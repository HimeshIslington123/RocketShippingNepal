"use client";

import { useEffect, useMemo, useState } from "react";

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

type ReturnRequest = {
  id: string;

  shipmentId: string;

  status: ReturnStatus;

  reason: ReturnReason;

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

  // ===================================================
  // RETURN REQUEST
  // ===================================================

  returnRequest?: ReturnRequest | null;
};

// =====================================================
// CONSTANTS
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
// STATUS LABEL
// =====================================================

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

// =====================================================
// RETURN STATUS LABEL
// =====================================================

function getReturnStatusLabel(
  status: ReturnStatus
) {
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

function getReturnStatusClass(
  status: ReturnStatus
) {
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
// RETURN REASON LABEL
// =====================================================

function getReturnReasonLabel(
  reason: ReturnReason
) {
  const found = RETURN_REASONS.find(
    (item) => item.value === reason
  );

  return found?.label || formatStatus(reason);
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function VendorShipmentsPage() {
  const [shipments, setShipments] = useState<
    Shipment[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

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

  // ===================================================
  // API URL
  // ===================================================

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadShipments();
  }, []);

  // =====================================================
  // LOAD SHIPMENTS + RETURNS
  // =====================================================

  async function loadShipments() {
    try {
      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "You are not logged in. Please login again."
        );

        return;
      }

      if (!API_URL) {
        setError(
          "NEXT_PUBLIC_API_URL is not configured."
        );

        return;
      }

      // =================================================
      // LOAD SHIPMENTS
      // =================================================

      const shipmentRes = await fetch(
        `${API_URL}/api/shipment/my`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const shipmentData =
        await shipmentRes.json();

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

      // =================================================
      // LOAD RETURNS
      // =================================================

      let returnList: ReturnRequest[] = [];

      try {
        const returnRes = await fetch(
          `${API_URL}/api/returns/my`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const returnData =
          await returnRes.json();

        if (returnRes.ok) {
          returnList = Array.isArray(
            returnData
          )
            ? returnData
            : returnData.returns || [];
        }
      } catch (returnError) {
        console.error(
          "LOAD RETURNS ERROR:",
          returnError
        );
      }

      // =================================================
      // MERGE RETURN INTO SHIPMENT
      // =================================================

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

      const mergedShipments =
        shipmentList.map((shipment) => ({
          ...shipment,

          returnRequest:
            shipment.returnRequest ||
            returnMap.get(shipment.id) ||
            null,
        }));

      setShipments(mergedShipments);

      // =================================================
      // UPDATE SELECTED SHIPMENT IF OPEN
      // =================================================

      setSelectedShipment((current) => {
        if (!current) {
          return null;
        }

        return (
          mergedShipments.find(
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
    }
  }

  // =====================================================
  // REQUEST RETURN
  // =====================================================

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

      // =================================================
      // SAFETY CHECK
      // =================================================

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

      // =================================================
      // CREATE RETURN
      // =================================================

      const res = await fetch(
        `${API_URL}/api/returns`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            shipmentId:
              returnShipment.id,

            reason: returnReason,

            description:
              returnDescription.trim() ||
              null,

            notes:
              returnNotes.trim() ||
              null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to request return"
        );
      }

      // =================================================
      // CLOSE RETURN MODAL
      // =================================================

      setReturnShipment(null);

      setReturnReason(
        "CUSTOMER_CHANGED_MIND"
      );

      setReturnDescription("");

      setReturnNotes("");

      // =================================================
      // RELOAD
      // =================================================

      await loadShipments();
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

  // =====================================================
  // CANCEL RETURN
  // =====================================================

  async function handleCancelReturn(
    shipment: Shipment
  ) {
    const returnRequest =
      shipment.returnRequest;

    if (!returnRequest) {
      return;
    }

    const confirmed =
      window.confirm(
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

      const res = await fetch(
        `${API_URL}/api/returns/${returnRequest.id}/cancel`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to cancel return"
        );
      }

      await loadShipments();
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

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date: string) {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString(
      "en-US",
      {
        year: "numeric",

        month: "short",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredShipments =
    useMemo(() => {
      return shipments.filter(
        (shipment) => {
          const searchText =
            search
              .toLowerCase()
              .trim();

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
            shipment.locationRate?.location?.name
              ?.toLowerCase()
              .includes(searchText);

          const matchesStatus =
            statusFilter === "ALL" ||
            shipment.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      shipments,
      search,
      statusFilter,
    ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalShipments =
    shipments.length;

  const createdCount =
    shipments.filter(
      (s) => s.status === "CREATED"
    ).length;

  const deliveryCount =
    shipments.filter(
      (s) =>
        s.status ===
        "OUT_FOR_DELIVERY"
    ).length;

  const deliveredCount =
    shipments.filter(
      (s) =>
        s.status === "DELIVERED"
    ).length;

  const returnRequestedCount =
    shipments.filter(
      (s) =>
        s.returnRequest?.status ===
        "REQUESTED"
    ).length;

  const returnInProgressCount =
    shipments.filter(
      (s) =>
        s.returnRequest &&
        [
          "ASSIGNED_TO_RIDER",
          "PICKED_UP_FROM_CUSTOMER",
          "IN_WAREHOUSE",
          "OUT_FOR_RETURN",
        ].includes(
          s.returnRequest.status
        )
    ).length;

  const returnedCount =
    shipments.filter(
      (s) =>
        s.returnRequest?.status ===
        "RETURNED_TO_VENDOR"
    ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-sm text-gray-500">
            Loading your shipments...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto max-w-7xl text-black">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-2xl font-bold text-ink">
            My Shipments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View, track and manage all shipments
            created by you.
          </p>
        </div>

        <button
          onClick={loadShipments}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="font-bold"
          >
            ✕
          </button>

        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

          <p className="text-sm text-gray-500">
            Total Shipments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalShipments}
          </p>

        </div>

        {/* CREATED */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

          <p className="text-sm text-gray-500">
            Created
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {createdCount}
          </p>

        </div>

        {/* OUT FOR DELIVERY */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

          <p className="text-sm text-gray-500">
            Out for Delivery
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {deliveryCount}
          </p>

        </div>

        {/* DELIVERED */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

          <p className="text-sm text-gray-500">
            Delivered
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {deliveredCount}
          </p>

        </div>

      </div>

      {/* =================================================
          RETURN STATISTICS
      ================================================= */}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

          <p className="text-sm text-gray-500">
            Return Requests
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {returnRequestedCount}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

          <p className="text-sm text-gray-500">
            Returns In Progress
          </p>

          <p className="mt-2 text-2xl font-bold text-orange-600">
            {returnInProgressCount}
          </p>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">

          <p className="text-sm text-gray-500">
            Returned To Vendor
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {returnedCount}
          </p>

        </div>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* SEARCH */}

          <div className="flex-1">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search tracking number, receiver or destination..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent"
            />

          </div>

          {/* STATUS */}

          <div className="md:w-64">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent"
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

        </div>

      </div>

      {/* =================================================
          DESKTOP TABLE
      ================================================= */}

      <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:block">

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

              {filteredShipments.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center"
                  >

                    <div className="text-sm font-medium text-gray-700">
                      No shipments found
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Try changing your
                      search or filter.
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

                        <div className="font-semibold">
                          {
                            shipment.trackingNumber
                          }
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            shipment.createdAt
                          )}
                        </div>

                        {/* RETURN BADGE */}

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

                        <div className="mt-1 text-xs text-gray-500">
                          {
                            shipment.receiverPhone
                          }
                        </div>

                      </td>

                      {/* DESTINATION */}

                      <td className="px-5 py-4">

                        <div className="font-medium">
                          {
                            shipment.locationRate
                              ?.location
                              ?.name ||
                            "N/A"
                          }
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {
                            shipment.deliveryZone ||
                            shipment
                              .locationRate
                              ?.location
                              ?.zone ||
                            ""
                          }
                        </div>

                      </td>

                      {/* DELIVERY */}

                      <td className="px-5 py-4">

                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium">
                          {
                            shipment.locationRate
                              ?.deliveryType
                              ?.name ||
                            "N/A"
                          }
                        </span>

                      </td>

                      {/* WEIGHT */}

                      <td className="px-5 py-4">

                        {
                          shipment.weight
                        }{" "}
                        kg

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

                        <div className="flex flex-col gap-2">

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

                          {/* RETURN BUTTON */}

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

      <div className="mt-6 space-y-4 lg:hidden">

        {filteredShipments.length ===
        0 ? (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">

            <div className="font-medium text-gray-700">
              No shipments found
            </div>

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

                {/* RETURN STATUS */}

                {shipment.returnRequest && (
                  <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3">

                    <div className="flex items-center justify-between gap-3">

                      <div>

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

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getReturnStatusClass(
                          shipment
                            .returnRequest
                            .status
                        )}`}
                      >
                        Return
                      </span>

                    </div>

                  </div>
                )}

                {/* DETAILS */}

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-xs text-gray-500">
                      Receiver
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        shipment.receiverName
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Destination
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        shipment.locationRate
                          ?.location
                          ?.name ||
                        "N/A"
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Delivery
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        shipment.locationRate
                          ?.deliveryType
                          ?.name ||
                        "N/A"
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Weight
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        shipment.weight
                      }{" "}
                      kg
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Shipping Charge
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      Rs.{" "}
                      {Number(
                        shipment.shippingCharge
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Payment
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {shipment.paymentType ===
                      "COD"
                        ? `COD Rs. ${Number(
                            shipment.codAmount
                          ).toLocaleString()}`
                        : "Prepaid"}
                    </p>

                  </div>

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

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedShipment && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() =>
            setSelectedShipment(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-lg font-bold">
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
                  setSelectedShipment(
                    null
                  )
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-6 p-6">

              {/* =========================================
                  CURRENT STATUS
              ========================================= */}

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

              {/* =========================================
                  RETURN STATUS
              ========================================= */}

              {selectedShipment.returnRequest && (

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                        Return Process
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-orange-900">
                        {
                          getReturnStatusLabel(
                            selectedShipment
                              .returnRequest
                              .status
                          )
                        }
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

                  {/* SAME TRACKING NUMBER */}

                  <div className="mt-5 rounded-xl bg-white p-4">

                    <p className="text-xs text-gray-500">
                      Shipment Tracking Number
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {
                        selectedShipment
                          .trackingNumber
                      }
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      The return uses the same
                      original shipment tracking
                      number.
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
                          {
                            selectedShipment
                              .returnRequest
                              .rider
                              .user
                              ?.name ||
                            "Rider"
                          }
                        </p>

                        {selectedShipment
                          .returnRequest
                          .rider
                          .user
                          ?.phone && (

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              selectedShipment
                                .returnRequest
                                .rider
                                .user
                                .phone
                            }
                          </p>

                        )}

                      </div>

                    ) : (

                      <div className="mt-2 rounded-xl bg-white p-4 text-sm text-gray-500">
                        Staff/Admin has not assigned
                        a return rider yet.
                      </div>

                    )}

                  </div>

                  {/* CANCEL */}

                  {[
                    "REQUESTED",
                    "ASSIGNED_TO_RIDER",
                  ].includes(
                    selectedShipment
                      .returnRequest
                      .status
                  ) && (

                    <button
                      onClick={() =>
                        handleCancelReturn(
                          selectedShipment
                        )
                      }
                      disabled={cancelLoading}
                      className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancelLoading
                        ? "Cancelling..."
                        : "Cancel Return"}
                    </button>

                  )}

                </div>

              )}

              {/* =========================================
                  RECEIVER
              ========================================= */}

              <div>

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

              </div>

              {/* =========================================
                  DELIVERY
              ========================================= */}

              <div>

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

              </div>

              {/* =========================================
                  PAYMENT
              ========================================= */}

              <div>

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

              </div>

              {/* =========================================
                  ORIGINAL RIDER
              ========================================= */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Original Delivery Rider
                </h3>

                {selectedShipment.rider ? (

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="font-medium">
                      {
                        selectedShipment
                          .rider
                          .user?.name ||
                        "Rider"
                      }
                    </p>

                    {selectedShipment
                      .rider
                      .user?.phone && (

                      <p className="mt-1 text-sm text-gray-500">
                        {
                          selectedShipment
                            .rider
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

              </div>

              {/* =========================================
                  TRACKING
              ========================================= */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <h3 className="font-semibold">
                    Tracking History
                  </h3>

                  {selectedShipment
                    .returnRequest && (

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

                            {tracking.status
                              .startsWith(
                                "RETURN"
                              ) ||
                              tracking.status ===
                                "OUT_FOR_RETURN" ? (

                              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                                RETURN
                              </span>

                            ) : null}

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

                  <div className="text-sm text-gray-500">
                    No tracking history available.
                  </div>

                )}

              </div>

              {/* =========================================
                  QR
              ========================================= */}

              {selectedShipment.qrCode && (

                <div className="border-t pt-6 text-center">

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

                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t px-6 py-4">

              <button
                onClick={() =>
                  setSelectedShipment(
                    null
                  )
                }
                className="w-full rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-dark"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          REQUEST RETURN MODAL
      ================================================= */}

      {returnShipment && (

        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            !returnLoading &&
            setReturnShipment(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-lg font-bold">
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
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            {/* BODY */}

            <div className="space-y-5 p-6">

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

              <div>

                <Info
                  label="Pickup Address"
                  value={
                    returnShipment.receiverAddress
                  }
                />

              </div>

              {/* REASON */}

              <div>

                <label className="text-sm font-semibold text-gray-700">
                  Return Reason
                </label>

                <select
                  value={returnReason}
                  onChange={(e) =>
                    setReturnReason(
                      e.target
                        .value as ReturnReason
                    )
                  }
                  disabled={returnLoading}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent"
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
                  onChange={(e) =>
                    setReturnDescription(
                      e.target.value
                    )
                  }
                  disabled={returnLoading}
                  rows={4}
                  placeholder="Explain why the shipment needs to be returned..."
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent"
                />

              </div>

              {/* NOTES */}

              <div>

                <label className="text-sm font-semibold text-gray-700">
                  Additional Notes
                </label>

                <textarea
                  value={returnNotes}
                  onChange={(e) =>
                    setReturnNotes(
                      e.target.value
                    )
                  }
                  disabled={returnLoading}
                  rows={3}
                  placeholder="Any additional instructions for staff/rider..."
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent"
                />

              </div>

              {/* WARNING */}

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                <p className="text-xs leading-5 text-yellow-800">
                  After submitting, staff/admin
                  will review the return and
                  assign a rider. The rider will
                  collect the package from the
                  customer and return it to your
                  company.
                </p>

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex gap-3 border-t px-6 py-4">

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
                onClick={
                  handleRequestReturn
                }
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

    </div>
  );
}

// =====================================================
// INFO COMPONENT
// =====================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value || "N/A"}
      </p>

    </div>
  );
}