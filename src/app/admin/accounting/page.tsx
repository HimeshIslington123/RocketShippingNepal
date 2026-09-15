"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Store,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type Tab =
  | "overview"
  | "transactions"
  | "vendors"
  | "cod"
  | "settlements";

type Direction = "CREDIT" | "DEBIT";

type SettlementDirection = "PAY_VENDOR" | "COLLECT_FROM_VENDOR";

type AccountingType =
  | "COD_COLLECTION"
  | "SHIPPING_CHARGE"
  | "RETURN_CHARGE"
  | "PICKUP_CHARGE"
  | "STORAGE_CHARGE"
  | "OTHER_CHARGE"
  | "REFUND"
  | "VENDOR_SETTLEMENT";

type SettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "CANCELLED";

type CodStatus = "PENDING" | "COLLECTED" | "FAILED" | "CANCELLED";

interface DashboardData {
  totalCredits: number;
  totalDebits: number;
  netBalance: number;

  cod: {
    pending: number;
    collected: number;
  };

  settlements: {
    pending: number;
    processing: number;
    paid: number;
    totalOutstanding: number;
  };

  vendors: {
    total: number;
    pendingSettlement: number;
  };
}

interface Vendor {
  id: number;
  companyName: string;
  contactId: string;
  location: string;

  _count: {
    shipments: number;
    accountingEntries: number;
    settlements: number;
  };

  totalCredits: number;
  totalDebits: number;
  availableCredits: number;
  availableDebits: number;
  balance: number;
  direction: SettlementDirection | null;
  settlementAmount: number;
  outstandingSettlement: number;
  pendingSettlementCount: number;
}

interface ShipmentInfo {
  id: string;
  trackingNumber: string;
  receiverName: string;
  codAmount?: number;
  shippingCharge?: number;
}

interface UnsettledEntry {
  id: string;
  type: AccountingType;
  direction: Direction;
  amount: number;
  allocatedAmount: number;
  remainingAmount: number;
  description: string | null;
  shipment: ShipmentInfo | null;
  returnRequest: { id: string; reason: string } | null;
  createdAt: string;
}

interface UnsettledData {
  vendor: {
    id: number;
    companyName: string;
  };
  credits: UnsettledEntry[];
  debits: UnsettledEntry[];
  summary: {
    totalCredits: number;
    totalDebits: number;
    netAmount: number;
    direction: SettlementDirection | null;
    settlementAmount: number;
  };
}

interface AccountingEntry {
  id: string;

  vendor: {
    id: number;
    companyName: string;
  };

  shipment: ShipmentInfo | null;

  type: AccountingType;
  direction: Direction;
  amount: number;
  description: string | null;
  createdAt: string;
}

interface CodCollection {
  id: string;

  shipment: {
    id: string;
    trackingNumber: string;
    receiverName: string;
    receiverPhone: string;
    codAmount: number;

    vendor: {
      id: number;
      companyName: string;
    } | null;
  } | null;

  rider: {
    id: number;
    phone: string;
    user: { name: string };
  } | null;

  amount: number;
  status: CodStatus;
  collectedAt: string | null;
  createdAt: string;
}

interface Settlement {
  id: string;

  vendor: {
    id: number;
    companyName: string;
    contactId?: string;
  };

  totalCodAmount: number;
  totalShippingCharge: number;
  totalReturnCharge: number;
  totalOtherCharges: number;
  totalCredits: number;
  totalDebits: number;
  netPayable: number;

  direction: SettlementDirection;
  status: SettlementStatus;

  paidAt: string | null;
  paymentReference: string | null;
  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

interface PageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ======================================================
// HELPERS
// ======================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.message || "Something went wrong";
  } catch {
    return "Something went wrong";
  }
};

const getTypeLabel = (type: AccountingType) => {
  switch (type) {
    case "COD_COLLECTION":
      return "COD Collection";
    case "SHIPPING_CHARGE":
      return "Shipping Charge";
    case "RETURN_CHARGE":
      return "Return Charge";
    case "PICKUP_CHARGE":
      return "Pickup Charge";
    case "STORAGE_CHARGE":
      return "Storage Charge";
    case "OTHER_CHARGE":
      return "Other Charge";
    case "REFUND":
      return "Refund";
    case "VENDOR_SETTLEMENT":
      return "Vendor Settlement";
    default:
      return type;
  }
};

const getDirectionLabel = (
  direction: SettlementDirection | null | undefined
) => {
  if (direction === "PAY_VENDOR") return "Pay vendor";
  if (direction === "COLLECT_FROM_VENDOR") return "Collect from vendor";
  return "Settled";
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case "PAID":
    case "COLLECTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const emptyPage: PageInfo = {
  page: 1,
  limit: 15,
  total: 0,
  totalPages: 1,
};

// ======================================================
// PAGE
// ======================================================

export default function AdminAccountingPage() {
  // ====================================================
  // STATE
  // ====================================================

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [codCollections, setCodCollections] = useState<CodCollection[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const [entriesPage, setEntriesPage] = useState<PageInfo>(emptyPage);
  const [codPage, setCodPage] = useState<PageInfo>(emptyPage);
  const [settlementsPage, setSettlementsPage] = useState<PageInfo>(emptyPage);

  // Filters

  const [entrySearch, setEntrySearch] = useState("");
  const [entryType, setEntryType] = useState("");
  const [entryDirection, setEntryDirection] = useState("");
  const [entryVendorId, setEntryVendorId] = useState("");

  const [codStatus, setCodStatus] = useState("");
  const [codVendorId, setCodVendorId] = useState("");

  const [settlementStatus, setSettlementStatus] = useState("");
  const [settlementVendorId, setSettlementVendorId] = useState("");

  // Modals

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedSettlement, setSelectedSettlement] =
    useState<Settlement | null>(null);

  const [showCreateSettlement, setShowCreateSettlement] = useState(false);
  const [unsettled, setUnsettled] = useState<UnsettledData | null>(null);
  const [unsettledLoading, setUnsettledLoading] = useState(false);
  const [unsettledError, setUnsettledError] = useState("");
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [settlementNotes, setSettlementNotes] = useState("");

  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  // ====================================================
  // API HELPER
  // ====================================================

  const apiFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const token = getToken();

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,

        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      return response.json();
    },
    []
  );

  // ====================================================
  // FETCHERS
  // ====================================================

  const fetchDashboard = useCallback(async () => {
    const response = await apiFetch("/api/admin/accounting/dashboard");
    setDashboard(response.data);
  }, [apiFetch]);

  const fetchEntries = useCallback(
    async (page = 1) => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "15");

      if (entrySearch.trim()) params.set("search", entrySearch.trim());
      if (entryType) params.set("type", entryType);
      if (entryDirection) params.set("direction", entryDirection);
      if (entryVendorId) params.set("vendorId", entryVendorId);

      const response = await apiFetch(
        `/api/admin/accounting/entries?${params.toString()}`
      );

      setEntries(response.data || []);
      setEntriesPage(response.pagination || emptyPage);
    },
    [apiFetch, entrySearch, entryType, entryDirection, entryVendorId]
  );

  const fetchVendors = useCallback(async () => {
    const response = await apiFetch("/api/admin/accounting/vendors");
    setVendors(response.data || []);
  }, [apiFetch]);

  const fetchCod = useCallback(
    async (page = 1) => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "15");

      if (codStatus) params.set("status", codStatus);
      if (codVendorId) params.set("vendorId", codVendorId);

      const response = await apiFetch(
        `/api/admin/accounting/cod?${params.toString()}`
      );

      setCodCollections(response.data || []);
      setCodPage(response.pagination || emptyPage);
    },
    [apiFetch, codStatus, codVendorId]
  );

  const fetchSettlements = useCallback(
    async (page = 1) => {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "15");

      if (settlementStatus) params.set("status", settlementStatus);
      if (settlementVendorId) params.set("vendorId", settlementVendorId);

      const response = await apiFetch(
        `/api/admin/accounting/settlements?${params.toString()}`
      );

      setSettlements(response.data || []);
      setSettlementsPage(response.pagination || emptyPage);
    },
    [apiFetch, settlementStatus, settlementVendorId]
  );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  const loadAll = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);

        setError("");

        await Promise.all([
          fetchDashboard(),
          fetchEntries(1),
          fetchVendors(),
          fetchCod(1),
          fetchSettlements(1),
        ]);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load accounting data"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchDashboard, fetchEntries, fetchVendors, fetchCod, fetchSettlements]
  );

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await loadAll(false);
  };

  // ====================================================
  // FILTER EFFECTS
  // ====================================================

  useEffect(() => {
    if (activeTab !== "transactions") return;

    const timeout = setTimeout(() => {
      fetchEntries(1).catch(console.error);
    }, 350);

    return () => clearTimeout(timeout);
  }, [
    activeTab,
    entrySearch,
    entryType,
    entryDirection,
    entryVendorId,
    fetchEntries,
  ]);

  useEffect(() => {
    if (activeTab !== "cod") return;
    fetchCod(1).catch(console.error);
  }, [activeTab, codStatus, codVendorId, fetchCod]);

  useEffect(() => {
    if (activeTab !== "settlements") return;
    fetchSettlements(1).catch(console.error);
  }, [activeTab, settlementStatus, settlementVendorId, fetchSettlements]);

  // ====================================================
  // OPEN SETTLEMENT BUILDER
  // ====================================================

  const openSettlementBuilder = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowCreateSettlement(true);
    setSettlementNotes("");
    setUnsettled(null);
    setUnsettledError("");
    setSelectedEntryIds([]);
    setUnsettledLoading(true);

    try {
      const response = await apiFetch(
        `/api/admin/accounting/vendors/${vendor.id}/unsettled`
      );

      const data: UnsettledData = response.data;

      setUnsettled(data);

      // Everything unsettled is selected by default.
      setSelectedEntryIds([
        ...data.credits.map((entry) => entry.id),
        ...data.debits.map((entry) => entry.id),
      ]);
    } catch (err) {
      setUnsettledError(
        err instanceof Error ? err.message : "Failed to load vendor entries"
      );
    } finally {
      setUnsettledLoading(false);
    }
  };

  const closeSettlementBuilder = () => {
    setShowCreateSettlement(false);
    setUnsettled(null);
    setUnsettledError("");
    setSelectedEntryIds([]);
    setSettlementNotes("");
  };

  const toggleEntry = (id: string) => {
    setSelectedEntryIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const allUnsettledEntries = useMemo(() => {
    if (!unsettled) return [] as UnsettledEntry[];
    return [...unsettled.credits, ...unsettled.debits];
  }, [unsettled]);

  // Live totals for whatever is ticked right now.
  const selection = useMemo(() => {
    let credits = 0;
    let debits = 0;

    for (const entry of allUnsettledEntries) {
      if (!selectedEntryIds.includes(entry.id)) continue;

      if (entry.direction === "CREDIT") credits += entry.remainingAmount;
      else debits += entry.remainingAmount;
    }

    credits = Math.round(credits * 100) / 100;
    debits = Math.round(debits * 100) / 100;

    const net = Math.round((credits - debits) * 100) / 100;

    return {
      credits,
      debits,
      net,
      amount: Math.abs(net),
      direction:
        net > 0
          ? ("PAY_VENDOR" as SettlementDirection)
          : net < 0
            ? ("COLLECT_FROM_VENDOR" as SettlementDirection)
            : null,
      count: selectedEntryIds.length,
    };
  }, [allUnsettledEntries, selectedEntryIds]);

  // ====================================================
  // CREATE SETTLEMENT
  // ====================================================

  const handleCreateSettlement = async () => {
    if (!selectedVendor || !unsettled) return;

    if (selection.count === 0) {
      alert("Select at least one entry.");
      return;
    }

    if (selection.net === 0) {
      alert("Selected entries cancel out to zero. Adjust the selection.");
      return;
    }

    const items = allUnsettledEntries
      .filter((entry) => selectedEntryIds.includes(entry.id))
      .map((entry) => ({
        accountingEntryId: entry.id,
        amount: entry.remainingAmount,
      }));

    try {
      setActionLoading(true);

      await apiFetch("/api/admin/accounting/settlements", {
        method: "POST",

        body: JSON.stringify({
          vendorId: selectedVendor.id,
          items,
          notes: settlementNotes || null,
        }),
      });

      closeSettlementBuilder();
      setSelectedVendor(null);

      await Promise.all([
        fetchDashboard(),
        fetchVendors(),
        fetchSettlements(1),
      ]);

      setActiveTab("settlements");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to create settlement"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // PROCESS / PAY / CANCEL
  // ====================================================

  const handleProcessSettlement = async (settlement: Settlement) => {
    if (
      !confirm(
        `Move settlement for ${settlement.vendor.companyName} to processing?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(
        `/api/admin/accounting/settlements/${settlement.id}/process`,
        { method: "PATCH" }
      );

      await Promise.all([
        fetchDashboard(),
        fetchSettlements(settlementsPage.page),
      ]);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to process settlement"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaySettlement = async () => {
    if (!selectedSettlement) return;

    try {
      setActionLoading(true);

      await apiFetch(
        `/api/admin/accounting/settlements/${selectedSettlement.id}/pay`,
        {
          method: "PATCH",

          body: JSON.stringify({
            paymentReference: paymentReference || null,
            notes: paymentNotes || null,
          }),
        }
      );

      setSelectedSettlement(null);
      setPaymentReference("");
      setPaymentNotes("");

      await Promise.all([
        fetchDashboard(),
        fetchSettlements(settlementsPage.page),
        fetchEntries(1),
        fetchVendors(),
      ]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to pay settlement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSettlement = async (settlement: Settlement) => {
    if (!confirm(`Cancel settlement for ${settlement.vendor.companyName}?`)) {
      return;
    }

    try {
      setActionLoading(true);

      await apiFetch(
        `/api/admin/accounting/settlements/${settlement.id}/cancel`,
        { method: "PATCH" }
      );

      await Promise.all([
        fetchDashboard(),
        fetchVendors(),
        fetchSettlements(settlementsPage.page),
      ]);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to cancel settlement"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f8]">
        <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-6">
          <div className="flex items-center gap-3 text-[#0b1729]">
            <Loader2 className="h-6 w-6 animate-spin" />

            <span className="text-sm font-medium">Loading accounting...</span>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#0b1729]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e23c2e] text-white">
                <Wallet className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e23c2e]">
                Finance
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Accounting
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage COD collections, charges and vendor settlements.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#0b1729] shadow-sm transition hover:border-[#e23c2e] hover:text-[#e23c2e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">Unable to load accounting</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* TOP CARDS */}

        {dashboard && (
          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="COD Collected"
              value={formatMoney(dashboard.cod.collected)}
              subtitle="Successfully collected"
              icon={<Banknote className="h-5 w-5" />}
              positive
            />

            <StatCard
              title="Pending COD"
              value={formatMoney(dashboard.cod.pending)}
              subtitle="Awaiting collection"
              icon={<Clock3 className="h-5 w-5" />}
            />

            <StatCard
              title="Vendor Payable"
              value={formatMoney(dashboard.settlements.totalOutstanding)}
              subtitle="Pending + processing"
              icon={<Wallet className="h-5 w-5" />}
            />

            <StatCard
              title="Settled"
              value={formatMoney(dashboard.settlements.paid)}
              subtitle="Already paid"
              icon={<CheckCircle2 className="h-5 w-5" />}
              positive
            />
          </div>
        )}

        {/* SECONDARY STATS */}

        {dashboard && (
          <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SmallStat
              label="Total Credits"
              value={formatMoney(dashboard.totalCredits)}
              icon={<ArrowDownRight className="h-4 w-4" />}
            />

            <SmallStat
              label="Total Debits"
              value={formatMoney(dashboard.totalDebits)}
              icon={<ArrowUpRight className="h-4 w-4" />}
            />

            <SmallStat
              label="Net Balance"
              value={formatMoney(dashboard.netBalance)}
              icon={<CircleDollarSign className="h-4 w-4" />}
            />

            <SmallStat
              label="Vendors"
              value={String(dashboard.vendors.total)}
              icon={<Store className="h-4 w-4" />}
            />
          </div>
        )}

        {/* TABS */}

        <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="flex min-w-max">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </TabButton>

            <TabButton
              active={activeTab === "transactions"}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </TabButton>

            <TabButton
              active={activeTab === "vendors"}
              onClick={() => setActiveTab("vendors")}
            >
              Vendors
            </TabButton>

            <TabButton
              active={activeTab === "cod"}
              onClick={() => setActiveTab("cod")}
            >
              COD
            </TabButton>

            <TabButton
              active={activeTab === "settlements"}
              onClick={() => setActiveTab("settlements")}
            >
              Settlements
            </TabButton>
          </div>
        </div>

        {/* OVERVIEW */}

        {activeTab === "overview" && (
          <OverviewSection
            dashboard={dashboard}
            vendors={vendors}
            settlements={settlements}
            onVendorClick={(vendor) => setSelectedVendor(vendor)}
            onGoToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TRANSACTIONS */}

        {activeTab === "transactions" && (
          <section>
            <SectionHeader
              title="Accounting Transactions"
              description="Complete financial ledger."
            />

            <div className="mb-5 mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={entrySearch}
                  onChange={(e) => setEntrySearch(e.target.value)}
                  placeholder="Search vendor, shipment..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
                />
              </div>

              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">All Types</option>
                <option value="COD_COLLECTION">COD Collection</option>
                <option value="SHIPPING_CHARGE">Shipping Charge</option>
                <option value="RETURN_CHARGE">Return Charge</option>
                <option value="PICKUP_CHARGE">Pickup Charge</option>
                <option value="STORAGE_CHARGE">Storage Charge</option>
                <option value="OTHER_CHARGE">Other Charge</option>
                <option value="REFUND">Refund</option>
                <option value="VENDOR_SETTLEMENT">Vendor Settlement</option>
              </select>

              <select
                value={entryDirection}
                onChange={(e) => setEntryDirection(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">All Directions</option>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>

              <select
                value={entryVendorId}
                onChange={(e) => setEntryVendorId(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">All Vendors</option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {entries.length === 0 ? (
                      <EmptyTableRow
                        colSpan={7}
                        text="No accounting transactions found."
                      />
                    ) : (
                      entries.map((entry) => (
                        <tr
                          key={entry.id}
                          className="transition hover:bg-slate-50"
                        >
                          <TableCell>
                            <div className="text-sm font-medium text-slate-700">
                              {formatDate(entry.createdAt)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-[#0b1729]">
                              {entry.vendor?.companyName}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {getTypeLabel(entry.type)}
                            </span>
                          </TableCell>

                          <TableCell>
                            {entry.shipment ? (
                              <div>
                                <div className="font-mono text-xs font-semibold text-[#0b1729]">
                                  {entry.shipment.trackingNumber}
                                </div>

                                <div className="mt-0.5 text-xs text-slate-400">
                                  {entry.shipment.receiverName}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                                entry.direction === "CREDIT"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {entry.direction === "CREDIT" ? (
                                <ArrowDownRight className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                              {entry.direction}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span
                              className={`font-semibold ${
                                entry.direction === "CREDIT"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {entry.direction === "CREDIT" ? "+" : "-"}
                              {formatMoney(entry.amount)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="block max-w-[240px] truncate text-sm text-slate-500">
                              {entry.description || "—"}
                            </span>
                          </TableCell>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationBar
                pagination={entriesPage}
                onPrevious={() => fetchEntries(entriesPage.page - 1)}
                onNext={() => fetchEntries(entriesPage.page + 1)}
              />
            </div>
          </section>
        )}

        {/* VENDORS */}

        {activeTab === "vendors" && (
          <section>
            <SectionHeader
              title="Vendor Accounting"
              description="Positive balance means you owe the vendor. Negative means the vendor owes you."
            />

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Unsettled Credits</TableHead>
                      <TableHead>Unsettled Charges</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Open Settlement</TableHead>
                      <TableHead>Action</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {vendors.length === 0 ? (
                      <EmptyTableRow colSpan={7} text="No vendors found." />
                    ) : (
                      vendors.map((vendor) => (
                        <tr
                          key={vendor.id}
                          className="transition hover:bg-slate-50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1729] text-sm font-bold text-white">
                                {vendor.companyName.slice(0, 1).toUpperCase()}
                              </div>

                              <div>
                                <div className="font-semibold text-[#0b1729]">
                                  {vendor.companyName}
                                </div>

                                <div className="text-xs text-slate-400">
                                  {vendor.location}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>{vendor._count?.shipments ?? 0}</TableCell>

                          <TableCell>
                            <span className="font-semibold text-emerald-600">
                              {formatMoney(vendor.availableCredits)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="font-semibold text-red-600">
                              {formatMoney(vendor.availableDebits)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="font-bold text-[#0b1729]">
                              {formatMoney(vendor.balance)}
                            </div>

                            <div className="text-xs text-slate-400">
                              {getDirectionLabel(vendor.direction)}
                            </div>
                          </TableCell>

                          <TableCell>
                            {vendor.outstandingSettlement > 0 ? (
                              <span className="font-semibold text-amber-600">
                                {formatMoney(vendor.outstandingSettlement)}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedVendor(vendor)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0b1729] transition hover:border-[#e23c2e] hover:text-[#e23c2e]"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                disabled={vendor.pendingSettlementCount > 0}
                                onClick={() => openSettlementBuilder(vendor)}
                                className="rounded-lg bg-[#e23c2e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#ce3122] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Settle
                              </button>
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* COD */}

        {activeTab === "cod" && (
          <section>
            <SectionHeader
              title="COD Collections"
              description="Track money collected by riders."
            />

            <div className="mb-5 mt-5 grid gap-3 sm:grid-cols-2">
              <select
                value={codStatus}
                onChange={(e) => setCodStatus(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COLLECTED">Collected</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={codVendorId}
                onChange={(e) => setCodVendorId(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">All Vendors</option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {codCollections.length === 0 ? (
                      <EmptyTableRow
                        colSpan={7}
                        text="No COD collections found."
                      />
                    ) : (
                      codCollections.map((collection) => (
                        <tr
                          key={collection.id}
                          className="transition hover:bg-slate-50"
                        >
                          <TableCell>
                            <div className="font-mono text-xs font-semibold">
                              {collection.shipment?.trackingNumber}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {collection.shipment?.receiverName}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-medium">
                              {collection.shipment?.vendor?.companyName || "—"}
                            </span>
                          </TableCell>

                          <TableCell>
                            {collection.rider ? (
                              <div>
                                <div className="font-medium">
                                  {collection.rider.user?.name}
                                </div>

                                <div className="text-xs text-slate-400">
                                  {collection.rider.phone}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Not assigned
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <span className="font-medium">
                              {formatMoney(collection.shipment?.codAmount || 0)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="font-bold text-emerald-600">
                              {formatMoney(collection.amount)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                collection.status
                              )}`}
                            >
                              {collection.status}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm text-slate-600">
                              {formatDate(
                                collection.collectedAt || collection.createdAt
                              )}
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationBar
                pagination={codPage}
                onPrevious={() => fetchCod(codPage.page - 1)}
                onNext={() => fetchCod(codPage.page + 1)}
              />
            </div>
          </section>
        )}

        {/* SETTLEMENTS */}

        {activeTab === "settlements" && (
          <section>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                title="Vendor Settlements"
                description="COD credits minus charges, settled per vendor."
              />

              <button
                type="button"
                onClick={() => setActiveTab("vendors")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-semibold text-white transition hover:bg-[#ce3122]"
              >
                <Wallet className="h-4 w-4" />
                Create Settlement
              </button>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <select
                value={settlementStatus}
                onChange={(e) => setSettlementStatus(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={settlementVendorId}
                onChange={(e) => setSettlementVendorId(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">All Vendors</option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>Vendor</TableHead>
                      <TableHead>COD</TableHead>
                      <TableHead>Shipping</TableHead>
                      <TableHead>Returns</TableHead>
                      <TableHead>Other</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {settlements.length === 0 ? (
                      <EmptyTableRow colSpan={9} text="No settlements found." />
                    ) : (
                      settlements.map((settlement) => (
                        <tr
                          key={settlement.id}
                          className="transition hover:bg-slate-50"
                        >
                          <TableCell>
                            <div className="font-semibold">
                              {settlement.vendor?.companyName}
                            </div>

                            <div className="mt-1 font-mono text-[10px] text-slate-400">
                              {settlement.id}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-emerald-600">
                              {formatMoney(settlement.totalCodAmount)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-red-600">
                              {formatMoney(settlement.totalShippingCharge)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-red-600">
                              {formatMoney(settlement.totalReturnCharge)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-red-600">
                              {formatMoney(settlement.totalOtherCharges)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="font-bold text-[#0b1729]">
                              {formatMoney(settlement.netPayable)}
                            </div>

                            <div
                              className={`text-xs font-semibold ${
                                settlement.direction === "PAY_VENDOR"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {getDirectionLabel(settlement.direction)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                settlement.status
                              )}`}
                            >
                              {settlement.status}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm text-slate-500">
                              {formatDate(settlement.createdAt)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              {settlement.status === "PENDING" && (
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleProcessSettlement(settlement)
                                  }
                                  className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                >
                                  Process
                                </button>
                              )}

                              {(settlement.status === "PENDING" ||
                                settlement.status === "PROCESSING") && (
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => {
                                    setSelectedSettlement(settlement);
                                    setPaymentReference("");
                                    setPaymentNotes("");
                                  }}
                                  className="rounded-lg bg-[#e23c2e] px-2.5 py-2 text-xs font-semibold text-white hover:bg-[#ce3122] disabled:opacity-50"
                                >
                                  {settlement.direction === "PAY_VENDOR"
                                    ? "Pay"
                                    : "Collect"}
                                </button>
                              )}

                              {(settlement.status === "PENDING" ||
                                settlement.status === "PROCESSING") && (
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleCancelSettlement(settlement)
                                  }
                                  className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}

                              {settlement.status === "PAID" && (
                                <span className="text-xs font-medium text-emerald-600">
                                  Settled {formatDate(settlement.paidAt)}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationBar
                pagination={settlementsPage}
                onPrevious={() => fetchSettlements(settlementsPage.page - 1)}
                onNext={() => fetchSettlements(settlementsPage.page + 1)}
              />
            </div>
          </section>
        )}
      </div>

      {/* ================================================== */}
      {/* VENDOR MODAL */}
      {/* ================================================== */}

      {selectedVendor && !showCreateSettlement && (
        <Modal onClose={() => setSelectedVendor(null)}>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e23c2e]">
                Vendor
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {selectedVendor.companyName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedVendor.location}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedVendor(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ModalStat
              label="Unsettled credits (COD etc.)"
              value={formatMoney(selectedVendor.availableCredits)}
              positive
            />

            <ModalStat
              label="Unsettled charges"
              value={formatMoney(selectedVendor.availableDebits)}
            />

            <ModalStat
              label="Balance"
              value={formatMoney(selectedVendor.balance)}
            />

            <ModalStat
              label="Open settlement"
              value={formatMoney(selectedVendor.outstandingSettlement)}
            />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-500">Contact</span>
              <span className="text-sm font-semibold">
                {selectedVendor.contactId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Shipments</span>
              <span className="text-sm font-semibold">
                {selectedVendor._count?.shipments ?? 0}
              </span>
            </div>
          </div>

          {selectedVendor.pendingSettlementCount > 0 ? (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              This vendor already has an open settlement. Finish or cancel it
              before creating a new one.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => openSettlementBuilder(selectedVendor)}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-semibold text-white transition hover:bg-[#ce3122]"
            >
              <Wallet className="h-4 w-4" />
              Create Settlement
            </button>
          )}
        </Modal>
      )}

      {/* ================================================== */}
      {/* SETTLEMENT BUILDER */}
      {/* ================================================== */}

      {showCreateSettlement && selectedVendor && (
        <Modal wide onClose={closeSettlementBuilder}>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e23c2e]">
                Settlement
              </p>

              <h2 className="mt-1 text-xl font-bold">Create Settlement</h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedVendor.companyName}
              </p>
            </div>

            <button
              type="button"
              onClick={closeSettlementBuilder}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {unsettledLoading && (
            <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading unsettled entries...</span>
            </div>
          )}

          {!unsettledLoading && unsettledError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {unsettledError}
            </div>
          )}

          {!unsettledLoading &&
            !unsettledError &&
            unsettled &&
            allUnsettledEntries.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Nothing left to settle for this vendor.
              </div>
            )}

          {!unsettledLoading &&
            !unsettledError &&
            unsettled &&
            allUnsettledEntries.length > 0 && (
              <>
                {/* SUMMARY */}

                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Credits (owed to vendor)
                    </p>

                    <p className="mt-1 text-lg font-bold text-emerald-700">
                      {formatMoney(selection.credits)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                      Charges (owed to you)
                    </p>

                    <p className="mt-1 text-lg font-bold text-red-700">
                      {formatMoney(selection.debits)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-[#0b1729] p-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      {selection.direction === "COLLECT_FROM_VENDOR"
                        ? "Collect from vendor"
                        : "Pay vendor"}
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {formatMoney(selection.amount)}
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-xs text-slate-500">
                  Credits minus charges. Example: COD {formatMoney(1000)} −
                  shipping {formatMoney(200)} = {formatMoney(800)} paid back to
                  the vendor. Untick anything you want to leave for a later
                  settlement.
                </p>

                {/* CREDITS */}

                <EntryGroup
                  title="Credits"
                  subtitle="COD collected on the vendor's behalf, refunds"
                  tone="credit"
                  entries={unsettled.credits}
                  selectedIds={selectedEntryIds}
                  onToggle={toggleEntry}
                />

                {/* DEBITS */}

                <EntryGroup
                  title="Charges"
                  subtitle="Shipping, return, pickup and other charges"
                  tone="debit"
                  entries={unsettled.debits}
                  selectedIds={selectedEntryIds}
                  onToggle={toggleEntry}
                />

                {/* NOTES */}

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold">
                    Notes
                  </label>

                  <textarea
                    value={settlementNotes}
                    onChange={(e) => setSettlementNotes(e.target.value)}
                    rows={3}
                    placeholder="Optional settlement notes..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
                  />
                </div>

                <button
                  type="button"
                  disabled={
                    actionLoading ||
                    selection.count === 0 ||
                    selection.net === 0
                  }
                  onClick={handleCreateSettlement}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-semibold text-white transition hover:bg-[#ce3122] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      {selection.direction === "COLLECT_FROM_VENDOR"
                        ? `Create collection of ${formatMoney(selection.amount)}`
                        : `Create payment of ${formatMoney(selection.amount)}`}
                    </>
                  )}
                </button>

                {selection.net === 0 && selection.count > 0 && (
                  <p className="mt-2 text-center text-xs text-amber-600">
                    Selected credits and charges cancel out exactly — nothing to
                    settle.
                  </p>
                )}
              </>
            )}
        </Modal>
      )}

      {/* ================================================== */}
      {/* PAY SETTLEMENT MODAL */}
      {/* ================================================== */}

      {selectedSettlement && (
        <Modal
          onClose={() => {
            setSelectedSettlement(null);
            setPaymentReference("");
            setPaymentNotes("");
          }}
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e23c2e]">
                {selectedSettlement.direction === "PAY_VENDOR"
                  ? "Vendor Payment"
                  : "Vendor Collection"}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {selectedSettlement.direction === "PAY_VENDOR"
                  ? "Mark as Paid"
                  : "Mark as Collected"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedSettlement.vendor?.companyName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSettlement(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Credits</span>
              <span className="font-semibold text-emerald-600">
                {formatMoney(selectedSettlement.totalCredits)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Charges</span>
              <span className="font-semibold text-red-600">
                −{formatMoney(selectedSettlement.totalDebits)}
              </span>
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {selectedSettlement.direction === "PAY_VENDOR"
                  ? "Amount to pay"
                  : "Amount to collect"}
              </p>

              <p className="mt-1 text-2xl font-bold text-[#0b1729]">
                {formatMoney(selectedSettlement.netPayable)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Reference
              </label>

              <input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Bank transfer / cheque reference..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Notes</label>

              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
                placeholder="Optional payment notes..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={actionLoading}
            onClick={handlePaySettlement}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-semibold text-white transition hover:bg-[#ce3122] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm
              </>
            )}
          </button>
        </Modal>
      )}
    </main>
  );
}

// ======================================================
// ENTRY GROUP (settlement builder)
// ======================================================

function EntryGroup({
  title,
  subtitle,
  tone,
  entries,
  selectedIds,
  onToggle,
}: {
  title: string;
  subtitle: string;
  tone: "credit" | "debit";
  entries: UnsettledEntry[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-[#0b1729]">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        <span
          className={`text-xs font-semibold ${
            tone === "credit" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {entries.length} entries
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-400">
          None outstanding.
        </p>
      ) : (
        <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
          {entries.map((entry) => {
            const checked = selectedIds.includes(entry.id);

            return (
              <label
                key={entry.id}
                className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(entry.id)}
                  className="mt-1 h-4 w-4 accent-[#e23c2e]"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {getTypeLabel(entry.type)}
                    </span>

                    {entry.shipment?.trackingNumber && (
                      <span className="font-mono text-[11px] text-slate-400">
                        {entry.shipment.trackingNumber}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {entry.description ||
                      entry.shipment?.receiverName ||
                      formatDate(entry.createdAt)}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-sm font-bold ${
                    tone === "credit" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {tone === "credit" ? "+" : "−"}
                  {formatMoney(entry.remainingAmount)}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  positive = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0b1729]">
          {icon}
        </div>

        <span
          className={`text-xs font-semibold ${
            positive ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {positive ? "Positive" : "Current"}
        </span>
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-xl font-bold tracking-tight text-[#0b1729]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

// ======================================================
// SMALL STAT
// ======================================================

function SmallStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>

        <p className="mt-0.5 truncate text-sm font-bold text-[#0b1729]">
          {value}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// OVERVIEW
// ======================================================

function OverviewSection({
  dashboard,
  vendors,
  settlements,
  onVendorClick,
  onGoToTab,
}: {
  dashboard: DashboardData | null;
  vendors: Vendor[];
  settlements: Settlement[];
  onVendorClick: (vendor: Vendor) => void;
  onGoToTab: (tab: Tab) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Financial Summary"
            description="Current accounting position."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SummaryRow
              label="Total credits"
              value={formatMoney(dashboard?.totalCredits || 0)}
              positive
            />

            <SummaryRow
              label="Total debits"
              value={formatMoney(dashboard?.totalDebits || 0)}
              negative
            />

            <SummaryRow
              label="Pending COD"
              value={formatMoney(dashboard?.cod.pending || 0)}
            />

            <SummaryRow
              label="Collected COD"
              value={formatMoney(dashboard?.cod.collected || 0)}
              positive
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <SectionHeader
              title="Vendor Balances"
              description="Who is owed what right now."
            />

            <button
              type="button"
              onClick={() => onGoToTab("vendors")}
              className="text-xs font-semibold text-[#e23c2e] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {vendors.slice(0, 5).map((vendor) => (
              <button
                key={vendor.id}
                type="button"
                onClick={() => onVendorClick(vendor)}
                className="flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1729] text-xs font-bold text-white">
                    {vendor.companyName.slice(0, 1).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {vendor.companyName}
                    </p>

                    <p className="text-xs text-slate-400">
                      {vendor._count?.shipments ?? 0} shipments
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatMoney(vendor.balance)}
                  </p>

                  <p className="text-[10px] font-semibold text-slate-400">
                    {getDirectionLabel(vendor.direction)}
                  </p>
                </div>
              </button>
            ))}

            {vendors.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                No vendors found.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Settlement Status"
            description="Vendor payment overview."
          />

          <div className="mt-5 space-y-4">
            <SettlementSummary
              label="Pending"
              value={formatMoney(dashboard?.settlements.pending || 0)}
              status="PENDING"
            />

            <SettlementSummary
              label="Processing"
              value={formatMoney(dashboard?.settlements.processing || 0)}
              status="PROCESSING"
            />

            <SettlementSummary
              label="Paid"
              value={formatMoney(dashboard?.settlements.paid || 0)}
              status="PAID"
            />
          </div>

          <button
            type="button"
            onClick={() => onGoToTab("settlements")}
            className="mt-5 flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold transition hover:border-[#e23c2e] hover:text-[#e23c2e]"
          >
            Manage Settlements
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <SectionHeader
              title="Recent Settlements"
              description="Latest vendor settlements."
            />

            <FileText className="h-5 w-5 text-slate-300" />
          </div>

          <div className="space-y-2">
            {settlements.slice(0, 5).map((settlement) => (
              <div
                key={settlement.id}
                className="flex items-center justify-between rounded-xl px-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {settlement.vendor?.companyName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(settlement.createdAt)} ·{" "}
                    {getDirectionLabel(settlement.direction)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatMoney(settlement.netPayable)}
                  </p>

                  <span
                    className={`text-[10px] font-bold ${
                      settlement.status === "PAID"
                        ? "text-emerald-600"
                        : settlement.status === "PROCESSING"
                          ? "text-blue-600"
                          : settlement.status === "CANCELLED"
                            ? "text-red-600"
                            : "text-amber-600"
                    }`}
                  >
                    {settlement.status}
                  </span>
                </div>
              </div>
            ))}

            {settlements.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                No settlements yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ======================================================
// SMALL UI PIECES
// ======================================================

function SettlementSummary({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: SettlementStatus;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "PAID"
              ? "bg-emerald-500"
              : status === "PROCESSING"
                ? "bg-blue-500"
                : "bg-amber-500"
          }`}
        />

        <span className="text-sm text-slate-500">{label}</span>
      </div>

      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>

      <span
        className={`text-sm font-bold ${
          positive
            ? "text-emerald-600"
            : negative
              ? "text-red-600"
              : "text-[#0b1729]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold tracking-tight text-[#0b1729]">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[#0b1729] text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-100 hover:text-[#0b1729]"
      }`}
    >
      {children}
    </button>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4 align-middle">{children}</td>;
}

function EmptyTableRow({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>

          <p className="text-sm font-semibold text-slate-600">{text}</p>
        </div>
      </td>
    </tr>
  );
}

function PaginationBar({
  pagination,
  onPrevious,
  onNext,
}: {
  pagination: PageInfo;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-400">
        Page{" "}
        <span className="font-semibold text-slate-600">{pagination.page}</span>{" "}
        of{" "}
        <span className="font-semibold text-slate-600">
          {pagination.totalPages}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={onPrevious}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#e23c2e] hover:text-[#e23c2e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#e23c2e] hover:text-[#e23c2e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1729]/60 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ModalStat({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p
        className={`mt-1 text-lg font-bold ${
          positive ? "text-emerald-600" : "text-[#0b1729]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}