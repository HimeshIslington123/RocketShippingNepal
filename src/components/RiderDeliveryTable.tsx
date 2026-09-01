"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  History,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Phone,
  RefreshCw,
  Search,
  Truck,
  User,
  Wallet,
  X,
  AlertCircle,
} from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/shipment`;

type ShipmentStatus =
  | "PENDING"
  | "RECEIVED"
  | "PROCESSING"
  | "IN_WAREHOUSE"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "ASSIGNED_TO_RIDER";

type Tracking = {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  message: string;
  createdAt: string;
};

type Shipment = {
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

  notes?: string | null;

  status: ShipmentStatus;

  riderId?: number | null;

  createdAt: string;
  updatedAt: string;

  trackings?: Tracking[];
};

type FilterType = "ALL" | "ACTIVE" | "DELIVERED";

const statusConfig: Record<
  ShipmentStatus,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
  }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },

  RECEIVED: {
    label: "Received",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },

  PROCESSING: {
    label: "Processing",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },

  IN_WAREHOUSE: {
    label: "In Warehouse",
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-500",
  },

  DISPATCHED: {
    label: "Dispatched",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },

  IN_TRANSIT: {
    label: "In Transit",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    dot: "bg-cyan-500",
  },

  ARRIVED: {
    label: "Arrived",
    bg: "bg-teal-50",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },

  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },

  DELIVERED: {
    label: "Delivered",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },

  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },

  RETURNED: {
    label: "Returned",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },

  ASSIGNED_TO_RIDER: {
    label: "Assigned to Rider",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
};

const quickMessages = [
  {
    label: "No answer",
    message: "Customer did not answer the call.",
  },
  {
    label: "Phone off",
    message: "Customer phone is switched off.",
  },
  {
    label: "Call later",
    message: "Customer requested delivery at a later time.",
  },
  {
    label: "Address issue",
    message: "Unable to find the delivery address.",
  },
  {
    label: "Customer refused",
    message: "Customer refused to accept the shipment.",
  },
];

function formatStatus(status: ShipmentStatus) {
  return statusConfig[status]?.label ?? status.replaceAll("_", " ");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-NP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({
  status,
  small = false,
}: {
  status: ShipmentStatus;
  small?: boolean;
}) {
  const config = statusConfig[status] ?? {
    label: formatStatus(status),
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${
        config.bg
      } ${config.text} ${
        small
          ? "px-2.5 py-1 text-[11px]"
          : "px-3 py-1.5 text-xs"
      } font-semibold`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {config.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: any;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function RiderDeliveryTable() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const [selectedShipment, setSelectedShipment] =
    useState<Shipment | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<FilterType>("ACTIVE");

  const [message, setMessage] = useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // GET TOKEN
  // =========================================================

  function getToken() {
    return localStorage.getItem("token");
  }

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  function getAuthHeaders(): HeadersInit {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // =========================================================
  // LOAD SHIPMENTS
  // =========================================================

  useEffect(() => {
    fetchShipments();
  }, []);

  async function fetchShipments(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const headers = getAuthHeaders();

      const response = await fetch(
        `${API_URL}/my-shipments`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load your shipments."
        );
      }

      const riderShipments: Shipment[] =
        Array.isArray(data.shipments)
          ? data.shipments
          : [];

      setShipments(riderShipments);

      setSelectedShipment((current) => {
        if (!current) {
          return null;
        }

        const updated = riderShipments.find(
          (item) => item.id === current.id
        );

        return updated ?? null;
      });
    } catch (err) {
      console.error(
        "FETCH RIDER SHIPMENTS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load deliveries."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredShipments = useMemo(() => {
    let result = [...shipments];

    if (filter === "ACTIVE") {
      result = result.filter(
        (shipment) =>
          shipment.status ===
            "OUT_FOR_DELIVERY" ||
          shipment.status ===
            "ASSIGNED_TO_RIDER"
      );
    }

    if (filter === "DELIVERED") {
      result = result.filter(
        (shipment) =>
          shipment.status === "DELIVERED"
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((shipment) => {
        return (
          shipment.trackingNumber
            .toLowerCase()
            .includes(query) ||
          shipment.receiverName
            .toLowerCase()
            .includes(query) ||
          shipment.receiverPhone
            .toLowerCase()
            .includes(query) ||
          shipment.receiverAddress
            .toLowerCase()
            .includes(query)
        );
      });
    }

    return result;
  }, [shipments, search, filter]);

  // =========================================================
  // STATS
  // =========================================================

  const activeCount = shipments.filter(
    (item) =>
      item.status === "OUT_FOR_DELIVERY" ||
      item.status === "ASSIGNED_TO_RIDER"
  ).length;

  const deliveredCount = shipments.filter(
    (item) => item.status === "DELIVERED"
  ).length;

  const codCount = shipments.filter(
    (item) =>
      item.status !== "DELIVERED" &&
      item.paymentType === "COD"
  ).length;

  // =========================================================
  // OPEN SHIPMENT
  // =========================================================

  function openShipment(shipment: Shipment) {
    setSelectedShipment(shipment);
    setMessage("");
    setError("");

    document.body.style.overflow = "hidden";
  }

  // =========================================================
  // CLOSE SHIPMENT
  // =========================================================

  function closeShipment() {
    setSelectedShipment(null);
    setMessage("");
    document.body.style.overflow = "";
  }

  // =========================================================
  // COPY TRACKING NUMBER
  // =========================================================

  async function copyTracking(
    trackingNumber: string
  ) {
    try {
      await navigator.clipboard.writeText(
        trackingNumber
      );
    } catch (err) {
      console.error(
        "Unable to copy tracking number:",
        err
      );
    }
  }

  // =========================================================
  // ADD MESSAGE
  // =========================================================

  async function addMessage() {
    if (!selectedShipment) return;

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    try {
      setSendingMessage(true);
      setError("");

      const headers = getAuthHeaders();

      const response = await fetch(
        `${API_URL}/${selectedShipment.id}/message`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: trimmedMessage,
            location: "Rider Location",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add delivery update."
        );
      }

      setMessage("");

      await fetchShipments(true);
    } catch (err) {
      console.error(
        "ADD MESSAGE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add message."
      );
    } finally {
      setSendingMessage(false);
    }
  }

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  async function updateStatus(
    status: ShipmentStatus,
    statusMessage: string
  ) {
    if (!selectedShipment) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const headers = getAuthHeaders();

      const response = await fetch(
        `${API_URL}/${selectedShipment.id}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status,
            location: "Rider Location",
            message: statusMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update shipment status."
        );
      }

      await fetchShipments(true);
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[500px] rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950">
            <Truck
              size={25}
              className="animate-pulse text-white"
            />
          </div>

          <p className="mt-5 text-base font-semibold text-slate-900">
            Loading deliveries
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Getting your latest delivery assignments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen ">
        <div className="mx-auto max-w-[1500px] space-y-6 ">

          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Truck size={16} />

                <span>Rider Dashboard</span>

                <ChevronRight size={14} />

                <span className="text-slate-900">
                  Deliveries
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                My Deliveries
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your assigned deliveries and keep
                customers updated.
              </p>
            </div>

            <button
              onClick={() => fetchShipments(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-sm">
                  {error}
                </p>
              </div>

              <button
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* =====================================================
              STATS
          ===================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active deliveries"
              value={activeCount}
              subtitle="Currently assigned"
              icon={Truck}
              iconClass="bg-orange-50 text-orange-600"
            />

            <StatCard
              title="Delivered"
              value={deliveredCount}
              subtitle="Successfully completed"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="COD deliveries"
              value={codCount}
              subtitle="Cash collection required"
              icon={Wallet}
              iconClass="bg-violet-50 text-violet-600"
            />

            <StatCard
              title="Total assigned"
              value={shipments.length}
              subtitle="Your deliveries"
              icon={Package}
              iconClass="bg-blue-50 text-blue-600"
            />
          </div>

          {/* =====================================================
              DELIVERY LIST
          ===================================================== */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Delivery assignments
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredShipments.length} deliveries shown
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Search delivery..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:w-[260px]"
                    />
                  </div>

                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {[
                      ["ACTIVE", "Active"],
                      ["DELIVERED", "Delivered"],
                      ["ALL", "All"],
                    ].map(
                      ([value, label]) => (
                        <button
                          key={value}
                          onClick={() =>
                            setFilter(
                              value as FilterType
                            )
                          }
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            filter === value
                              ? "bg-white text-slate-950 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {filteredShipments.length > 0 ? (
              <>
                {/* =================================================
                    DESKTOP
                ================================================= */}

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Delivery
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Destination
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Package
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Payment
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </th>

                        <th className="px-6 py-4" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredShipments.map(
                        (shipment) => (
                          <tr
                            key={shipment.id}
                            className="group transition hover:bg-slate-50/70"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                  <Package size={18} />
                                </div>

                                <div>
                                  <p className="font-bold text-slate-900">
                                    {
                                      shipment.trackingNumber
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {formatDate(
                                      shipment.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <p className="font-semibold text-slate-900">
                                {
                                  shipment.receiverName
                                }
                              </p>

                              <a
                                href={`tel:${shipment.receiverPhone}`}
                                className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
                              >
                                <Phone size={13} />
                                {
                                  shipment.receiverPhone
                                }
                              </a>
                            </td>

                            <td className="max-w-[280px] px-6 py-5">
                              <div className="flex items-start gap-2">
                                <MapPin
                                  size={16}
                                  className="mt-0.5 shrink-0 text-slate-400"
                                />

                                <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                                  {
                                    shipment.receiverAddress
                                  }
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold text-slate-900">
                                {
                                  shipment.packageType
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {shipment.weight} kg
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              {shipment.paymentType ===
                              "COD" ? (
                                <>
                                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                                    <Wallet size={14} />

                                    Rs.{" "}
                                    {shipment.codAmount.toLocaleString()}
                                  </div>

                                  <p className="mt-1 text-xs text-violet-600">
                                    Cash on delivery
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                    <Check size={14} />
                                    Prepaid
                                  </div>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Paid
                                  </p>
                                </>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <StatusBadge
                                status={
                                  shipment.status
                                }
                              />
                            </td>

                            <td className="px-6 py-5 text-right">
                              <button
                                onClick={() =>
                                  openShipment(
                                    shipment
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                              >
                                View

                                <ArrowRight
                                  size={14}
                                />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE
                ================================================= */}

                <div className="divide-y divide-slate-100 lg:hidden">
                  {filteredShipments.map(
                    (shipment) => (
                      <button
                        key={shipment.id}
                        onClick={() =>
                          openShipment(
                            shipment
                          )
                        }
                        className="w-full p-5 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                              <Package size={18} />
                            </div>

                            <div>
                              <p className="font-bold text-slate-950">
                                {
                                  shipment.trackingNumber
                                }
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {
                                  shipment.receiverName
                                }
                              </p>
                            </div>
                          </div>

                          <ChevronRight
                            size={19}
                            className="text-slate-400"
                          />
                        </div>

                        <div className="mt-4">
                          <StatusBadge
                            status={
                              shipment.status
                            }
                          />
                        </div>

                        <div className="mt-4 flex items-start gap-2">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <p className="line-clamp-2 text-sm text-slate-600">
                            {
                              shipment.receiverAddress
                            }
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="text-xs text-slate-400">
                            {
                              shipment.packageType
                            }{" "}
                            ·{" "}
                            {
                              shipment.weight
                            }{" "}
                            kg
                          </span>

                          <span className="text-xs font-bold text-slate-700">
                            {shipment.paymentType ===
                            "COD"
                              ? `COD Rs. ${shipment.codAmount.toLocaleString()}`
                              : "Prepaid"}
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="flex min-h-[350px] flex-col items-center justify-center p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <Package
                    size={27}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  No deliveries found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  There are no deliveries matching
                  your current search or filter.
                </p>

                {(search ||
                  filter !== "ACTIVE") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilter("ACTIVE");
                    }}
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          DETAIL DRAWER
      ========================================================= */}

      {selectedShipment && (
        <div className="fixed inset-0 z-50">

          {/* BACKDROP */}

          <button
            aria-label="Close delivery details"
            onClick={closeShipment}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          {/* DRAWER */}

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-[#f8f9fb] shadow-2xl">

            {/* ===================================================
                DRAWER HEADER
            =================================================== */}

            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">
                  <button
                    onClick={closeShipment}
                    className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <ArrowLeft size={17} />
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-950">
                        {
                          selectedShipment.trackingNumber
                        }
                      </h2>

                      <StatusBadge
                        status={
                          selectedShipment.status
                        }
                        small
                      />
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      Created{" "}
                      {formatDate(
                        selectedShipment.createdAt
                      )}

                      <button
                        onClick={() =>
                          copyTracking(
                            selectedShipment.trackingNumber
                          )
                        }
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
                      >
                        <Copy size={12} />
                        Copy ID
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeShipment}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ===================================================
                DRAWER BODY
            =================================================== */}

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-5 p-5 sm:p-7">

                {/* =================================================
                    DELIVERY HERO
                ================================================= */}

                <div className="overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Delivery destination
                      </p>

                      <div className="mt-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                          <Navigation size={18} />
                        </div>

                        <div>
                          <p className="font-semibold">
                            {
                              selectedShipment.receiverName
                            }
                          </p>

                          <p className="mt-1 text-sm leading-5 text-slate-300">
                            {
                              selectedShipment.receiverAddress
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${selectedShipment.receiverPhone}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 transition hover:bg-slate-100"
                    >
                      <Phone size={18} />
                    </a>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Receiver phone
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {
                          selectedShipment.receiverPhone
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Package
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {
                          selectedShipment.packageType
                        }{" "}
                        ·{" "}
                        {
                          selectedShipment.weight
                        }{" "}
                        kg
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    CUSTOMER + PAYMENT
                ================================================= */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <User size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Customer
                        </p>

                        <p className="text-xs text-slate-400">
                          Receiver information
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="font-semibold text-slate-900">
                        {
                          selectedShipment.receiverName
                        }
                      </p>

                      <a
                        href={`tel:${selectedShipment.receiverPhone}`}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <Phone size={14} />

                        {
                          selectedShipment.receiverPhone
                        }
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <CreditCard size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Payment
                        </p>

                        <p className="text-xs text-slate-400">
                          Collection details
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      {selectedShipment.paymentType ===
                      "COD" ? (
                        <>
                          <p className="text-2xl font-bold text-slate-950">
                            Rs.{" "}
                            {selectedShipment.codAmount.toLocaleString()}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-violet-600">
                            Cash on delivery
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-emerald-600">
                            Paid
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Prepaid shipment
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    PACKAGE DETAILS
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Package size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Package details
                      </p>

                      <p className="text-xs text-slate-400">
                        Shipment information
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Type
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedShipment.packageType
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Weight
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedShipment.weight
                        }{" "}
                        kg
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Shipping
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        Rs.{" "}
                        {selectedShipment.shippingCharge.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Payment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          selectedShipment.paymentType
                        }
                      </p>
                    </div>
                  </div>

                  {selectedShipment.notes && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <div className="flex gap-3">
                        <FileText
                          size={16}
                          className="mt-0.5 text-slate-400"
                        />

                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            Shipment note
                          </p>

                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {
                              selectedShipment.notes
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* =================================================
                    DELIVERY STATUS ACTION
                ================================================= */}

                {selectedShipment.status ===
                  "ASSIGNED_TO_RIDER" && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <Truck size={20} />
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-orange-950">
                          Ready to start delivery?
                        </p>

                        <p className="mt-1 text-sm leading-5 text-orange-800/70">
                          Start the delivery when you have
                          picked up the shipment and are
                          heading to the customer.
                        </p>

                        <button
                          disabled={updatingStatus}
                          onClick={() =>
                            updateStatus(
                              "OUT_FOR_DELIVERY",
                              "Shipment is now out for delivery."
                            )
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Truck size={17} />

                          {updatingStatus
                            ? "Starting..."
                            : "Start Delivery"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    MARK AS DELIVERED

                    IMPORTANT:
                    Only visible when status is
                    OUT_FOR_DELIVERY.
                ================================================= */}

                {selectedShipment.status ===
                  "OUT_FOR_DELIVERY" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={20} />
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-emerald-950">
                          Delivery in progress
                        </p>

                        <p className="mt-1 text-sm leading-5 text-emerald-800/70">
                          Confirm delivery only after the
                          package has been handed to the
                          customer.
                        </p>

                        <button
                          disabled={updatingStatus}
                          onClick={() =>
                            updateStatus(
                              "DELIVERED",
                              "Shipment delivered successfully."
                            )
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={17} />

                          {updatingStatus
                            ? "Updating..."
                            : "Mark as Delivered"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    DELIVERED SUCCESS
                ================================================= */}

                {selectedShipment.status ===
                  "DELIVERED" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 size={21} />
                      </div>

                      <div>
                        <p className="font-bold text-emerald-950">
                          Delivery completed
                        </p>

                        <p className="mt-1 text-sm text-emerald-800/70">
                          This shipment has been successfully
                          delivered to the customer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    QUICK MESSAGE
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <MessageCircle size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Quick update
                      </p>

                      <p className="text-xs text-slate-400">
                        Add a delivery note
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickMessages.map(
                      (item) => (
                        <button
                          key={item.label}
                          onClick={() =>
                            setMessage(
                              item.message
                            )
                          }
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            message === item.message
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    )}
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    rows={3}
                    placeholder="Write a delivery update..."
                    className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  />

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={addMessage}
                      disabled={
                        sendingMessage ||
                        !message.trim()
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MessageCircle size={15} />

                      {sendingMessage
                        ? "Saving..."
                        : "Save update"}
                    </button>
                  </div>
                </div>

                {/* =================================================
                    DELIVERY HISTORY
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <History size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Delivery history
                        </p>

                        <p className="text-xs text-slate-400">
                          Every shipment update
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      {
                        selectedShipment
                          .trackings?.length ?? 0
                      }
                    </span>
                  </div>

                  <div className="mt-6">
                    {!selectedShipment.trackings ||
                    selectedShipment.trackings.length ===
                      0 ? (
                      <div className="rounded-xl bg-slate-50 p-7 text-center">
                        <Clock3
                          size={22}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          No tracking history
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        {selectedShipment.trackings.map(
                          (
                            tracking,
                            index
                          ) => {
                            const isLast =
                              index ===
                              selectedShipment
                                .trackings!
                                .length -
                                1;

                            const config =
                              statusConfig[
                                tracking.status
                              ] ?? {
                                bg: "bg-slate-100",
                                text: "text-slate-700",
                                dot: "bg-slate-500",
                                label:
                                  formatStatus(
                                    tracking.status
                                  ),
                              };

                            return (
                              <div
                                key={
                                  tracking.id
                                }
                                className="relative flex gap-4 pb-7 last:pb-0"
                              >
                                {!isLast && (
                                  <div className="absolute left-[17px] top-9 h-[calc(100%-20px)] w-px bg-slate-200" />
                                )}

                                <div
                                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white ${config.bg} ${config.text}`}
                                >
                                  {tracking.status ===
                                  "DELIVERED" ? (
                                    <Check size={14} />
                                  ) : (
                                    <span
                                      className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
                                    />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1 pt-0.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">
                                      {
                                        config.label
                                      }
                                    </span>

                                    <span className="text-xs text-slate-400">
                                      {formatDateTime(
                                        tracking.createdAt
                                      )}
                                    </span>
                                  </div>

                                  {tracking.message && (
                                    <p className="mt-1.5 text-sm leading-5 text-slate-600">
                                      {
                                        tracking.message
                                      }
                                    </p>
                                  )}

                                  {tracking.location && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                                      <MapPin size={12} />

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
                </div>

                {/* =================================================
                    LOCATION
                ================================================= */}

                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedShipment.receiverAddress
                      )}`,
                      "_blank"
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <LocateFixed size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Open destination
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Open this address in Google Maps
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-slate-400"
                  />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}