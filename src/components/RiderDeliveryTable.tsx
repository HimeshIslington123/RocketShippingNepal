
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
  RotateCcw,
  Warehouse,
} from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/shipment`;
const RETURNS_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/returns`;

/* ============================================================
   NORMAL SHIPMENT STATUS
============================================================ */

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
  | "ASSIGNED_TO_RIDER"
  | "RETURN_REQUESTED"
  | "RETURN_ASSIGNED_TO_RIDER"
  | "RETURN_PICKED_UP_FROM_CUSTOMER"
  | "RETURN_IN_WAREHOUSE"
  | "OUT_FOR_RETURN"
  | "RETURNED_TO_VENDOR";

/* ============================================================
   RETURN STATUS
============================================================ */

type ReturnStatus =
  | "REQUESTED"
  | "ASSIGNED_TO_RIDER"
  | "PICKED_UP_FROM_CUSTOMER"
  | "IN_WAREHOUSE"
  | "OUT_FOR_RETURN"
  | "RETURNED_TO_VENDOR"
  | "CANCELLED";

/* ============================================================
   TRACKING
============================================================ */

type Tracking = {
  id: string;
  shipmentId: string;
  status: string;
  location?: string | null;
  message?: string | null;
  createdAt: string;
};

/* ============================================================
   SHIPMENT
============================================================ */

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

/* ============================================================
   RETURN REQUEST
============================================================ */

type ReturnRequest = {
  id: string;

  shipmentId: string;

  status: ReturnStatus;

  reason: string;

  description?: string | null;

  riderId?: number | null;

  returnCharge?: number | null;

  requestedAt: string;

  pickedUpAt?: string | null;

  completedAt?: string | null;

  notes?: string | null;

  createdAt: string;

  updatedAt: string;

  shipment?: Shipment | null;

  rider?: {
    id: number;
    phone: string;
    vehicleNumber?: string | null;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  } | null;
};

/* ============================================================
   FILTER TYPE
============================================================ */

type FilterType =
  | "ALL"
  | "ACTIVE"
  | "DELIVERED";

type WorkType =
  | "DELIVERIES"
  | "RETURNS";

/* ============================================================
   NORMAL STATUS CONFIG
============================================================ */

const statusConfig: Record<
  string,
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

  RETURN_REQUESTED: {
    label: "Return Requested",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },

  RETURN_ASSIGNED_TO_RIDER: {
    label: "Return Assigned to Rider",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },

  RETURN_PICKED_UP_FROM_CUSTOMER: {
    label: "Return Picked Up",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },

  RETURN_IN_WAREHOUSE: {
    label: "Return In Warehouse",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },

  OUT_FOR_RETURN: {
    label: "Out For Return",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },

  RETURNED_TO_VENDOR: {
    label: "Returned To Vendor",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
};

/* ============================================================
   QUICK MESSAGES
============================================================ */

const quickMessages = [
  {
    label: "No answer",
    message:
      "Customer did not answer the call.",
  },
  {
    label: "Phone off",
    message:
      "Customer phone is switched off.",
  },
  {
    label: "Call later",
    message:
      "Customer requested delivery at a later time.",
  },
  {
    label: "Address issue",
    message:
      "Unable to find the delivery address.",
  },
  {
    label: "Customer refused",
    message:
      "Customer refused to accept the shipment.",
  },
];

/* ============================================================
   RETURN STATUS LABEL
============================================================ */

function formatReturnStatus(
  status: ReturnStatus
) {
  const labels: Record<
    ReturnStatus,
    string
  > = {
    REQUESTED: "Requested",

    ASSIGNED_TO_RIDER:
      "Assigned To Rider",

    PICKED_UP_FROM_CUSTOMER:
      "Picked Up From Customer",

    IN_WAREHOUSE:
      "In Warehouse",

    OUT_FOR_RETURN:
      "Out For Return",

    RETURNED_TO_VENDOR:
      "Returned To Vendor",

    CANCELLED: "Cancelled",
  };

  return labels[status];
}

/* ============================================================
   FORMAT STATUS
============================================================ */

function formatStatus(
  status: string
) {
  return (
    statusConfig[status]?.label ??
    status.replaceAll("_", " ")
  );
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(date: string) {
  return new Date(
    date
  ).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ============================================================
   FORMAT DATETIME
============================================================ */

function formatDateTime(date: string) {
  return new Date(
    date
  ).toLocaleString("en-NP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
  small = false,
}: {
  status: string;
  small?: boolean;
}) {
  const config =
    statusConfig[status] ?? {
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

/* ============================================================
   STAT CARD
============================================================ */

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

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function RiderDeliveryTable() {

  /* ==========================================================
     NORMAL SHIPMENTS
  ========================================================== */

  const [shipments, setShipments] =
    useState<Shipment[]>([]);

  /* ==========================================================
     RETURNS
  ========================================================== */

  const [returns, setReturns] =
    useState<ReturnRequest[]>([]);

  /* ==========================================================
     SELECTED NORMAL SHIPMENT
  ========================================================== */

  const [selectedShipment, setSelectedShipment] =
    useState<Shipment | null>(null);

  /* ==========================================================
     SELECTED RETURN
  ========================================================== */

  const [selectedReturn, setSelectedReturn] =
    useState<ReturnRequest | null>(null);

  /* ==========================================================
     GENERAL STATES
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("ACTIVE");

  const [workType, setWorkType] =
    useState<WorkType>("DELIVERIES");

  const [message, setMessage] =
    useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [updatingReturnStatus, setUpdatingReturnStatus] =
    useState(false);

  const [error, setError] =
    useState("");

  const [returnError, setReturnError] =
    useState("");

  /* ==========================================================
     GET TOKEN
  ========================================================== */

  function getToken() {
    return localStorage.getItem("token");
  }

  /* ==========================================================
     AUTH HEADERS
  ========================================================== */

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

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchAll();
  }, []);

  /* ==========================================================
     FETCH EVERYTHING
  ========================================================== */

  async function fetchAll(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setReturnError("");

      await Promise.all([
        fetchShipments(),
        fetchReturns(),
      ]);

    } catch (err) {
      console.error(
        "FETCH RIDER DATA ERROR:",
        err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* ==========================================================
     LOAD NORMAL SHIPMENTS
  ========================================================== */

  async function fetchShipments() {
    try {
      const headers =
        getAuthHeaders();

      const response =
        await fetch(
          `${API_URL}/my-shipments`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load your shipments."
        );
      }

      const riderShipments: Shipment[] =
        Array.isArray(
          data.shipments
        )
          ? data.shipments
          : [];

      setShipments(
        riderShipments
      );

      setSelectedShipment(
        (current) => {
          if (!current) {
            return null;
          }

          const updated =
            riderShipments.find(
              (item) =>
                item.id ===
                current.id
            );

          return updated ?? null;
        }
      );

    } catch (err) {
      console.error(
        "FETCH RIDER SHIPMENTS ERROR:",
        err
      );

      throw err;
    }
  }

  /* ==========================================================
     LOAD RIDER RETURNS
  ========================================================== */

  async function fetchReturns() {
    try {
      const headers =
        getAuthHeaders();

      const response =
        await fetch(
          `${RETURNS_API_URL}/rider/my`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load return assignments."
        );
      }

      const riderReturns: ReturnRequest[] =
        Array.isArray(
          data.returns
        )
          ? data.returns
          : Array.isArray(data)
          ? data
          : [];

      setReturns(
        riderReturns
      );

      setSelectedReturn(
        (current) => {
          if (!current) {
            return null;
          }

          const updated =
            riderReturns.find(
              (item) =>
                item.id ===
                current.id
            );

          return updated ?? null;
        }
      );

    } catch (err) {
      console.error(
        "FETCH RIDER RETURNS ERROR:",
        err
      );

      setReturnError(
        err instanceof Error
          ? err.message
          : "Unable to load return assignments."
      );
    }
  }

  /* ==========================================================
     FILTER NORMAL SHIPMENTS
  ========================================================== */

  const filteredShipments =
    useMemo(() => {
      let result = [
        ...shipments,
      ];

      if (
        filter ===
        "ACTIVE"
      ) {
        result =
          result.filter(
            (shipment) =>
              shipment.status ===
                "OUT_FOR_DELIVERY" ||
              shipment.status ===
                "ASSIGNED_TO_RIDER"
          );
      }

      if (
        filter ===
        "DELIVERED"
      ) {
        result =
          result.filter(
            (shipment) =>
              shipment.status ===
              "DELIVERED"
          );
      }

      if (
        search.trim()
      ) {
        const query =
          search.toLowerCase();

        result =
          result.filter(
            (shipment) => {
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
            }
          );
      }

      return result;
    }, [
      shipments,
      search,
      filter,
    ]);

  /* ==========================================================
     FILTER RETURNS
  ========================================================== */

  const filteredReturns =
    useMemo(() => {
      let result =
        returns.filter(
          (item) =>
            item.status !==
            "CANCELLED"
        );

      if (
        filter ===
        "ACTIVE"
      ) {
        result =
          result.filter(
            (item) =>
              item.status ===
                "ASSIGNED_TO_RIDER" ||
              item.status ===
                "PICKED_UP_FROM_CUSTOMER"
          );
      }

      if (
        filter ===
        "DELIVERED"
      ) {
        result =
          result.filter(
            (item) =>
              item.status ===
              "IN_WAREHOUSE"
          );
      }

      if (
        search.trim()
      ) {
        const query =
          search.toLowerCase();

        result =
          result.filter(
            (item) => {
              const shipment =
                item.shipment;

              return (
                shipment?.trackingNumber
                  ?.toLowerCase()
                  .includes(query) ||
                shipment?.receiverName
                  ?.toLowerCase()
                  .includes(query) ||
                shipment?.receiverPhone
                  ?.toLowerCase()
                  .includes(query) ||
                shipment?.receiverAddress
                  ?.toLowerCase()
                  .includes(query)
              );
            }
          );
      }

      return result;
    }, [
      returns,
      search,
      filter,
    ]);

  /* ==========================================================
     NORMAL STATS
  ========================================================== */

  const activeCount =
    shipments.filter(
      (item) =>
        item.status ===
          "OUT_FOR_DELIVERY" ||
        item.status ===
          "ASSIGNED_TO_RIDER"
    ).length;

  const deliveredCount =
    shipments.filter(
      (item) =>
        item.status ===
        "DELIVERED"
    ).length;

  const codCount =
    shipments.filter(
      (item) =>
        item.status !==
          "DELIVERED" &&
        item.paymentType ===
          "COD"
    ).length;

  /* ==========================================================
     RETURN STATS
  ========================================================== */

  const activeReturnCount =
    returns.filter(
      (item) =>
        item.status ===
          "ASSIGNED_TO_RIDER" ||
        item.status ===
          "PICKED_UP_FROM_CUSTOMER"
    ).length;

  const warehouseReturnCount =
    returns.filter(
      (item) =>
        item.status ===
        "IN_WAREHOUSE"
    ).length;

  /* ==========================================================
     OPEN NORMAL SHIPMENT
  ========================================================== */

  function openShipment(
    shipment: Shipment
  ) {
    setSelectedReturn(null);
    setSelectedShipment(
      shipment
    );

    setMessage("");
    setError("");

    document.body.style.overflow =
      "hidden";
  }

  /* ==========================================================
     OPEN RETURN
  ========================================================== */

  function openReturn(
    returnRequest: ReturnRequest
  ) {
    setSelectedShipment(null);
    setSelectedReturn(
      returnRequest
    );

    setMessage("");
    setReturnError("");

    document.body.style.overflow =
      "hidden";
  }

  /* ==========================================================
     CLOSE ALL
  ========================================================== */

  function closeDetails() {
    setSelectedShipment(null);
    setSelectedReturn(null);
    setMessage("");
    setError("");
    setReturnError("");

    document.body.style.overflow =
      "";
  }

  /* ==========================================================
     COPY TRACKING
  ========================================================== */

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

  /* ==========================================================
     NORMAL SHIPMENT MESSAGE
  ========================================================== */

  async function addMessage() {
    if (!selectedShipment)
      return;

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage)
      return;

    try {
      setSendingMessage(true);
      setError("");

      const headers =
        getAuthHeaders();

      const response =
        await fetch(
          `${API_URL}/${selectedShipment.id}/message`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              message:
                trimmedMessage,
              location:
                "Rider Location",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add delivery update."
        );
      }

      setMessage("");

      await fetchShipments();

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

  /* ==========================================================
     NORMAL SHIPMENT STATUS
  ========================================================== */

  async function updateStatus(
    status: ShipmentStatus,
    statusMessage: string
  ) {
    if (!selectedShipment)
      return;

    try {
      setUpdatingStatus(true);
      setError("");

      const headers =
        getAuthHeaders();

      const response =
        await fetch(
          `${API_URL}/${selectedShipment.id}/status`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              status,
              location:
                "Rider Location",
              message:
                statusMessage,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update shipment status."
        );
      }

      await fetchShipments();

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

  /* ==========================================================
     RETURN STATUS UPDATE
     
     CURRENTLY ALLOWED:

     ASSIGNED_TO_RIDER
          ↓
     PICKED_UP_FROM_CUSTOMER
          ↓
     IN_WAREHOUSE

     NOTHING AFTER IN_WAREHOUSE FOR NOW.
  ========================================================== */

  async function updateReturnStatus(
    status: ReturnStatus
  ) {
    if (!selectedReturn)
      return;

    try {
      setUpdatingReturnStatus(
        true
      );

      setReturnError("");

      const headers =
        getAuthHeaders();

      const response =
        await fetch(
          `${RETURNS_API_URL}/${selectedReturn.id}/status`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update return status."
        );
      }

      await fetchReturns();

    } catch (err) {
      console.error(
        "UPDATE RETURN STATUS ERROR:",
        err
      );

      setReturnError(
        err instanceof Error
          ? err.message
          : "Failed to update return status."
      );
    } finally {
      setUpdatingReturnStatus(
        false
      );
    }
  }

  /* ==========================================================
     RETURN NEXT ACTION
  ========================================================== */

  function getReturnNextAction(
    status: ReturnStatus
  ): ReturnStatus | null {

    if (
      status ===
      "ASSIGNED_TO_RIDER"
    ) {
      return "PICKED_UP_FROM_CUSTOMER";
    }

    if (
      status ===
      "PICKED_UP_FROM_CUSTOMER"
    ) {
      return "IN_WAREHOUSE";
    }

    /*
      STOP HERE.

      We are not implementing:

      IN_WAREHOUSE
          ↓
      OUT_FOR_RETURN

      yet.
    */

    return null;
  }

  /* ==========================================================
     RETURN ACTION LABEL
  ========================================================== */

  function getReturnActionLabel(
    status: ReturnStatus
  ) {
    if (
      status ===
      "PICKED_UP_FROM_CUSTOMER"
    ) {
      return "Confirm Package In Warehouse";
    }

    if (
      status ===
      "IN_WAREHOUSE"
    ) {
      return "";
    }

    return "Mark Picked Up From Customer";
  }

  /* ==========================================================
     LOADING
  ========================================================== */

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
            Loading rider dashboard
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Getting your deliveries and return assignments...
          </p>

        </div>

      </div>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <>
      <div className="min-h-screen">

        <div className="mx-auto max-w-[1500px] space-y-6">

          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-2 text-sm text-slate-500">

                <Truck size={16} />

                <span>
                  Rider Dashboard
                </span>

                <ChevronRight
                  size={14}
                />

                <span className="text-slate-900">
                  {workType ===
                  "DELIVERIES"
                    ? "Deliveries"
                    : "Returns"}
                </span>

              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {workType ===
                "DELIVERIES"
                  ? "My Deliveries"
                  : "Return Pickups"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {workType ===
                "DELIVERIES"
                  ? "Manage your assigned deliveries and keep customers updated."
                  : "Pick up returned packages from customers and bring them to the warehouse."}
              </p>

            </div>

            <button
              onClick={() =>
                fetchAll(true)
              }
              disabled={
                refreshing
              }
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

          {(error ||
            returnError) && (
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
                  {error ||
                    returnError}
                </p>

              </div>

              <button
                onClick={() => {
                  setError("");
                  setReturnError("");
                }}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* =====================================================
              WORK TYPE TABS
          ===================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

            <div className="grid grid-cols-2 gap-2">

              <button
                onClick={() =>
                  setWorkType(
                    "DELIVERIES"
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  workType ===
                  "DELIVERIES"
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >

                <Truck size={17} />

                Deliveries

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    workType ===
                    "DELIVERIES"
                      ? "bg-white/15 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {
                    shipments.filter(
                      (item) =>
                        item.status ===
                          "ASSIGNED_TO_RIDER" ||
                        item.status ===
                          "OUT_FOR_DELIVERY"
                    ).length
                  }
                </span>

              </button>

              <button
                onClick={() =>
                  setWorkType(
                    "RETURNS"
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  workType ===
                  "RETURNS"
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >

                <RotateCcw
                  size={17}
                />

                Returns

                {activeReturnCount >
                  0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      workType ===
                      "RETURNS"
                        ? "bg-white/15 text-white"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {
                      activeReturnCount
                    }
                  </span>
                )}

              </button>

            </div>

          </div>

          {/* =====================================================
              STATS
          ===================================================== */}

          {workType ===
          "DELIVERIES" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                title="Active deliveries"
                value={
                  activeCount
                }
                subtitle="Currently assigned"
                icon={Truck}
                iconClass="bg-orange-50 text-orange-600"
              />

              <StatCard
                title="Delivered"
                value={
                  deliveredCount
                }
                subtitle="Successfully completed"
                icon={
                  CheckCircle2
                }
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                title="COD deliveries"
                value={
                  codCount
                }
                subtitle="Cash collection required"
                icon={Wallet}
                iconClass="bg-violet-50 text-violet-600"
              />

              <StatCard
                title="Total assigned"
                value={
                  shipments.length
                }
                subtitle="Your deliveries"
                icon={Package}
                iconClass="bg-blue-50 text-blue-600"
              />

            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">

              <StatCard
                title="Active returns"
                value={
                  activeReturnCount
                }
                subtitle="Pickup required"
                icon={RotateCcw}
                iconClass="bg-orange-50 text-orange-600"
              />

              <StatCard
                title="Picked up"
                value={
                  returns.filter(
                    (item) =>
                      item.status ===
                      "PICKED_UP_FROM_CUSTOMER"
                  ).length
                }
                subtitle="Coming to warehouse"
                icon={Package}
                iconClass="bg-purple-50 text-purple-600"
              />

              <StatCard
                title="In warehouse"
                value={
                  warehouseReturnCount
                }
                subtitle="Return received"
                icon={Warehouse}
                iconClass="bg-amber-50 text-amber-600"
              />

            </div>
          )}

          {/* =====================================================
              LIST
          ===================================================== */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            {/* ===================================================
                LIST HEADER
            =================================================== */}

            <div className="border-b border-slate-200 p-5 sm:p-6">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-950">
                    {workType ===
                    "DELIVERIES"
                      ? "Delivery assignments"
                      : "Return assignments"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {workType ===
                    "DELIVERIES"
                      ? `${filteredShipments.length} deliveries shown`
                      : `${filteredReturns.length} returns shown`}
                  </p>

                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                  {/* SEARCH */}

                  <div className="relative">

                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={
                        search
                      }
                      onChange={(
                        e
                      ) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder={
                        workType ===
                        "DELIVERIES"
                          ? "Search delivery..."
                          : "Search return..."
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:w-[260px]"
                    />

                  </div>

                  {/* FILTER */}

                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">

                    {[
                      [
                        "ACTIVE",
                        "Active",
                      ],
                      [
                        "DELIVERED",
                        workType ===
                        "DELIVERIES"
                          ? "Delivered"
                          : "Warehouse",
                      ],
                      [
                        "ALL",
                        "All",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (
                        <button
                          key={
                            value
                          }
                          onClick={() =>
                            setFilter(
                              value as FilterType
                            )
                          }
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            filter ===
                            value
                              ? "bg-white text-slate-950 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {
                            label
                          }
                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* ===================================================
                NORMAL DELIVERY LIST
            =================================================== */}

            {workType ===
            "DELIVERIES" ? (
              filteredShipments.length >
              0 ? (
                <>
                  {/* DESKTOP */}

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
                          (
                            shipment
                          ) => (
                            <tr
                              key={
                                shipment.id
                              }
                              className="group transition hover:bg-slate-50/70"
                            >

                              <td className="px-6 py-5">

                                <div className="flex items-start gap-3">

                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <Package
                                      size={
                                        18
                                      }
                                    />
                                  </div>

                                  <div>

                                    <p className="font-bold text-slate-900">
                                      {
                                        shipment.trackingNumber
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      {
                                        formatDate(
                                          shipment.createdAt
                                        )
                                      }
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
                                  <Phone
                                    size={
                                      13
                                    }
                                  />

                                  {
                                    shipment.receiverPhone
                                  }

                                </a>

                              </td>

                              <td className="max-w-[280px] px-6 py-5">

                                <div className="flex items-start gap-2">

                                  <MapPin
                                    size={
                                      16
                                    }
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
                                  {
                                    shipment.weight
                                  }{" "}
                                  kg
                                </p>

                              </td>

                              <td className="px-6 py-5">

                                {shipment.paymentType ===
                                "COD" ? (
                                  <>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">

                                      <Wallet
                                        size={
                                          14
                                        }
                                      />

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

                                      <Check
                                        size={
                                          14
                                        }
                                      />

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
                                    size={
                                      14
                                    }
                                  />

                                </button>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* MOBILE */}

                  <div className="divide-y divide-slate-100 lg:hidden">

                    {filteredShipments.map(
                      (
                        shipment
                      ) => (
                        <button
                          key={
                            shipment.id
                          }
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

                                <Package
                                  size={
                                    18
                                  }
                                />

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
                              size={
                                19
                              }
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
                              size={
                                15
                              }
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
                <EmptyState
                  icon={
                    <Package
                      size={27}
                    />
                  }
                  title="No deliveries found"
                  description="There are no deliveries matching your current search or filter."
                  onClear={() => {
                    setSearch("");
                    setFilter(
                      "ACTIVE"
                    );
                  }}
                  showClear={
                    Boolean(
                      search
                    ) ||
                    filter !==
                      "ACTIVE"
                  }
                />
              )
            ) : (
              /* =================================================
                 RETURN LIST
              ================================================= */

              filteredReturns.length >
              0 ? (
                <>
                  {/* DESKTOP */}

                  <div className="hidden overflow-x-auto lg:block">

                    <table className="w-full">

                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Return
                          </th>

                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Customer
                          </th>

                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Pickup Address
                          </th>

                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Reason
                          </th>

                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>

                          <th className="px-6 py-4" />

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {filteredReturns.map(
                          (
                            returnRequest
                          ) => {

                            const shipment =
                              returnRequest.shipment;

                            return (
                              <tr
                                key={
                                  returnRequest.id
                                }
                                className="group transition hover:bg-slate-50/70"
                              >

                                <td className="px-6 py-5">

                                  <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                      <RotateCcw
                                        size={
                                          18
                                        }
                                      />
                                    </div>

                                    <div>

                                      <p className="font-bold text-slate-900">
                                        {
                                          shipment?.trackingNumber ||
                                          "—"
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-slate-400">
                                        Return requested{" "}
                                        {formatDate(
                                          returnRequest.requestedAt
                                        )}
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                <td className="px-6 py-5">

                                  <p className="font-semibold text-slate-900">
                                    {
                                      shipment?.receiverName ||
                                      "—"
                                    }
                                  </p>

                                  {shipment?.receiverPhone && (
                                    <a
                                      href={`tel:${shipment.receiverPhone}`}
                                      className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
                                    >
                                      <Phone
                                        size={
                                          13
                                        }
                                      />

                                      {
                                        shipment.receiverPhone
                                      }

                                    </a>
                                  )}

                                </td>

                                <td className="max-w-[300px] px-6 py-5">

                                  <div className="flex items-start gap-2">

                                    <MapPin
                                      size={
                                        16
                                      }
                                      className="mt-0.5 shrink-0 text-slate-400"
                                    />

                                    <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                                      {
                                        shipment?.receiverAddress ||
                                        "—"
                                      }
                                    </p>

                                  </div>

                                </td>

                                <td className="px-6 py-5">

                                  <p className="text-sm font-semibold text-slate-900">
                                    {
                                      returnRequest.reason
                                        .replaceAll(
                                          "_",
                                          " "
                                        )
                                        .toLowerCase()
                                        .replace(
                                          /\b\w/g,
                                          (
                                            letter
                                          ) =>
                                            letter.toUpperCase()
                                        )
                                    }
                                  </p>

                                  {returnRequest.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                                      {
                                        returnRequest.description
                                      }
                                    </p>
                                  )}

                                </td>

                                <td className="px-6 py-5">

                                  <ReturnStatusBadge
                                    status={
                                      returnRequest.status
                                    }
                                  />

                                </td>

                                <td className="px-6 py-5 text-right">

                                  <button
                                    onClick={() =>
                                      openReturn(
                                        returnRequest
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                                  >

                                    View

                                    <ArrowRight
                                      size={
                                        14
                                      }
                                    />

                                  </button>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* MOBILE */}

                  <div className="divide-y divide-slate-100 lg:hidden">

                    {filteredReturns.map(
                      (
                        returnRequest
                      ) => {

                        const shipment =
                          returnRequest.shipment;

                        return (
                          <button
                            key={
                              returnRequest.id
                            }
                            onClick={() =>
                              openReturn(
                                returnRequest
                              )
                            }
                            className="w-full p-5 text-left transition hover:bg-slate-50"
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div className="flex items-start gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                                  <RotateCcw
                                    size={
                                      18
                                    }
                                  />

                                </div>

                                <div>

                                  <p className="font-bold text-slate-950">
                                    {
                                      shipment?.trackingNumber ||
                                      "—"
                                    }
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {
                                      shipment?.receiverName ||
                                      "—"
                                    }
                                  </p>

                                </div>

                              </div>

                              <ChevronRight
                                size={
                                  19
                                }
                                className="text-slate-400"
                              />

                            </div>

                            <div className="mt-4">

                              <ReturnStatusBadge
                                status={
                                  returnRequest.status
                                }
                              />

                            </div>

                            <div className="mt-4 flex items-start gap-2">

                              <MapPin
                                size={
                                  15
                                }
                                className="mt-0.5 shrink-0 text-slate-400"
                              />

                              <p className="line-clamp-2 text-sm text-slate-600">
                                {
                                  shipment?.receiverAddress ||
                                  "—"
                                }
                              </p>

                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                              <span className="text-xs text-slate-400">
                                {
                                  returnRequest.reason
                                    .replaceAll(
                                      "_",
                                      " "
                                    )
                                    .toLowerCase()
                                }
                              </span>

                              <span className="text-xs font-bold text-orange-600">
                                Return
                              </span>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>
                </>
              ) : (
                <EmptyState
                  icon={
                    <RotateCcw
                      size={27}
                    />
                  }
                  title="No return assignments"
                  description="There are no return pickups assigned to you matching the current filter."
                  onClear={() => {
                    setSearch("");
                    setFilter(
                      "ACTIVE"
                    );
                  }}
                  showClear={
                    Boolean(
                      search
                    ) ||
                    filter !==
                      "ACTIVE"
                  }
                />
              )
            )}

          </div>

        </div>
      </div>

      {/* =========================================================
          NORMAL SHIPMENT DETAIL DRAWER
      ========================================================= */}

      {selectedShipment && (
        <div className="fixed inset-0 z-50">

          <button
            aria-label="Close delivery details"
            onClick={closeDetails}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-[#f8f9fb] shadow-2xl">

            {/* HEADER */}

            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                  <button
                    onClick={closeDetails}
                    className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <ArrowLeft
                      size={17}
                    />
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
                        <Copy
                          size={12}
                        />

                        Copy ID

                      </button>

                    </div>

                  </div>

                </div>

                <button
                  onClick={closeDetails}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <X size={18} />
                </button>

              </div>

            </div>

            {/* BODY */}

            <div className="flex-1 overflow-y-auto">

              <div className="space-y-5 p-5 sm:p-7">

                {/* DESTINATION */}

                <div className="overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-sm">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Delivery destination
                      </p>

                      <div className="mt-3 flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                          <Navigation
                            size={18}
                          />
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
                      <Phone
                        size={18}
                      />
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

                {/* CUSTOMER + PAYMENT */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <User
                          size={17}
                        />
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
                        <Phone
                          size={14}
                        />

                        {
                          selectedShipment.receiverPhone
                        }

                      </a>

                    </div>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <CreditCard
                          size={17}
                        />
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

                {/* PACKAGE DETAILS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Package
                        size={17}
                      />
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
                    START DELIVERY
                ================================================== */}

                {selectedShipment.status ===
                  "ASSIGNED_TO_RIDER" && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <Truck
                          size={20}
                        />
                      </div>

                      <div className="flex-1">

                        <p className="font-bold text-orange-950">
                          Ready to start delivery?
                        </p>

                        <p className="mt-1 text-sm leading-5 text-orange-800/70">
                          Start the delivery when you have picked up the shipment and are heading to the customer.
                        </p>

                        <button
                          disabled={
                            updatingStatus
                          }
                          onClick={() =>
                            updateStatus(
                              "OUT_FOR_DELIVERY",
                              "Shipment is now out for delivery."
                            )
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <Truck
                            size={17}
                          />

                          {updatingStatus
                            ? "Starting..."
                            : "Start Delivery"}

                        </button>

                      </div>

                    </div>

                  </div>
                )}

                {/* MARK DELIVERED */}

                {selectedShipment.status ===
                  "OUT_FOR_DELIVERY" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2
                          size={20}
                        />
                      </div>

                      <div className="flex-1">

                        <p className="font-bold text-emerald-950">
                          Delivery in progress
                        </p>

                        <p className="mt-1 text-sm leading-5 text-emerald-800/70">
                          Confirm delivery only after the package has been handed to the customer.
                        </p>

                        <button
                          disabled={
                            updatingStatus
                          }
                          onClick={() =>
                            updateStatus(
                              "DELIVERED",
                              "Shipment delivered successfully."
                            )
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <Check
                            size={17}
                          />

                          {updatingStatus
                            ? "Updating..."
                            : "Mark as Delivered"}

                        </button>

                      </div>

                    </div>

                  </div>
                )}

                {/* DELIVERED */}

                {selectedShipment.status ===
                  "DELIVERED" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

                        <CheckCircle2
                          size={21}
                        />

                      </div>

                      <div>

                        <p className="font-bold text-emerald-950">
                          Delivery completed
                        </p>

                        <p className="mt-1 text-sm text-emerald-800/70">
                          This shipment has been successfully delivered to the customer.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* QUICK MESSAGE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <MessageCircle
                        size={17}
                      />
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
                          key={
                            item.label
                          }
                          onClick={() =>
                            setMessage(
                              item.message
                            )
                          }
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            message ===
                            item.message
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {
                            item.label
                          }
                        </button>
                      )
                    )}

                  </div>

                  <textarea
                    value={
                      message
                    }
                    onChange={(
                      e
                    ) =>
                      setMessage(
                        e.target
                          .value
                      )
                    }
                    rows={3}
                    placeholder="Write a delivery update..."
                    className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  />

                  <div className="mt-3 flex justify-end">

                    <button
                      onClick={
                        addMessage
                      }
                      disabled={
                        sendingMessage ||
                        !message.trim()
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >

                      <MessageCircle
                        size={15}
                      />

                      {sendingMessage
                        ? "Saving..."
                        : "Save update"}

                    </button>

                  </div>

                </div>

                {/* DELIVERY HISTORY */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <History
                          size={17}
                        />
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
                        selectedShipment.trackings?.length ??
                        0
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
                                    <Check
                                      size={
                                        14
                                      }
                                    />
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
                                      {
                                        formatDateTime(
                                          tracking.createdAt
                                        )
                                      }
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

                                      <MapPin
                                        size={
                                          12
                                        }
                                      />

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

                {/* LOCATION */}

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
                      <LocateFixed
                        size={18}
                      />
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

      {/* =========================================================
          RETURN DETAIL DRAWER
      ========================================================= */}

      {selectedReturn && (
        <div className="fixed inset-0 z-50">

          {/* BACKDROP */}

          <button
            aria-label="Close return details"
            onClick={
              closeDetails
            }
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          {/* DRAWER */}

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-[#f8f9fb] shadow-2xl">

            {/* ===================================================
                HEADER
            =================================================== */}

            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                  <button
                    onClick={
                      closeDetails
                    }
                    className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <ArrowLeft
                      size={17}
                    />
                  </button>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                        <RotateCcw
                          size={18}
                        />

                      </div>

                      <h2 className="text-xl font-bold text-slate-950">
                        {
                          selectedReturn.shipment
                            ?.trackingNumber ||
                          "—"
                        }
                      </h2>

                    </div>

                    <div className="mt-2">

                      <ReturnStatusBadge
                        status={
                          selectedReturn.status
                        }
                      />

                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">

                      Same original shipment tracking number

                      <button
                        onClick={() =>
                          selectedReturn.shipment?.trackingNumber &&
                          copyTracking(
                            selectedReturn.shipment.trackingNumber
                          )
                        }
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
                      >

                        <Copy
                          size={12}
                        />

                        Copy ID

                      </button>

                    </div>

                  </div>

                </div>

                <button
                  onClick={
                    closeDetails
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <X size={18} />
                </button>

              </div>

            </div>

            {/* ===================================================
                BODY
            =================================================== */}

            <div className="flex-1 overflow-y-auto">

              <div className="space-y-5 p-5 sm:p-7">

                {/* =================================================
                    RETURN PICKUP HERO
                ================================================= */}

                <div className="overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-sm">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Return pickup
                      </p>

                      <div className="mt-3 flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">

                          <RotateCcw
                            size={18}
                          />

                        </div>

                        <div>

                          <p className="font-semibold">
                            {
                              selectedReturn.shipment
                                ?.receiverName ||
                              "—"
                            }
                          </p>

                          <p className="mt-1 text-sm leading-5 text-slate-300">
                            Pick up the package from this customer.
                          </p>

                        </div>

                      </div>

                    </div>

                    {selectedReturn.shipment
                      ?.receiverPhone && (
                      <a
                        href={`tel:${selectedReturn.shipment.receiverPhone}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 transition hover:bg-slate-100"
                      >
                        <Phone
                          size={18}
                        />
                      </a>
                    )}

                  </div>

                  <div className="mt-5 border-t border-white/10 pt-4">

                    <p className="text-[11px] uppercase tracking-wider text-slate-500">
                      Pickup address
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {
                        selectedReturn.shipment
                          ?.receiverAddress ||
                        "—"
                      }
                    </p>

                  </div>

                </div>

                {/* =================================================
                    RETURN INFORMATION
                ================================================== */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                        <RotateCcw
                          size={17}
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-slate-900">
                          Return reason
                        </p>

                        <p className="text-xs text-slate-400">
                          Why the package is being returned
                        </p>

                      </div>

                    </div>

                    <p className="mt-5 text-sm font-semibold text-slate-900">
                      {selectedReturn.reason
                        .replaceAll(
                          "_",
                          " "
                        )
                        .toLowerCase()
                        .replace(
                          /\b\w/g,
                          (
                            letter
                          ) =>
                            letter.toUpperCase()
                        )}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                        <Package
                          size={17}
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-slate-900">
                          Package
                        </p>

                        <p className="text-xs text-slate-400">
                          Original shipment
                        </p>

                      </div>

                    </div>

                    <p className="mt-5 text-sm font-semibold text-slate-900">

                      {
                        selectedReturn.shipment
                          ?.packageType ||
                        "—"
                      }

                      {" · "}

                      {
                        selectedReturn.shipment
                          ?.weight ??
                        "—"
                      }{" "}
                      kg

                    </p>

                  </div>

                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                {selectedReturn.description && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex gap-3">

                      <FileText
                        size={17}
                        className="mt-0.5 text-slate-400"
                      />

                      <div>

                        <p className="text-xs font-bold text-slate-700">
                          Return description
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {
                            selectedReturn.description
                          }
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================================
                    CURRENT RIDER
                ================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                      <User
                        size={17}
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold text-slate-900">
                        Return assignment
                      </p>

                      <p className="text-xs text-slate-400">
                        You are assigned to this return
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-5">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          formatReturnStatus(
                            selectedReturn.status
                          )
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Requested
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {
                          formatDateTime(
                            selectedReturn.requestedAt
                          )
                        }
                      </p>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    RETURN ACTION
                ================================================== */}

                {getReturnNextAction(
                  selectedReturn.status
                ) && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">

                        {selectedReturn.status ===
                        "ASSIGNED_TO_RIDER" ? (
                          <Package
                            size={20}
                          />
                        ) : (
                          <Warehouse
                            size={20}
                          />
                        )}

                      </div>

                      <div className="flex-1">

                        <p className="font-bold text-orange-950">

                          {selectedReturn.status ===
                          "ASSIGNED_TO_RIDER"
                            ? "Pick up return from customer"
                            : "Bring return to warehouse"}

                        </p>

                        <p className="mt-1 text-sm leading-5 text-orange-800/70">

                          {selectedReturn.status ===
                          "ASSIGNED_TO_RIDER"
                            ? "Go to the customer's address, collect the returned package, and confirm the pickup."
                            : "After collecting the package, bring it to the warehouse and confirm that it has been received."}

                        </p>

                        <button
                          disabled={
                            updatingReturnStatus
                          }
                          onClick={() =>
                            updateReturnStatus(
                              getReturnNextAction(
                                selectedReturn.status
                              )!
                            )
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {selectedReturn.status ===
                          "ASSIGNED_TO_RIDER" ? (
                            <Package
                              size={
                                17
                              }
                            />
                          ) : (
                            <Warehouse
                              size={
                                17
                              }
                            />
                          )}

                          {updatingReturnStatus
                            ? "Updating..."
                            : getReturnActionLabel(
                                selectedReturn.status
                              )}

                        </button>

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================================
                    IN WAREHOUSE COMPLETE
                ================================================== */}

                {selectedReturn.status ===
                  "IN_WAREHOUSE" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

                        <CheckCircle2
                          size={21}
                        />

                      </div>

                      <div>

                        <p className="font-bold text-emerald-950">
                          Return received in warehouse
                        </p>

                        <p className="mt-1 text-sm text-emerald-800/70">
                          Your part of the return pickup is complete. The package is now in the warehouse.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================================
                    RETURN TIMELINE
                ================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                      <History
                        size={17}
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold text-slate-900">
                        Return timeline
                      </p>

                      <p className="text-xs text-slate-400">
                        Return progress
                      </p>

                    </div>

                  </div>

                  <ReturnTimeline
                    returnRequest={
                      selectedReturn
                    }
                  />

                </div>

                {/* =================================================
                    CUSTOMER LOCATION
                ================================================== */}

                {selectedReturn.shipment
                  ?.receiverAddress && (
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          selectedReturn
                            .shipment!
                            .receiverAddress
                        )}`,
                        "_blank"
                      );
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                        <LocateFixed
                          size={18}
                        />

                      </div>

                      <div>

                        <p className="text-sm font-bold text-slate-900">
                          Open customer address
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Open pickup location in Google Maps
                        </p>

                      </div>

                    </div>

                    <ArrowRight
                      size={17}
                      className="text-slate-400"
                    />

                  </button>
                )}

                {/* =================================================
                    IMPORTANT NOTE
                ================================================== */}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">

                  <div className="flex gap-3">

                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-blue-900">
                        Return workflow
                      </p>

                      <p className="mt-1 text-sm leading-5 text-blue-800/70">
                        For now, your return responsibility ends when the package reaches the warehouse. Vendor delivery will be added in the next step.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>
      )}
    </>
  );
}

/* ============================================================
   RETURN STATUS BADGE
============================================================ */

function ReturnStatusBadge({
  status,
}: {
  status: ReturnStatus;
}) {
  const styles: Record<
    ReturnStatus,
    string
  > = {
    REQUESTED:
      "bg-yellow-50 text-yellow-700",

    ASSIGNED_TO_RIDER:
      "bg-blue-50 text-blue-700",

    PICKED_UP_FROM_CUSTOMER:
      "bg-purple-50 text-purple-700",

    IN_WAREHOUSE:
      "bg-amber-50 text-amber-700",

    OUT_FOR_RETURN:
      "bg-orange-50 text-orange-700",

    RETURNED_TO_VENDOR:
      "bg-green-50 text-green-700",

    CANCELLED:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {formatReturnStatus(
        status
      )}
    </span>
  );
}

/* ============================================================
   RETURN TIMELINE
============================================================ */

function ReturnTimeline({
  returnRequest,
}: {
  returnRequest: ReturnRequest;
}) {
  const steps: {
    status: ReturnStatus;
    trackingStatus: string;
    label: string;
  }[] = [
    {
      status: "REQUESTED",
      trackingStatus:
        "RETURN_REQUESTED",
      label: "Requested",
    },

    {
      status:
        "ASSIGNED_TO_RIDER",
      trackingStatus:
        "RETURN_ASSIGNED_TO_RIDER",
      label: "Assigned To Rider",
    },

    {
      status:
        "PICKED_UP_FROM_CUSTOMER",
      trackingStatus:
        "RETURN_PICKED_UP_FROM_CUSTOMER",
      label: "Picked Up From Customer",
    },

    {
      status:
        "IN_WAREHOUSE",
      trackingStatus:
        "RETURN_IN_WAREHOUSE",
      label: "In Warehouse",
    },
  ];

  const trackings =
    returnRequest.shipment
      ?.trackings ?? [];

  return (
    <div className="mt-6 space-y-5">

      {steps.map(
        (
          step,
          index
        ) => {

          /*
            IMPORTANT:

            We ONLY search using RETURN tracking statuses.

            This prevents the old normal shipment:

              IN_WAREHOUSE

            from being incorrectly shown as the return:

              IN_WAREHOUSE
          */

          const tracking =
            trackings.find(
              (item) =>
                item.status ===
                step.trackingStatus
            );

          const isDone =
            Boolean(
              tracking
            );

          const isCurrent =
            returnRequest.status ===
            step.status;

          return (
            <div
              key={
                step.status
              }
              className="flex gap-4"
            >

              <div className="flex flex-col items-center">

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    isDone
                      ? "bg-green-100 text-green-700"
                      : isCurrent
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone
                    ? "✓"
                    : "○"}
                </div>

                {index <
                  steps.length -
                    1 && (
                  <div
                    className={`mt-1 h-8 w-px ${
                      isDone
                        ? "bg-green-200"
                        : "bg-slate-200"
                    }`}
                  />
                )}

              </div>

              <div className="flex-1">

                <p
                  className={`text-sm font-bold ${
                    isCurrent
                      ? "text-orange-700"
                      : isDone
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {
                    step.label
                  }
                </p>

                {tracking && (
                  <>
                    <p className="mt-1 text-xs text-slate-400">

                      {formatDateTime(
                        tracking.createdAt
                      )}

                      {tracking.location
                        ? ` · ${tracking.location}`
                        : ""}

                    </p>

                    {tracking.message && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {
                          tracking.message
                        }
                      </p>
                    )}
                  </>
                )}

              </div>

            </div>
          );
        }
      )}

    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  icon,
  title,
  description,
  onClear,
  showClear,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClear: () => void;
  showClear: boolean;
}) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center p-10 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {description}
      </p>

      {showClear && (
        <button
          onClick={
            onClear
          }
          className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Clear filters
        </button>
      )}

    </div>
  );
}

