
"use client";

import { useEffect, useState } from "react";
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
  type LucideIcon,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

interface RecentShipment {
  id: string;
  trackingNumber: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageType: string;
  weight: number;
  paymentType: string;
  codAmount: number;
  shippingCharge: number;
  status: ShipmentStatus;
  createdAt: string;

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

type ShipmentStatus =
  | "CREATED"
  | "IN_WAREHOUSE"
  | "ASSIGNED_TO_RIDER"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

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

// ======================================================
// HELPERS
// ======================================================

function formatNPR(amount: number | null | undefined) {
  return `NPR ${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

function formatStatus(status: ShipmentStatus) {
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

function getStatusStyle(status: ShipmentStatus) {
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

// ======================================================
// STAT CARD
// ======================================================

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconStyle: string;
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconStyle,
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>

        {description && (
          <span className="text-xs font-medium text-ink/40">
            {description}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-ink/50">{label}</p>

      <p className="font-display mt-1 text-2xl font-extrabold text-ink">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ====================================================
  // FETCH DASHBOARD
  // ====================================================

 useEffect(() => {
  let cancelled = false;

  async function fetchDashboard() {
    // 1. Check cached data first
    const cached = sessionStorage.getItem("admin-dashboard");

    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);

      // Optional: don't make API request at all
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/admin`
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const json: DashboardData = await res.json();

      if (!cancelled) {
        setData(json);
        setError(null);

        // 2. Save dashboard data
        sessionStorage.setItem(
          "admin-dashboard",
          JSON.stringify(json)
        );
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  fetchDashboard();

  return () => {
    cancelled = true;
  };
}, []);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-black/5" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-black/5" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[140px] animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            />
          ))}
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          Failed to load dashboard.
          <p className="mt-1 text-red-500/80">
            {error || "No dashboard data available."}
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="mx-auto max-w-6xl text-black">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Admin Overview
        </h1>

        <p className="mt-1 text-sm text-ink/50">
          Overview of your delivery platform.
        </p>
      </div>

      {/* ==================================================
          TOP STATS
      ================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Vendors"
          value={data.users.vendors}
          description="Vendors"
          icon={Building2}
          iconStyle="bg-blue-50 text-blue-600"
        />

        <StatCard
          label="Total Staff"
          value={data.users.staff}
          description="Staff"
          icon={Users}
          iconStyle="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          label="Total Riders"
          value={data.users.riders}
          description={`${data.users.activeRiders} available`}
          icon={Bike}
          iconStyle="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          label="Total Shipments"
          value={data.shipments.total}
          description="All time"
          icon={Package}
          iconStyle="bg-orange-50 text-orange-600"
        />
      </div>

      {/* ==================================================
          SHIPMENT OVERVIEW
      ================================================== */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Shipment Overview
            </h2>

            <p className="mt-1 text-sm text-ink/45">
              Current shipment status across the platform.
            </p>
          </div>

          <Package className="hidden h-5 w-5 text-ink/20 sm:block" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* CREATED */}

          <div className="rounded-xl bg-blue-50/60 p-4">
            <Clock className="h-5 w-5 text-blue-600" />

            <p className="mt-3 text-xs text-ink/50">
              Created
            </p>

            <p className="font-display mt-1 text-xl font-extrabold text-ink">
              {data.shipments.created}
            </p>
          </div>

          {/* WAREHOUSE */}

          <div className="rounded-xl bg-amber-50/60 p-4">
            <Warehouse className="h-5 w-5 text-amber-600" />

            <p className="mt-3 text-xs text-ink/50">
              In Warehouse
            </p>

            <p className="font-display mt-1 text-xl font-extrabold text-ink">
              {data.shipments.inWarehouse}
            </p>
          </div>

          {/* ASSIGNED */}

          <div className="rounded-xl bg-indigo-50/60 p-4">
            <Bike className="h-5 w-5 text-indigo-600" />

            <p className="mt-3 text-xs text-ink/50">
              Assigned to Rider
            </p>

            <p className="font-display mt-1 text-xl font-extrabold text-ink">
              {data.shipments.assignedToRider}
            </p>
          </div>

          {/* OUT FOR DELIVERY */}

          <div className="rounded-xl bg-orange-50/60 p-4">
            <Truck className="h-5 w-5 text-orange-600" />

            <p className="mt-3 text-xs text-ink/50">
              Out for Delivery
            </p>

            <p className="font-display mt-1 text-xl font-extrabold text-ink">
              {data.shipments.outForDelivery}
            </p>
          </div>

          {/* DELIVERED */}

          <div className="rounded-xl bg-emerald-50/60 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />

            <p className="mt-3 text-xs text-ink/50">
              Delivered
            </p>

            <p className="font-display mt-1 text-xl font-extrabold text-ink">
              {data.shipments.delivered}
            </p>
          </div>

          {/* RETURNED */}

          <div className="rounded-xl bg-purple-50/60 p-4">
            <RotateCcw className="h-5 w-5 text-purple-600" />

            <p className="mt-3 text-xs text-ink/50">
              Returned
            </p>

            <p className="font-display mt-1 text-xl font-extrabold text-ink">
              {data.shipments.returned}
            </p>
          </div>

          {/* CANCELLED */}

          <div className="rounded-xl bg-red-50/60 p-4">
            <XCircle className="h-5 w-5 text-red-600" />

            <p className="mt-3 text-xs text-ink/50">
              Cancelled
            </p>

            <p className="font-display mt-1 text-xl font-extrabold text-ink">
              {data.shipments.cancelled}
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          FINANCE + PICKUPS
      ================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* FINANCE */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Finance
              </h2>

              <p className="mt-1 text-sm text-ink/45">
                Platform financial overview.
              </p>
            </div>

            <Wallet className="h-5 w-5 text-ink/20" />
          </div>

          <div className="mt-5 space-y-3">
            {/* REVENUE */}

            <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 p-4">
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
                {formatNPR(data.finance.totalRevenue)}
              </p>
            </div>

            {/* COD COLLECTED */}

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
                {formatNPR(data.finance.codCollected)}
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
                {formatNPR(data.finance.codPending)}
              </p>
            </div>

            {/* SHIPPING PENDING */}

            <div className="flex items-center justify-between rounded-xl border border-black/5 p-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Shipping Charges Pending
                </p>

                <p className="text-xs text-ink/40">
                  Not yet collected
                </p>
              </div>

              <p className="font-semibold text-amber-600">
                {formatNPR(
                  data.finance.shippingChargesPending
                )}
              </p>
            </div>

            {/* AVERAGE */}

            <div className="flex items-center justify-between border-t border-black/5 pt-4">
              <p className="text-sm text-ink/50">
                Average shipping charge
              </p>

              <p className="font-semibold text-ink">
                {formatNPR(
                  data.finance.averageShippingCharge
                )}
              </p>
            </div>
          </div>
        </div>

        {/* PICKUPS */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Pickups
              </h2>

              <p className="mt-1 text-sm text-ink/45">
                Current pickup activity.
              </p>
            </div>

            <Truck className="h-5 w-5 text-ink/20" />
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
        </div>
      </div>

      {/* ==================================================
          SYSTEM OVERVIEW
      ================================================== */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            System Overview
          </h2>

          <p className="mt-1 text-sm text-ink/45">
            Resources configured on the platform.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-black/5 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-black/5 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
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
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-black/5 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
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
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-black/5 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
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
          </div>
        </div>
      </div>

      {/* ==================================================
          RECENT SHIPMENTS
      ================================================== */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Recent Shipments
            </h2>

            <p className="mt-1 text-sm text-ink/45">
              Latest shipments added to the platform.
            </p>
          </div>

          <Package className="h-5 w-5 text-ink/20" />
        </div>

        {data.recentShipments.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink/40">
            No shipments found.
          </div>
        ) : (
          <>
            {/* MOBILE */}

            <div className="mt-5 space-y-3 md:hidden">
              {data.recentShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="rounded-xl border border-black/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        {shipment.trackingNumber}
                      </p>

                      <p className="mt-1 text-xs text-ink/45">
                        {shipment.receiverName}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                        shipment.status
                      )}`}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-ink/50">
                    <MapPin className="h-4 w-4 shrink-0" />

                    <span className="truncate">
                      {shipment.receiverAddress}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-ink/40">
                      Vendor
                    </span>

                    <span className="font-medium text-ink">
                      {shipment.vendor?.companyName || "—"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-ink/40">
                      Rider
                    </span>

                    <span className="font-medium text-ink">
                      {shipment.rider?.user?.name || "Not assigned"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP */}

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
                  {data.recentShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-4 font-semibold text-ink">
                        {shipment.trackingNumber}
                      </td>

                      <td className="py-4">
                        <p className="font-medium text-ink">
                          {shipment.receiverName}
                        </p>

                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-ink/40">
                          {shipment.receiverAddress}
                        </p>
                      </td>

                      <td className="py-4 text-ink/60">
                        {shipment.vendor?.companyName || "—"}
                      </td>

                      <td className="py-4 text-ink/60">
                        {shipment.rider?.user?.name ||
                          "Not assigned"}
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                            shipment.status
                          )}`}
                        >
                          {formatStatus(shipment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

