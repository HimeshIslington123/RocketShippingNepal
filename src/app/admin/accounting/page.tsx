"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Printer,
  Search,
  Share2,
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
  | "pending-cod"
  | "settlements";

type Direction = "CREDIT" | "DEBIT";

type SettlementDirection =
  | "PAY_VENDOR"
  | "COLLECT_FROM_VENDOR";

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

type CodStatus =
  | "PENDING"
  | "COLLECTED"
  | "FAILED"
  | "CANCELLED";

// ======================================================
// DASHBOARD
// ======================================================

interface DashboardData {
  totalCredits: number;
  totalDebits: number;
  netBalance: number;

  // Company earnings from vendor charges
  companyEarnings?: number;

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

// ======================================================
// VENDOR
// ======================================================

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

// ======================================================
// SHIPMENT
// ======================================================

interface ShipmentInfo {
  id: string;
  trackingNumber: string;
  receiverName: string;
  codAmount?: number;
  shippingCharge?: number;
}

// ======================================================
// UNSETTLED ENTRY
// ======================================================

interface UnsettledEntry {
  id: string;

  type: AccountingType;
  direction: Direction;

  amount: number;
  allocatedAmount: number;
  remainingAmount: number;

  description: string | null;

  shipment: ShipmentInfo | null;

  returnRequest: {
    id: string;
    reason: string;
  } | null;

  createdAt: string;
}

// ======================================================
// UNSETTLED DATA
// ======================================================

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

// ======================================================
// ACCOUNTING ENTRY
// ======================================================

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

// ======================================================
// COD
// ======================================================

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

    user: {
      name: string;
    };
  } | null;

  amount: number;

  status: CodStatus;

  collectedAt: string | null;

  createdAt: string;
}

// ======================================================
// SETTLEMENT ITEM
// ======================================================

interface SettlementItem {
  id: string;
  amount: number;
  createdAt: string;
  accountingEntry?: {
    id: string;
    type: AccountingType;
    direction: Direction;
    amount: number;
    description: string | null;
    shipment?: {
      trackingNumber: string;
    } | null;
  } | null;
}

// ======================================================
// SETTLEMENT
// ======================================================

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
  items?: SettlementItem[];
}

// ======================================================
// PAGINATION
// ======================================================

interface PageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ======================================================
// PAGE CACHE
//
// This lives OUTSIDE the React component intentionally.
// It survives Next.js client-side navigation away from this page.
// A browser refresh clears the module and therefore fetches fresh data.
// ======================================================

interface PageCache {
  dashboard: DashboardData | null;
  entries: AccountingEntry[];
  vendors: Vendor[];
  codCollections: CodCollection[];
  settlements: Settlement[];
}

let pageCache: PageCache | null = null;
let pageRequest: Promise<PageCache> | null = null;

// ======================================================
// HELPERS
// ======================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const formatMoney = (amount: number | null | undefined) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (
  value: string | null | undefined
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const getErrorMessage = async (
  response: Response
) => {
  try {
    const data = await response.json();

    return (
      data?.message ||
      data?.error ||
      "Something went wrong"
    );
  } catch {
    return "Something went wrong";
  }
};

// ======================================================
// ACCOUNTING TYPE LABEL
// ======================================================

const getTypeLabel = (
  type: AccountingType
) => {
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

// ======================================================
// DIRECTION LABEL
// ======================================================

const getDirectionLabel = (
  direction:
    | SettlementDirection
    | null
    | undefined
) => {
  if (direction === "PAY_VENDOR") {
    return "Pay vendor";
  }

  if (direction === "COLLECT_FROM_VENDOR") {
    return "Collect from vendor";
  }

  return "Settled";
};

// ======================================================
// STATUS
// ======================================================

const getStatusClasses = (
  status: string
) => {
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

// ======================================================
// EMPTY PAGE
// ======================================================

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

  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [loading, setLoading] =
    useState(!pageCache);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [entries, setEntries] =
    useState<AccountingEntry[]>([]);

  const [vendors, setVendors] =
    useState<Vendor[]>([]);

  const [codCollections, setCodCollections] =
    useState<CodCollection[]>([]);

  const [settlements, setSettlements] =
    useState<Settlement[]>([]);




  // ====================================================
  // FILTERS
  // ====================================================

  const [entrySearch, setEntrySearch] =
    useState("");

  const [entryType, setEntryType] =
    useState("");

  const [entryDirection, setEntryDirection] =
    useState("");

  const [entryVendorId, setEntryVendorId] =
    useState("");

  const [codStatus, setCodStatus] =
    useState("");

  const [codVendorId, setCodVendorId] =
    useState("");

  const [settlementStatus, setSettlementStatus] =
    useState("");

  const [settlementVendorId, setSettlementVendorId] =
    useState("");

  // ====================================================
  // MODALS
  // ====================================================

  const [selectedVendor, setSelectedVendor] =
    useState<Vendor | null>(null);

  const [selectedSettlement, setSelectedSettlement] =
    useState<Settlement | null>(null);

  const [billSettlement, setBillSettlement] =
    useState<Settlement | null>(null);

  const [showCreateSettlement, setShowCreateSettlement] =
    useState(false);

  const [unsettled, setUnsettled] =
    useState<UnsettledData | null>(null);

  const [unsettledLoading, setUnsettledLoading] =
    useState(false);

  const [unsettledError, setUnsettledError] =
    useState("");

  const [selectedEntryIds, setSelectedEntryIds] =
    useState<string[]>([]);

  const [settlementNotes, setSettlementNotes] =
    useState("");

  const [paymentReference, setPaymentReference] =
    useState("");

  const [paymentNotes, setPaymentNotes] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  // ====================================================
  // API
  // ====================================================

  const apiFetch = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {}
    ) => {
      const token = getToken();

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
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
  // FETCH ALL DATA — ONE GET BATCH + PERSISTENT PAGE CACHE
  //
  // This is the important part: after the first successful load,
  // navigating away and coming back to this page uses pageCache.
  // No GET request is made again.
  // A browser refresh clears the module cache, so GETs run once again.
  // force=true is used only by the explicit Refresh button.
  // ====================================================

  const fetchAllData = useCallback(
    async (force = false): Promise<PageCache> => {
      if (!force && pageCache) {
        return pageCache;
      }

      if (pageRequest) {
        return pageRequest;
      }

      if (force) {
        pageCache = null;
      }

      const request = (async () => {
        const [
          dashboardResponse,
          entriesResponse,
          vendorsResponse,
          codResponse,
          settlementsResponse,
        ] = await Promise.all([
          apiFetch("/api/admin/accounting/dashboard"),
          apiFetch("/api/admin/accounting/entries?page=1&limit=1000"),
          apiFetch("/api/admin/accounting/vendors"),
          apiFetch("/api/admin/accounting/cod?page=1&limit=1000"),
          apiFetch("/api/admin/accounting/settlements?page=1&limit=1000"),
        ]);

        const result: PageCache = {
          dashboard: dashboardResponse?.data || null,
          entries: Array.isArray(entriesResponse?.data)
            ? entriesResponse.data
            : [],
          vendors: Array.isArray(vendorsResponse?.data)
            ? vendorsResponse.data
            : [],
          codCollections: Array.isArray(codResponse?.data)
            ? codResponse.data
            : [],
          settlements: Array.isArray(settlementsResponse?.data)
            ? settlementsResponse.data
            : [],
        };

        pageCache = result;
        return result;
      })();

      pageRequest = request;

      try {
        return await request;
      } finally {
        if (pageRequest === request) {
          pageRequest = null;
        }
      }
    },
    [apiFetch]
  );

  const applyPageCache = useCallback((data: PageCache) => {
    setDashboard(data.dashboard);
    setEntries(data.entries);
    setVendors(data.vendors);
    setCodCollections(data.codCollections);
    setSettlements(data.settlements);
  }, []);

  // ====================================================
  // INITIAL LOAD
  //
  // If pageCache exists, this does ZERO GET requests.
  // ====================================================

  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const run = async () => {
      try {
        setError("");

        const cached = pageCache;
        if (cached) {
          applyPageCache(cached);
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await fetchAllData(false);
        applyPageCache(data);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load accounting data"
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [applyPageCache, fetchAllData]);

  // ====================================================
  // REFRESH — INTENTIONALLY FETCHES GET DATA AGAIN
  // ====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      const data = await fetchAllData(true);
      applyPageCache(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh accounting data"
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ====================================================
  // CLIENT-SIDE FILTERING — NO API CALLS
  // ====================================================

  const filteredEntries = useMemo(() => {
    const search = entrySearch.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        !search ||
        [
          entry.vendor?.companyName,
          entry.shipment?.trackingNumber,
          entry.shipment?.receiverName,
          entry.description,
          getTypeLabel(entry.type),
        ].some((value) =>
          String(value || "").toLowerCase().includes(search)
        );

      const matchesType = !entryType || entry.type === entryType;
      const matchesDirection =
        !entryDirection || entry.direction === entryDirection;
      const matchesVendor =
        !entryVendorId ||
        String(entry.vendor?.id) === String(entryVendorId);

      return (
        matchesSearch &&
        matchesType &&
        matchesDirection &&
        matchesVendor
      );
    });
  }, [entries, entrySearch, entryType, entryDirection, entryVendorId]);

  const filteredCodCollections = useMemo(() => {
    return codCollections.filter((collection) => {
      const matchesStatus =
        !codStatus || collection.status === codStatus;
      const matchesVendor =
        !codVendorId ||
        String(collection.shipment?.vendor?.id) === String(codVendorId);

      return matchesStatus && matchesVendor;
    });
  }, [codCollections, codStatus, codVendorId]);

  const pendingCodCollections = useMemo(
    () => codCollections.filter((collection) => collection.status === "PENDING"),
    [codCollections]
  );

  const filteredSettlements = useMemo(() => {
    return settlements.filter((settlement) => {
      const matchesStatus =
        !settlementStatus || settlement.status === settlementStatus;
      const matchesVendor =
        !settlementVendorId ||
        String(settlement.vendor?.id) === String(settlementVendorId);

      return matchesStatus && matchesVendor;
    });
  }, [settlements, settlementStatus, settlementVendorId]);

  // ====================================================
  // OPEN SETTLEMENT BUILDER
  // ====================================================

  const openSettlementBuilder =
    async (
      vendor: Vendor
    ) => {
      setSelectedVendor(vendor);

      setShowCreateSettlement(
        true
      );

      setSettlementNotes("");

      setUnsettled(null);

      setUnsettledError("");

      setSelectedEntryIds([]);

      setUnsettledLoading(true);

      try {
        const response =
          await apiFetch(
            `/api/admin/accounting/vendors/${vendor.id}/unsettled`
          );

        const data: UnsettledData =
          response.data;

        setUnsettled(data);

        setSelectedEntryIds([
          ...data.credits.map(
            (entry) => entry.id
          ),

          ...data.debits.map(
            (entry) => entry.id
          ),
        ]);
      } catch (err) {
        setUnsettledError(
          err instanceof Error
            ? err.message
            : "Failed to load vendor entries"
        );
      } finally {
        setUnsettledLoading(false);
      }
    };

  // ====================================================
  // CLOSE BUILDER
  // ====================================================

  const closeSettlementBuilder =
    () => {
      setShowCreateSettlement(false);

      setUnsettled(null);

      setUnsettledError("");

      setSelectedEntryIds([]);

      setSettlementNotes("");
    };

  // ====================================================
  // TOGGLE ENTRY
  // ====================================================

  const toggleEntry = (
    id: string
  ) => {
    setSelectedEntryIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (value) =>
                value !== id
            )
          : [
              ...current,
              id,
            ]
    );
  };

  // ====================================================
  // ALL UNSETTLED
  // ====================================================

  const allUnsettledEntries =
    useMemo(() => {
      if (!unsettled) {
        return [] as UnsettledEntry[];
      }

      return [
        ...unsettled.credits,
        ...unsettled.debits,
      ];
    }, [unsettled]);

  // ====================================================
  // LIVE SELECTION
  // ====================================================

  const selection =
    useMemo(() => {
      let credits = 0;
      let debits = 0;

      for (const entry of allUnsettledEntries) {
        if (
          !selectedEntryIds.includes(
            entry.id
          )
        ) {
          continue;
        }

        if (
          entry.direction ===
          "CREDIT"
        ) {
          credits +=
            entry.remainingAmount;
        } else {
          debits +=
            entry.remainingAmount;
        }
      }

      credits =
        Math.round(
          credits * 100
        ) / 100;

      debits =
        Math.round(
          debits * 100
        ) / 100;

      const net =
        Math.round(
          (credits - debits) *
            100
        ) / 100;

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

        count:
          selectedEntryIds.length,
      };
    }, [
      allUnsettledEntries,
      selectedEntryIds,
    ]);

  // ====================================================
  // CREATE SETTLEMENT
  // ====================================================

  const handleCreateSettlement =
    async () => {
      if (
        !selectedVendor ||
        !unsettled
      ) {
        return;
      }

      if (
        selection.count === 0
      ) {
        alert(
          "Select at least one entry."
        );

        return;
      }

      if (
        selection.net === 0
      ) {
        alert(
          "Selected entries cancel out to zero. Adjust the selection."
        );

        return;
      }

      const items =
        allUnsettledEntries
          .filter((entry) =>
            selectedEntryIds.includes(
              entry.id
            )
          )
          .map((entry) => ({
            accountingEntryId:
              entry.id,

            amount:
              entry.remainingAmount,
          }));

      try {
        setActionLoading(true);

        await apiFetch(
          "/api/admin/accounting/settlements",
          {
            method: "POST",

            body: JSON.stringify({
              vendorId:
                selectedVendor.id,

              items,

              notes:
                settlementNotes ||
                null,
            }),
          }
        );

        closeSettlementBuilder();

        setSelectedVendor(null);

        // Do not refetch here.
        // The page intentionally reloads accounting GET data only on initial
        // load or when the user explicitly presses Refresh/browser refresh.
        setActiveTab("settlements");
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Failed to create settlement"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ====================================================
  // PROCESS SETTLEMENT
  // ====================================================

  const handleProcessSettlement =
    async (
      settlement: Settlement
    ) => {
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
          {
            method: "PATCH",
          }
        );

        // Do not refetch. The updated server state will be visible after
        // an explicit Refresh or browser refresh.
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Failed to process settlement"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ====================================================
  // PAY / COLLECT
  // ====================================================

  const handlePaySettlement =
    async () => {
      if (
        !selectedSettlement
      ) {
        return;
      }

      try {
        setActionLoading(true);

        await apiFetch(
          `/api/admin/accounting/settlements/${selectedSettlement.id}/pay`,
          {
            method: "PATCH",

            body: JSON.stringify({
              paymentReference:
                paymentReference ||
                null,

              notes:
                paymentNotes ||
                null,
            }),
          }
        );

        setSelectedSettlement(
          null
        );

        setPaymentReference("");

        setPaymentNotes("");

        // Do not refetch. The updated server state will be visible after
        // an explicit Refresh or browser refresh.
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Failed to complete settlement"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ====================================================
  // CANCEL
  // ====================================================

  const handleCancelSettlement =
    async (
      settlement: Settlement
    ) => {
      if (
        !confirm(
          `Cancel settlement for ${settlement.vendor.companyName}?`
        )
      ) {
        return;
      }

      try {
        setActionLoading(true);

        await apiFetch(
          `/api/admin/accounting/settlements/${settlement.id}/cancel`,
          {
            method: "PATCH",
          }
        );

        // Do not refetch. The updated server state will be visible after
        // an explicit Refresh or browser refresh.
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Failed to cancel settlement"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return <AccountingSkeleton />;
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#0b1729]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

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
              Manage COD collections,
              charges and vendor
              settlements.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#0b1729] shadow-sm transition hover:border-[#e23c2e] hover:text-[#e23c2e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Unable to load accounting
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TOP CARDS */}
        {/* ================================================== */}

        {dashboard && (
          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="COD Collected"
              value={formatMoney(
                dashboard.cod
                  .collected
              )}
              subtitle="Successfully collected"
              icon={
                <Banknote className="h-5 w-5" />
              }
              positive
              onClick={() => setActiveTab("cod")}
            />

            <StatCard
              title="Pending COD"
              value={formatMoney(
                dashboard.cod
                  .pending
              )}
              subtitle="Awaiting collection"
              icon={
                <Clock3 className="h-5 w-5" />
              }
              onClick={() => setActiveTab("pending-cod")}
            />

            <StatCard
              title="Vendor Payable"
              value={formatMoney(
                dashboard
                  .settlements
                  .totalOutstanding
              )}
              subtitle="Pending + processing"
              icon={
                <Wallet className="h-5 w-5" />
              }
              onClick={() => setActiveTab("settlements")}
            />

            <StatCard
              title="Settled"
              value={formatMoney(
                dashboard
                  .settlements
                  .paid
              )}
              subtitle="Already paid"
              icon={
                <CheckCircle2 className="h-5 w-5" />
              }
              positive
              onClick={() => setActiveTab("settlements")}
            />

          </div>
        )}

        {/* ================================================== */}
        {/* SECONDARY STATS */}
        {/* ================================================== */}

        {dashboard && (
          <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SmallStat
              label="Total Credits"
              value={formatMoney(
                dashboard.totalCredits
              )}
              icon={
                <ArrowDownRight className="h-4 w-4" />
              }
            />

            <SmallStat
              label="Total Charges"
              value={formatMoney(
                dashboard.totalDebits
              )}
              icon={
                <ArrowUpRight className="h-4 w-4" />
              }
            />

            <SmallStat
              label="Vendor Balance"
              value={formatMoney(
                dashboard.netBalance
              )}
              icon={
                <CircleDollarSign className="h-4 w-4" />
              }
            />

            <SmallStat
              label="Cargo Earnings"
              value={formatMoney(
                dashboard
                  .companyEarnings ??
                  dashboard.totalDebits
              )}
              icon={
                <Banknote className="h-4 w-4" />
              }
            />

          </div>
        )}

        {/* ================================================== */}
        {/* TABS */}
        {/* ================================================== */}

        <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="flex min-w-max">

            <TabButton
              active={
                activeTab ===
                "overview"
              }
              onClick={() =>
                setActiveTab(
                  "overview"
                )
              }
            >
              Overview
            </TabButton>

            <TabButton
              active={
                activeTab ===
                "transactions"
              }
              onClick={() =>
                setActiveTab(
                  "transactions"
                )
              }
            >
              Transactions
            </TabButton>

            <TabButton
              active={
                activeTab ===
                "vendors"
              }
              onClick={() =>
                setActiveTab(
                  "vendors"
                )
              }
            >
              Vendors
            </TabButton>

            <TabButton
              active={
                activeTab ===
                "pending-cod"
              }
              onClick={() =>
                setActiveTab("pending-cod")
              }
            >
              Pending COD
            </TabButton>

            <TabButton
              active={
                activeTab ===
                "cod"
              }
              onClick={() =>
                setActiveTab("cod")
              }
            >
              COD
            </TabButton>

            <TabButton
              active={
                activeTab ===
                "settlements"
              }
              onClick={() =>
                setActiveTab(
                  "settlements"
                )
              }
            >
              Settlements
            </TabButton>

          </div>
        </div>

        {/* ================================================== */}
        {/* OVERVIEW */}
        {/* ================================================== */}

        {activeTab ===
          "overview" && (
          <OverviewSection
            dashboard={dashboard}
            vendors={vendors}
            settlements={settlements}
            onVendorClick={(
              vendor
            ) =>
              setSelectedVendor(
                vendor
              )
            }
            onGoToTab={(tab) =>
              setActiveTab(tab)
            }
          />
        )}

        {/* ================================================== */}
        {/* TRANSACTIONS */}
        {/* ================================================== */}

        {activeTab ===
          "transactions" && (
          <section>
            <SectionHeader
              title="Accounting Transactions"
              description="Operational financial ledger. Vendor settlement itself is tracked separately."
            />

            <div className="mb-5 mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_220px]">

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={
                    entrySearch
                  }
                  onChange={(e) =>
                    setEntrySearch(
                      e.target.value
                    )
                  }
                  placeholder="Search vendor, shipment..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
                />
              </div>

              <select
                value={
                  entryType
                }
                onChange={(e) =>
                  setEntryType(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">
                  All Types
                </option>

                <option value="COD_COLLECTION">
                  COD Collection
                </option>

                <option value="SHIPPING_CHARGE">
                  Shipping Charge
                </option>

                <option value="RETURN_CHARGE">
                  Return Charge
                </option>

                <option value="PICKUP_CHARGE">
                  Pickup Charge
                </option>

                <option value="STORAGE_CHARGE">
                  Storage Charge
                </option>

                <option value="OTHER_CHARGE">
                  Other Charge
                </option>

                <option value="REFUND">
                  Refund
                </option>

                <option value="VENDOR_SETTLEMENT">
                  Vendor Settlement
                </option>
              </select>

              <select
                value={
                  entryDirection
                }
                onChange={(e) =>
                  setEntryDirection(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">
                  All Directions
                </option>

                <option value="CREDIT">
                  Credit
                </option>

                <option value="DEBIT">
                  Debit
                </option>
              </select>

              <select
                value={
                  entryVendorId
                }
                onChange={(e) =>
                  setEntryVendorId(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">
                  All Vendors
                </option>

                {vendors.map(
                  (vendor) => (
                    <option
                      key={
                        vendor.id
                      }
                      value={
                        vendor.id
                      }
                    >
                      {
                        vendor.companyName
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>
                        Date
                      </TableHead>

                      <TableHead>
                        Vendor
                      </TableHead>

                      <TableHead>
                        Type
                      </TableHead>

                      <TableHead>
                        Shipment
                      </TableHead>

                      <TableHead>
                        Direction
                      </TableHead>

                      <TableHead>
                        Amount
                      </TableHead>

                      <TableHead>
                        Description
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredEntries.length ===
                    0 ? (
                      <EmptyTableRow
                        colSpan={7}
                        text="No accounting transactions found."
                      />
                    ) : (
                      filteredEntries.map(
                        (entry) => (
                          <tr
                            key={
                              entry.id
                            }
                            className="transition hover:bg-slate-50"
                          >

                            <TableCell>
                              <div className="text-sm font-medium text-slate-700">
                                {formatDate(
                                  entry.createdAt
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="font-medium text-[#0b1729]">
                                {
                                  entry
                                    .vendor
                                    ?.companyName
                                }
                              </div>
                            </TableCell>

                            <TableCell>
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {getTypeLabel(
                                  entry.type
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              {entry.shipment ? (
                                <div>
                                  <div className="font-mono text-xs font-semibold text-[#0b1729]">
                                    {
                                      entry
                                        .shipment
                                        .trackingNumber
                                    }
                                  </div>

                                  <div className="mt-0.5 text-xs text-slate-400">
                                    {
                                      entry
                                        .shipment
                                        .receiverName
                                    }
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  —
                                </span>
                              )}
                            </TableCell>

                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                                  entry.direction ===
                                  "CREDIT"
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {entry.direction ===
                                "CREDIT" ? (
                                  <ArrowDownRight className="h-4 w-4" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4" />
                                )}

                                {
                                  entry.direction
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              <span
                                className={`font-semibold ${
                                  entry.direction ===
                                  "CREDIT"
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {entry.direction ===
                                "CREDIT"
                                  ? "+"
                                  : "-"}
                                {formatMoney(
                                  entry.amount
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="block max-w-[240px] truncate text-sm text-slate-500">
                                {entry.description ||
                                  "—"}
                              </span>
                            </TableCell>

                          </tr>
                        )
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* VENDORS */}
        {/* ================================================== */}

        {activeTab ===
          "vendors" && (
          <section>

            <SectionHeader
              title="Vendor Accounting"
              description="Unsettled COD credits minus vendor charges."
            />

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>
                        Vendor
                      </TableHead>

                      <TableHead>
                        Shipments
                      </TableHead>

                      <TableHead>
                        Unsettled Credits
                      </TableHead>

                      <TableHead>
                        Unsettled Charges
                      </TableHead>

                      <TableHead>
                        Balance
                      </TableHead>

                      <TableHead>
                        Open Settlement
                      </TableHead>

                      <TableHead>
                        Action
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {vendors.length ===
                    0 ? (
                      <EmptyTableRow
                        colSpan={7}
                        text="No vendors found."
                      />
                    ) : (
                      vendors.map(
                        (vendor) => (
                          <tr
                            key={
                              vendor.id
                            }
                            className="transition hover:bg-slate-50"
                          >

                            <TableCell>
                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1729] text-sm font-bold text-white">
                                  {vendor.companyName
                                    .slice(
                                      0,
                                      1
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <div className="font-semibold text-[#0b1729]">
                                    {
                                      vendor.companyName
                                    }
                                  </div>

                                  <div className="text-xs text-slate-400">
                                    {
                                      vendor.location
                                    }
                                  </div>
                                </div>

                              </div>
                            </TableCell>

                            <TableCell>
                              {
                                vendor
                                  ._count
                                  ?.shipments ??
                                0
                              }
                            </TableCell>

                            <TableCell>
                              <span className="font-semibold text-emerald-600">
                                {formatMoney(
                                  vendor.availableCredits
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="font-semibold text-red-600">
                                {formatMoney(
                                  vendor.availableDebits
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="font-bold text-[#0b1729]">
                                {formatMoney(
                                  vendor.balance
                                )}
                              </div>

                              <div
                                className={`text-xs font-semibold ${
                                  vendor.direction ===
                                  "PAY_VENDOR"
                                    ? "text-emerald-600"
                                    : vendor.direction ===
                                        "COLLECT_FROM_VENDOR"
                                      ? "text-amber-600"
                                      : "text-slate-400"
                                }`}
                              >
                                {getDirectionLabel(
                                  vendor.direction
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              {vendor.outstandingSettlement >
                              0 ? (
                                <span className="font-semibold text-amber-600">
                                  {formatMoney(
                                    vendor.outstandingSettlement
                                  )}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  —
                                </span>
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedVendor(
                                      vendor
                                    )
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0b1729] transition hover:border-[#e23c2e] hover:text-[#e23c2e]"
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    vendor.pendingSettlementCount >
                                    0 ||
                                    vendor.balance ===
                                      0
                                  }
                                  onClick={() =>
                                    openSettlementBuilder(
                                      vendor
                                    )
                                  }
                                  className="rounded-lg bg-[#e23c2e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#ce3122] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Settle
                                </button>

                              </div>
                            </TableCell>

                          </tr>
                        )
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* PENDING COD */}
        {/* ================================================== */}

        {activeTab === "pending-cod" && (
          <section>
            <SectionHeader
              title="Pending COD"
              description="COD amounts that are still awaiting collection."
            />

            <div className="mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Awaiting collection
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {pendingCodCollections.length} pending COD record{pendingCodCollections.length === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-lg font-bold text-amber-900">
                  {formatMoney(
                    pendingCodCollections.reduce((sum, item) => sum + Number(item.amount || 0), 0)
                  )}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>COD Amount</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingCodCollections.length === 0 ? (
                      <EmptyTableRow colSpan={7} text="No pending COD collections." />
                    ) : (
                      pendingCodCollections.map((collection) => (
                        <tr key={collection.id} className="hover:bg-slate-50">
                          <TableCell>
                            <span className="font-mono text-xs font-semibold">
                              {collection.shipment?.trackingNumber || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{collection.shipment?.receiverName || "—"}</div>
                            <div className="mt-1 text-xs text-slate-400">{collection.shipment?.receiverPhone || "—"}</div>
                          </TableCell>
                          <TableCell>{collection.shipment?.vendor?.companyName || "—"}</TableCell>
                          <TableCell>{collection.rider?.user?.name || "Not assigned"}</TableCell>
                          <TableCell>
                            <span className="font-bold text-amber-700">{formatMoney(collection.amount)}</span>
                          </TableCell>
                          <TableCell>{formatDate(collection.createdAt)}</TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              PENDING
                            </span>
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

        {/* ================================================== */}
        {/* COD */}
        {/* ================================================== */}

        {activeTab === "cod" && (
          <section>

            <SectionHeader
              title="COD Collections"
              description="Track money collected by riders."
            />

            <div className="mb-5 mt-5 grid gap-3 sm:grid-cols-2">

              <select
                value={
                  codStatus
                }
                onChange={(e) =>
                  setCodStatus(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="COLLECTED">
                  Collected
                </option>

                <option value="FAILED">
                  Failed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

              <select
                value={
                  codVendorId
                }
                onChange={(e) =>
                  setCodVendorId(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">
                  All Vendors
                </option>

                {vendors.map(
                  (vendor) => (
                    <option
                      key={
                        vendor.id
                      }
                      value={
                        vendor.id
                      }
                    >
                      {
                        vendor.companyName
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <TableHead>
                        Shipment
                      </TableHead>

                      <TableHead>
                        Vendor
                      </TableHead>

                      <TableHead>
                        Rider
                      </TableHead>

                      <TableHead>
                        Expected
                      </TableHead>

                      <TableHead>
                        Collected
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Date
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredCodCollections.length ===
                    0 ? (
                      <EmptyTableRow
                        colSpan={7}
                        text="No COD collections found."
                      />
                    ) : (
                      filteredCodCollections.map(
                        (
                          collection
                        ) => (
                          <tr
                            key={
                              collection.id
                            }
                            className="transition hover:bg-slate-50"
                          >

                            <TableCell>
                              <div className="font-mono text-xs font-semibold">
                                {
                                  collection
                                    .shipment
                                    ?.trackingNumber
                                }
                              </div>

                              <div className="mt-1 text-xs text-slate-400">
                                {
                                  collection
                                    .shipment
                                    ?.receiverName
                                }
                              </div>
                            </TableCell>

                            <TableCell>
                              <span className="font-medium">
                                {
                                  collection
                                    .shipment
                                    ?.vendor
                                    ?.companyName ||
                                  "—"
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              {collection.rider ? (
                                <div>
                                  <div className="font-medium">
                                    {
                                      collection
                                        .rider
                                        .user
                                        ?.name
                                    }
                                  </div>

                                  <div className="text-xs text-slate-400">
                                    {
                                      collection
                                        .rider
                                        .phone
                                    }
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
                                {formatMoney(
                                  collection
                                    .shipment
                                    ?.codAmount ||
                                    0
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="font-bold text-emerald-600">
                                {formatMoney(
                                  collection.amount
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  collection.status
                                )}`}
                              >
                                {
                                  collection.status
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="text-sm text-slate-600">
                                {formatDate(
                                  collection.collectedAt ||
                                    collection.createdAt
                                )}
                              </div>
                            </TableCell>

                          </tr>
                        )
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* SETTLEMENTS */}
        {/* ================================================== */}

        {activeTab ===
          "settlements" && (
          <section>

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <SectionHeader
                title="Vendor Settlements"
                description="COD credits minus vendor charges."
              />

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "vendors"
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-semibold text-white transition hover:bg-[#ce3122]"
              >
                <Wallet className="h-4 w-4" />

                Create Settlement
              </button>

            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">

              <select
                value={
                  settlementStatus
                }
                onChange={(e) =>
                  setSettlementStatus(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="PROCESSING">
                  Processing
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

              <select
                value={
                  settlementVendorId
                }
                onChange={(e) =>
                  setSettlementVendorId(
                    e.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e]"
              >
                <option value="">
                  All Vendors
                </option>

                {vendors.map(
                  (vendor) => (
                    <option
                      key={
                        vendor.id
                      }
                      value={
                        vendor.id
                      }
                    >
                      {
                        vendor.companyName
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1150px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>

                      <TableHead>
                        Vendor
                      </TableHead>

                      <TableHead>
                        COD
                      </TableHead>

                      <TableHead>
                        Shipping
                      </TableHead>

                      <TableHead>
                        Returns
                      </TableHead>

                      <TableHead>
                        Other
                      </TableHead>

                      <TableHead>
                        Net
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Created
                      </TableHead>

                      <TableHead>
                        Action
                      </TableHead>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredSettlements.length ===
                    0 ? (
                      <EmptyTableRow
                        colSpan={9}
                        text="No settlements found."
                      />
                    ) : (
                      filteredSettlements.map(
                        (
                          settlement
                        ) => (
                          <tr
                            key={
                              settlement.id
                            }
                            className="transition hover:bg-slate-50"
                          >

                            <TableCell>
                              <div className="font-semibold">
                                {
                                  settlement
                                    .vendor
                                    ?.companyName
                                }
                              </div>

                              <div className="mt-1 font-mono text-[10px] text-slate-400">
                                {
                                  settlement.id
                                }
                              </div>
                            </TableCell>

                            <TableCell>
                              <span className="text-emerald-600">
                                {formatMoney(
                                  settlement.totalCodAmount
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="text-red-600">
                                {formatMoney(
                                  settlement.totalShippingCharge
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="text-red-600">
                                {formatMoney(
                                  settlement.totalReturnCharge
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="text-red-600">
                                {formatMoney(
                                  settlement.totalOtherCharges
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="font-bold text-[#0b1729]">
                                {formatMoney(
                                  settlement.netPayable
                                )}
                              </div>

                              <div
                                className={`text-xs font-semibold ${
                                  settlement.direction ===
                                  "PAY_VENDOR"
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {getDirectionLabel(
                                  settlement.direction
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  settlement.status
                                )}`}
                              >
                                {
                                  settlement.status
                                }
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="text-sm text-slate-500">
                                {formatDate(
                                  settlement.createdAt
                                )}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">

                                <button
                                  type="button"
                                  onClick={() => setBillSettlement(settlement)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                  title="Download settlement bill"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Bill
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void shareSettlementBill(settlement)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                  title="Share settlement bill"
                                >
                                  <Share2 className="h-3.5 w-3.5" />
                                  Share
                                </button>

                                {settlement.status ===
                                  "PENDING" && (
                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading
                                    }
                                    onClick={() =>
                                      handleProcessSettlement(
                                        settlement
                                      )
                                    }
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                  >
                                    Process
                                  </button>
                                )}

                                {(settlement.status ===
                                  "PENDING" ||
                                  settlement.status ===
                                    "PROCESSING") && (
                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading
                                    }
                                    onClick={() => {
                                      setSelectedSettlement(
                                        settlement
                                      );

                                      setPaymentReference(
                                        ""
                                      );

                                      setPaymentNotes(
                                        ""
                                      );
                                    }}
                                    className="rounded-lg bg-[#e23c2e] px-2.5 py-2 text-xs font-semibold text-white hover:bg-[#ce3122] disabled:opacity-50"
                                  >
                                    {settlement.direction ===
                                    "PAY_VENDOR"
                                      ? "Pay"
                                      : "Collect"}
                                  </button>
                                )}

                                {(settlement.status ===
                                  "PENDING" ||
                                  settlement.status ===
                                    "PROCESSING") && (
                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading
                                    }
                                    onClick={() =>
                                      handleCancelSettlement(
                                        settlement
                                      )
                                    }
                                    className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                )}

                                {settlement.status ===
                                  "PAID" && (
                                  <span className="text-xs font-medium text-emerald-600">
                                    Settled{" "}
                                    {formatDate(
                                      settlement.paidAt
                                    )}
                                  </span>
                                )}

                              </div>
                            </TableCell>

                          </tr>
                        )
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ================================================== */}
      {/* VENDOR MODAL */}
      {/* ================================================== */}

      {selectedVendor &&
        !showCreateSettlement && (
          <Modal
            onClose={() =>
              setSelectedVendor(
                null
              )
            }
          >

            <div className="mb-6 flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#e23c2e]">
                  Vendor
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {
                    selectedVendor.companyName
                  }
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedVendor.location
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVendor(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <ModalStat
                label="Unsettled credits"
                value={formatMoney(
                  selectedVendor.availableCredits
                )}
                positive
              />

              <ModalStat
                label="Unsettled charges"
                value={formatMoney(
                  selectedVendor.availableDebits
                )}
              />

              <ModalStat
                label="Vendor balance"
                value={formatMoney(
                  selectedVendor.balance
                )}
              />

              <ModalStat
                label="Open settlement"
                value={formatMoney(
                  selectedVendor.outstandingSettlement
                )}
              />

            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Contact
                </span>

                <span className="text-sm font-semibold">
                  {
                    selectedVendor.contactId
                  }
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Shipments
                </span>

                <span className="text-sm font-semibold">
                  {
                    selectedVendor
                      ._count
                      ?.shipments ??
                    0
                  }
                </span>

              </div>

            </div>

            {selectedVendor.pendingSettlementCount >
            0 ? (
              <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                This vendor already
                has an open
                settlement. Finish
                or cancel it before
                creating a new one.
              </p>
            ) : selectedVendor.balance ===
              0 ? (
              <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                There is currently
                nothing to settle
                for this vendor.
              </p>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openSettlementBuilder(
                    selectedVendor
                  )
                }
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

      {showCreateSettlement &&
        selectedVendor && (
          <Modal
            wide
            onClose={
              closeSettlementBuilder
            }
          >

            <div className="mb-6 flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#e23c2e]">
                  Settlement
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Create Settlement
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedVendor.companyName
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeSettlementBuilder
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {unsettledLoading && (
              <div className="flex items-center justify-center gap-3 py-12 text-slate-500">

                <Loader2 className="h-5 w-5 animate-spin" />

                <span className="text-sm">
                  Loading unsettled
                  entries...
                </span>

              </div>
            )}

            {!unsettledLoading &&
              unsettledError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {
                    unsettledError
                  }
                </div>
              )}

            {!unsettledLoading &&
              !unsettledError &&
              unsettled &&
              allUnsettledEntries.length ===
                0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Nothing left to
                  settle for this
                  vendor.
                </div>
              )}

            {!unsettledLoading &&
              !unsettledError &&
              unsettled &&
              allUnsettledEntries.length >
                0 && (
                <>
                  {/* SUMMARY */}

                  <div className="mb-5 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        Credits
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-700">
                        {formatMoney(
                          selection.credits
                        )}
                      </p>

                      <p className="mt-1 text-[11px] text-emerald-600/70">
                        Money held for
                        vendor
                      </p>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                        Charges
                      </p>

                      <p className="mt-1 text-lg font-bold text-red-700">
                        {formatMoney(
                          selection.debits
                        )}
                      </p>

                      <p className="mt-1 text-[11px] text-red-600/70">
                        Vendor owes cargo
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-[#0b1729] p-4 text-white">

                      <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                        {selection.direction ===
                        "COLLECT_FROM_VENDOR"
                          ? "Collect from vendor"
                          : "Pay vendor"}
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {formatMoney(
                          selection.amount
                        )}
                      </p>

                    </div>

                  </div>

                  {/* EXAMPLE */}

                  <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Settlement calculation
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      COD collected
                      from customer −
                      vendor charges =
                      amount to settle.
                    </p>

                    <p className="mt-2 text-sm font-bold text-blue-900">
                      Example:{" "}
                      {formatMoney(
                        20000
                      )}{" "}
                      −{" "}
                      {formatMoney(
                        200
                      )}{" "}
                      ={" "}
                      {formatMoney(
                        19800
                      )}{" "}
                      to vendor
                    </p>

                  </div>

                  {/* CREDITS */}

                  <EntryGroup
                    title="Credits"
                    subtitle="COD collected on the vendor's behalf and other vendor credits"
                    tone="credit"
                    entries={
                      unsettled.credits
                    }
                    selectedIds={
                      selectedEntryIds
                    }
                    onToggle={
                      toggleEntry
                    }
                  />

                  {/* DEBITS */}

                  <EntryGroup
                    title="Charges"
                    subtitle="Shipping, return, pickup, storage and other vendor charges"
                    tone="debit"
                    entries={
                      unsettled.debits
                    }
                    selectedIds={
                      selectedEntryIds
                    }
                    onToggle={
                      toggleEntry
                    }
                  />

                  {/* NOTES */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-semibold">
                      Notes
                    </label>

                    <textarea
                      value={
                        settlementNotes
                      }
                      onChange={(e) =>
                        setSettlementNotes(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="Optional settlement notes..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
                    />

                  </div>

                  {/* CREATE */}

                  <button
                    type="button"
                    disabled={
                      actionLoading ||
                      selection.count ===
                        0 ||
                      selection.net ===
                        0
                    }
                    onClick={
                      handleCreateSettlement
                    }
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

                        {selection.direction ===
                        "COLLECT_FROM_VENDOR"
                          ? `Create collection of ${formatMoney(
                              selection.amount
                            )}`
                          : `Create payment of ${formatMoney(
                              selection.amount
                            )}`}
                      </>
                    )}

                  </button>

                  {selection.net ===
                    0 &&
                    selection.count >
                      0 && (
                      <p className="mt-2 text-center text-xs text-amber-600">
                        Selected credits
                        and charges
                        cancel out
                        exactly —
                        nothing to
                        settle.
                      </p>
                    )}

                </>
              )}

          </Modal>
        )}

      {/* ================================================== */}
      {/* SETTLEMENT BILL MODAL */}
      {/* ================================================== */}

      {billSettlement && (
        <SettlementBillModal
          settlement={billSettlement}
          onClose={() => setBillSettlement(null)}
        />
      )}

      {/* ================================================== */}
      {/* PAY / COLLECT MODAL */}
      {/* ================================================== */}

      {selectedSettlement && (
        <Modal
          onClose={() => {
            setSelectedSettlement(
              null
            );

            setPaymentReference("");

            setPaymentNotes("");
          }}
        >

          <div className="mb-6 flex items-start justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-[#e23c2e]">
                {selectedSettlement.direction ===
                "PAY_VENDOR"
                  ? "Vendor Payment"
                  : "Vendor Collection"}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {selectedSettlement.direction ===
                "PAY_VENDOR"
                  ? "Mark as Paid"
                  : "Mark as Collected"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {
                  selectedSettlement
                    .vendor
                    ?.companyName
                }
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedSettlement(
                  null
                )
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* AMOUNT */}

          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center justify-between text-sm">

              <span className="text-slate-500">
                COD credits
              </span>

              <span className="font-semibold text-emerald-600">
                {formatMoney(
                  selectedSettlement.totalCredits
                )}
              </span>

            </div>

            <div className="mt-2 flex items-center justify-between text-sm">

              <span className="text-slate-500">
                Vendor charges
              </span>

              <span className="font-semibold text-red-600">
                −
                {formatMoney(
                  selectedSettlement.totalDebits
                )}
              </span>

            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {selectedSettlement.direction ===
                "PAY_VENDOR"
                  ? "Amount to pay vendor"
                  : "Amount to collect from vendor"}
              </p>

              <p className="mt-1 text-2xl font-bold text-[#0b1729]">
                {formatMoney(
                  selectedSettlement.netPayable
                )}
              </p>

              <p
                className={`mt-1 text-xs font-semibold ${
                  selectedSettlement.direction ===
                  "PAY_VENDOR"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {getDirectionLabel(
                  selectedSettlement.direction
                )}
              </p>

            </div>

          </div>

          {/* REFERENCE */}

          <div className="space-y-4">

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Payment Reference
              </label>

              <input
                value={
                  paymentReference
                }
                onChange={(e) =>
                  setPaymentReference(
                    e.target.value
                  )
                }
                placeholder="Bank transfer / cheque reference..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Notes
              </label>

              <textarea
                value={
                  paymentNotes
                }
                onChange={(e) =>
                  setPaymentNotes(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Optional payment notes..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#e23c2e] focus:ring-2 focus:ring-[#e23c2e]/10"
              />

            </div>

          </div>

          {/* CONFIRM */}

          <button
            type="button"
            disabled={
              actionLoading
            }
            onClick={
              handlePaySettlement
            }
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

                {selectedSettlement.direction ===
                "PAY_VENDOR"
                  ? "Confirm Vendor Payment"
                  : "Confirm Vendor Collection"}
              </>
            )}

          </button>

        </Modal>
      )}

    </main>
  );
}

// ======================================================
// SKELETON
// ======================================================

function AccountingSkeleton() {
  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-7">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-8 w-48 rounded-lg bg-slate-200" />
              <div className="h-4 w-80 max-w-full rounded bg-slate-200" />
            </div>
            <div className="hidden h-11 w-28 rounded-xl bg-slate-200 sm:block" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between">
                  <div className="h-10 w-10 rounded-xl bg-slate-200" />
                  <div className="h-4 w-14 rounded bg-slate-200" />
                </div>
                <div className="mt-5 h-4 w-28 rounded bg-slate-200" />
                <div className="mt-2 h-7 w-36 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-28 rounded-xl bg-slate-200" />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-6 w-52 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-80 max-w-full rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ======================================================
// SETTLEMENT BILL - TEXT
// ======================================================

function getSettlementShareText(settlement: Settlement) {
  const direction = getDirectionLabel(settlement.direction);
  const vendor = settlement.vendor?.companyName || "Vendor";

  const itemLines = (settlement.items || []).map((item) => {
    const entry = item.accountingEntry;
    const tracking = entry?.shipment?.trackingNumber || "—";
    const type = entry ? getTypeLabel(entry.type) : "Accounting Entry";
    return `${tracking} | ${type} | ${formatMoney(item.amount)}`;
  });

  return [
    "ROCKET SHIPPING CARGO",
    "Settlement Bill",
    "",
    `Vendor: ${vendor}`,
    `Settlement ID: ${settlement.id}`,
    `Direction: ${direction}`,
    `Status: ${settlement.status}`,
    `Created: ${formatDate(settlement.createdAt)}`,
    `Paid: ${formatDate(settlement.paidAt)}`,
    "",
    `COD Credits: ${formatMoney(settlement.totalCodAmount)}`,
    `Shipping Charges: ${formatMoney(settlement.totalShippingCharge)}`,
    `Return Charges: ${formatMoney(settlement.totalReturnCharge)}`,
    `Other Charges: ${formatMoney(settlement.totalOtherCharges)}`,
    `Total Credits: ${formatMoney(settlement.totalCredits)}`,
    `Total Debits: ${formatMoney(settlement.totalDebits)}`,
    `Net Amount: ${formatMoney(settlement.netPayable)}`,
    "",
    `Payment Reference: ${settlement.paymentReference || "—"}`,
    `Notes: ${settlement.notes || "—"}`,
    ...(itemLines.length ? ["", "Settlement Items:", ...itemLines] : []),
  ].join("\n");
}

// ======================================================
// CREATE BILL IMAGE
// ======================================================

async function createSettlementBillCanvas(
  settlement: Settlement
): Promise<HTMLCanvasElement> {
  const items = settlement.items || [];
  const width = 1400;
  const rowHeight = 58;
  const itemRows = Math.max(items.length, 1);
  const height = 1250 + itemRows * rowHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create bill image.");

  const navy = "#0b1729";
  const red = "#e23c2e";
  const slate = "#64748b";
  const light = "#f8fafc";
  const border = "#e2e8f0";
  const green = "#059669";

  ctx.fillStyle = "#eef1f5";
  ctx.fillRect(0, 0, width, height);

  // Bill paper
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(55, 45, width - 110, height - 90);

  const left = 105;
  const right = width - 105;
  let y = 125;

  ctx.fillStyle = red;
  ctx.font = "700 22px Arial";
  ctx.fillText("ROCKET SHIPPING CARGO", left, y);

  y += 55;
  ctx.fillStyle = navy;
  ctx.font = "700 40px Arial";
  ctx.fillText("Settlement Bill", left, y);

  ctx.fillStyle = slate;
  ctx.font = "400 18px Arial";
  ctx.fillText("Vendor accounting settlement", left, y + 34);

  ctx.textAlign = "right";
  ctx.fillStyle = slate;
  ctx.font = "600 15px Arial";
  ctx.fillText("SETTLEMENT ID", right, 125);
  ctx.fillStyle = navy;
  ctx.font = "600 15px monospace";
  ctx.fillText(settlement.id, right, 151);
  ctx.textAlign = "left";

  y += 95;
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.stroke();

  y += 50;

  const boxW = (right - left - 24) / 2;
  const boxH = 100;
  const boxes = [
    ["VENDOR", settlement.vendor?.companyName || "—", settlement.vendor?.contactId || ""],
    ["STATUS", settlement.status, `Created ${formatDate(settlement.createdAt)}`],
    ["DIRECTION", getDirectionLabel(settlement.direction), ""],
    ["PAYMENT DATE", formatDate(settlement.paidAt), ""],
  ];

  boxes.forEach((box, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = left + col * (boxW + 24);
    const yy = y + row * (boxH + 18);

    ctx.fillStyle = light;
    ctx.fillRect(x, yy, boxW, boxH);
    ctx.strokeStyle = border;
    ctx.strokeRect(x, yy, boxW, boxH);

    ctx.fillStyle = slate;
    ctx.font = "700 13px Arial";
    ctx.fillText(box[0], x + 18, yy + 25);

    ctx.fillStyle = navy;
    ctx.font = "700 20px Arial";
    ctx.fillText(String(box[1]).slice(0, 55), x + 18, yy + 55);

    if (box[2]) {
      ctx.fillStyle = slate;
      ctx.font = "400 14px Arial";
      ctx.fillText(String(box[2]).slice(0, 65), x + 18, yy + 80);
    }
  });

  y += boxH * 2 + 18 * 2 + 40;

  // Items heading
  ctx.fillStyle = navy;
  ctx.font = "700 21px Arial";
  ctx.fillText("Settlement Items", left, y);
  y += 28;

  const tableX = left;
  const tableW = right - left;
  const colX = [tableX, tableX + 220, tableX + 470, tableX + 1040];
  const headerH = 44;

  ctx.fillStyle = light;
  ctx.fillRect(tableX, y, tableW, headerH);
  ctx.strokeStyle = border;
  ctx.strokeRect(tableX, y, tableW, headerH);

  ctx.fillStyle = slate;
  ctx.font = "700 13px Arial";
  ctx.fillText("TRACKING", colX[0] + 12, y + 28);
  ctx.fillText("TYPE", colX[1] + 12, y + 28);
  ctx.fillText("DESCRIPTION", colX[2] + 12, y + 28);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", right - 12, y + 28);
  ctx.textAlign = "left";

  y += headerH;

  const rows = items.length ? items : [null];
  rows.forEach((item) => {
    ctx.strokeStyle = border;
    ctx.strokeRect(tableX, y, tableW, rowHeight);

    if (!item) {
      ctx.fillStyle = slate;
      ctx.font = "400 14px Arial";
      ctx.fillText("No item-level entries were returned by the settlement API.", tableX + 14, y + 35);
    } else {
      const entry = item.accountingEntry;
      const tracking = entry?.shipment?.trackingNumber || "—";
      const type = entry ? getTypeLabel(entry.type) : "Accounting Entry";
      const description = entry?.description || "—";
      const amount = formatMoney(item.amount);

      ctx.fillStyle = navy;
      ctx.font = "600 14px monospace";
      ctx.fillText(tracking.slice(0, 27), colX[0] + 12, y + 35);

      ctx.font = "600 14px Arial";
      ctx.fillText(type.slice(0, 28), colX[1] + 12, y + 35);

      ctx.fillStyle = slate;
      ctx.font = "400 14px Arial";
      ctx.fillText(description.slice(0, 65), colX[2] + 12, y + 35);

      ctx.textAlign = "right";
      ctx.fillStyle = navy;
      ctx.font = "700 14px Arial";
      ctx.fillText(amount, right - 12, y + 35);
      ctx.textAlign = "left";
    }

    y += rowHeight;
  });

  y += 35;

  const totalsX = width - 520;
  const totals = [
    ["COD credits", formatMoney(settlement.totalCodAmount)],
    ["Shipping charges", formatMoney(settlement.totalShippingCharge)],
    ["Return charges", formatMoney(settlement.totalReturnCharge)],
    ["Other charges", formatMoney(settlement.totalOtherCharges)],
    ["Total credits", formatMoney(settlement.totalCredits)],
    ["Total debits", formatMoney(settlement.totalDebits)],
  ];

  totals.forEach(([label, value]) => {
    ctx.fillStyle = slate;
    ctx.font = "400 16px Arial";
    ctx.fillText(label, totalsX, y);
    ctx.textAlign = "right";
    ctx.fillStyle = navy;
    ctx.font = "700 16px Arial";
    ctx.fillText(value, right, y);
    ctx.textAlign = "left";
    y += 31;
  });

  y += 10;
  ctx.strokeStyle = navy;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(totalsX, y);
  ctx.lineTo(right, y);
  ctx.stroke();
  y += 42;

  ctx.fillStyle = navy;
  ctx.font = "700 23px Arial";
  ctx.fillText(getDirectionLabel(settlement.direction), totalsX, y);
  ctx.textAlign = "right";
  ctx.fillStyle = green;
  ctx.font = "800 26px Arial";
  ctx.fillText(formatMoney(settlement.netPayable), right, y);
  ctx.textAlign = "left";

  y += 60;
  if (settlement.paymentReference || settlement.notes) {
    ctx.fillStyle = "#fffbeb";
    ctx.fillRect(left, y, right - left, 105);
    ctx.strokeStyle = "#fde68a";
    ctx.strokeRect(left, y, right - left, 105);

    ctx.fillStyle = navy;
    ctx.font = "700 16px Arial";
    ctx.fillText("Settlement Notes", left + 18, y + 28);
    ctx.fillStyle = slate;
    ctx.font = "400 14px Arial";
    ctx.fillText(`Reference: ${settlement.paymentReference || "—"}`, left + 18, y + 55);
    ctx.fillText(`Notes: ${settlement.notes || "—"}`, left + 18, y + 80);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 13px Arial";
  ctx.fillText("Generated from the accounting settlement record.", width / 2, height - 65);
  ctx.textAlign = "left";

  return canvas;
}

// ======================================================
// CREATE PDF FROM THE SAME BILL IMAGE
// ======================================================

async function createSettlementBillPdf(
  settlement: Settlement
): Promise<File> {
  const canvas = await createSettlementBillCanvas(settlement);
  const image = canvas.toDataURL("image/png", 1);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * usableWidth) / canvas.width;

  let remaining = imageHeight;
  let offset = 0;
  const renderedPageHeight = pageHeight - margin * 2;

  while (remaining > 0) {
    pdf.addImage(
      image,
      "PNG",
      margin,
      margin - offset,
      usableWidth,
      imageHeight,
      undefined,
      "FAST"
    );

    remaining -= renderedPageHeight;
    offset += renderedPageHeight;

    if (remaining > 0) {
      pdf.addPage();
    }
  }

  const blob = pdf.output("blob");
  const vendor = (settlement.vendor?.companyName || "vendor")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-");

  return new File(
    [blob],
    `settlement-${vendor}-${settlement.id}.pdf`,
    { type: "application/pdf" }
  );
}

// ======================================================
// SHARE ACTUAL PDF + BILL IMAGE
// ======================================================

async function shareSettlementBill(settlement: Settlement) {
  const vendor = settlement.vendor?.companyName || "Vendor";
  const title = `Settlement Bill - ${vendor}`;
  const text = `Settlement bill for ${vendor}. Settlement ID: ${settlement.id}. Amount: ${formatMoney(settlement.netPayable)}.`;

  try {
    const [pdfFile, canvas] = await Promise.all([
      createSettlementBillPdf(settlement),
      createSettlementBillCanvas(settlement),
    ]);

    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not create bill image."));
      }, "image/png", 1);
    });

    const imageFile = new File(
      [imageBlob],
      `settlement-${settlement.id}.png`,
      { type: "image/png" }
    );

    // Prefer the native share sheet with REAL files.
    // WhatsApp, Gmail, Messages, Drive, etc. can appear here
    // depending on the device/browser.
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      navigator.canShare
    ) {
      const files = [pdfFile, imageFile];

      if (navigator.canShare({ files })) {
        try {
          await navigator.share({
            title,
            text,
            files,
          });
          return;
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }
        }
      }

      if (navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            title,
            text,
            files: [pdfFile],
          });
          return;
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }
        }
      }
    }

    // Desktop fallback: download the actual PDF and PNG.
    // These are files, not text.
    const downloadFile = (file: File) => {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    downloadFile(pdfFile);
    downloadFile(imageFile);

    alert(
      "Your settlement PDF and bill image were downloaded. You can now attach either file to WhatsApp, Gmail, or another app."
    );
  } catch (error) {
    console.error("Settlement sharing failed:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Could not create the settlement PDF/image."
    );
  }
}

// ======================================================
// SETTLEMENT BILL
// ======================================================

function SettlementBillModal({
  settlement,
  onClose,
}: {
  settlement: Settlement;
  onClose: () => void;
}) {
  const getBillHtml = () => {
    const rows = (settlement.items || []).map((item) => {
      const entry = item.accountingEntry;
      return `
        <tr>
          <td>${escapeHtml(entry?.shipment?.trackingNumber || "—")}</td>
          <td>${escapeHtml(entry ? getTypeLabel(entry.type) : "Accounting Entry")}</td>
          <td>${escapeHtml(entry?.description || "—")}</td>
          <td style="text-align:right">NPR ${Number(item.amount || 0).toLocaleString("en-NP", { minimumFractionDigits: 2 })}</td>
        </tr>`;
    }).join("");

    const direction = getDirectionLabel(settlement.direction);
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Settlement Bill - ${escapeHtml(settlement.vendor?.companyName || "Vendor")}</title>
<style>
body{font-family:Arial,sans-serif;background:#f5f6f8;color:#0b1729;padding:32px}.bill{max-width:850px;margin:auto;background:#fff;padding:36px;border-radius:16px}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #e5e7eb;padding-bottom:22px}.brand{font-size:24px;font-weight:800}.muted{color:#64748b;font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:24px 0}.box{background:#f8fafc;border:1px solid #e2e8f0;padding:14px;border-radius:10px}.label{font-size:11px;color:#64748b;text-transform:uppercase}.value{font-weight:700;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:10px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:12px}th{background:#f8fafc}.totals{margin-top:24px;margin-left:auto;max-width:360px}.line{display:flex;justify-content:space-between;padding:7px 0}.grand{border-top:2px solid #0b1729;margin-top:8px;padding-top:12px;font-size:18px;font-weight:800}.note{margin-top:24px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px}.footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:11px}@media print{body{padding:0;background:#fff}.bill{box-shadow:none;max-width:none}}
</style></head><body><div class="bill">
<div class="top"><div><div class="brand">Settlement Bill</div><div class="muted">Vendor accounting settlement</div></div><div style="text-align:right"><div class="muted">Settlement ID</div><div style="font-family:monospace;font-size:11px">${escapeHtml(settlement.id)}</div></div></div>
<div class="grid">
<div class="box"><div class="label">Vendor</div><div class="value">${escapeHtml(settlement.vendor?.companyName || "—")}</div><div class="muted">${escapeHtml(settlement.vendor?.contactId || "")}</div></div>
<div class="box"><div class="label">Status</div><div class="value">${escapeHtml(settlement.status)}</div><div class="muted">Created ${escapeHtml(formatDate(settlement.createdAt))}</div></div>
<div class="box"><div class="label">Settlement Direction</div><div class="value">${escapeHtml(direction)}</div></div>
<div class="box"><div class="label">Payment Date</div><div class="value">${escapeHtml(formatDate(settlement.paidAt))}</div></div>
</div>
<table><thead><tr><th>Tracking</th><th>Type</th><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${rows || `<tr><td colspan="4" style="text-align:center;color:#64748b">No item-level entries were returned by the settlement API.</td></tr>`}
</tbody></table>
<div class="totals">
<div class="line"><span>COD credits</span><strong>NPR ${Number(settlement.totalCodAmount || 0).toLocaleString("en-NP", {minimumFractionDigits:2})}</strong></div>
<div class="line"><span>Shipping charges</span><strong>NPR ${Number(settlement.totalShippingCharge || 0).toLocaleString("en-NP", {minimumFractionDigits:2})}</strong></div>
<div class="line"><span>Return charges</span><strong>NPR ${Number(settlement.totalReturnCharge || 0).toLocaleString("en-NP", {minimumFractionDigits:2})}</strong></div>
<div class="line"><span>Other charges</span><strong>NPR ${Number(settlement.totalOtherCharges || 0).toLocaleString("en-NP", {minimumFractionDigits:2})}</strong></div>
<div class="line"><span>Total credits</span><strong>NPR ${Number(settlement.totalCredits || 0).toLocaleString("en-NP", {minimumFractionDigits:2})}</strong></div>
<div class="line"><span>Total debits</span><strong>NPR ${Number(settlement.totalDebits || 0).toLocaleString("en-NP", {minimumFractionDigits:2})}</strong></div>
<div class="line grand"><span>${escapeHtml(direction)}</span><span>NPR ${Number(settlement.netPayable || 0).toLocaleString("en-NP", {minimumFractionDigits:2})}</span></div>
</div>
${settlement.paymentReference || settlement.notes ? `<div class="note"><strong>Settlement Notes</strong><div style="margin-top:6px">Reference: ${escapeHtml(settlement.paymentReference || "—")}</div><div style="margin-top:4px">Notes: ${escapeHtml(settlement.notes || "—")}</div></div>` : ""}
<div class="footer">Generated from the accounting settlement record.</div>
</div></body></html>`;

    return html;
  };

  const downloadBill = () => {
    const html = getBillHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlement-${settlement.vendor?.companyName || "vendor"}-${settlement.id}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const printBill = () => {
    const html = getBillHtml();
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      alert("Please allow pop-ups for this site to print the settlement bill.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for the bill document to finish rendering, then open the
    // browser/OS printer dialog. From there the user can select a
    // connected Wi-Fi, USB, network, AirPrint, or system printer.
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    };

    // Some browsers fire the print call before onload when document.write
    // is used, so this is a safe fallback.
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch {
        // The browser will already have handled printing if the call above worked.
      }
    }, 700);
  };

  return (
    <Modal onClose={onClose}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#e23c2e]">Settlement Bill</p>
          <h2 className="mt-1 text-xl font-bold">{settlement.vendor?.companyName}</h2>
          <p className="mt-1 text-sm text-slate-500">{getDirectionLabel(settlement.direction)} · {settlement.status}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ModalStat label="COD credits" value={formatMoney(settlement.totalCodAmount)} positive />
        <ModalStat label="Shipping charges" value={formatMoney(settlement.totalShippingCharge)} />
        <ModalStat label="Return charges" value={formatMoney(settlement.totalReturnCharge)} />
        <ModalStat label="Other charges" value={formatMoney(settlement.totalOtherCharges)} />
        <ModalStat label="Total credits" value={formatMoney(settlement.totalCredits)} positive />
        <ModalStat label="Total debits" value={formatMoney(settlement.totalDebits)} />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{getDirectionLabel(settlement.direction)}</span>
          <span className="text-xl font-bold">{formatMoney(settlement.netPayable)}</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Created {formatDate(settlement.createdAt)} · Paid {formatDate(settlement.paidAt)}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-bold">Settlement information</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4"><span className="text-slate-500">Payment reference</span><span className="font-semibold">{settlement.paymentReference || "—"}</span></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Notes</span><span className="max-w-[60%] text-right font-semibold">{settlement.notes || "—"}</span></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Settlement ID</span><span className="max-w-[60%] break-all text-right font-mono text-xs">{settlement.id}</span></div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={downloadBill}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-semibold text-white hover:bg-[#ce3122]"
        >
          <Download className="h-4 w-4" />
          Download Bill
        </button>

        <button
          type="button"
          onClick={() => void shareSettlementBill(settlement)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Share2 className="h-4 w-4" />
          Share Bill
        </button>

        <button
          type="button"
          onClick={printBill}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-[#0b1729] hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Print Bill
        </button>
      </div>
    </Modal>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======================================================
// ENTRY GROUP
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
  onToggle: (
    id: string
  ) => void;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">

        <div>
          <p className="text-sm font-bold text-[#0b1729]">
            {title}
          </p>

          <p className="text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <span
          className={`text-xs font-semibold ${
            tone === "credit"
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {entries.length}{" "}
          entries
        </span>

      </div>

      {entries.length ===
      0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-400">
          None outstanding.
        </p>
      ) : (
        <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">

          {entries.map(
            (entry) => {
              const checked =
                selectedIds.includes(
                  entry.id
                );

              return (
                <label
                  key={
                    entry.id
                  }
                  className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-slate-50"
                >

                  <input
                    type="checkbox"
                    checked={
                      checked
                    }
                    onChange={() =>
                      onToggle(
                        entry.id
                      )
                    }
                    className="mt-1 h-4 w-4 accent-[#e23c2e]"
                  />

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2">

                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {getTypeLabel(
                          entry.type
                        )}
                      </span>

                      {entry.shipment
                        ?.trackingNumber && (
                        <span className="font-mono text-[11px] text-slate-400">
                          {
                            entry
                              .shipment
                              .trackingNumber
                          }
                        </span>
                      )}

                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {entry.description ||
                        entry
                          .shipment
                          ?.receiverName ||
                        formatDate(
                          entry.createdAt
                        )}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 text-sm font-bold ${
                      tone ===
                      "credit"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {tone ===
                    "credit"
                      ? "+"
                      : "−"}

                    {formatMoney(
                      entry.remainingAmount
                    )}
                  </span>

                </label>
              );
            }
          )}

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
  onClick,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  positive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#e23c2e] hover:shadow-md"
          : ""
      }`}
    >

      <div className="mb-4 flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0b1729]">
          {icon}
        </div>

        <span
          className={`text-xs font-semibold ${
            positive
              ? "text-emerald-600"
              : "text-slate-400"
          }`}
        >
          {positive
            ? "Positive"
            : "Current"}
        </span>

      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold tracking-tight text-[#0b1729]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

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

        <p className="text-xs text-slate-400">
          {label}
        </p>

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
  dashboard:
    | DashboardData
    | null;

  vendors: Vendor[];

  settlements: Settlement[];

  onVendorClick: (
    vendor: Vendor
  ) => void;

  onGoToTab: (
    tab: Tab
  ) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

      {/* LEFT */}

      <div className="space-y-6">

        {/* FINANCIAL SUMMARY */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <SectionHeader
            title="Financial Summary"
            description="Current accounting position."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <SummaryRow
              label="Total COD credits"
              value={formatMoney(
                dashboard?.totalCredits ||
                  0
              )}
              positive
            />

            <SummaryRow
              label="Vendor charges"
              value={formatMoney(
                dashboard?.totalDebits ||
                  0
              )}
              negative
            />

            <SummaryRow
              label="Pending COD"
              value={formatMoney(
                dashboard?.cod
                  .pending ||
                  0
              )}
            />

            <SummaryRow
              label="Collected COD"
              value={formatMoney(
                dashboard?.cod
                  .collected ||
                  0
              )}
              positive
            />

          </div>
        </section>

        {/* VENDOR BALANCES */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center justify-between">

            <SectionHeader
              title="Vendor Balances"
              description="Unsettled amount currently owed or receivable."
            />

            <button
              type="button"
              onClick={() =>
                onGoToTab(
                  "vendors"
                )
              }
              className="text-xs font-semibold text-[#e23c2e] hover:underline"
            >
              View all
            </button>

          </div>

          <div className="space-y-2">

            {vendors
              .slice(0, 5)
              .map(
                (vendor) => (
                  <button
                    key={
                      vendor.id
                    }
                    type="button"
                    onClick={() =>
                      onVendorClick(
                        vendor
                      )
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1729] text-xs font-bold text-white">
                        {vendor.companyName
                          .slice(
                            0,
                            1
                          )
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          {
                            vendor.companyName
                          }
                        </p>

                        <p className="text-xs text-slate-400">
                          {
                            vendor
                              ._count
                              ?.shipments ??
                            0
                          }{" "}
                          shipments
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-sm font-bold">
                        {formatMoney(
                          vendor.balance
                        )}
                      </p>

                      <p
                        className={`text-[10px] font-semibold ${
                          vendor.direction ===
                          "PAY_VENDOR"
                            ? "text-emerald-600"
                            : vendor.direction ===
                                "COLLECT_FROM_VENDOR"
                              ? "text-amber-600"
                              : "text-slate-400"
                        }`}
                      >
                        {getDirectionLabel(
                          vendor.direction
                        )}
                      </p>

                    </div>

                  </button>
                )
              )}

            {vendors.length ===
              0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                No vendors found.
              </p>
            )}

          </div>

        </section>

      </div>

      {/* RIGHT */}

      <div className="space-y-6">

        {/* SETTLEMENT STATUS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <SectionHeader
            title="Settlement Status"
            description="Vendor settlement overview."
          />

          <div className="mt-5 space-y-4">

            <SettlementSummary
              label="Pending"
              value={formatMoney(
                dashboard
                  ?.settlements
                  .pending ||
                  0
              )}
              status="PENDING"
            />

            <SettlementSummary
              label="Processing"
              value={formatMoney(
                dashboard
                  ?.settlements
                  .processing ||
                  0
              )}
              status="PROCESSING"
            />

            <SettlementSummary
              label="Paid"
              value={formatMoney(
                dashboard
                  ?.settlements
                  .paid ||
                  0
              )}
              status="PAID"
            />

          </div>

          <button
            type="button"
            onClick={() =>
              onGoToTab(
                "settlements"
              )
            }
            className="mt-5 flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold transition hover:border-[#e23c2e] hover:text-[#e23c2e]"
          >
            Manage Settlements
          </button>

        </section>

        {/* RECENT SETTLEMENTS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center justify-between">

            <SectionHeader
              title="Recent Settlements"
              description="Latest vendor settlements."
            />

            <FileText className="h-5 w-5 text-slate-300" />

          </div>

          <div className="space-y-2">

            {settlements
              .slice(0, 5)
              .map(
                (settlement) => (
                  <div
                    key={
                      settlement.id
                    }
                    className="flex items-center justify-between rounded-xl px-3 py-3"
                  >

                    <div>

                      <p className="text-sm font-semibold">
                        {
                          settlement
                            .vendor
                            ?.companyName
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(
                          settlement.createdAt
                        )}{" "}
                        ·{" "}
                        {getDirectionLabel(
                          settlement.direction
                        )}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-sm font-bold">
                        {formatMoney(
                          settlement.netPayable
                        )}
                      </p>

                      <span
                        className={`text-[10px] font-bold ${
                          settlement.status ===
                          "PAID"
                            ? "text-emerald-600"
                            : settlement.status ===
                                "PROCESSING"
                              ? "text-blue-600"
                              : settlement.status ===
                                  "CANCELLED"
                                ? "text-red-600"
                                : "text-amber-600"
                        }`}
                      >
                        {
                          settlement.status
                        }
                      </span>

                    </div>

                  </div>
                )
              )}

            {settlements.length ===
              0 && (
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
// SETTLEMENT SUMMARY
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
              : status ===
                  "PROCESSING"
                ? "bg-blue-500"
                : "bg-amber-500"
          }`}
        />

        <span className="text-sm text-slate-500">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold">
        {value}
      </span>

    </div>
  );
}

// ======================================================
// SUMMARY ROW
// ======================================================

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

      <span className="text-sm text-slate-500">
        {label}
      </span>

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

// ======================================================
// SECTION HEADER
// ======================================================

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

      <p className="mt-1 text-sm text-slate-400">
        {description}
      </p>

    </div>
  );
}

// ======================================================
// TAB BUTTON
// ======================================================

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

// ======================================================
// TABLE HEAD
// ======================================================

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  );
}

// ======================================================
// TABLE CELL
// ======================================================

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-4 py-4 align-middle">
      {children}
    </td>
  );
}

// ======================================================
// EMPTY TABLE
// ======================================================

function EmptyTableRow({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) {
  return (
    <tr>

      <td
        colSpan={
          colSpan
        }
        className="px-4 py-16 text-center"
      >

        <div className="mx-auto flex max-w-sm flex-col items-center">

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>

          <p className="text-sm font-semibold text-slate-600">
            {text}
          </p>

        </div>

      </td>

    </tr>
  );
}

// ======================================================
// PAGINATION
// ======================================================

function PaginationBar({
  pagination,
  onPrevious,
  onNext,
}: {
  pagination: PageInfo;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (
    !pagination ||
    pagination.totalPages <= 1
  ) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">

      <p className="text-xs text-slate-400">

        Page{" "}

        <span className="font-semibold text-slate-600">
          {
            pagination.page
          }
        </span>{" "}

        of{" "}

        <span className="font-semibold text-slate-600">
          {
            pagination.totalPages
          }
        </span>

      </p>

      <div className="flex items-center gap-2">

        <button
          type="button"
          disabled={
            pagination.page <=
            1
          }
          onClick={
            onPrevious
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#e23c2e] hover:text-[#e23c2e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={
            pagination.page >=
            pagination.totalPages
          }
          onClick={
            onNext
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#e23c2e] hover:text-[#e23c2e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

      </div>

    </div>
  );
}

// ======================================================
// MODAL
// ======================================================

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

      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 ${
          wide
            ? "max-w-2xl"
            : "max-w-lg"
        }`}
      >
        {children}
      </div>

    </div>
  );
}

// ======================================================
// MODAL STAT
// ======================================================

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

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-bold ${
          positive
            ? "text-emerald-600"
            : "text-[#0b1729]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}