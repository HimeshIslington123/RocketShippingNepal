
"use client";

import { useEffect, useState } from "react";

import {
  Package,
  CheckCircle2,
  Truck,
  Clock3,
  RotateCcw,
  XCircle,
  Warehouse,
  UserCheck,
  MapPin,
  ChevronRight,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type ShipmentStatus =
  | "CREATED"
  | "IN_WAREHOUSE"
  | "ASSIGNED_TO_RIDER"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

interface Shipment {
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

  vendor?: {
    id: number;
    companyName: string;
  } | null;

  rider?: {
    id: number;
    phone: string;

    user?: {
      id: number;
      name: string;
    } | null;
  } | null;
}

interface DashboardData {
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
    requested: number;
  };

  recentShipments: Shipment[];
}

// ======================================================
// STATUS STYLES
// ======================================================

const STATUS_STYLES: Record<
  ShipmentStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  CREATED: {
    label: "Created",
    className: "bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
  },

  IN_WAREHOUSE: {
    label: "In Warehouse",
    className: "bg-amber-50 text-amber-600",
    dot: "bg-amber-500",
  },

  ASSIGNED_TO_RIDER: {
    label: "Assigned to Rider",
    className: "bg-purple-50 text-purple-600",
    dot: "bg-purple-500",
  },

  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    className: "bg-orange-50 text-orange-600",
    dot: "bg-orange-500",
  },

  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },

  RETURNED: {
    label: "Returned",
    className: "bg-rose-50 text-rose-600",
    dot: "bg-rose-500",
  },

  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600",
    dot: "bg-gray-500",
  },
};

// ======================================================
// HELPERS
// ======================================================

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ======================================================
// PAGE
// ======================================================

export default function StaffOverviewPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5001/api/vendor/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load dashboard"
          );
        }

        const data =
          await response.json();

        setDashboard(data);
      } catch (err) {
        console.error(
          "STAFF DASHBOARD ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-black">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-sm text-ink/50">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div className="mx-auto max-w-6xl text-black">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // NO DATA
  // ====================================================

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-6xl text-black">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-ink/50">
            No dashboard data available.
          </p>
        </div>
      </div>
    );
  }

  const {
    shipments,
    pickups,
    recentShipments,
  } = dashboard;

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="mx-auto max-w-6xl text-black">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
          Staff Dashboard
        </h1>

        <p className="mt-1 text-sm text-ink/50">
          Overview of shipments and pickup requests.
        </p>
      </div>

      {/* ==================================================
          MAIN STATS
      ================================================== */}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-5 w-5" />
            </span>

            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
              All
            </span>

          </div>

          <p className="mt-4 text-sm text-ink/50">
            Total Shipments
          </p>

          <p className="font-display mt-1 text-3xl font-extrabold text-ink">
            {shipments.total}
          </p>
        </div>

        {/* CREATED */}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock3 className="h-5 w-5" />
            </span>

            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
              New
            </span>

          </div>

          <p className="mt-4 text-sm text-ink/50">
            Created
          </p>

          <p className="font-display mt-1 text-3xl font-extrabold text-ink">
            {shipments.created}
          </p>
        </div>

        {/* OUT FOR DELIVERY */}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Truck className="h-5 w-5" />
            </span>

            <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
              Active
            </span>

          </div>

          <p className="mt-4 text-sm text-ink/50">
            Out for Delivery
          </p>

          <p className="font-display mt-1 text-3xl font-extrabold text-ink">
            {shipments.outForDelivery}
          </p>
        </div>

        {/* DELIVERED */}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
              Done
            </span>

          </div>

          <p className="mt-4 text-sm text-ink/50">
            Delivered
          </p>

          <p className="font-display mt-1 text-3xl font-extrabold text-ink">
            {shipments.delivered}
          </p>
        </div>

      </div>

      {/* ==================================================
          OTHER SHIPMENT STATUSES
      ================================================== */}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">

        {/* IN WAREHOUSE */}

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">

          <div className="flex items-center gap-2">

            <Warehouse className="h-4 w-4 text-amber-600" />

            <p className="text-xs text-ink/50">
              In Warehouse
            </p>

          </div>

          <p className="mt-1 text-xl font-bold text-ink">
            {shipments.inWarehouse}
          </p>

        </div>

        {/* ASSIGNED */}

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">

          <div className="flex items-center gap-2">

            <UserCheck className="h-4 w-4 text-purple-600" />

            <p className="text-xs text-ink/50">
              Assigned to Rider
            </p>

          </div>

          <p className="mt-1 text-xl font-bold text-ink">
            {shipments.assignedToRider}
          </p>

        </div>

        {/* RETURNED */}

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">

          <div className="flex items-center gap-2">

            <RotateCcw className="h-4 w-4 text-rose-600" />

            <p className="text-xs text-ink/50">
              Returned
            </p>

          </div>

          <p className="mt-1 text-xl font-bold text-ink">
            {shipments.returned}
          </p>

        </div>

        {/* CANCELLED */}

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">

          <div className="flex items-center gap-2">

            <XCircle className="h-4 w-4 text-gray-500" />

            <p className="text-xs text-ink/50">
              Cancelled
            </p>

          </div>

          <p className="mt-1 text-xl font-bold text-ink">
            {shipments.cancelled}
          </p>

        </div>

      </div>

      {/* ==================================================
          PICKUP REQUEST
      ================================================== */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="font-display text-lg font-bold text-ink">
              Pickup Requests
            </h2>

            <p className="mt-1 text-sm text-ink/50">
              Pickup requests waiting for assignment.
            </p>

          </div>

          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Package className="h-5 w-5" />
          </span>

        </div>

        <div className="mt-5">

          <p className="text-sm text-ink/50">
            Requested
          </p>

          <p className="mt-1 text-3xl font-extrabold text-ink">
            {pickups.requested}
          </p>

        </div>

      </div>

      {/* ==================================================
          RECENT SHIPMENTS
      ================================================== */}

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">

        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Recent Shipments
          </h2>

          <p className="mt-1 text-sm text-ink/50">
            Latest shipment activity.
          </p>
        </div>

        {/* ==================================================
            MOBILE
        ================================================== */}

        <div className="mt-5 space-y-4 md:hidden">

          {recentShipments.length === 0 ? (

            <div className="py-8 text-center text-sm text-ink/50">
              No shipments found.
            </div>

          ) : (

            recentShipments
              .slice(0, 3)
              .map((shipment) => {

                const status =
                  STATUS_STYLES[
                    shipment.status
                  ];

                return (
                  <div
                    key={shipment.id}
                    className="rounded-xl border border-black/5 p-4"
                  >

                    {/* TOP */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="break-all font-semibold text-ink">
                          {shipment.trackingNumber}
                        </h3>

                        <p className="mt-1 text-sm text-ink/50">
                          {shipment.receiverName}
                        </p>

                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />

                        {status.label}

                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-4 space-y-2 text-sm text-ink/60">

                      <div className="flex items-start gap-2">

                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>
                          {shipment.receiverAddress}
                        </span>

                      </div>

                      <p>
                        <span className="font-medium text-ink">
                          Vendor:
                        </span>{" "}
                        {shipment.vendor?.companyName ||
                          "-"}
                      </p>

                      <p>
                        <span className="font-medium text-ink">
                          Rider:
                        </span>{" "}
                        {shipment.rider?.user?.name ||
                          "Not assigned"}
                      </p>

                      <p>
                        <span className="font-medium text-ink">
                          Created:
                        </span>{" "}
                        {formatDate(
                          shipment.createdAt
                        )}
                      </p>

                    </div>

                    {/* ACTION */}

                    <button
                      type="button"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 font-semibold text-white transition hover:bg-accent-dark"
                    >
                      View Shipment

                      <ChevronRight className="h-4 w-4" />
                    </button>

                  </div>
                );
              })

          )}

        </div>

        {/* ==================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="mt-5 hidden overflow-x-auto md:block">

          <table className="w-full text-left text-sm">

            <thead>

              <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink/40">

                <th className="pb-3">
                  Tracking ID
                </th>

                <th className="pb-3">
                  Receiver
                </th>

                <th className="pb-3">
                  Destination
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

                <th className="pb-3">
                  Created
                </th>

                <th className="pb-3">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {recentShipments.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-10 text-center text-sm text-ink/50"
                  >
                    No shipments found.
                  </td>

                </tr>

              ) : (

                recentShipments
                  .slice(0, 3)
                  .map((shipment) => {

                    const status =
                      STATUS_STYLES[
                        shipment.status
                      ];

                    return (
                      <tr
                        key={shipment.id}
                        className="border-b border-black/5 last:border-0"
                      >

                        {/* TRACKING */}

                        <td className="py-4 font-semibold">
                          {shipment.trackingNumber}
                        </td>

                        {/* RECEIVER */}

                        <td className="py-4">

                          <div>

                            <p className="font-medium">
                              {shipment.receiverName}
                            </p>

                            <p className="text-xs text-ink/40">
                              {shipment.receiverPhone}
                            </p>

                          </div>

                        </td>

                        {/* DESTINATION */}

                        <td className="py-4">

                          <div className="flex items-center gap-2 text-ink/60">

                            <MapPin className="h-4 w-4 shrink-0" />

                            <span>
                              {shipment.receiverAddress}
                            </span>

                          </div>

                        </td>

                        {/* VENDOR */}

                        <td className="py-4">

                          {shipment.vendor?.companyName ||
                            "-"}

                        </td>

                        {/* RIDER */}

                        <td className="py-4">

                          {shipment.rider?.user?.name ||
                            "Not assigned"}

                        </td>

                        {/* STATUS */}

                        <td className="py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />

                            {status.label}

                          </span>

                        </td>

                        {/* CREATED */}

                        <td className="py-4 text-ink/60">
                          {formatDate(
                            shipment.createdAt
                          )}
                        </td>

                        {/* ACTION */}

                        <td className="py-4">

                          <button
                            type="button"
                            className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
                          >
                            View

                            <ChevronRight className="h-4 w-4" />
                          </button>

                        </td>

                      </tr>
                    );
                  })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

