"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

type ReturnStatus =
  | "REQUESTED"
  | "ASSIGNED_TO_RIDER"
  | "PICKED_UP_FROM_CUSTOMER"
  | "IN_WAREHOUSE"
  | "OUT_FOR_RETURN"
  | "RETURNED_TO_VENDOR"
  | "CANCELLED";

type ReturnReason =
  | "CUSTOMER_CHANGED_MIND"
  | "WRONG_PRODUCT"
  | "DAMAGED_PRODUCT"
  | "DEFECTIVE_PRODUCT"
  | "WRONG_SIZE"
  | "WRONG_COLOR"
  | "PRODUCT_NOT_AS_DESCRIBED"
  | "OTHER";

type ReturnDeliveryOption =
  | "VENDOR_PICKUP"
  | "DELIVER_TO_VENDOR";

type ReturnRequest = {
  id: string;
  shipmentId: string;
  status: ReturnStatus;
  reason: ReturnReason;
  deliveryOption?: ReturnDeliveryOption | null;
  description?: string | null;
  riderId?: number | null;
  returnCharge?: number | null;
  requestedAt: string;
  pickedUpAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;

  rider?: {
    id: number;

    user?: {
      name?: string;
      phone?: string;
    };
  } | null;
};

type Shipment = {
  id: string;
  trackingNumber: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  packageType: string;
  weight: number;

  paymentType: "PREPAID" | "COD";
  codAmount: number;
  shippingCharge: number;

  origin: string;
  deliveryZone: string;
  status: string;

  qrCode?: string;

  createdAt: string;

  locationRate?: {
    id: number;
    price: number;

    location?: {
      id: number;
      name: string;
      zone: string;
    };

    deliveryType?: {
      id: number;
      name: string;
    };
  };

  rider?: {
    id: number;

    user?: {
      name: string;
      phone?: string;
    };
  };

  trackings?: {
    id: string;
    status: string;
    location?: string;
    message?: string;
    createdAt: string;
  }[];

  returnRequest?: ReturnRequest | null;
};

// =====================================================
// CACHE
// =====================================================
// IMPORTANT:
//
// These variables live outside the React component.
//
// Therefore:
// - Navigate away -> come back = cache remains
// - React StrictMode = request is deduplicated
// - F5/browser refresh = module resets and fresh API call
//
// =====================================================

let shipmentsCache: {
  token: string;
  data: Shipment[];
} | null = null;

let shipmentsRequest: {
  token: string;
  promise: Promise<Shipment[]>;
} | null = null;

// =====================================================
// RETURN REASONS
// =====================================================

const RETURN_REASONS: {
  value: ReturnReason;
  label: string;
}[] = [
  {
    value: "CUSTOMER_CHANGED_MIND",
    label: "Customer Changed Mind",
  },
  {
    value: "WRONG_PRODUCT",
    label: "Wrong Product",
  },
  {
    value: "DAMAGED_PRODUCT",
    label: "Damaged Product",
  },
  {
    value: "DEFECTIVE_PRODUCT",
    label: "Defective Product",
  },
  {
    value: "WRONG_SIZE",
    label: "Wrong Size",
  },
  {
    value: "WRONG_COLOR",
    label: "Wrong Color",
  },
  {
    value: "PRODUCT_NOT_AS_DESCRIBED",
    label: "Product Not As Described",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

// =====================================================
// STATUS FORMAT
// =====================================================

function formatStatus(status: string) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// =====================================================
// RETURN STATUS LABEL
// =====================================================

function getReturnStatusLabel(status: ReturnStatus) {
  switch (status) {
    case "REQUESTED":
      return "Return Requested";

    case "ASSIGNED_TO_RIDER":
      return "Rider Assigned";

    case "PICKED_UP_FROM_CUSTOMER":
      return "Picked Up From Customer";

    case "IN_WAREHOUSE":
      return "In Warehouse";

    case "OUT_FOR_RETURN":
      return "Out For Return";

    case "RETURNED_TO_VENDOR":
      return "Returned To Vendor";

    case "CANCELLED":
      return "Return Cancelled";

    default:
      return formatStatus(status);
  }
}

// =====================================================
// RETURN STATUS COLOR
// =====================================================

function getReturnStatusClass(status: ReturnStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-yellow-50 text-yellow-700";

    case "ASSIGNED_TO_RIDER":
      return "bg-blue-50 text-blue-700";

    case "PICKED_UP_FROM_CUSTOMER":
      return "bg-purple-50 text-purple-700";

    case "IN_WAREHOUSE":
      return "bg-indigo-50 text-indigo-700";

    case "OUT_FOR_RETURN":
      return "bg-orange-50 text-orange-700";

    case "RETURNED_TO_VENDOR":
      return "bg-green-50 text-green-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// =====================================================
// SHIPMENT STATUS COLOR
// =====================================================

function getStatusClass(status: string) {
  switch (status) {
    case "CREATED":
      return "bg-blue-50 text-blue-700";

    case "IN_WAREHOUSE":
      return "bg-indigo-50 text-indigo-700";

    case "ASSIGNED_TO_RIDER":
      return "bg-purple-50 text-purple-700";

    case "OUT_FOR_DELIVERY":
      return "bg-orange-50 text-orange-700";

    case "DELIVERED":
      return "bg-green-50 text-green-700";

    case "RETURN_REQUESTED":
      return "bg-yellow-50 text-yellow-700";

    case "RETURN_ASSIGNED_TO_RIDER":
      return "bg-blue-50 text-blue-700";

    case "RETURN_PICKED_UP_FROM_CUSTOMER":
      return "bg-purple-50 text-purple-700";

    case "RETURN_IN_WAREHOUSE":
      return "bg-indigo-50 text-indigo-700";

    case "OUT_FOR_RETURN":
      return "bg-orange-50 text-orange-700";

    case "RETURNED_TO_VENDOR":
      return "bg-green-50 text-green-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// =====================================================
// RETURN REASON
// =====================================================

function getReturnReasonLabel(reason: ReturnReason) {
  const found = RETURN_REASONS.find(
    (item) => item.value === reason
  );

  return found?.label || formatStatus(reason);
}

// =====================================================
// DATE
// =====================================================

function formatDate(date?: string | null) {
  if (!date) {
    return "N/A";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================================
// API ERROR
// =====================================================

async function getJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// =====================================================
// FETCH SHIPMENTS
// =====================================================

async function fetchShipments(
  force = false
): Promise<Shipment[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You are not logged in. Please login again."
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  // ===================================================
  // RETURN CACHE
  // ===================================================

  if (
    !force &&
    shipmentsCache &&
    shipmentsCache.token === token
  ) {
    return shipmentsCache.data;
  }

  // ===================================================
  // RETURN EXISTING REQUEST
  // ===================================================
  // This is extremely important for React StrictMode.
  //
  // If two effects call this function at the same time,
  // only ONE HTTP request is created.
  // ===================================================

  if (
    shipmentsRequest &&
    shipmentsRequest.token === token
  ) {
    return shipmentsRequest.promise;
  }

  // ===================================================
  // CREATE REQUEST
  // ===================================================

  const request = (async () => {
    // -------------------------------------------------
    // SHIPMENTS
    // -------------------------------------------------

    const shipmentRes = await fetch(
      `${API_URL}/api/shipment/my`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const shipmentData =
      await getJson(shipmentRes);

    if (!shipmentRes.ok) {
      throw new Error(
        shipmentData.message ||
          "Failed to load shipments"
      );
    }

    const shipmentList: Shipment[] =
      Array.isArray(shipmentData)
        ? shipmentData
        : shipmentData.shipments || [];

    // -------------------------------------------------
    // RETURNS
    // -------------------------------------------------

    let returnList: ReturnRequest[] = [];

    try {
      const returnRes = await fetch(
        `${API_URL}/api/returns/my`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const returnData =
        await getJson(returnRes);

      if (returnRes.ok) {
        returnList = Array.isArray(returnData)
          ? returnData
          : returnData.returns || [];
      } else {
        console.error(
          "GET RETURNS ERROR:",
          returnData
        );
      }
    } catch (error) {
      console.error(
        "LOAD RETURNS ERROR:",
        error
      );
    }

    // -------------------------------------------------
    // MAP RETURNS
    // -------------------------------------------------

    const returnMap = new Map<
      string,
      ReturnRequest
    >();

    returnList.forEach((returnRequest) => {
      returnMap.set(
        returnRequest.shipmentId,
        returnRequest
      );
    });

    // -------------------------------------------------
    // MERGE
    // -------------------------------------------------

    const mergedShipments =
      shipmentList.map((shipment) => ({
        ...shipment,

        returnRequest:
          shipment.returnRequest ||
          returnMap.get(shipment.id) ||
          null,
      }));

    // -------------------------------------------------
    // SAVE CACHE
    // -------------------------------------------------

    shipmentsCache = {
      token,
      data: mergedShipments,
    };

    return mergedShipments;
  })();

  shipmentsRequest = {
    token,
    promise: request,
  };

  try {
    return await request;
  } finally {
    if (
      shipmentsRequest &&
      shipmentsRequest.promise === request
    ) {
      shipmentsRequest = null;
    }
  }
}

// =====================================================
// CLEAR CACHE
// =====================================================

function clearShipmentsCache() {
  shipmentsCache = null;
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function VendorShipmentsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ===================================================
  // DATA
  // ===================================================

  const [shipments, setShipments] =
    useState<Shipment[]>(
      shipmentsCache?.data || []
    );

  const [loading, setLoading] = useState(
    shipmentsCache === null
  );

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // FILTER
  // ===================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // ===================================================
  // DETAILS MODAL
  // ===================================================

  const [selectedShipment, setSelectedShipment] =
    useState<Shipment | null>(null);

  // ===================================================
  // RETURN MODAL
  // ===================================================

  const [returnShipment, setReturnShipment] =
    useState<Shipment | null>(null);

  const [returnReason, setReturnReason] =
    useState<ReturnReason>(
      "CUSTOMER_CHANGED_MIND"
    );

  const [returnDescription, setReturnDescription] =
    useState("");

  const [returnNotes, setReturnNotes] =
    useState("");

  const [returnLoading, setReturnLoading] =
    useState(false);

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [
    returnDeliveryLoading,
    setReturnDeliveryLoading,
  ] = useState(false);

  // ===================================================
  // LOAD DATA
  // ===================================================

  async function loadShipments(
    force = false,
    showLoader = true
  ) {
    try {
      setError("");

      if (showLoader) {
        if (shipments.length === 0) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
      }

      const data = await fetchShipments(force);

      setShipments(data);

      // -------------------------------------------------
      // UPDATE OPEN DETAILS MODAL
      // -------------------------------------------------

      setSelectedShipment((current) => {
        if (!current) {
          return null;
        }

        return (
          data.find(
            (shipment) =>
              shipment.id === current.id
          ) || null
        );
      });

      // -------------------------------------------------
      // UPDATE OPEN RETURN MODAL
      // -------------------------------------------------

      setReturnShipment((current) => {
        if (!current) {
          return null;
        }

        return (
          data.find(
            (shipment) =>
              shipment.id === current.id
          ) || null
        );
      });
    } catch (error) {
      console.error(
        "LOAD SHIPMENTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load shipments"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadShipments(false, true);

    // Request deduplication prevents duplicate
    // network requests in React StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================================================
  // ESCAPE MODALS
  // ===================================================

  useEffect(() => {
    const hasModal =
      selectedShipment !== null ||
      returnShipment !== null;

    if (!hasModal) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      if (returnLoading || cancelLoading) {
        return;
      }

      setSelectedShipment(null);
      setReturnShipment(null);
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    selectedShipment,
    returnShipment,
    returnLoading,
    cancelLoading,
  ]);

  // ===================================================
  // RETURN DELIVERY OPTION
  // ===================================================

  async function handleReturnDeliveryOption(
    shipment: Shipment,
    option: ReturnDeliveryOption
  ) {
    const returnRequest =
      shipment.returnRequest;

    if (!returnRequest) {
      return;
    }

    // -------------------------------------------------
    // DON'T SEND IF ALREADY SELECTED
    // -------------------------------------------------

    if (
      returnRequest.deliveryOption === option
    ) {
      return;
    }

    if (returnRequest.deliveryOption) {
      setError(
        "Return delivery option has already been selected."
      );

      return;
    }

    try {
      setReturnDeliveryLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured."
        );
      }

      const response = await fetch(
        `${API_URL}/api/returns/${returnRequest.id}/delivery-option`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            deliveryOption: option,
          }),
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to select return delivery option"
        );
      }

      clearShipmentsCache();

      await loadShipments(true, false);

      setSuccess(
        "Return delivery option selected successfully."
      );
    } catch (error) {
      console.error(
        "RETURN DELIVERY OPTION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to select return delivery option"
      );
    } finally {
      setReturnDeliveryLoading(false);
    }
  }

  // ===================================================
  // REQUEST RETURN
  // ===================================================

  async function handleRequestReturn() {
    if (!returnShipment) {
      return;
    }

    try {
      setReturnLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured."
        );
      }

      if (
        returnShipment.status !==
        "DELIVERED"
      ) {
        throw new Error(
          "Only delivered shipments can be returned."
        );
      }

      if (returnShipment.returnRequest) {
        throw new Error(
          "A return request already exists for this shipment."
        );
      }

      const response = await fetch(
        `${API_URL}/api/returns`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            shipmentId: returnShipment.id,

            reason: returnReason,

            description:
              returnDescription.trim() ||
              null,

            notes:
              returnNotes.trim() || null,
          }),
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to request return"
        );
      }

      // -------------------------------------------------
      // CLOSE
      // -------------------------------------------------

      setReturnShipment(null);

      setReturnReason(
        "CUSTOMER_CHANGED_MIND"
      );

      setReturnDescription("");
      setReturnNotes("");

      // -------------------------------------------------
      // INVALIDATE CACHE
      // -------------------------------------------------

      clearShipmentsCache();

      // -------------------------------------------------
      // REFRESH ONCE
      // -------------------------------------------------

      await loadShipments(true, false);

      setSuccess(
        "Return request created successfully."
      );
    } catch (error) {
      console.error(
        "REQUEST RETURN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to request return"
      );
    } finally {
      setReturnLoading(false);
    }
  }

  // ===================================================
  // CANCEL RETURN
  // ===================================================

  async function handleCancelReturn(
    shipment: Shipment
  ) {
    const returnRequest =
      shipment.returnRequest;

    if (!returnRequest) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this return request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured."
        );
      }

      const response = await fetch(
        `${API_URL}/api/returns/${returnRequest.id}/cancel`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to cancel return"
        );
      }

      clearShipmentsCache();

      await loadShipments(true, false);

      setSuccess(
        "Return request cancelled successfully."
      );
    } catch (error) {
      console.error(
        "CANCEL RETURN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to cancel return"
      );
    } finally {
      setCancelLoading(false);
    }
  }

  // ===================================================
  // FILTERED SHIPMENTS
  // ===================================================

  const filteredShipments = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return shipments.filter((shipment) => {
      const matchesSearch =
        !searchText ||
        shipment.trackingNumber
          .toLowerCase()
          .includes(searchText) ||
        shipment.receiverName
          .toLowerCase()
          .includes(searchText) ||
        shipment.receiverPhone
          .toLowerCase()
          .includes(searchText) ||
        shipment.receiverAddress
          .toLowerCase()
          .includes(searchText) ||
        shipment.locationRate?.location?.name
          ?.toLowerCase()
          .includes(searchText) ||
        shipment.deliveryZone
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        shipment.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    shipments,
    search,
    statusFilter,
  ]);

  // ===================================================
  // STATISTICS
  // ===================================================

  const totalShipments =
    shipments.length;

  const createdCount =
    shipments.filter(
      (shipment) =>
        shipment.status === "CREATED"
    ).length;

  const deliveryCount =
    shipments.filter(
      (shipment) =>
        shipment.status ===
        "OUT_FOR_DELIVERY"
    ).length;

  const deliveredCount =
    shipments.filter(
      (shipment) =>
        shipment.status === "DELIVERED"
    ).length;

  const returnRequestedCount =
    shipments.filter(
      (shipment) =>
        shipment.returnRequest?.status ===
        "REQUESTED"
    ).length;

  const returnInProgressCount =
    shipments.filter(
      (shipment) =>
        shipment.returnRequest &&
        [
          "ASSIGNED_TO_RIDER",
          "PICKED_UP_FROM_CUSTOMER",
          "IN_WAREHOUSE",
          "OUT_FOR_RETURN",
        ].includes(
          shipment.returnRequest.status
        )
    ).length;

  const returnedCount =
    shipments.filter(
      (shipment) =>
        shipment.returnRequest?.status ===
        "RETURNED_TO_VENDOR"
    ).length;

  const filtersActive =
    search.trim() !== "" ||
    statusFilter !== "ALL";

  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
  }

  // ===================================================
  // INITIAL LOADING
  // ===================================================

  if (
    loading &&
    shipments.length === 0
  ) {
    return (
      <>
        <style jsx global>{`
          @keyframes skeleton-shimmer {
            0% {
              background-position: 200% 0;
            }

            100% {
              background-position: -200% 0;
            }
          }

          .skeleton-shimmer {
            background-image: linear-gradient(
              90deg,
              #e5e7eb 0%,
              #f9fafb 50%,
              #e5e7eb 100%
            );

            background-size: 200% 100%;

            animation: skeleton-shimmer
              1.5s ease-in-out infinite;
          }
        `}</style>

        <ShipmentSkeleton />
      </>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      <style jsx global>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-shimmer {
          background-image: linear-gradient(
            90deg,
            #e5e7eb 0%,
            #f9fafb 50%,
            #e5e7eb 100%
          );

          background-size: 200% 100%;

          animation: skeleton-shimmer
            1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl text-black">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0b1729]">
              My Shipments
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View, track and manage all
              shipments created by you.
            </p>
          </div>

          <button
            onClick={() =>
              loadShipments(true, true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />

              <span>{success}</span>
            </div>

            <button
              onClick={() =>
                setSuccess("")
              }
              className="rounded-lg p-1 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />

              <span>{error}</span>
            </div>

            <button
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =================================================
            MAIN STATISTICS
        ================================================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Shipments"
            value={totalShipments}
            icon={<Package className="h-5 w-5" />}
          />

          <StatCard
            label="Created"
            value={createdCount}
            valueClass="text-blue-600"
            icon={<Clock3 className="h-5 w-5" />}
          />

          <StatCard
            label="Out for Delivery"
            value={deliveryCount}
            valueClass="text-orange-600"
            icon={<Truck className="h-5 w-5" />}
          />

          <StatCard
            label="Delivered"
            value={deliveredCount}
            valueClass="text-green-600"
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
          />
        </div>

        {/* =================================================
            RETURN STATISTICS
        ================================================= */}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Return Requests"
            value={returnRequestedCount}
            valueClass="text-yellow-600"
          />

          <StatCard
            label="Returns In Progress"
            value={returnInProgressCount}
            valueClass="text-orange-600"
          />

          <StatCard
            label="Returned To Vendor"
            value={returnedCount}
            valueClass="text-green-600"
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search tracking number, receiver, phone or destination..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0b1729] focus:ring-2 focus:ring-[#0b1729]/5"
              />
            </div>

            {/* STATUS */}

            <div className="lg:w-64">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0b1729]"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="CREATED">
                  Created
                </option>

                <option value="IN_WAREHOUSE">
                  In Warehouse
                </option>

                <option value="ASSIGNED_TO_RIDER">
                  Assigned To Rider
                </option>

                <option value="OUT_FOR_DELIVERY">
                  Out For Delivery
                </option>

                <option value="DELIVERED">
                  Delivered
                </option>

                <option value="RETURN_REQUESTED">
                  Return Requested
                </option>

                <option value="RETURN_ASSIGNED_TO_RIDER">
                  Return Rider Assigned
                </option>

                <option value="RETURN_PICKED_UP_FROM_CUSTOMER">
                  Return Picked Up
                </option>

                <option value="RETURN_IN_WAREHOUSE">
                  Return In Warehouse
                </option>

                <option value="OUT_FOR_RETURN">
                  Out For Return
                </option>

                <option value="RETURNED_TO_VENDOR">
                  Returned To Vendor
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>

            {/* CLEAR */}

            {filtersActive && (
              <button
                onClick={clearFilters}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            TABLE HEADER SUMMARY
        ================================================= */}

        <div className="mt-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[#0b1729]">
              Shipment List
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredShipments.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {shipments.length}
              </span>{" "}
              shipments
            </p>
          </div>

          {refreshing && (
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />

              Updating shipments...
            </div>
          )}
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="mt-4 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Shipment
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Receiver
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Destination
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Delivery
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Weight
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Charge
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center"
                    >
                      <Package className="mx-auto h-8 w-8 text-gray-300" />

                      <div className="mt-3 text-sm font-medium text-gray-700">
                        No shipments found
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search
                        or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map(
                    (shipment) => (
                      <tr
                        key={shipment.id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* SHIPMENT */}

                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900">
                            {
                              shipment.trackingNumber
                            }
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays className="h-3 w-3" />

                            {formatDate(
                              shipment.createdAt
                            )}
                          </div>

                          {shipment.returnRequest && (
                            <div className="mt-2">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getReturnStatusClass(
                                  shipment
                                    .returnRequest
                                    .status
                                )}`}
                              >
                                Return:{" "}
                                {getReturnStatusLabel(
                                  shipment
                                    .returnRequest
                                    .status
                                )}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* RECEIVER */}

                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {
                              shipment.receiverName
                            }
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />

                            {
                              shipment.receiverPhone
                            }
                          </div>
                        </td>

                        {/* DESTINATION */}

                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                            <div>
                              <div className="font-medium">
                                {shipment
                                  .locationRate
                                  ?.location
                                  ?.name ||
                                  "N/A"}
                              </div>

                              <div className="mt-1 text-xs text-gray-500">
                                {shipment
                                  .deliveryZone ||
                                  shipment
                                    .locationRate
                                    ?.location
                                    ?.zone ||
                                  ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* DELIVERY */}

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium">
                            {shipment
                              .locationRate
                              ?.deliveryType
                              ?.name ||
                              "N/A"}
                          </span>
                        </td>

                        {/* WEIGHT */}

                        <td className="px-5 py-4">
                          {shipment.weight} kg
                        </td>

                        {/* CHARGE */}

                        <td className="px-5 py-4">
                          <div className="font-semibold">
                            Rs.{" "}
                            {Number(
                              shipment.shippingCharge
                            ).toLocaleString()}
                          </div>
                        </td>

                        {/* PAYMENT */}

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium">
                            {shipment.paymentType ===
                            "COD"
                              ? "COD"
                              : "Prepaid"}
                          </div>

                          {shipment.paymentType ===
                            "COD" && (
                            <div className="mt-1 text-xs text-gray-500">
                              Rs.{" "}
                              {Number(
                                shipment.codAmount
                              ).toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              shipment.status
                            )}`}
                          >
                            {formatStatus(
                              shipment.status
                            )}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">
                          <div className="flex min-w-[110px] flex-col gap-2">
                            <button
                              onClick={() =>
                                setSelectedShipment(
                                  shipment
                                )
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold transition hover:bg-gray-50"
                            >
                              View
                            </button>

                            {shipment.status ===
                              "DELIVERED" &&
                              !shipment.returnRequest && (
                                <button
                                  onClick={() =>
                                    setReturnShipment(
                                      shipment
                                    )
                                  }
                                  className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
                                >
                                  Request Return
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        <div className="mt-4 space-y-4 lg:hidden">
          {filteredShipments.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
              <Package className="mx-auto h-8 w-8 text-gray-300" />

              <div className="mt-3 font-medium text-gray-700">
                No shipments found
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or
                filter.
              </p>
            </div>
          ) : (
            filteredShipments.map(
              (shipment) => (
                <div
                  key={shipment.id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                >
                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {
                          shipment.trackingNumber
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(
                          shipment.createdAt
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        shipment.status
                      )}`}
                    >
                      {formatStatus(
                        shipment.status
                      )}
                    </span>
                  </div>

                  {/* RETURN */}

                  {shipment.returnRequest && (
                    <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3">
                      <p className="text-xs font-medium text-orange-700">
                        Return Status
                      </p>

                      <p className="mt-1 text-sm font-bold text-orange-800">
                        {getReturnStatusLabel(
                          shipment
                            .returnRequest
                            .status
                        )}
                      </p>
                    </div>
                  )}

                  {/* DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <Info
                      label="Receiver"
                      value={
                        shipment.receiverName
                      }
                    />

                    <Info
                      label="Destination"
                      value={
                        shipment.locationRate
                          ?.location?.name ||
                        "N/A"
                      }
                    />

                    <Info
                      label="Delivery"
                      value={
                        shipment.locationRate
                          ?.deliveryType
                          ?.name ||
                        "N/A"
                      }
                    />

                    <Info
                      label="Weight"
                      value={`${shipment.weight} kg`}
                    />

                    <Info
                      label="Shipping Charge"
                      value={`Rs. ${Number(
                        shipment.shippingCharge
                      ).toLocaleString()}`}
                    />

                    <Info
                      label="Payment"
                      value={
                        shipment.paymentType ===
                        "COD"
                          ? `COD Rs. ${Number(
                              shipment.codAmount
                            ).toLocaleString()}`
                          : "Prepaid"
                      }
                    />
                  </div>

                  {/* BUTTONS */}

                  <div className="mt-5 grid gap-2">
                    <button
                      onClick={() =>
                        setSelectedShipment(
                          shipment
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
                    >
                      View Shipment
                    </button>

                    {shipment.status ===
                      "DELIVERED" &&
                      !shipment.returnRequest && (
                        <button
                          onClick={() =>
                            setReturnShipment(
                              shipment
                            )
                          }
                          className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                          Request Return
                        </button>
                      )}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* =====================================================
          SHIPMENT DETAILS MODAL
      ===================================================== */}

      {selectedShipment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedShipment(null);
            }
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0b1729]">
                  Shipment Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Tracking Number:{" "}
                  <span className="font-semibold text-gray-700">
                    {
                      selectedShipment.trackingNumber
                    }
                  </span>
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedShipment(null)
                }
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BODY */}

            <div className="max-h-[calc(92vh-145px)] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* STATUS */}

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Current Shipment Status
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatStatus(
                          selectedShipment.status
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        selectedShipment.status
                      )}`}
                    >
                      {formatStatus(
                        selectedShipment.status
                      )}
                    </span>
                  </div>
                </div>

                {/* RETURN PROCESS */}

                {selectedShipment.returnRequest && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                          Return Process
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-orange-900">
                          {getReturnStatusLabel(
                            selectedShipment
                              .returnRequest
                              .status
                          )}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getReturnStatusClass(
                          selectedShipment
                            .returnRequest
                            .status
                        )}`}
                      >
                        {
                          selectedShipment
                            .returnRequest
                            .status
                        }
                      </span>
                    </div>

                    {/* SAME TRACKING */}

                    <div className="mt-5 rounded-xl bg-white p-4">
                      <p className="text-xs text-gray-500">
                        Shipment Tracking Number
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {
                          selectedShipment.trackingNumber
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        The return uses the
                        same original shipment
                        tracking number.
                      </p>
                    </div>

                    {/* RETURN DETAILS */}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Info
                        label="Return Reason"
                        value={getReturnReasonLabel(
                          selectedShipment
                            .returnRequest
                            .reason
                        )}
                      />

                      <Info
                        label="Requested At"
                        value={formatDate(
                          selectedShipment
                            .returnRequest
                            .requestedAt
                        )}
                      />

                      {selectedShipment
                        .returnRequest
                        .pickedUpAt && (
                        <Info
                          label="Picked Up At"
                          value={formatDate(
                            selectedShipment
                              .returnRequest
                              .pickedUpAt
                          )}
                        />
                      )}

                      {selectedShipment
                        .returnRequest
                        .completedAt && (
                        <Info
                          label="Completed At"
                          value={formatDate(
                            selectedShipment
                              .returnRequest
                              .completedAt
                          )}
                        />
                      )}
                    </div>

                    {/* DELIVERY OPTION */}

                    {selectedShipment
                      .returnRequest
                      .status ===
                      "IN_WAREHOUSE" && (
                      <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        {!selectedShipment
                          .returnRequest
                          .deliveryOption ? (
                          <>
                            <p className="text-sm font-semibold text-blue-900">
                              Your return has
                              reached the
                              warehouse
                            </p>

                            <p className="mt-1 text-sm text-blue-700">
                              Choose how you want
                              to receive your
                              returned package.
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {/* VENDOR PICKUP */}

                              <button
                                disabled={
                                  returnDeliveryLoading
                                }
                                onClick={() =>
                                  handleReturnDeliveryOption(
                                    selectedShipment,
                                    "VENDOR_PICKUP"
                                  )
                                }
                                className="rounded-xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <div className="text-2xl">
                                  📦
                                </div>

                                <p className="mt-2 font-semibold text-gray-900">
                                  I will pick up
                                  from warehouse
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  Collect the
                                  returned package
                                  yourself from
                                  the warehouse.
                                </p>
                              </button>

                              {/* DELIVER */}

                              <button
                                disabled={
                                  returnDeliveryLoading
                                }
                                onClick={() =>
                                  handleReturnDeliveryOption(
                                    selectedShipment,
                                    "DELIVER_TO_VENDOR"
                                  )
                                }
                                className="rounded-xl border border-orange-200 bg-white p-4 text-left transition hover:border-orange-400 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <div className="text-2xl">
                                  🏠
                                </div>

                                <p className="mt-2 font-semibold text-gray-900">
                                  Return to my
                                  address
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  Have the returned
                                  package delivered
                                  to your registered
                                  vendor address.
                                </p>
                              </button>
                            </div>

                            {returnDeliveryLoading && (
                              <p className="mt-3 text-center text-xs font-medium text-blue-700">
                                Saving your
                                delivery option...
                              </p>
                            )}
                          </>
                        ) : selectedShipment
                            .returnRequest
                            .deliveryOption ===
                          "VENDOR_PICKUP" ? (
                          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">
                                📦
                              </div>

                              <div>
                                <p className="font-semibold text-green-900">
                                  Vendor Pickup
                                  Selected
                                </p>

                                <p className="mt-1 text-sm text-green-700">
                                  You will collect
                                  the returned
                                  package from the
                                  warehouse.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">
                                🏠
                              </div>

                              <div>
                                <p className="font-semibold text-orange-900">
                                  Delivery To Vendor
                                  Selected
                                </p>

                                <p className="mt-1 text-sm text-orange-700">
                                  The returned package
                                  will be delivered to
                                  your registered vendor
                                  address.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DESCRIPTION */}

                    {selectedShipment
                      .returnRequest
                      .description && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">
                          Description
                        </p>

                        <p className="mt-1 rounded-xl bg-white p-3 text-sm text-gray-700">
                          {
                            selectedShipment
                              .returnRequest
                              .description
                          }
                        </p>
                      </div>
                    )}

                    {/* RIDER */}

                    <div className="mt-4">
                      <p className="text-xs text-gray-500">
                        Return Rider
                      </p>

                      {selectedShipment
                        .returnRequest
                        .rider ? (
                        <div className="mt-2 rounded-xl bg-white p-4">
                          <p className="font-semibold">
                            {selectedShipment
                              .returnRequest
                              .rider.user
                              ?.name ||
                              "Rider"}
                          </p>

                          {selectedShipment
                            .returnRequest
                            .rider.user
                            ?.phone && (
                            <p className="mt-1 text-sm text-gray-500">
                              {
                                selectedShipment
                                  .returnRequest
                                  .rider.user
                                  .phone
                              }
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 rounded-xl bg-white p-4 text-sm text-gray-500">
                          Staff/Admin has not
                          assigned a return rider
                          yet.
                        </div>
                      )}
                    </div>

                    {/* CANCEL */}

                    {[
                      "REQUESTED",
                      "ASSIGNED_TO_RIDER",
                    ].includes(
                      selectedShipment
                        .returnRequest.status
                    ) && (
                      <button
                        onClick={() =>
                          handleCancelReturn(
                            selectedShipment
                          )
                        }
                        disabled={
                          cancelLoading
                        }
                        className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancelLoading
                          ? "Cancelling..."
                          : "Cancel Return"}
                      </button>
                    )}
                  </div>
                )}

                {/* RECEIVER */}

                <section>
                  <h3 className="mb-3 font-semibold">
                    Receiver Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Name"
                      value={
                        selectedShipment.receiverName
                      }
                    />

                    <Info
                      label="Phone"
                      value={
                        selectedShipment.receiverPhone
                      }
                    />

                    <div className="sm:col-span-2">
                      <Info
                        label="Address"
                        value={
                          selectedShipment.receiverAddress
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* DELIVERY */}

                <section>
                  <h3 className="mb-3 font-semibold">
                    Delivery Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Destination"
                      value={
                        selectedShipment
                          .locationRate
                          ?.location?.name ||
                        "N/A"
                      }
                    />

                    <Info
                      label="Zone"
                      value={
                        selectedShipment
                          .deliveryZone ||
                        selectedShipment
                          .locationRate
                          ?.location?.zone ||
                        "N/A"
                      }
                    />

                    <Info
                      label="Delivery Type"
                      value={
                        selectedShipment
                          .locationRate
                          ?.deliveryType
                          ?.name ||
                        "N/A"
                      }
                    />

                    <Info
                      label="Weight"
                      value={`${selectedShipment.weight} kg`}
                    />

                    <Info
                      label="Shipping Charge"
                      value={`Rs. ${Number(
                        selectedShipment.shippingCharge
                      ).toLocaleString()}`}
                    />

                    <Info
                      label="Package Type"
                      value={
                        selectedShipment.packageType
                      }
                    />
                  </div>
                </section>

                {/* PAYMENT */}

                <section>
                  <h3 className="mb-3 font-semibold">
                    Payment
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Info
                      label="Payment Type"
                      value={
                        selectedShipment.paymentType ===
                        "COD"
                          ? "Cash On Delivery"
                          : "Prepaid"
                      }
                    />

                    {selectedShipment.paymentType ===
                      "COD" && (
                      <Info
                        label="COD Amount"
                        value={`Rs. ${Number(
                          selectedShipment.codAmount
                        ).toLocaleString()}`}
                      />
                    )}
                  </div>
                </section>

                {/* RIDER */}

                <section>
                  <h3 className="mb-3 font-semibold">
                    Original Delivery Rider
                  </h3>

                  {selectedShipment.rider ? (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="font-medium">
                        {selectedShipment.rider.user
                          ?.name ||
                          "Rider"}
                      </p>

                      {selectedShipment.rider
                        .user?.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                          {
                            selectedShipment.rider
                              .user.phone
                          }
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                      Rider has not been assigned
                      yet.
                    </div>
                  )}
                </section>

                {/* TRACKING */}

                <section>
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold">
                      Tracking History
                    </h3>

                    {selectedShipment.returnRequest && (
                      <span className="text-xs font-medium text-orange-600">
                        Return updates use the
                        same tracking number
                      </span>
                    )}
                  </div>

                  {selectedShipment.trackings &&
                  selectedShipment.trackings.length >
                    0 ? (
                    <div className="space-y-4">
                      {selectedShipment.trackings.map(
                        (tracking) => (
                          <div
                            key={tracking.id}
                            className="relative border-l-2 border-gray-200 pl-4"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium">
                                {formatStatus(
                                  tracking.status
                                )}
                              </div>

                              {(tracking.status.startsWith(
                                "RETURN"
                              ) ||
                                tracking.status ===
                                  "OUT_FOR_RETURN") && (
                                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                                  RETURN
                                </span>
                              )}
                            </div>

                            {tracking.location && (
                              <div className="mt-1 text-sm text-gray-500">
                                {
                                  tracking.location
                                }
                              </div>
                            )}

                            {tracking.message && (
                              <div className="mt-1 text-sm text-gray-600">
                                {
                                  tracking.message
                                }
                              </div>
                            )}

                            <div className="mt-1 text-xs text-gray-400">
                              {formatDate(
                                tracking.createdAt
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                      No tracking history
                      available.
                    </div>
                  )}
                </section>

                {/* QR */}

                {selectedShipment.qrCode && (
                  <section className="border-t pt-6 text-center">
                    <h3 className="mb-3 font-semibold">
                      Shipment QR Code
                    </h3>

                    <img
                      src={
                        selectedShipment.qrCode
                      }
                      alt="Shipment QR Code"
                      className="mx-auto h-40 w-40 object-contain"
                    />

                    <p className="mt-3 text-xs text-gray-500">
                      Tracking Number:{" "}
                      {
                        selectedShipment.trackingNumber
                      }
                    </p>
                  </section>
                )}
              </div>
            </div>

            {/* FOOTER */}

            <div className="border-t bg-white px-6 py-4">
              <button
                onClick={() =>
                  setSelectedShipment(null)
                }
                className="w-full rounded-xl bg-[#0b1729] px-5 py-3 font-semibold text-white transition hover:bg-[#15253c]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REQUEST RETURN MODAL
      ===================================================== */}

      {returnShipment && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !returnLoading
            ) {
              setReturnShipment(null);
            }
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0b1729]">
                  Request Shipment Return
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {
                    returnShipment.trackingNumber
                  }
                </p>
              </div>

              <button
                disabled={returnLoading}
                onClick={() =>
                  setReturnShipment(null)
                }
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BODY */}

            <div className="max-h-[calc(92vh-145px)] overflow-y-auto p-6">
              <div className="space-y-5">
                {/* INFO */}

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-800">
                    Return information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    The return will be collected
                    from the customer, brought to
                    the warehouse, and then sent
                    back to you.
                  </p>
                </div>

                {/* TRACKING */}

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Original Shipment Tracking
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    {
                      returnShipment.trackingNumber
                    }
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    This same tracking number will
                    be used throughout the return.
                  </p>
                </div>

                {/* RECEIVER */}

                <div className="grid grid-cols-2 gap-4">
                  <Info
                    label="Customer"
                    value={
                      returnShipment.receiverName
                    }
                  />

                  <Info
                    label="Phone"
                    value={
                      returnShipment.receiverPhone
                    }
                  />
                </div>

                {/* ADDRESS */}

                <Info
                  label="Pickup Address"
                  value={
                    returnShipment.receiverAddress
                  }
                />

                {/* REASON */}

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Return Reason
                  </label>

                  <select
                    value={returnReason}
                    onChange={(event) =>
                      setReturnReason(
                        event.target
                          .value as ReturnReason
                      )
                    }
                    disabled={returnLoading}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#0b1729]"
                  >
                    {RETURN_REASONS.map(
                      (reason) => (
                        <option
                          key={reason.value}
                          value={reason.value}
                        >
                          {reason.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={returnDescription}
                    onChange={(event) =>
                      setReturnDescription(
                        event.target.value
                      )
                    }
                    disabled={returnLoading}
                    rows={4}
                    placeholder="Explain why the shipment needs to be returned..."
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#0b1729]"
                  />
                </div>

                {/* NOTES */}

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Additional Notes
                  </label>

                  <textarea
                    value={returnNotes}
                    onChange={(event) =>
                      setReturnNotes(
                        event.target.value
                      )
                    }
                    disabled={returnLoading}
                    rows={3}
                    placeholder="Any additional instructions for staff/rider..."
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#0b1729]"
                  />
                </div>

                {/* WARNING */}

                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-xs leading-5 text-yellow-800">
                    After submitting, staff/admin
                    will review the return and assign
                    a rider. The rider will collect
                    the package from the customer and
                    return it to your company.
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex gap-3 border-t bg-white px-6 py-4">
              <button
                disabled={returnLoading}
                onClick={() =>
                  setReturnShipment(null)
                }
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={returnLoading}
                onClick={handleRequestReturn}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {returnLoading
                  ? "Submitting..."
                  : "Request Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  label,
  value,
  valueClass = "text-gray-900",
  icon,
}: {
  label: string;
  value: number;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {label}
        </p>

        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      <p
        className={`mt-2 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

// =====================================================
// INFO
// =====================================================

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

// =====================================================
// SKELETON
// =====================================================

function ShipmentSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="skeleton-shimmer h-7 w-48 rounded-lg" />

          <div className="skeleton-shimmer mt-2 h-4 w-72 rounded-lg" />
        </div>

        <div className="skeleton-shimmer h-11 w-28 rounded-xl" />
      </div>

      {/* STATS */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="skeleton-shimmer h-4 w-28 rounded" />

              <div className="skeleton-shimmer mt-3 h-9 w-16 rounded" />
            </div>
          )
        )}
      </div>

      {/* RETURN STATS */}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="skeleton-shimmer h-4 w-32 rounded" />

              <div className="skeleton-shimmer mt-3 h-8 w-12 rounded" />
            </div>
          )
        )}
      </div>

      {/* FILTER */}

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="skeleton-shimmer h-12 flex-1 rounded-xl" />

          <div className="skeleton-shimmer h-12 md:w-64 rounded-xl" />
        </div>
      </div>

      {/* TABLE */}

      <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:block">
        <div className="border-b bg-gray-50 px-5 py-4">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 7 }).map(
            (_, row) => (
              <div
                key={row}
                className="grid grid-cols-9 gap-5 px-5 py-5"
              >
                {Array.from({
                  length: 9,
                }).map((_, column) => (
                  <div
                    key={column}
                    className="skeleton-shimmer h-5 rounded"
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* MOBILE */}

      <div className="mt-6 space-y-4 lg:hidden">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex justify-between">
                <div className="skeleton-shimmer h-5 w-36 rounded" />

                <div className="skeleton-shimmer h-6 w-20 rounded-full" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {Array.from({
                  length: 6,
                }).map((_, item) => (
                  <div key={item}>
                    <div className="skeleton-shimmer h-3 w-16 rounded" />

                    <div className="skeleton-shimmer mt-2 h-4 w-24 rounded" />
                  </div>
                ))}
              </div>

              <div className="skeleton-shimmer mt-5 h-11 w-full rounded-xl" />
            </div>
          )
        )}
      </div>
    </div>
  );
}