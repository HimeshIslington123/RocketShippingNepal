"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Bike,
  Package,
  Clock,
  Warehouse,
  Truck,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Wallet,
  Banknote,
  MapPin,
  Layers,
  Boxes,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  Activity,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type ShipmentStatus =
  | "CREATED"
  | "IN_WAREHOUSE"
  | "ASSIGNED_TO_RIDER"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

interface RecentShipment {
  id: string;
  trackingNumber: string;
  receiverName: string | null;
  receiverPhone: string | null;
  receiverAddress: string | null;
  packageType: string | null;
  weight: number | null;
  paymentType: string | null;
  codAmount: number | null;
  shippingCharge: number | null;
  status: ShipmentStatus;
  createdAt: string | null;

  vendor: {
    id: number;
    companyName: string;
  } | null;

  rider: {
    id: number;
    phone: string;
    user: {
      id: number;
      name: string;
    };
  } | null;
}

interface DashboardData {
  users: {
    vendors: number;
    staff: number;
    riders: number;
    activeRiders: number;
    inactiveRiders: number;
  };

  shipments: {
    total: number;
    created: number;
    inWarehouse: number;
    assignedToRider: number;
    outForDelivery: number;
    delivered: number;
    returned: number;
    cancelled: number;
  };

  pickups: {
    total: number;
    requested: number;
    assigned: number;
    completed: number;
    cancelled: number;
  };

  finance: {
    totalCOD: number;
    codCollected: number;
    codPending: number;
    totalShippingCharges: number;
    shippingChargesCollected: number;
    shippingChargesPending: number;
    averageShippingCharge: number;
    totalShippingCost: number | null;
    totalRevenue: number;
  };

  system: {
    locations: number;
    deliveryTypes: number;
    warehouses: number;
    carriers: number;
  };

  recentShipments: RecentShipment[];
}

// ============================================================
// CONSTANTS
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

const CACHE_KEY =
  "admin-dashboard-v2";

const CACHE_TIME_KEY =
  "admin-dashboard-v2-time";

// Cache remains valid for 5 minutes.
// Navigation does not refetch.
// User can manually refresh whenever needed.
const CACHE_DURATION =
  5 * 60 * 1000;

// ============================================================
// MODULE REQUEST DEDUPLICATION
// ============================================================

let dashboardRequest:
  | Promise<DashboardData>
  | null = null;

// ============================================================
// HELPERS
// ============================================================

function formatNPR(
  amount: number | null | undefined
) {
  return `NPR ${Number(
    amount ?? 0
  ).toLocaleString("en-IN")}`;
}

function formatStatus(
  status: ShipmentStatus
) {
  switch (status) {
    case "CREATED":
      return "Created";

    case "IN_WAREHOUSE":
      return "In Warehouse";

    case "ASSIGNED_TO_RIDER":
      return "Assigned";

    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";

    case "DELIVERED":
      return "Delivered";

    case "RETURNED":
      return "Returned";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getStatusStyle(
  status: ShipmentStatus
) {
  switch (status) {
    case "CREATED":
      return "bg-blue-50 text-blue-600";

    case "IN_WAREHOUSE":
      return "bg-amber-50 text-amber-600";

    case "ASSIGNED_TO_RIDER":
      return "bg-indigo-50 text-indigo-600";

    case "OUT_FOR_DELIVERY":
      return "bg-orange-50 text-orange-600";

    case "DELIVERED":
      return "bg-emerald-50 text-emerald-600";

    case "RETURNED":
      return "bg-purple-50 text-purple-600";

    case "CANCELLED":
      return "bg-red-50 text-red-600";

    default:
      return "bg-gray-50 text-gray-600";
  }
}

// ============================================================
// API FETCH
// ============================================================

async function fetchDashboard(): Promise<DashboardData> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  // ----------------------------------------------------------
  // IMPORTANT:
  // If React StrictMode calls this twice,
  // both calls use the same Promise.
  // ----------------------------------------------------------

  if (dashboardRequest) {
    return dashboardRequest;
  }

  dashboardRequest = fetch(
    `${API_URL}/api/vendor/admin`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  )
    .then(async (res) => {
      const json = await res.json().catch(
        () => null
      );

      if (!res.ok) {
        throw new Error(
          json?.message ||
            `Request failed: ${res.status}`
        );
      }

      return json as DashboardData;
    })
    .finally(() => {
      dashboardRequest = null;
    });

  return dashboardRequest;
}

// ============================================================
// CACHE HELPERS
// ============================================================

function getCachedDashboard():
  | DashboardData
  | null {
  try {
    const cached =
      sessionStorage.getItem(CACHE_KEY);

    const cachedTime =
      sessionStorage.getItem(
        CACHE_TIME_KEY
      );

    if (!cached || !cachedTime) {
      return null;
    }

    const age =
      Date.now() - Number(cachedTime);

    if (age > CACHE_DURATION) {
      sessionStorage.removeItem(
        CACHE_KEY
      );

      sessionStorage.removeItem(
        CACHE_TIME_KEY
      );

      return null;
    }

    return JSON.parse(
      cached
    ) as DashboardData;
  } catch {
    return null;
  }
}

function saveDashboardCache(
  data: DashboardData
) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify(data)
    );

    sessionStorage.setItem(
      CACHE_TIME_KEY,
      String(Date.now())
    );
  } catch {
    // Ignore storage errors.
  }
}

function clearDashboardCache() {
  try {
    sessionStorage.removeItem(
      CACHE_KEY
    );

    sessionStorage.removeItem(
      CACHE_TIME_KEY
    );
  } catch {
    // Ignore storage errors.
  }
}

// ============================================================
// SHIMMER
// ============================================================

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
    />
  );
}

// ============================================================
// FULL PAGE SKELETON
// ============================================================

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <SkeletonBlock className="h-7 w-52" />

          <SkeletonBlock className="mt-3 h-4 w-72" />
        </div>

        <SkeletonBlock className="h-10 w-28 rounded-xl" />
      </div>

      {/* Top stats */}

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex justify-between">
              <SkeletonBlock className="h-10 w-10 rounded-xl" />

              <SkeletonBlock className="h-4 w-16" />
            </div>

            <SkeletonBlock className="mt-5 h-4 w-28" />

            <SkeletonBlock className="mt-2 h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Shipment overview */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
        <SkeletonBlock className="h-6 w-48" />

        <SkeletonBlock className="mt-3 h-4 w-80" />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl bg-gray-50/70 p-4"
            >
              <SkeletonBlock className="h-5 w-5" />

              <SkeletonBlock className="mt-4 h-3 w-20" />

              <SkeletonBlock className="mt-2 h-7 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Finance / pickup */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <SkeletonBlock className="h-6 w-28" />

          <SkeletonBlock className="mt-3 h-4 w-64" />

          <div className="mt-6 space-y-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-[70px] w-full"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <SkeletonBlock className="h-6 w-28" />

          <SkeletonBlock className="mt-3 h-4 w-64" />

          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-24"
              />
            ))}
          </div>
        </div>
      </div>

      {/* System */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
        <SkeletonBlock className="h-6 w-40" />

        <SkeletonBlock className="mt-3 h-4 w-72" />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className="h-20"
            />
          ))}
        </div>
      </div>

      {/* Recent */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
        <SkeletonBlock className="h-6 w-44" />

        <SkeletonBlock className="mt-3 h-4 w-72" />

        <div className="mt-6 space-y-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className="h-16"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconStyle: string;
  onClick?: () => void;
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconStyle,
  onClick,
}: StatCardProps) {
  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5 transition ${
        clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon
            className="h-5 w-5"
            strokeWidth={2}
          />
        </span>

        {description && (
          <span className="text-xs font-medium text-ink/40">
            {description}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-ink/50">
        {label}
      </p>

      <div className="mt-1 flex items-center justify-between">
        <p className="font-display text-2xl font-extrabold text-ink">
          {value}
        </p>

        {clickable && (
          <ChevronRight className="h-4 w-4 text-ink/20 transition-transform group-hover:translate-x-1" />
        )}
      </div>
    </button>
  );
}

// ============================================================
// SMALL SECTION LINK
// ============================================================

function SectionLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-1 text-xs font-semibold text-ink/40 transition hover:text-[#E23C2E]"
    >
      {children}

      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function AdminOverviewPage() {
  const router = useRouter();

  const cachedInitialData =
    useMemo(
      () => getCachedDashboard(),
      []
    );

  const [data, setData] =
    useState<DashboardData | null>(
      cachedInitialData
    );

  const [loading, setLoading] =
    useState(
      cachedInitialData === null
    );

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // RELOAD DASHBOARD
  // ==========================================================

  const reloadDashboard = useCallback(
    async (
      force = false
    ) => {
      // ------------------------------------------------------
      // NORMAL LOAD
      // ------------------------------------------------------

      if (!force) {
        const cached =
          getCachedDashboard();

        if (cached) {
          setData(cached);
          setLoading(false);
          setError(null);

          return;
        }
      }

      // ------------------------------------------------------
      // FORCE REFRESH
      // ------------------------------------------------------

      if (force) {
        setRefreshing(true);

        // Remove old cache so next normal navigation
        // doesn't show stale data.
        clearDashboardCache();
      } else {
        setLoading(true);
      }

      try {
        const freshData =
          await fetchDashboard();

        saveDashboardCache(
          freshData
        );

        setData(freshData);
        setError(null);
      } catch (err) {
        console.error(
          "ADMIN DASHBOARD FETCH ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    reloadDashboard(false);
  }, [reloadDashboard]);

  // ==========================================================
  // NAVIGATION HELPERS
  // ==========================================================

  const goToVendors = () => {
    router.push(
      "/admin/vendorDetails"
    );
  };

  const goToUsers = () => {
    router.push(
      "/admin/allUsers"
    );
  };
   const gotorider = () => {
    router.push(
      "/admin/riderDetails"
    );
  };

  const goToShipments = () => {
    router.push(
      "/admin/shippingDetails"
    );
  };

  const goToPickup = () => {
    router.push(
      "/admin/pickup"
    );
  };

  const goToLocation = () => {
    router.push("/admin/location");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    !data
  ) {
    return (
      <>
        <style jsx global>{`
          @keyframes dashboard-shimmer {
            0% {
              background-position: 200% 0;
            }

            100% {
              background-position: -200% 0;
            }
          }

          .skeleton-shimmer {
            background: linear-gradient(
              90deg,
              #e8eaed 0%,
              #f8f9fa 45%,
              #ffffff 50%,
              #f8f9fa 55%,
              #e8eaed 100%
            );

            background-size: 200% 100%;

            animation:
              dashboard-shimmer
              1.45s
              ease-in-out
              infinite;
          }
        `}</style>

        <DashboardSkeleton />
      </>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !data
  ) {
    return (
      <>
        <style jsx global>{`
          @keyframes dashboard-shimmer {
            0% {
              background-position: 200% 0;
            }

            100% {
              background-position: -200% 0;
            }
          }

          .skeleton-shimmer {
            background: linear-gradient(
              90deg,
              #e8eaed 0%,
              #f8f9fa 45%,
              #ffffff 50%,
              #f8f9fa 55%,
              #e8eaed 100%
            );

            background-size: 200% 100%;

            animation:
              dashboard-shimmer
              1.45s
              ease-in-out
              infinite;
          }
        `}</style>

        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-red-700">
                  Dashboard could not be loaded
                </h2>

                <p className="mt-1 text-sm text-red-600/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  reloadDashboard(true)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#E23C2E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#CE3122]"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return null;
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <>
      <style jsx global>{`
        @keyframes dashboard-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #e8eaed 0%,
            #f8f9fa 45%,
            #ffffff 50%,
            #f8f9fa 55%,
            #e8eaed 100%
          );

          background-size: 200% 100%;

          animation:
            dashboard-shimmer
            1.45s
            ease-in-out
            infinite;
        }
      `}</style>

      <div className="mx-auto max-w-6xl text-black">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#E23C2E]" />

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E23C2E]">
                Control Center
              </p>
            </div>

            <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Admin Overview
            </h1>

            <p className="mt-1 text-sm text-ink/50">
              A quick look at your delivery operation.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              reloadDashboard(true)
            }
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-black/20 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {refreshing
              ? "Refreshing"
              : "Refresh"}
          </button>
        </div>

        {/* ==================================================
            REFRESH INDICATOR
        ================================================== */}

        {refreshing && (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-ink/40">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E23C2E]" />

            Updating dashboard data...
          </div>
        )}

        {/* ==================================================
            TOP STATS
        ================================================== */}

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Vendors"
            value={data.users.vendors}
            description="Vendors"
            icon={Building2}
            iconStyle="bg-blue-50 text-blue-600"
            onClick={goToVendors}
          />

          <StatCard
            label="Total Staff"
            value={data.users.staff}
            description="Staff"
            icon={Users}
            iconStyle="bg-indigo-50 text-indigo-600"
            onClick={goToUsers}
          />

          <StatCard
            label="Total Riders"
            value={data.users.riders}
            description={`${data.users.activeRiders} available`}
            icon={Bike}
            iconStyle="bg-emerald-50 text-emerald-600"
            onClick={gotorider}
          />

          <StatCard
            label="Total Shipments"
            value={data.shipments.total}
            description="All shipments"
            icon={Package}
            iconStyle="bg-orange-50 text-orange-600"
            onClick={goToShipments}
          />
        </div>

        {/* ==================================================
            SHIPMENT OVERVIEW
        ================================================== */}

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Shipment Overview
              </h2>

              <p className="mt-1 text-sm text-ink/45">
                Current status across the platform.
              </p>
            </div>

            <SectionLink
              onClick={goToShipments}
            >
              View shipments
            </SectionLink>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* CREATED */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-blue-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <Clock className="h-5 w-5 text-blue-600" />

              <p className="mt-3 text-xs text-ink/50">
                Created
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.created}
              </p>
            </button>

            {/* WAREHOUSE */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-amber-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-amber-50"
            >
              <Warehouse className="h-5 w-5 text-amber-600" />

              <p className="mt-3 text-xs text-ink/50">
                In Warehouse
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.inWarehouse}
              </p>
            </button>

            {/* ASSIGNED */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-indigo-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              <Bike className="h-5 w-5 text-indigo-600" />

              <p className="mt-3 text-xs text-ink/50">
                Assigned
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.assignedToRider}
              </p>
            </button>

            {/* OUT FOR DELIVERY */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-orange-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-orange-50"
            >
              <Truck className="h-5 w-5 text-orange-600" />

              <p className="mt-3 text-xs text-ink/50">
                Out for Delivery
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.outForDelivery}
              </p>
            </button>

            {/* DELIVERED */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-emerald-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />

              <p className="mt-3 text-xs text-ink/50">
                Delivered
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.delivered}
              </p>
            </button>

            {/* RETURNED */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-purple-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-purple-50"
            >
              <RotateCcw className="h-5 w-5 text-purple-600" />

              <p className="mt-3 text-xs text-ink/50">
                Returned
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.returned}
              </p>
            </button>

            {/* CANCELLED */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-red-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:bg-red-50"
            >
              <XCircle className="h-5 w-5 text-red-600" />

              <p className="mt-3 text-xs text-ink/50">
                Cancelled
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.cancelled}
              </p>
            </button>

            {/* TOTAL */}

            <button
              type="button"
              onClick={goToShipments}
              className="group rounded-xl bg-gray-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-gray-100"
            >
              <Package className="h-5 w-5 text-ink/50" />

              <p className="mt-3 text-xs text-ink/50">
                Total
              </p>

              <p className="font-display mt-1 text-xl font-extrabold text-ink">
                {data.shipments.total}
              </p>
            </button>
          </div>
        </div>

        {/* ==================================================
            FINANCE + PICKUPS
        ================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ==================================================
              FINANCE
          ================================================== */}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Finance
                </h2>

                <p className="mt-1 text-sm text-ink/45">
                  Current financial position.
                </p>
              </div>

              <SectionLink
                onClick={goToShipments}
              >
                View shipments
              </SectionLink>
            </div>

            <div className="mt-5 space-y-3">
              {/* REVENUE */}

              <button
                type="button"
                onClick={goToShipments}
                className="flex w-full items-center justify-between rounded-xl bg-emerald-50/60 p-4 text-left transition hover:bg-emerald-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Revenue
                    </p>

                    <p className="text-xs text-ink/40">
                      Shipping charges
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-emerald-600">
                  {formatNPR(
                    data.finance.totalRevenue
                  )}
                </p>
              </button>

              {/* COD */}

              <div className="flex items-center justify-between rounded-xl border border-black/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Banknote className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-ink">
                      COD Collected
                    </p>

                    <p className="text-xs text-ink/40">
                      Delivered orders
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-ink">
                  {formatNPR(
                    data.finance.codCollected
                  )}
                </p>
              </div>

              {/* COD PENDING */}

              <div className="flex items-center justify-between rounded-xl border border-black/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    COD Pending
                  </p>

                  <p className="text-xs text-ink/40">
                    Yet to be collected
                  </p>
                </div>

                <p className="font-semibold text-amber-600">
                  {formatNPR(
                    data.finance.codPending
                  )}
                </p>
              </div>

              {/* SHIPPING PENDING */}

              <div className="flex items-center justify-between rounded-xl border border-black/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Shipping Pending
                  </p>

                  <p className="text-xs text-ink/40">
                    Not yet collected
                  </p>
                </div>

                <p className="font-semibold text-amber-600">
                  {formatNPR(
                    data.finance
                      .shippingChargesPending
                  )}
                </p>
              </div>

              {/* AVERAGE */}

              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-ink/30" />

                  <p className="text-sm text-ink/50">
                    Average shipping charge
                  </p>
                </div>

                <p className="font-semibold text-ink">
                  {formatNPR(
                    data.finance
                      .averageShippingCharge
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              PICKUPS
          ================================================== */}

          <button
            type="button"
            onClick={goToPickup}
            className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md md:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Pickups
                </h2>

                <p className="mt-1 text-sm text-ink/45">
                  Current pickup activity.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-ink/20" />

                <ChevronRight className="h-4 w-4 text-ink/20" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50/60 p-4">
                <p className="text-xs text-ink/50">
                  Total
                </p>

                <p className="font-display mt-1 text-2xl font-extrabold text-ink">
                  {data.pickups.total}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50/60 p-4">
                <p className="text-xs text-ink/50">
                  Requested
                </p>

                <p className="font-display mt-1 text-2xl font-extrabold text-amber-600">
                  {data.pickups.requested}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50/60 p-4">
                <p className="text-xs text-ink/50">
                  Assigned
                </p>

                <p className="font-display mt-1 text-2xl font-extrabold text-indigo-600">
                  {data.pickups.assigned}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50/60 p-4">
                <p className="text-xs text-ink/50">
                  Completed
                </p>

                <p className="font-display mt-1 text-2xl font-extrabold text-emerald-600">
                  {data.pickups.completed}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-red-50/60 p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />

                <span className="text-sm font-medium text-ink">
                  Cancelled
                </span>
              </div>

              <span className="font-bold text-red-600">
                {data.pickups.cancelled}
              </span>
            </div>
          </button>
        </div>

        {/* ==================================================
            SYSTEM OVERVIEW
        ================================================== */}

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                System Overview
              </h2>

              <p className="mt-1 text-sm text-ink/45">
                Resources currently configured.
              </p>
            </div>

            <SectionLink
              onClick={goToLocation}
            >
              Manage locations
            </SectionLink>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* LOCATIONS */}

            <button
              type="button"
              onClick={goToLocation}
              className="group flex items-center gap-3 rounded-xl border border-black/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin className="h-4 w-4" />
              </span>

              <div>
                <p className="text-xs text-ink/45">
                  Locations
                </p>

                <p className="font-bold text-ink">
                  {data.system.locations}
                </p>
              </div>
            </button>

            {/* DELIVERY TYPES */}

            <button
              type="button"
              onClick={goToLocation}
              className="group flex items-center gap-3 rounded-xl border border-black/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Layers className="h-4 w-4" />
              </span>

              <div>
                <p className="text-xs text-ink/45">
                  Delivery Types
                </p>

                <p className="font-bold text-ink">
                  {data.system.deliveryTypes}
                </p>
              </div>
            </button>

            {/* WAREHOUSES */}

            <button
              type="button"
              onClick={goToLocation}
              className="group flex items-center gap-3 rounded-xl border border-black/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Warehouse className="h-4 w-4" />
              </span>

              <div>
                <p className="text-xs text-ink/45">
                  Warehouses
                </p>

                <p className="font-bold text-ink">
                  {data.system.warehouses}
                </p>
              </div>
            </button>

            {/* CARRIERS */}

            <button
              type="button"
              onClick={goToLocation}
              className="group flex items-center gap-3 rounded-xl border border-black/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Boxes className="h-4 w-4" />
              </span>

              <div>
                <p className="text-xs text-ink/45">
                  Carriers
                </p>

                <p className="font-bold text-ink">
                  {data.system.carriers}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ==================================================
            RECENT SHIPMENTS
        ================================================== */}

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Recent Shipments
              </h2>

              <p className="mt-1 text-sm text-ink/45">
                Latest shipments added to the platform.
              </p>
            </div>

            <SectionLink
              onClick={goToShipments}
            >
              View all
            </SectionLink>
          </div>

          {data.recentShipments.length ===
          0 ? (
            <div className="py-10 text-center">
              <Package className="mx-auto h-8 w-8 text-ink/15" />

              <p className="mt-3 text-sm text-ink/40">
                No shipments found.
              </p>
            </div>
          ) : (
            <>
              {/* ==================================================
                  MOBILE
              ================================================== */}

              <div className="mt-5 space-y-3 md:hidden">
                {data.recentShipments.map(
                  (shipment) => (
                    <button
                      type="button"
                      key={shipment.id}
                      onClick={goToShipments}
                      className="w-full rounded-xl border border-black/5 p-4 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">
                            {
                              shipment.trackingNumber
                            }
                          </p>

                          <p className="mt-1 text-xs text-ink/45">
                            {
                              shipment.receiverName ||
                              "Unknown receiver"
                            }
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                            shipment.status
                          )}`}
                        >
                          {formatStatus(
                            shipment.status
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-ink/50">
                        <MapPin className="h-4 w-4 shrink-0" />

                        <span className="truncate">
                          {shipment.receiverAddress ||
                            "Address unavailable"}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-ink/40">
                          Vendor
                        </span>

                        <span className="font-medium text-ink">
                          {shipment.vendor
                            ?.companyName ||
                            "—"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-ink/40">
                          Rider
                        </span>

                        <span className="font-medium text-ink">
                          {shipment.rider
                            ?.user?.name ||
                            "Not assigned"}
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>

              {/* ==================================================
                  DESKTOP
              ================================================== */}

              <div className="mt-5 hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink/40">
                      <th className="pb-3">
                        Tracking
                      </th>

                      <th className="pb-3">
                        Receiver
                      </th>

                      <th className="pb-3">
                        Vendor
                      </th>

                      <th className="pb-3">
                        Rider
                      </th>

                      <th className="pb-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recentShipments.map(
                      (shipment) => (
                        <tr
                          key={shipment.id}
                          onClick={
                            goToShipments
                          }
                          className="cursor-pointer border-b border-black/5 transition hover:bg-gray-50 last:border-0"
                        >
                          <td className="py-4 font-semibold text-ink">
                            {
                              shipment.trackingNumber
                            }
                          </td>

                          <td className="py-4">
                            <p className="font-medium text-ink">
                              {shipment.receiverName ||
                                "Unknown receiver"}
                            </p>

                            <p className="mt-0.5 max-w-[180px] truncate text-xs text-ink/40">
                              {shipment.receiverAddress ||
                                "Address unavailable"}
                            </p>
                          </td>

                          <td className="py-4 text-ink/60">
                            {shipment.vendor
                              ?.companyName ||
                              "—"}
                          </td>

                          <td className="py-4 text-ink/60">
                            {shipment.rider
                              ?.user?.name ||
                              "Not assigned"}
                          </td>

                          <td className="py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                                shipment.status
                              )}`}
                            >
                              {formatStatus(
                                shipment.status
                              )}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ==================================================
            FOOTER STATUS
        ================================================== */}

        <div className="flex flex-col gap-2 py-8 text-xs text-ink/35 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Dashboard connected
          </div>

          <button
            type="button"
            onClick={() =>
              reloadDashboard(true)
            }
            className="self-start font-medium transition hover:text-[#E23C2E] sm:self-auto"
          >
            Refresh data
          </button>
        </div>
      </div>
    </>
  );
}