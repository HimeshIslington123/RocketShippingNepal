"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Box,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  MapPin,
  Package,
  Receipt,
  RotateCcw,
  Search,
  Send,
  Truck,
  UserRound,
  Wallet,
  Warehouse,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DASHBOARD_API_URL = `${API_URL}/api/vendor`;
const SHIPMENT_API_URL = `${API_URL}/api/shipment`;

/* =========================================================
   TYPES
========================================================= */

interface VendorInfo {
  id: string;
  companyName: string;
  contactId: string;
  location: string;
}

interface OrderStats {
  total: number;
  pending: number;
  received: number;
  processing: number;
  inWarehouse: number;
  dispatched: number;
  inTransit: number;
  arrived: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

interface FinanceStats {
  totalCOD: number;
  codCollected: number;
  codPending?: number;
  totalShippingCharges: number;
  shippingChargesPaid?: number;
  billToPay?: number;
  averageShippingCharge: number;
  totalShippingCost: number | null;
  totalRevenue: number;
}

interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  location: string | null;
  message: string | null;
  createdAt: string;
}

interface RiderInfo {
  id: number;
  phone: string;
  vehicleNumber?: string | null;
  isAvailable?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface WarehouseInfo {
  id: number;
  name: string;
  city: string;
}

interface CarrierInfo {
  id: number;
  name: string;
  phone: string;
}

interface ReturnRequestInfo {
  id: number;
  shipmentId: string;
  status: string;
  reason: string;
  description: string | null;
  returnCharge: number | null;
  requestedAt: string;
  pickedUpAt: string | null;
  completedAt: string | null;
  notes: string | null;
  riderId: number | null;
  rider?: RiderInfo | null;
}

interface RecentShipment {
  id: string;
  trackingNumber: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageType: string;
  weight: number;
  paymentType: string;
  codAmount: number | null;
  shippingCharge: number;
  notes?: string | null;
  qrCode?: string | null;
  status: string;
  origin?: string | null;
  deliveryZone?: string | null;
  vendorId?: number;
  riderId?: number | null;
  warehouseId?: number | null;
  carrierId?: number | null;
  locationRateId?: number | null;
  createdAt: string;
  updatedAt: string;

  trackings: TrackingEvent[];

  rider?: RiderInfo | null;

  warehouse?: WarehouseInfo | null;

  carrier?: CarrierInfo | null;

  returnRequest?: ReturnRequestInfo | null;
}

type ShipmentDetail = RecentShipment;

interface VendorDashboardData {
  vendor: VendorInfo;
  orders: OrderStats;
  finance: FinanceStats;
  pickups?: {
    total: number;
    requested: number;
    assigned: number;
    completed: number;
    cancelled: number;
  };
  recentShipments: RecentShipment[];
}

/* =========================================================
   DASHBOARD MEMORY CACHE
   ---------------------------------------------------------
   Outside React component.

   First visit:
   API request + skeleton

   Navigate away and return:
   cached data, NO API request

   React Strict Mode:
   duplicate effect shares same Promise

   Browser refresh:
   JavaScript runtime resets -> fresh API request
========================================================= */

let dashboardCache: VendorDashboardData | null = null;

let dashboardRequest: Promise<VendorDashboardData> | null =
  null;

/* =========================================================
   SHIPMENT DETAIL MEMORY CACHE
========================================================= */

const shipmentDetailCache: Record<
  string,
  ShipmentDetail
> = {};

const shipmentDetailRequests: Record<
  string,
  Promise<ShipmentDetail> | undefined
> = {};

/* =========================================================
   STATUS CONFIG
========================================================= */

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  text: string;
  bg: string;
  dot: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    text: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },

  RECEIVED: {
    label: "Received",
    icon: Package,
    text: "text-blue-700",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },

  PROCESSING: {
    label: "Processing",
    icon: RotateCcw,
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    dot: "bg-indigo-500",
  },

  IN_WAREHOUSE: {
    label: "In Warehouse",
    icon: Warehouse,
    text: "text-violet-700",
    bg: "bg-violet-50",
    dot: "bg-violet-500",
  },

  DISPATCHED: {
    label: "Dispatched",
    icon: Send,
    text: "text-cyan-700",
    bg: "bg-cyan-50",
    dot: "bg-cyan-500",
  },

  IN_TRANSIT: {
    label: "In Transit",
    icon: Truck,
    text: "text-blue-700",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },

  ARRIVED: {
    label: "Arrived",
    icon: MapPin,
    text: "text-violet-700",
    bg: "bg-violet-50",
    dot: "bg-violet-500",
  },

  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    icon: Truck,
    text: "text-orange-700",
    bg: "bg-orange-50",
    dot: "bg-orange-500",
  },

  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    text: "text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },

  RETURNED: {
    label: "Returned",
    icon: RotateCcw,
    text: "text-rose-700",
    bg: "bg-rose-50",
    dot: "bg-rose-500",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function getStatusConfig(status: string): StatusConfig {
  return (
    STATUS_CONFIG[status] ?? {
      label: formatStatusLabel(status),
      icon: Package,
      text: "text-slate-700",
      bg: "bg-slate-100",
      dot: "bg-slate-500",
    }
  );
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function formatNPR(
  amount: number | null | undefined
) {
  if (
    amount == null ||
    Number.isNaN(Number(amount))
  ) {
    return "NPR 0";
  }

  return `NPR ${Number(amount).toLocaleString(
    "en-IN"
  )}`;
}

function formatDate(dateString: string) {
  try {
    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string) {
  try {
    return new Date(
      dateString
    ).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/* =========================================================
   AUTH
========================================================= */

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

/* =========================================================
   FETCH DASHBOARD
   ---------------------------------------------------------
   ONE REQUEST ONLY
========================================================= */

async function fetchDashboard(): Promise<VendorDashboardData> {
  /*
   * Return cached dashboard immediately.
   */
  if (dashboardCache) {
    return dashboardCache;
  }

  /*
   * If another request is already running,
   * reuse the same Promise.
   */
  if (dashboardRequest) {
    return dashboardRequest;
  }

  dashboardRequest = fetch(
    DASHBOARD_API_URL,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  )
    .then(async (response) => {
      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        const body =
          await response.text().catch(
            () => ""
          );

        throw new Error(
          body ||
            `Failed to load dashboard (${response.status})`
        );
      }

      return response.json() as Promise<VendorDashboardData>;
    })
    .then((result) => {
      /*
       * Save successful response.
       */
      dashboardCache = result;

      return result;
    })
    .finally(() => {
      /*
       * Clear active request.
       *
       * Keep dashboardCache.
       */
      dashboardRequest = null;
    });

  return dashboardRequest;
}

/* =========================================================
   CLEAR DASHBOARD CACHE
   ---------------------------------------------------------
   Useful if you later need a manual refresh.
========================================================= */

export function clearVendorDashboardCache() {
  dashboardCache = null;
  dashboardRequest = null;
}

/* =========================================================
   FETCH SHIPMENT DETAIL
========================================================= */

async function fetchShipmentDetail(
  shipmentId: string
): Promise<ShipmentDetail> {
  /*
   * Return already loaded detail.
   */
  if (shipmentDetailCache[shipmentId]) {
    return shipmentDetailCache[shipmentId];
  }

  /*
   * Reuse active request.
   */
  if (shipmentDetailRequests[shipmentId]) {
    return shipmentDetailRequests[shipmentId]!;
  }

  const request = fetch(
    `${SHIPMENT_API_URL}/${shipmentId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  )
    .then(async (response) => {
      if (response.status === 401) {
        throw new Error(
          "Your session has expired."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load shipment (${response.status})`
        );
      }

      return response.json() as Promise<ShipmentDetail>;
    })
    .then((result) => {
      shipmentDetailCache[shipmentId] =
        result;

      return result;
    })
    .finally(() => {
      delete shipmentDetailRequests[
        shipmentId
      ];
    });

  shipmentDetailRequests[shipmentId] =
    request;

  return request;
}

/* =========================================================
   SHIMMER SKELETON
========================================================= */

function Shimmer({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-slate-100 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

/* =========================================================
   DASHBOARD SKELETON
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

      {/* =================================================
          HEADER SKELETON
      ================================================= */}

      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full">
          <Shimmer className="h-3 w-28" />

          <Shimmer className="mt-3 h-8 w-64 max-w-full" />

          <Shimmer className="mt-3 h-4 w-[430px] max-w-full" />
        </div>

        <Shimmer className="h-10 w-32" />
      </div>

      {/* =================================================
          MAIN STATS
      ================================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <Shimmer className="h-10 w-10 rounded-lg" />

            <Shimmer className="mt-5 h-3 w-24" />

            <Shimmer className="mt-2 h-7 w-24" />

            <Shimmer className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>

      {/* =================================================
          SECOND ROW
      ================================================= */}

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">

        {/* Finance */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <Shimmer className="h-4 w-20" />

              <Shimmer className="mt-2 h-3 w-36" />
            </div>

            <Shimmer className="h-9 w-9 rounded-lg" />
          </div>

          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item}>
                <div className="flex items-center justify-between">
                  <Shimmer className="h-3 w-24" />

                  <Shimmer className="h-4 w-24" />
                </div>

                {item !== 3 && (
                  <div className="mt-4 h-px bg-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shipment status */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <Shimmer className="h-4 w-28" />

              <Shimmer className="mt-2 h-3 w-48" />
            </div>

            <Shimmer className="h-6 w-20 rounded-full" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex min-w-[130px] flex-1 items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3"
                >
                  <Shimmer className="h-8 w-8 shrink-0 rounded-md" />

                  <div className="min-w-0">
                    <Shimmer className="h-2.5 w-20" />

                    <Shimmer className="mt-2 h-4 w-8" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          RECENT SHIPMENTS
      ================================================= */}

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">

        {/* Header */}

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Shimmer className="h-4 w-32" />

              <Shimmer className="mt-2 h-3 w-48" />
            </div>

            <div className="flex gap-2">
              <Shimmer className="h-9 w-[240px]" />

              <Shimmer className="h-9 w-20" />
            </div>
          </div>
        </div>

        {/* Desktop header */}

        <div className="hidden grid-cols-[1.2fr_1.15fr_1.4fr_0.8fr_0.9fr_32px] gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-3 lg:grid">
          {[
            "Shipment",
            "Receiver",
            "Destination",
            "Payment",
            "Status",
            "",
          ].map((item, index) => (
            <Shimmer
              key={index}
              className={`h-2.5 ${
                index === 0
                  ? "w-16"
                  : index === 1
                    ? "w-16"
                    : index === 2
                      ? "w-20"
                      : index === 3
                        ? "w-14"
                        : index === 4
                          ? "w-12"
                          : "w-3"
              }`}
            />
          ))}
        </div>

        {/* Rows */}

        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map(
            (item) => (
              <div
                key={item}
                className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[1.2fr_1.15fr_1.4fr_0.8fr_0.9fr_32px] lg:items-center lg:gap-4"
              >
                {/* Shipment */}

                <div className="flex items-center gap-2.5">
                  <Shimmer className="h-9 w-9 shrink-0 rounded-lg" />

                  <div className="min-w-0">
                    <Shimmer className="h-3.5 w-28" />

                    <Shimmer className="mt-2 h-2.5 w-20" />
                  </div>
                </div>

                {/* Receiver */}

                <div>
                  <Shimmer className="h-3.5 w-28" />

                  <Shimmer className="mt-2 h-2.5 w-20" />
                </div>

                {/* Destination */}

                <div>
                  <Shimmer className="h-3.5 w-36" />

                  <Shimmer className="mt-2 h-3.5 w-24" />
                </div>

                {/* Payment */}

                <div>
                  <Shimmer className="h-3.5 w-20" />

                  <Shimmer className="mt-2 h-2.5 w-24" />
                </div>

                {/* Status */}

                <Shimmer className="h-7 w-24 rounded-full" />

                {/* Arrow */}

                <Shimmer className="hidden h-4 w-4 lg:block" />
              </div>
            )
          )}
        </div>
      </div>

      {/* =================================================
          SHIMMER KEYFRAMES
      ================================================= */}

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 1.8s infinite;
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function VendorDashboardPage() {
  const [data, setData] =
    useState<VendorDashboardData | null>(
      dashboardCache
    );

  /*
   * If cache exists:
   *   immediately show dashboard
   *
   * If cache does not exist:
   *   show shimmer
   */
  const [loading, setLoading] =
    useState(!dashboardCache);

  const [error, setError] =
    useState<string | null>(null);

  const [expandedShipment, setExpandedShipment] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [detailsCache, setDetailsCache] =
    useState<Record<string, ShipmentDetail>>(
      {}
    );

  const [detailsLoading, setDetailsLoading] =
    useState<Record<string, boolean>>({});

  const [detailsError, setDetailsError] =
    useState<Record<string, string>>({});

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    /*
     * Cached dashboard.
     */
    if (dashboardCache) {
      setData(dashboardCache);
      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await fetchDashboard();

        if (cancelled) {
          return;
        }

        setData(result);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     LOAD SHIPMENT DETAIL
  ========================================================= */

  async function loadShipmentDetail(
    shipmentId: string
  ) {
    /*
     * Already loaded into component state.
     */
    if (detailsCache[shipmentId]) {
      return;
    }

    try {
      setDetailsLoading((prev) => ({
        ...prev,
        [shipmentId]: true,
      }));

      setDetailsError((prev) => {
        const next = { ...prev };

        delete next[shipmentId];

        return next;
      });

      const result =
        await fetchShipmentDetail(
          shipmentId
        );

      setDetailsCache((prev) => ({
        ...prev,
        [shipmentId]: result,
      }));
    } catch (err) {
      setDetailsError((prev) => ({
        ...prev,
        [shipmentId]:
          err instanceof Error
            ? err.message
            : "Unable to load shipment details.",
      }));
    } finally {
      setDetailsLoading((prev) => ({
        ...prev,
        [shipmentId]: false,
      }));
    }
  }

  /* =========================================================
     TOGGLE SHIPMENT
  ========================================================= */

  function toggleShipment(
    shipmentId: string
  ) {
    const next =
      expandedShipment === shipmentId
        ? null
        : shipmentId;

    setExpandedShipment(next);

    if (next) {
      loadShipmentDetail(next);
    }
  }

  /* =========================================================
     FILTER SHIPMENTS
  ========================================================= */

  const filteredShipments =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return data.recentShipments;
      }

      return data.recentShipments.filter(
        (shipment) => {
          return (
            shipment.trackingNumber
              ?.toLowerCase()
              .includes(query) ||
            shipment.receiverName
              ?.toLowerCase()
              .includes(query) ||
            shipment.receiverPhone
              ?.toLowerCase()
              .includes(query) ||
            shipment.receiverAddress
              ?.toLowerCase()
              .includes(query) ||
            shipment.status
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }, [data, search]);

  /* =========================================================
     MAIN STATS
  ========================================================= */

  const mainStats = data
    ? [
        {
          label: "Total shipments",
          value: data.orders.total,
          helper: "All shipments",
          icon: Package,
          iconBg: "bg-slate-100",
          iconColor: "text-slate-700",
        },
        {
          label: "In transit",
          value: data.orders.inTransit,
          helper: "Currently moving",
          icon: Truck,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          label: "Delivered",
          value: data.orders.delivered,
          helper: "Successfully delivered",
          icon: CheckCircle2,
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
        },
        {
          label: "Shipping revenue",
          value: formatNPR(
            data.finance.totalRevenue
          ),
          helper: "Total shipping charges",
          icon: Wallet,
          iconBg: "bg-violet-50",
          iconColor: "text-violet-600",
        },
      ]
    : [];

  /* =========================================================
     STATUS SUMMARY
  ========================================================= */

  const statusSummary = data
    ? [
        {
          key: "PENDING",
          label: "Pending",
          value: data.orders.pending,
        },
        {
          key: "RECEIVED",
          label: "Received",
          value: data.orders.received,
        },
        {
          key: "PROCESSING",
          label: "Processing",
          value: data.orders.processing,
        },
        {
          key: "IN_WAREHOUSE",
          label: "Warehouse",
          value: data.orders.inWarehouse,
        },
        {
          key: "DISPATCHED",
          label: "Dispatched",
          value: data.orders.dispatched,
        },
        {
          key: "IN_TRANSIT",
          label: "In transit",
          value: data.orders.inTransit,
        },
        {
          key: "ARRIVED",
          label: "Arrived",
          value: data.orders.arrived,
        },
        {
          key: "OUT_FOR_DELIVERY",
          label: "Out for delivery",
          value: data.orders.outForDelivery,
        },
        {
          key: "DELIVERED",
          label: "Delivered",
          value: data.orders.delivered,
        },
        {
          key: "CANCELLED",
          label: "Cancelled",
          value: data.orders.cancelled,
        },
        {
          key: "RETURNED",
          label: "Returned",
          value: data.orders.returned,
        },
      ]
    : [];

  /* =========================================================
     RENDER
  ========================================================= */

  if (loading && !data) {
    return (
      <main className="min-h-full text-slate-900">
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-full text-slate-900">
      <div className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Workspace</span>

              <span>/</span>

              <span className="text-slate-500">
                Dashboard
              </span>
            </div>

            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-slate-950">
              {data?.vendor.companyName ||
                "Vendor Dashboard"}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              {data?.vendor.location && (
                <>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />

                    {data.vendor.location}
                  </span>

                  <span className="hidden text-slate-300 sm:inline">
                    •
                  </span>
                </>
              )}

              <span>
                Here's what's happening with your
                shipments.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/vendor/order"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Package className="h-4 w-4" />

              New shipment
            </Link>
          </div>
        </header>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            MAIN STATS
        =================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {mainStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                </div>

                <div className="mt-5">
                  <p className="text-[13px] font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-[25px] font-bold tracking-[-0.025em] text-slate-950">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.helper}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===================================================
            SECOND ROW
        =================================================== */}

        {data && (
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">

            {/* FINANCE */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Finance
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Your shipment earnings
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    COD collected
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {formatNPR(
                      data.finance.codCollected
                    )}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Total COD
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {formatNPR(
                      data.finance.totalCOD
                    )}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Avg. shipping
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {formatNPR(
                      data.finance
                        .averageShippingCharge
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* SHIPMENT STATUS */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Shipment status
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current distribution of your
                    shipments
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {data.orders.total} total
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {statusSummary.map(
                  (item) => {
                    const config =
                      getStatusConfig(
                        item.key
                      );

                    const Icon =
                      config.icon;

                    return (
                      <div
                        key={item.key}
                        className="flex min-w-[130px] flex-1 items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${config.bg} ${config.text}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-slate-400">
                            {item.label}
                          </p>

                          <p className="mt-0.5 text-base font-bold text-slate-900">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          </div>
        )}

        {/* ===================================================
            SHIPMENTS
        =================================================== */}

        {data && (
          <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

            {/* HEADER */}

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-950">
                      Recent shipments
                    </h2>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {
                        data
                          .recentShipments
                          .length
                      }
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Latest activity across your
                    shipments
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search tracking, receiver..."
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:w-[240px]"
                    />
                  </div>

                  <Link
                    href="/vendor/View"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View all

                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* EMPTY */}

            {filteredShipments.length ===
            0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Package className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  {search
                    ? "No shipments found"
                    : "No shipments yet"}
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  {search
                    ? "Try searching with another tracking number, receiver or status."
                    : "Once you create shipments, your latest activity will appear here."}
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP HEADER */}

                <div className="hidden grid-cols-[1.2fr_1.15fr_1.4fr_0.8fr_0.9fr_32px] gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 lg:grid">
                  <span>Shipment</span>

                  <span>Receiver</span>

                  <span>Destination</span>

                  <span>Payment</span>

                  <span>Status</span>

                  <span />
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredShipments.map(
                    (shipment) => {
                      const expanded =
                        expandedShipment ===
                        shipment.id;

                      const detail =
                        detailsCache[
                          shipment.id
                        ];

                      const isLoadingDetail =
                        !!detailsLoading[
                          shipment.id
                        ];

                      const loadError =
                        detailsError[
                          shipment.id
                        ];

                      const trackings =
                        detail?.trackings ??
                        shipment.trackings ??
                        [];

                      const riderId =
                        detail?.riderId ??
                        shipment.riderId ??
                        null;

                      const rider =
                        detail?.rider ??
                        shipment.rider ??
                        null;

                      const notes =
                        detail?.notes ??
                        shipment.notes;

                      const status =
                        getStatusConfig(
                          shipment.status
                        );

                      const StatusIcon =
                        status.icon;

                      return (
                        <div
                          key={shipment.id}
                        >
                          {/* ROW */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleShipment(
                                shipment.id
                              )
                            }
                            className="group w-full text-left transition hover:bg-slate-50/70"
                          >
                            <div className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[1.2fr_1.15fr_1.4fr_0.8fr_0.9fr_32px] lg:items-center lg:gap-4">

                              {/* SHIPMENT */}

                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:hidden">
                                  Shipment
                                </p>

                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                    <Package className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900">
                                      {
                                        shipment.trackingNumber
                                      }
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      {formatDate(
                                        shipment.createdAt
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* RECEIVER */}

                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:hidden">
                                  Receiver
                                </p>

                                <p className="truncate text-sm font-medium text-slate-800">
                                  {
                                    shipment.receiverName
                                  }
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  {
                                    shipment.receiverPhone
                                  }
                                </p>
                              </div>

                              {/* DESTINATION */}

                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:hidden">
                                  Destination
                                </p>

                                <div className="flex items-start gap-1.5">
                                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                                  <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                                    {
                                      shipment.receiverAddress
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* PAYMENT */}

                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:hidden">
                                  Payment
                                </p>

                                {shipment.paymentType ===
                                "COD" ? (
                                  <>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {formatNPR(
                                        shipment.codAmount
                                      )}
                                    </p>

                                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                      Cash on delivery
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-semibold text-slate-800">
                                      Prepaid
                                    </p>

                                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                      Paid online
                                    </p>
                                  </>
                                )}
                              </div>

                              {/* STATUS */}

                              <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 lg:hidden">
                                  Status
                                </p>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${status.bg} ${status.text}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                  />

                                  {
                                    status.label
                                  }
                                </span>
                              </div>

                              {/* CHEVRON */}

                              <div className="hidden justify-end lg:flex">
                                {expanded ? (
                                  <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                                )}
                              </div>
                            </div>
                          </button>

                          {/* EXPANDED */}

                          {expanded && (
                            <div className="border-t border-slate-100 bg-[#fafbfc] px-5 py-5 sm:px-6">

                              {/* ERROR */}

                              {loadError && (
                                <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />

                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-red-800">
                                      Could not load shipment
                                      details
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-red-600">
                                      {
                                        loadError
                                      }
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(
                                      e
                                    ) => {
                                      e.stopPropagation();

                                      delete shipmentDetailCache[
                                        shipment.id
                                      ];

                                      delete shipmentDetailRequests[
                                        shipment.id
                                      ];

                                      setDetailsCache(
                                        (prev) => {
                                          const next = {
                                            ...prev,
                                          };

                                          delete next[
                                            shipment.id
                                          ];

                                          return next;
                                        }
                                      );

                                      loadShipmentDetail(
                                        shipment.id
                                      );
                                    }}
                                    className="ml-auto rounded-md bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
                                  >
                                    Retry
                                  </button>
                                </div>
                              )}

                              {/* DETAILS */}

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                                <DetailCard
                                  icon={
                                    UserRound
                                  }
                                  label="Receiver"
                                  value={
                                    shipment.receiverName
                                  }
                                  subValue={
                                    shipment.receiverPhone
                                  }
                                />

                                <DetailCard
                                  icon={MapPin}
                                  label="Destination"
                                  value={
                                    shipment.receiverAddress
                                  }
                                  subValue="Delivery address"
                                />

                                <DetailCard
                                  icon={Box}
                                  label="Package"
                                  value={
                                    shipment.packageType
                                  }
                                  subValue={`${shipment.weight} kg`}
                                />

                                <DetailCard
                                  icon={Wallet}
                                  label="Shipping charge"
                                  value={formatNPR(
                                    shipment.shippingCharge
                                  )}
                                  subValue={
                                    shipment.paymentType ===
                                    "COD"
                                      ? `COD ${formatNPR(
                                          shipment.codAmount
                                        )}`
                                      : "Prepaid"
                                  }
                                />
                              </div>

                              {/* RIDER + NOTES */}

                              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">

                                {/* RIDER */}

                                <div className="rounded-lg border border-slate-200 bg-white p-4">
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                      Delivery rider
                                    </p>

                                    <Truck className="h-4 w-4 text-slate-300" />
                                  </div>

                                  {isLoadingDetail &&
                                  !detail ? (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                      <Loader2 className="h-4 w-4 animate-spin" />

                                      Loading rider...
                                    </div>
                                  ) : rider ? (
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                        <Truck className="h-4 w-4" />
                                      </div>

                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                          {rider
                                            .user
                                            ?.name ||
                                            `Rider #${rider.id}`}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                          {
                                            rider.phone
                                          }

                                          {rider.vehicleNumber
                                            ? ` · ${rider.vehicleNumber}`
                                            : ""}
                                        </p>
                                      </div>
                                    </div>
                                  ) : riderId ? (
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">
                                        Rider #
                                        {riderId}
                                      </p>

                                      <p className="mt-0.5 text-xs text-emerald-600">
                                        Assigned
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-amber-600">
                                      No rider assigned
                                    </p>
                                  )}
                                </div>

                                {/* NOTES */}

                                <div className="rounded-lg border border-slate-200 bg-white p-4">
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                      Notes
                                    </p>

                                    <Receipt className="h-4 w-4 text-slate-300" />
                                  </div>

                                  <p className="text-sm leading-6 text-slate-600">
                                    {notes ||
                                      "No additional notes for this shipment."}
                                  </p>
                                </div>
                              </div>

                              {/* TRACKING */}

                              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                      Tracking history
                                    </h3>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      Shipment activity from creation
                                      to current status
                                    </p>
                                  </div>

                                  <span
                                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.bg} ${status.text}`}
                                  >
                                    <StatusIcon className="h-3 w-3" />

                                    {status.label}
                                  </span>
                                </div>

                                {isLoadingDetail &&
                                !detail ? (
                                  <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 p-4 text-xs text-slate-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />

                                    Loading tracking history...
                                  </div>
                                ) : trackings.length ===
                                  0 ? (
                                  <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                    <Clock3 className="mx-auto h-5 w-5 text-slate-300" />

                                    <p className="mt-2 text-xs font-medium text-slate-500">
                                      No tracking events yet
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                      Tracking updates will
                                      appear here as the shipment
                                      moves.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="mt-6">
                                    {trackings.map(
                                      (
                                        tracking,
                                        index
                                      ) => {
                                        const trackingStatus =
                                          getStatusConfig(
                                            tracking.status
                                          );

                                        const TrackingIcon =
                                          trackingStatus.icon;

                                        const isLast =
                                          index ===
                                          trackings.length -
                                            1;

                                        return (
                                          <div
                                            key={
                                              tracking.id
                                            }
                                            className="relative flex gap-3"
                                          >
                                            {!isLast && (
                                              <div className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-slate-200" />
                                            )}

                                            <div
                                              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${trackingStatus.bg} ${trackingStatus.text}`}
                                            >
                                              <TrackingIcon className="h-3.5 w-3.5" />
                                            </div>

                                            <div className="min-w-0 flex-1 pb-6">
                                              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                  <p className="text-sm font-semibold text-slate-900">
                                                    {
                                                      trackingStatus.label
                                                    }
                                                  </p>

                                                  {tracking.message && (
                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                      {
                                                        tracking.message
                                                      }
                                                    </p>
                                                  )}
                                                </div>

                                                <span className="shrink-0 text-[10px] text-slate-400">
                                                  {formatDateTime(
                                                    tracking.createdAt
                                                  )}
                                                </span>
                                              </div>

                                              {tracking.location && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] text-slate-500">
                                                  <MapPin className="h-3 w-3" />

                                                  {
                                                    tracking.location
                                                  }
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* DATES */}

                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />

                                  Created{" "}
                                  {formatDateTime(
                                    shipment.createdAt
                                  )}
                                </span>

                                <span className="flex items-center gap-1.5">
                                  <Clock3 className="h-3.5 w-3.5" />

                                  Updated{" "}
                                  {formatDateTime(
                                    shipment.updatedAt
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {/* =====================================================
          GLOBAL SHIMMER ANIMATION
      ===================================================== */}

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 1.8s infinite;
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">
        {value}
      </p>

      {subValue && (
        <p className="mt-1 text-[11px] text-slate-400">
          {subValue}
        </p>
      )}
    </div>
  );
}