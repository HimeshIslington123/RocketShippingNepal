"use client";

import { useEffect, useState } from "react";

import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Warehouse,
  Send,
  MapPin,
  Wallet,
  Receipt,
  TrendingUp,
  Download,
  LucideIcon,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Box,
  Loader2,
  AlertCircle,
} from "lucide-react";

const SHIPMENT_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/shipment`;

// --------------------------------------------------
// TYPES
// --------------------------------------------------

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
  totalShippingCharges: number;
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
  vendorId?: number;
  riderId?: number | null;
  priceLocationId?: number;
  createdAt: string;
  updatedAt: string;
  trackings: TrackingEvent[];
  rider?: RiderInfo | null;
}

// The dashboard endpoint returns a lighter shipment shape
// (no `rider` relation, and sometimes an empty `trackings`
// array). We fetch the full record from /api/shipment/:id
// on expand and merge it in — see loadShipmentDetail().
type ShipmentDetail = RecentShipment;

interface VendorDashboardData {
  vendor: VendorInfo;
  orders: OrderStats;
  finance: FinanceStats;
  recentShipments: RecentShipment[];
}

interface StatCard {
  label: string;
  value: string | number;
  tag: string;
  tagColor: string;
  icon: LucideIcon;
}

interface StatusStep {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatNPR(amount: number | null | undefined): string {
  if (amount == null) return "NPR 0";

  return `NPR ${Number(amount).toLocaleString("en-IN")}`;
}

function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("en-US", {
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

function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: LucideIcon;
    color: string;
    bg: string;
  }
> = {
  PENDING: { label: "Pending", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  RECEIVED: { label: "Received", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
  PROCESSING: { label: "Processing", icon: RotateCcw, color: "text-blue-600", bg: "bg-blue-50" },
  IN_WAREHOUSE: { label: "In Warehouse", icon: Warehouse, color: "text-purple-600", bg: "bg-purple-50" },
  DISPATCHED: { label: "Dispatched", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
  IN_TRANSIT: { label: "In Transit", icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
  ARRIVED: { label: "Arrived", icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
  DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  RETURNED: { label: "Returned", icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
};

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function VendorDashboardPage() {
  const [data, setData] = useState<VendorDashboardData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);

  // --------------------------------------------------
  // PER-SHIPMENT DETAIL CACHE
  //
  // The dashboard endpoint's `recentShipments` doesn't
  // include the rider relation and can return an empty
  // `trackings` array. When a row is expanded we fetch
  // the full record from /api/shipment/:id (same endpoint
  // your rider table already uses) and cache it here.
  // --------------------------------------------------

  const [detailsCache, setDetailsCache] = useState<
    Record<string, ShipmentDetail>
  >({});

  const [detailsLoading, setDetailsLoading] = useState<
    Record<string, boolean>
  >({});

  const [detailsError, setDetailsError] = useState<
    Record<string, string>
  >({});

  // --------------------------------------------------
  // FETCH DASHBOARD
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);

        const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/dashboard`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(`Request failed: ${res.status} ${body}`);
        }

        const json: VendorDashboardData = await res.json();

        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
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

  // --------------------------------------------------
  // FETCH FULL SHIPMENT DETAIL (rider + trackings)
  // --------------------------------------------------

  async function loadShipmentDetail(shipmentId: string) {
    // Already cached or already loading — don't refetch.
    if (detailsCache[shipmentId] || detailsLoading[shipmentId]) {
      return;
    }

    try {
      setDetailsLoading((prev) => ({ ...prev, [shipmentId]: true }));

      setDetailsError((prev) => {
        const next = { ...prev };
        delete next[shipmentId];
        return next;
      });

      const res = await fetch(`${SHIPMENT_API_URL}/${shipmentId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to load shipment (status ${res.status})`);
      }

      const json: ShipmentDetail = await res.json();

      setDetailsCache((prev) => ({ ...prev, [shipmentId]: json }));
    } catch (err) {
      setDetailsError((prev) => ({
        ...prev,
        [shipmentId]:
          err instanceof Error
            ? err.message
            : "Could not load rider and tracking details.",
      }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [shipmentId]: false }));
    }
  }

  function toggleShipment(shipment: RecentShipment) {
    const next = expandedShipment === shipment.id ? null : shipment.id;

    setExpandedShipment(next);

    if (next) {
      loadShipmentDetail(shipment.id);
    }
  }

  // --------------------------------------------------
  // TOP STATS
  // --------------------------------------------------

  const STATS: StatCard[] = data
    ? [
        {
          label: "Total Orders",
          value: data.orders.total,
          tag: "All time",
          tagColor: "text-blue-600 bg-blue-50",
          icon: Package,
        },
        {
          label: "In Transit",
          value: data.orders.inTransit,
          tag: "Live",
          tagColor: "text-blue-600 bg-blue-50",
          icon: Truck,
        },
        {
          label: "Delivered",
          value: data.orders.delivered,
          tag: "Success",
          tagColor: "text-green-600 bg-green-50",
          icon: CheckCircle2,
        },
        {
          label: "Total Revenue",
          value: formatNPR(data.finance.totalRevenue),
          tag: "Shipping charges",
          tagColor: "text-green-600 bg-green-50",
          icon: Wallet,
        },
      ]
    : [];

  // --------------------------------------------------
  // FINANCE STATS
  // --------------------------------------------------

  const FINANCE_STATS: StatCard[] = data
    ? [
        {
          label: "COD Collected",
          value: formatNPR(data.finance.codCollected),
          tag: "Delivered COD",
          tagColor: "text-green-600 bg-green-50",
          icon: Wallet,
        },
        {
          label: "Total COD",
          value: formatNPR(data.finance.totalCOD),
          tag: "All COD orders",
          tagColor: "text-blue-600 bg-blue-50",
          icon: Receipt,
        },
        {
          label: "Avg. Shipping Charge",
          value: formatNPR(data.finance.averageShippingCharge),
          tag: "Per shipment",
          tagColor: "text-blue-600 bg-blue-50",
          icon: TrendingUp,
        },
      ]
    : [];

  // --------------------------------------------------
  // STATUS STEPS
  // --------------------------------------------------

  const STATUS_STEPS: StatusStep[] = data
    ? [
        { label: "Pending", value: data.orders.pending, icon: Clock, color: "text-orange-500 bg-orange-50" },
        { label: "Received", value: data.orders.received, icon: Package, color: "text-blue-600 bg-blue-50" },
        { label: "Processing", value: data.orders.processing, icon: RotateCcw, color: "text-blue-600 bg-blue-50" },
        { label: "In Warehouse", value: data.orders.inWarehouse, icon: Warehouse, color: "text-purple-600 bg-purple-50" },
        { label: "Dispatched", value: data.orders.dispatched, icon: Send, color: "text-blue-600 bg-blue-50" },
        { label: "In Transit", value: data.orders.inTransit, icon: Truck, color: "text-blue-600 bg-blue-50" },
        { label: "Arrived", value: data.orders.arrived, icon: MapPin, color: "text-purple-600 bg-purple-50" },
        { label: "Out for Delivery", value: data.orders.outForDelivery, icon: Truck, color: "text-amber-600 bg-amber-50" },
        { label: "Delivered", value: data.orders.delivered, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
        { label: "Cancelled", value: data.orders.cancelled, icon: XCircle, color: "text-red-600 bg-red-50" },
        { label: "Returned", value: data.orders.returned, icon: RotateCcw, color: "text-red-500 bg-red-50" },
      ]
    : [];

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl text-black">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {data ? data.vendor.companyName : "Vendor Dashboard"}
          </h1>

          <p className="mt-1 text-sm text-ink/50">
            {data
              ? `${data.vendor.location} · Overview of your shipments and earnings.`
              : "Overview of your shipments and earnings."}
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-black/[0.03]"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p className="font-semibold">Failed to load dashboard</p>
          <p className="mt-1">{error}</p>
        </div>
      )}


      {/* ==================================================
          TOP STAT CARDS
      ================================================== */}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[124px] animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stat.tagColor}`}
                  >
                    {stat.tag}
                  </span>
                </div>

                <p className="mt-4 text-sm text-ink/50">{stat.label}</p>

                <p className="font-display text-2xl font-extrabold text-ink">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      )}


      {/* ==================================================
          FINANCE
      ================================================== */}

      {!loading && data && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FINANCE_STATS.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stat.tagColor}`}
                  >
                    {stat.tag}
                  </span>
                </div>

                <p className="mt-4 text-sm text-ink/50">{stat.label}</p>

                <p className="font-display text-2xl font-extrabold text-ink">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      )}


      {/* ==================================================
          ORDER STATUS BREAKDOWN
      ================================================== */}

      {!loading && data && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold text-ink">
            Order Status Breakdown
          </h2>

          <p className="mt-1 text-sm text-ink/40">
            Current status of all your shipments.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {STATUS_STEPS.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className="rounded-xl border border-black/5 p-4"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${step.color}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>

                  <p className="mt-3 text-xs text-ink/50">{step.label}</p>

                  <p className="font-display text-lg font-extrabold text-ink">
                    {step.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ==================================================
          RECENT SHIPMENTS
      ================================================== */}

      {!loading && data && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">

          {/* Header */}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Recent Shipments
              </h2>

              <p className="mt-1 text-sm text-ink/40">
                Click a shipment to view complete delivery history.
              </p>
            </div>

            <a href="#" className="text-sm font-semibold text-accent">
              View All Shipments
            </a>
          </div>


          {/* Empty */}

          {data.recentShipments.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-black/10 p-8 text-center">
              <Package className="mx-auto h-8 w-8 text-ink/20" />
              <p className="mt-3 text-sm text-ink/50">No shipments yet.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {data.recentShipments.map((shipment) => {
                const expanded = expandedShipment === shipment.id;

                // Full detail (rider + trackings) fetched on expand.
                // Falls back to the summary object's own fields
                // until the fetch resolves.
                const detail = detailsCache[shipment.id];
                const isLoadingDetail = !!detailsLoading[shipment.id];
                const loadError = detailsError[shipment.id];

                const trackings =
                  detail?.trackings ?? shipment.trackings ?? [];

                const riderId = detail?.riderId ?? shipment.riderId ?? null;
                const rider = detail?.rider ?? null;
                const notes = detail?.notes ?? shipment.notes;

                const statusConfig =
                  STATUS_CONFIG[shipment.status] ?? {
                    label: formatStatusLabel(shipment.status),
                    icon: Package,
                    color: "text-gray-600",
                    bg: "bg-gray-50",
                  };

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={shipment.id}
                    className="overflow-hidden rounded-xl border border-black/5"
                  >

                    {/* ==================================================
                        SHIPMENT SUMMARY
                    ================================================== */}

                    <button
                      type="button"
                      onClick={() => toggleShipment(shipment)}
                      className="w-full px-5 py-4 text-left transition hover:bg-black/[0.02]"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:items-center">

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-ink/40">
                            Tracking
                          </p>
                          <p className="mt-1 font-semibold text-ink">
                            {shipment.trackingNumber}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-ink/40">
                            Receiver
                          </p>
                          <p className="mt-1 font-medium text-ink">
                            {shipment.receiverName}
                          </p>
                          <p className="text-xs text-ink/40">
                            {shipment.receiverPhone}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-ink/40">
                            Destination
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-sm text-ink/60">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {shipment.receiverAddress}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-ink/40">
                            Payment
                          </p>
                          <p className="mt-1 font-medium text-ink">
                            {shipment.paymentType === "COD"
                              ? formatNPR(shipment.codAmount)
                              : "PREPAID"}
                          </p>
                          {shipment.paymentType === "COD" && (
                            <p className="text-xs text-ink/40">COD</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-ink/40">
                            Status
                          </p>
                          <span
                            className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="flex justify-end">
                          {expanded ? (
                            <ChevronUp className="h-5 w-5 text-ink/40" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-ink/40" />
                          )}
                        </div>
                      </div>
                    </button>


                    {/* ==================================================
                        EXPANDED DETAILS
                    ================================================== */}

                    {expanded && (
                      <div className="border-t border-black/5 bg-gray-50/50 p-5">

                        {/* Fetch error banner */}

                        {loadError && (
                          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold">
                                Couldn&apos;t load rider &amp; tracking details
                              </p>
                              <p className="mt-0.5 text-xs text-red-500">
                                {loadError}
                              </p>
                            </div>
                            <button
                              onClick={() => loadShipmentDetail(shipment.id)}
                              className="ml-auto shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        {/* ==================================================
                            SHIPMENT INFORMATION
                        ================================================== */}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                          <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                            <div className="flex items-center gap-2 text-ink/40">
                              <User className="h-4 w-4" />
                              <span className="text-xs">Receiver</span>
                            </div>
                            <p className="mt-2 font-semibold text-ink">
                              {shipment.receiverName}
                            </p>
                            <p className="mt-1 text-xs text-ink/50">
                              {shipment.receiverPhone}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                            <div className="flex items-center gap-2 text-ink/40">
                              <MapPin className="h-4 w-4" />
                              <span className="text-xs">Destination</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-ink">
                              {shipment.receiverAddress}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                            <div className="flex items-center gap-2 text-ink/40">
                              <Box className="h-4 w-4" />
                              <span className="text-xs">Package</span>
                            </div>
                            <p className="mt-2 font-semibold text-ink">
                              {shipment.packageType}
                            </p>
                            <p className="mt-1 text-xs text-ink/50">
                              {shipment.weight} kg
                            </p>
                          </div>

                          <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                            <div className="flex items-center gap-2 text-ink/40">
                              <Wallet className="h-4 w-4" />
                              <span className="text-xs">Charges</span>
                            </div>
                            <p className="mt-2 font-semibold text-ink">
                              {formatNPR(shipment.shippingCharge)}
                            </p>
                            {shipment.paymentType === "COD" && (
                              <p className="mt-1 text-xs text-green-600">
                                COD: {formatNPR(shipment.codAmount)}
                              </p>
                            )}
                          </div>
                        </div>


                        {/* ==================================================
                            RIDER + NOTES
                        ================================================== */}

                        <div className="mt-4 rounded-xl bg-white p-5 ring-1 ring-black/5">
                          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                            {/* Rider */}

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                                Delivery Rider
                              </p>

                              {isLoadingDetail && !detail ? (
                                <div className="mt-2 flex items-center gap-2 text-ink/40">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">
                                    Loading rider...
                                  </span>
                                </div>
                              ) : rider ? (
                                <div className="mt-2 flex items-center gap-3">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <Truck className="h-4 w-4" />
                                  </span>

                                  <div>
                                    <p className="text-sm font-semibold text-ink">
                                      {rider.user?.name ??
                                        `Rider #${rider.id}`}
                                    </p>

                                    <p className="text-xs text-ink/50">
                                      {rider.phone}
                                      {rider.vehicleNumber
                                        ? ` · ${rider.vehicleNumber}`
                                        : ""}
                                    </p>
                                  </div>
                                </div>
                              ) : riderId ? (
                                <div className="mt-2 flex items-center gap-3">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <Truck className="h-4 w-4" />
                                  </span>

                                  <div>
                                    <p className="text-sm font-semibold text-ink">
                                      Rider #{riderId}
                                    </p>
                                    <p className="text-xs text-green-600">
                                      Assigned
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-2 text-sm text-orange-500">
                                  No rider assigned yet
                                </p>
                              )}
                            </div>

                            {/* Payment */}

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                                Payment Type
                              </p>
                              <p className="mt-2 text-sm font-semibold text-ink">
                                {shipment.paymentType}
                              </p>
                            </div>

                            {/* Notes */}

                            {notes && (
                              <div className="md:max-w-md">
                                <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                                  Notes
                                </p>
                                <p className="mt-2 text-sm text-ink/60">
                                  {notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>


                        {/* ==================================================
                            DELIVERY PROGRESS
                        ================================================== */}

                        <div className="mt-5 rounded-xl bg-white p-5 ring-1 ring-black/5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="font-display font-bold text-ink">
                                Delivery Progress
                              </h3>
                              <p className="mt-1 text-xs text-ink/40">
                                Complete tracking history for this shipment.
                              </p>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Loading */}

                          {isLoadingDetail && !detail ? (
                            <div className="mt-5 flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-ink/40">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <p className="text-sm">
                                Loading tracking history...
                              </p>
                            </div>
                          ) : trackings.length === 0 ? (
                            /* No tracking */
                            <div className="mt-5 rounded-lg bg-orange-50 p-4">
                              <div className="flex items-center gap-2 text-orange-600">
                                <Clock className="h-4 w-4" />
                                <p className="text-sm font-medium">
                                  Shipment has not started tracking yet.
                                </p>
                              </div>
                              <p className="mt-1 text-xs text-orange-500/70">
                                Tracking events will appear here once the
                                shipment is received.
                              </p>
                            </div>
                          ) : (
                            /* ==================================================
                               TIMELINE
                            ================================================== */
                            <div className="relative mt-7">
                              {trackings.map((tracking, index) => {
                                const config =
                                  STATUS_CONFIG[tracking.status] ?? {
                                    label: formatStatusLabel(
                                      tracking.status
                                    ),
                                    icon: Package,
                                    color: "text-gray-600",
                                    bg: "bg-gray-50",
                                  };

                                const Icon = config.icon;

                                const isLast =
                                  index === trackings.length - 1;

                                return (
                                  <div
                                    key={tracking.id}
                                    className="relative flex gap-4 pb-7 last:pb-0"
                                  >
                                    {!isLast && (
                                      <div className="absolute left-[15px] top-8 h-full w-px bg-black/10" />
                                    )}

                                    <div
                                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                          <p className="font-semibold text-ink">
                                            {config.label}
                                          </p>

                                          {tracking.message && (
                                            <p className="mt-1 text-sm leading-6 text-ink/60">
                                              {tracking.message}
                                            </p>
                                          )}
                                        </div>

                                        <p className="shrink-0 text-xs text-ink/40">
                                          {formatDateTime(
                                            tracking.createdAt
                                          )}
                                        </p>
                                      </div>

                                      {tracking.location && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-ink/50">
                                          <MapPin className="h-3.5 w-3.5" />
                                          <span>{tracking.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>


                        {/* ==================================================
                            SHIPMENT DATES
                        ================================================== */}

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/40">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Created: {formatDateTime(shipment.createdAt)}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Last Updated:{" "}
                            {formatDateTime(shipment.updatedAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}