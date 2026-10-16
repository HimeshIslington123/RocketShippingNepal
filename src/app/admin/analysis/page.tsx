
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Search,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ======================================================
// CONFIGURATION
// ======================================================

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

const ACCOUNTING_API = `${API_BASE}/api/admin/accounting`;

const ORANGE = "#e23c2e";
const ORANGE_LIGHT = "#fff0ed";
const GREEN = "#1e8449";
const BLUE = "#2563eb";
const PURPLE = "#7c3aed";
const AMBER = "#d97706";

const PIE_COLORS = [
  ORANGE,
  BLUE,
  GREEN,
  PURPLE,
  AMBER,
];

type Period =
  | "day"
  | "week"
  | "month"
  | "year"
  | "all"
  | "custom";

type Direction = "CREDIT" | "DEBIT";

type AccountingEntry = {
  id: string;
  type: string;
  direction: Direction;
  amount: number;
  description?: string | null;
  createdAt: string;
  vendor?: {
    id: number;
    companyName: string;
  } | null;
  shipment?: {
    trackingNumber?: string;
    shippingCharge?: number;
    codAmount?: number;
  } | null;
};

type DashboardSummary = {
  totalCredits: number;
  totalDebits: number;
  netBalance: number;
  outstandingVendorBalance: number;
  companyEarnings: number;
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
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type EntryResponse = {
  success?: boolean;
  data?: AccountingEntry[];
  pagination?: Pagination;
  message?: string;
};

type DashboardResponse = {
  success?: boolean;
  data?: DashboardSummary;
  message?: string;
};

type ChartPoint = {
  label: string;
  credits: number;
  debits: number;
  income: number;
  shipping: number;
  cod: number;
  returns: number;
  other: number;
};

type Metric = {
  label: string;
  value: number;
  description: string;
  icon: typeof Wallet;
  color: string;
  background: string;
};

const formatMoney = (value: number) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCompactMoney = (value: number) => {
  const amount = Number(value || 0);

  if (Math.abs(amount) >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (Math.abs(amount) >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(2)} L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}K`;
  }

  return `Rs. ${amount.toFixed(0)}`;
};

const formatDate = (date: string) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const safeNumber = (value: unknown) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

function getDateRange(
  period: Period,
  customStart: string,
  customEnd: string,
) {
  const now = new Date();

  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "week": {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;

      start.setDate(start.getDate() + mondayOffset);
      start.setHours(0, 0, 0, 0);

      end.setTime(start.getTime());
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    case "custom":
      if (customStart) {
        const parsedStart = new Date(`${customStart}T00:00:00`);
        if (!Number.isNaN(parsedStart.getTime())) {
          start.setTime(parsedStart.getTime());
        }
      }

      if (customEnd) {
        const parsedEnd = new Date(`${customEnd}T23:59:59.999`);
        if (!Number.isNaN(parsedEnd.getTime())) {
          end.setTime(parsedEnd.getTime());
        }
      }
      break;

    case "all":
      return {
        start: null as Date | null,
        end: null as Date | null,
      };
  }

  return { start, end };
}

function groupEntriesByDate(
  entries: AccountingEntry[],
  period: Period,
): ChartPoint[] {
  const grouped = new Map<string, ChartPoint>();

  const makePoint = (label: string): ChartPoint => ({
    label,
    credits: 0,
    debits: 0,
    income: 0,
    shipping: 0,
    cod: 0,
    returns: 0,
    other: 0,
  });

  for (const entry of entries) {
    const date = new Date(entry.createdAt);

    if (Number.isNaN(date.getTime())) continue;

    let key: string;

    if (period === "day") {
      key = `${String(date.getHours()).padStart(2, "0")}:00`;
    } else if (period === "week" || period === "month") {
      key = date.toISOString().slice(0, 10);
    } else if (period === "year") {
      key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;
    } else {
      key = date.toISOString().slice(0, 10);
    }

    if (!grouped.has(key)) {
      grouped.set(key, makePoint(key));
    }

    const point = grouped.get(key)!;
    const amount = safeNumber(entry.amount);
    const type = entry.type.toUpperCase();

    if (entry.direction === "CREDIT") {
      point.credits += amount;
    } else {
      point.debits += amount;
    }

    // Charges are operational company earnings when recorded
    // as DEBIT entries in the supplied backend.
    if (type === "REFUND" && entry.direction === "CREDIT") {
      point.income -= amount;
    } else if (
      [
        "SHIPPING_CHARGE",
        "RETURN_CHARGE",
        "PICKUP_CHARGE",
        "STORAGE_CHARGE",
        "OTHER_CHARGE",
      ].includes(type) &&
      entry.direction === "DEBIT"
    ) {
      point.income += amount;
    }

    if (type === "SHIPPING_CHARGE") {
      point.shipping += amount;
    } else if (type === "COD_COLLECTION") {
      point.cod += amount;
    } else if (type === "RETURN_CHARGE") {
      point.returns += amount;
    } else if (
      ["PICKUP_CHARGE", "STORAGE_CHARGE", "OTHER_CHARGE"].includes(type)
    ) {
      point.other += amount;
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

function getPeriodLabel(period: Period) {
  const labels: Record<Period, string> = {
    day: "Today",
    week: "This week",
    month: "This month",
    year: "This year",
    all: "All time",
    custom: "Custom range",
  };

  return labels[period];
}

// ======================================================
// REUSABLE UI
// ======================================================

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
      )}

      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm leading-6 text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-5 text-muted sm:text-sm">
            {metric.label}
          </p>

          <p className="mt-2 break-words text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {formatCompactMoney(metric.value)}
          </p>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: metric.background, color: metric.color }}
        >
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        {metric.description}
      </p>
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-line bg-white p-4 sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-xl bg-surface px-5 text-center text-sm text-muted">
      {message}
    </div>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function AccountingAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchJson = useCallback(
    async <T,>(url: string): Promise<T> => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (!token) {
        throw new Error(
          "Your login session was not found. Please log in again.",
        );
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your session may have expired or you do not have permission to view accounting data.",
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Request failed (${response.status})`,
        );
      }

      return result as T;
    },
    [],
  );

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [dashboardResult, firstPage] = await Promise.all([
          fetchJson<DashboardResponse>(`${ACCOUNTING_API}/dashboard`),
          fetchJson<EntryResponse>(
            `${ACCOUNTING_API}/entries?page=1&limit=100`,
          ),
        ]);

        if (!dashboardResult?.data) {
          throw new Error(
            dashboardResult?.message ||
              "The accounting dashboard returned no data.",
          );
        }

        const firstEntries = firstPage.data ?? [];
        const pageInfo = firstPage.pagination;

        let allEntries = [...firstEntries];

        // Load the remaining pages in small batches to avoid
        // firing too many requests at once.
        const totalPages = Math.min(
          pageInfo?.totalPages ?? 1,
          100,
        );

        for (let page = 2; page <= totalPages; page += 4) {
          const pages = Array.from(
            { length: Math.min(4, totalPages - page + 1) },
            (_, index) => page + index,
          );

          const responses = await Promise.all(
            pages.map((pageNumber) =>
              fetchJson<EntryResponse>(
                `${ACCOUNTING_API}/entries?page=${pageNumber}&limit=100`,
              ),
            ),
          );

          for (const response of responses) {
            allEntries = allEntries.concat(response.data ?? []);
          }
        }

        setDashboard(dashboardResult.data);
        setEntries(allEntries);
        setPagination(pageInfo ?? null);
        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load accounting analytics.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchJson],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ====================================================
  // FILTERING
  // ====================================================

  const filteredEntries = useMemo(() => {
    const { start, end } = getDateRange(
      period,
      customStart,
      customEnd,
    );

    return entries.filter((entry) => {
      const date = new Date(entry.createdAt);

      if (Number.isNaN(date.getTime())) return false;

      if (start && date < start) return false;
      if (end && date > end) return false;

      if (search.trim()) {
        const query = search.toLowerCase();

        const matches =
          entry.id.toLowerCase().includes(query) ||
          entry.type.toLowerCase().includes(query) ||
          (entry.description ?? "").toLowerCase().includes(query) ||
          (entry.vendor?.companyName ?? "").toLowerCase().includes(query) ||
          (entry.shipment?.trackingNumber ?? "")
            .toLowerCase()
            .includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [entries, period, customStart, customEnd, search]);

  const metrics = useMemo(() => {
    let credits = 0;
    let debits = 0;
    let shipping = 0;
    let codEntries = 0;
    let returns = 0;
    let otherCharges = 0;
    let refunds = 0;

    for (const entry of filteredEntries) {
      const amount = safeNumber(entry.amount);
      const type = entry.type.toUpperCase();

      if (entry.direction === "CREDIT") {
        credits += amount;
      } else {
        debits += amount;
      }

      if (type === "SHIPPING_CHARGE") shipping += amount;
      if (type === "COD_COLLECTION") codEntries += amount;
      if (type === "RETURN_CHARGE") returns += amount;

      if (
        ["PICKUP_CHARGE", "STORAGE_CHARGE", "OTHER_CHARGE"].includes(type)
      ) {
        otherCharges += amount;
      }

      if (type === "REFUND" && entry.direction === "CREDIT") {
        refunds += amount;
      }
    }

    return {
      credits,
      debits,
      shipping,
      codEntries,
      returns,
      otherCharges,
      refunds,
      net: credits - debits,
      income: debits - refunds,
      count: filteredEntries.length,
    };
  }, [filteredEntries]);

  const chartData = useMemo(
    () => groupEntriesByDate(filteredEntries, period),
    [filteredEntries, period],
  );

  const pieData = useMemo(() => {
    const items = [
      { name: "Shipping charges", value: metrics.shipping },
      { name: "COD entries", value: metrics.codEntries },
      { name: "Return charges", value: metrics.returns },
      { name: "Other charges", value: metrics.otherCharges },
    ];

    return items.filter((item) => item.value > 0);
  }, [metrics]);

  const recentEntries = useMemo(
    () =>
      [...filteredEntries]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        )
        .slice(0, 10),
    [filteredEntries],
  );

  const summaryMetrics = useMemo<Metric[]>(() => {
    const data = dashboard;

    return [
      {
        label: "Shipping charges",
        value: metrics.shipping,
        description: `${getPeriodLabel(period)} · from accounting entries`,
        icon: Truck,
        color: ORANGE,
        background: ORANGE_LIGHT,
      },
      {
        label: "Company income",
        value: metrics.income,
        description: "Filtered charges less credit refunds",
        icon: Activity,
        color: GREEN,
        background: "#e9f7ef",
      },
      {
        label: "COD collected",
        value: data?.cod.collected ?? 0,
        description: "All-time total from COD collections",
        icon: CheckCircle2,
        color: BLUE,
        background: "#eaf2ff",
      },
      {
        label: "COD pending",
        value: data?.cod.pending ?? 0,
        description: "All-time total awaiting collection",
        icon: Clock,
        color: AMBER,
        background: "#fff5df",
      },
      {
        label: "Vendor payable",
        value: data?.outstandingVendorBalance ?? data?.netBalance ?? 0,
        description: "Current outstanding vendor balance",
        icon: Wallet,
        color: PURPLE,
        background: "#f2eaff",
      },
      {
        label: "Total credits",
        value: metrics.credits,
        description: `${getPeriodLabel(period)} · filtered entries`,
        icon: ArrowDownRight,
        color: GREEN,
        background: "#e9f7ef",
      },
      {
        label: "Total debits",
        value: metrics.debits,
        description: `${getPeriodLabel(period)} · filtered entries`,
        icon: ArrowUpRight,
        color: ORANGE,
        background: ORANGE_LIGHT,
      },
      {
        label: "Pending settlements",
        value: data?.settlements.totalOutstanding ?? 0,
        description: "Pending + processing settlements",
        icon: Banknote,
        color: BLUE,
        background: "#eaf2ff",
      },
    ];
  }, [dashboard, metrics, period]);

  // ====================================================
  // EXPORT CSV
  // ====================================================

  const exportCsv = useCallback(() => {
    const rows = [
      [
        "Date",
        "Entry ID",
        "Vendor",
        "Type",
        "Direction",
        "Amount (NPR)",
        "Tracking Number",
        "Description",
      ],
      ...filteredEntries.map((entry) => [
        formatDate(entry.createdAt),
        entry.id,
        entry.vendor?.companyName ?? "",
        entry.type,
        entry.direction,
        safeNumber(entry.amount).toFixed(2),
        entry.shipment?.trackingNumber ?? "",
        entry.description ?? "",
      ]),
    ];

    const escapeCell = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = rows
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `accounting-${period}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }, [filteredEntries, period]);

  // ====================================================
  // EXPORT PDF
  // ====================================================

  const exportPdf = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(226, 60, 46);
    doc.rect(0, 0, pageWidth, 34, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Accounting Analytics Report", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Period: ${getPeriodLabel(period)} | Generated: ${new Date().toLocaleString()}`,
      14,
      24,
    );

    doc.setTextColor(25, 35, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Financial summary", 14, 44);

    autoTable(doc, {
      startY: 48,
      head: [["Metric", "Amount (NPR)"]],
      body: [
        ["Filtered shipping charges", metrics.shipping.toFixed(2)],
        ["Filtered company income", metrics.income.toFixed(2)],
        ["Filtered COD entries", metrics.codEntries.toFixed(2)],
        ["Filtered return charges", metrics.returns.toFixed(2)],
        ["Filtered other charges", metrics.otherCharges.toFixed(2)],
        ["Filtered credits", metrics.credits.toFixed(2)],
        ["Filtered debits", metrics.debits.toFixed(2)],
        ["Filtered net balance", metrics.net.toFixed(2)],
        ["All-time COD collected", safeNumber(dashboard?.cod.collected).toFixed(2)],
        ["All-time COD pending", safeNumber(dashboard?.cod.pending).toFixed(2)],
        [
          "Outstanding vendor balance",
          safeNumber(
            dashboard?.outstandingVendorBalance ?? dashboard?.netBalance,
          ).toFixed(2),
        ],
        [
          "Pending + processing settlements",
          safeNumber(dashboard?.settlements.totalOutstanding).toFixed(2),
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [226, 60, 46],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    const summaryFinalY =
      (doc as any).lastAutoTable?.finalY ?? 120;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Accounting entries", 14, summaryFinalY + 12);

    autoTable(doc, {
      startY: summaryFinalY + 16,
      head: [[
        "Date",
        "Entry ID",
        "Vendor",
        "Type",
        "Direction",
        "Amount (NPR)",
        "Tracking",
        "Description",
      ]],
      body: filteredEntries.map((entry) => [
        formatDate(entry.createdAt),
        entry.id,
        entry.vendor?.companyName ?? "—",
        titleCase(entry.type),
        entry.direction,
        safeNumber(entry.amount).toFixed(2),
        entry.shipment?.trackingNumber ?? "—",
        entry.description ?? "—",
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [226, 60, 46],
        textColor: [255, 255, 255],
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
      },
      columnStyles: {
        1: { cellWidth: 29 },
        2: { cellWidth: 37 },
        3: { cellWidth: 29 },
        5: { halign: "right" },
        6: { cellWidth: 28 },
        7: { cellWidth: 48 },
      },
      didDrawPage: () => {
        const height = doc.internal.pageSize.getHeight();

        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text(
          `NaN? Accounting Analytics · ${getPeriodLabel(period)}`,
          14,
          height - 7,
        );

        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          pageWidth - 25,
          height - 7,
        );
      },
    });

    doc.save(
      `accounting-report-${period}-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`,
    );
  }, [dashboard, filteredEntries, metrics, period]);

  // ====================================================
  // CUSTOM RANGE VALIDATION
  // ====================================================

  const customRangeError =
    period === "custom" &&
    customStart &&
    customEnd &&
    customStart > customEnd
      ? "The start date must be on or before the end date."
      : "";

  const resetFilters = () => {
    setPeriod("month");
    setCustomStart("");
    setCustomEnd("");
    setSearch("");
  };

  // ====================================================
  // LOADING STATE
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-surface p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] animate-pulse">
          <div className="mb-8 h-10 w-72 rounded-lg bg-gray-200" />

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl border border-line bg-white"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="h-[360px] rounded-2xl bg-white" />
            <div className="h-[360px] rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // ERROR STATE
  // ====================================================

  if (error && !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface p-5">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-accent">
            <XCircle size={28} />
          </div>

          <h1 className="text-xl font-bold text-foreground">
            Could not load accounting data
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

          <button
            onClick={() => void loadData()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  // ====================================================
  // MAIN DASHBOARD
  // ====================================================

  return (
    <main className="min-h-screen bg-surface px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}
        <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Finance & operations
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Accounting analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Track shipping charges, COD collections, company income, vendor
              balances, and accounting activity in one place.
            </p>

            {lastUpdated && (
              <p className="mt-2 text-xs text-muted">
                Last updated {lastUpdated.toLocaleTimeString()}
                {pagination
                  ? ` · ${entries.length.toLocaleString()} of ${pagination.total.toLocaleString()} entries loaded`
                  : ""}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void loadData(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={exportCsv}
              disabled={!filteredEntries.length}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              Export CSV
            </button>

            <button
              onClick={exportPdf}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </header>

        {/* ERROR BANNER */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>

            <button
              onClick={() => void loadData(true)}
              className="shrink-0 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* FILTERS */}
        <Panel className="mb-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-accent" />
              <h2 className="font-bold text-foreground">
                Report filters
              </h2>
            </div>

            <button
              onClick={resetFilters}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Reset filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label
                htmlFor="period"
                className="mb-2 block text-xs font-semibold text-muted"
              >
                Reporting period
              </label>

              <select
                id="period"
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value as Period)
                }
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-orange-100"
              >
                <option value="day">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
                <option value="all">All time</option>
                <option value="custom">Custom date range</option>
              </select>
            </div>

            {period === "custom" && (
              <>
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-xs font-semibold text-muted"
                  >
                    Start date
                  </label>

                  <input
                    id="startDate"
                    type="date"
                    value={customStart}
                    max={customEnd || undefined}
                    onChange={(event) => setCustomStart(event.target.value)}
                    className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-xs font-semibold text-muted"
                  >
                    End date
                  </label>

                  <input
                    id="endDate"
                    type="date"
                    value={customEnd}
                    min={customStart || undefined}
                    onChange={(event) => setCustomEnd(event.target.value)}
                    className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="entrySearch"
                className="mb-2 block text-xs font-semibold text-muted"
              >
                Search accounting entries
              </label>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id="entrySearch"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Vendor, tracking, type..."
                  className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

          {customRangeError && (
            <p className="mt-3 text-sm text-red-600">{customRangeError}</p>
          )}

          {period === "custom" && (!customStart || !customEnd) && (
            <p className="mt-3 text-xs text-muted">
              Choose both dates to apply a complete custom range.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-lg bg-orange-50 px-3 py-2 font-semibold text-accent">
              {getPeriodLabel(period)}
            </span>
            <span>
              {filteredEntries.length.toLocaleString()} matching entries
            </span>
          </div>
        </Panel>

        {/* SUMMARY CARDS */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Financial snapshot"
            title="Your money at a glance"
            description="Period-sensitive entry totals are shown alongside current all-time COD and settlement balances."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </div>

        {/* CHARTS */}
        <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-5">
          <Panel className="xl:col-span-3">
            <SectionHeading
              eyebrow="Trends"
              title="Credits, debits & income"
              description="Amounts are grouped by hour, day, month, or date according to the selected period."
            />

            {chartData.length === 0 ? (
              <EmptyChart message="No accounting entries were found for this period." />
            ) : (
              <div className="h-[300px] w-full sm:h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />

                    <YAxis
                      tickFormatter={(value) => formatCompactMoney(value)}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={75}
                    />

                    <Tooltip
                      formatter={(value, name) => [
                        formatMoney(Number(value)),
                        String(name),
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="credits"
                      name="Credits"
                      stroke={GREEN}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="debits"
                      name="Debits"
                      stroke={ORANGE}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Company income"
                      stroke={BLUE}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel className="xl:col-span-2">
            <SectionHeading
              eyebrow="Breakdown"
              title="Charge distribution"
              description="Accounting entries grouped by operational charge type."
            />

            {pieData.length === 0 ? (
              <EmptyChart message="No charge entries are available for this period." />
            ) : (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="48%"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={3}
                        stroke="#ffffff"
                        strokeWidth={3}
                      >
                        {pieData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => formatMoney(Number(value))}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e5e7eb",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {pieData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            background:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <span className="truncate text-muted">
                          {item.name}
                        </span>
                      </div>

                      <span className="shrink-0 font-semibold text-foreground">
                        {formatCompactMoney(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>
        </div>

        {/* BAR CHART */}
        <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Panel>
            <SectionHeading
              eyebrow="Operations"
              title="Shipping and charge totals"
              description="A comparison of charge categories in the selected period."
            />

            {chartData.length === 0 ? (
              <EmptyChart message="No data is available for this period." />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />

                    <YAxis
                      tickFormatter={(value) => formatCompactMoney(value)}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />

                    <Tooltip
                      formatter={(value) => formatMoney(Number(value))}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="shipping"
                      name="Shipping"
                      fill={ORANGE}
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="returns"
                      name="Returns"
                      fill={BLUE}
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="other"
                      name="Other charges"
                      fill={GREEN}
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel>
            <SectionHeading
              eyebrow="Balance"
              title="Credits versus debits"
              description="Compare credit and debit accounting entries over the selected period."
            />

            {chartData.length === 0 ? (
              <EmptyChart message="No entries are available to compare." />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 5, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="creditsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={GREEN} stopOpacity={0.01} />
                      </linearGradient>

                      <linearGradient id="debitsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ORANGE} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={ORANGE} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />

                    <YAxis
                      tickFormatter={(value) => formatCompactMoney(value)}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />

                    <Tooltip
                      formatter={(value) => formatMoney(Number(value))}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />

                    <Legend />

                    <Area
                      type="monotone"
                      dataKey="credits"
                      name="Credits"
                      stroke={GREEN}
                      fill="url(#creditsFill)"
                      strokeWidth={2}
                    />

                    <Area
                      type="monotone"
                      dataKey="debits"
                      name="Debits"
                      stroke={ORANGE}
                      fill="url(#debitsFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        {/* ADDITIONAL BALANCE SUMMARY */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Settlement overview"
            title="Vendor and COD balances"
            description="These balances come from the accounting dashboard endpoint and are all-time figures."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm text-muted">Pending settlements</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatCompactMoney(dashboard?.settlements.pending ?? 0)}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm text-muted">Processing settlements</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatCompactMoney(dashboard?.settlements.processing ?? 0)}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm text-muted">Paid settlements</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatCompactMoney(dashboard?.settlements.paid ?? 0)}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm text-muted">Vendors with open settlements</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(dashboard?.vendors.pendingSettlement ?? 0).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted">
                Out of {(dashboard?.vendors.total ?? 0).toLocaleString()} vendors
              </p>
            </div>
          </div>
        </div>

        {/* RECENT ENTRIES */}
        <Panel>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Ledger"
              title="Recent accounting entries"
              description="The latest entries matching your selected period and search."
            />

            <button
              onClick={exportCsv}
              disabled={!filteredEntries.length}
              className="mb-5 inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-line px-3 py-2 text-xs font-bold text-foreground transition hover:border-accent hover:text-accent disabled:opacity-50 sm:self-auto"
            >
              <FileSpreadsheet size={15} />
              Download CSV
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <div className="rounded-xl bg-surface p-10 text-center">
              <FileText className="mx-auto mb-3 text-muted" size={28} />
              <p className="font-semibold text-foreground">
                No accounting entries found
              </p>
              <p className="mt-1 text-sm text-muted">
                Try another period or clear your search.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="space-y-3 md:hidden">
                {recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-line p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all text-sm font-bold text-foreground">
                          {titleCase(entry.type)}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted">
                          {entry.vendor?.companyName || "No vendor"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${
                          entry.direction === "CREDIT"
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-accent"
                        }`}
                      >
                        {entry.direction}
                      </span>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted">
                          {formatDate(entry.createdAt)}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {entry.shipment?.trackingNumber || entry.id}
                        </p>
                      </div>

                      <p className="text-right text-sm font-bold text-foreground">
                        {formatMoney(safeNumber(entry.amount))}
                      </p>
                    </div>

                    {entry.description && (
                      <p className="mt-3 border-t border-line pt-3 text-xs leading-5 text-muted">
                        {entry.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-muted">
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Entry / tracking</th>
                      <th className="px-4 py-3 font-semibold">Vendor</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Direction</th>
                      <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-line last:border-0 hover:bg-orange-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-muted">
                          {formatDate(entry.createdAt)}
                        </td>

                        <td className="px-4 py-4">
                          <p className="max-w-[200px] truncate font-medium text-foreground">
                            {entry.shipment?.trackingNumber || entry.id}
                          </p>

                          {entry.description && (
                            <p className="mt-1 max-w-[200px] truncate text-xs text-muted">
                              {entry.description}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-foreground">
                          {entry.vendor?.companyName || "—"}
                        </td>

                        <td className="px-4 py-4 text-foreground">
                          {titleCase(entry.type)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                              entry.direction === "CREDIT"
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-accent"
                            }`}
                          >
                            {entry.direction}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-foreground">
                          {formatMoney(safeNumber(entry.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
            <span>
              Showing {recentEntries.length} of{" "}
              {filteredEntries.length.toLocaleString()} matching entries
            </span>

            <button
              onClick={exportPdf}
              className="inline-flex items-center gap-2 font-bold text-accent hover:underline"
            >
              <Download size={14} />
              Download full report PDF
            </button>
          </div>
        </Panel>

        {/* FOOTER NOTE */}
        <footer className="py-7 text-center text-xs leading-5 text-muted">
          Accounting analytics · Amounts are displayed in Nepalese rupees (NPR).
          <br />
          Chart totals are calculated from accounting entries returned by your API.
        </footer>
      </div>
    </main>
  );
}
