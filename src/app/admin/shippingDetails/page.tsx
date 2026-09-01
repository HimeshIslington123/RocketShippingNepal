"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

// ============================================================
// TYPES
// ============================================================

type Vendor = {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
  userId: number;
};

type Location = {
  id: number;
  name: string;
  zone?: string | null;
};

type DeliveryType = {
  id: number;
  name: string;
};

type LocationRate = {
  id: number;
  price: number;
  location: Location;
  deliveryType: DeliveryType;
};

type Rider = {
  id: number;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  vehicleNumber?: string | null;
  isAvailable?: boolean;
  userId: number;

  user?: {
    id: number;
    name: string;
    email: string;
  };
};

type Tracking = {
  id: string;
  status: string;
  createdAt: string;
  location?: string | null;
  message?: string | null;
  createdBy?: string | null;
};

type Shipment = {
  id: string;

  trackingNumber: string;

  qrCode?: string | null;

  receiverName: string;

  receiverPhone: string;

  receiverAddress: string;

  packageType: string;

  weight: number;

  paymentType: "PREPAID" | "COD";

  codAmount: number;

  shippingCharge: number;

  notes?: string | null;

  vendorId?: number | null;

  status: string;

  origin?: string;

  deliveryZone?: string | null;

  locationRateId?: number;

  createdAt: string;

  updatedAt?: string;

  vendor?: Vendor;

  createdByStaff?: {
    id: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };

  locationRate?: LocationRate | null;

  rider?: Rider | null;

  riderId?: number | null;

  trackings?: Tracking[];
};

// ============================================================
// COMPANY NAME
// ============================================================

const CARGO_COMPANY_NAME =
  "Rocket Shipping Cargo";

// ============================================================
// NORMAL DELIVERY FLOW
// ============================================================

const STATUS_FLOW = [
  "CREATED",
  "IN_WAREHOUSE",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

// ============================================================
// STATUS STYLES
// ============================================================

const STATUS_STYLES: Record<string, string> = {
  CREATED:
    "bg-gray-100 text-gray-700 ring-gray-600/20",

  IN_WAREHOUSE:
    "bg-amber-50 text-amber-700 ring-amber-600/20",

  ASSIGNED_TO_RIDER:
    "bg-blue-50 text-blue-700 ring-blue-600/20",

  OUT_FOR_DELIVERY:
    "bg-orange-50 text-orange-700 ring-orange-600/20",

  DELIVERED:
    "bg-green-50 text-green-700 ring-green-600/20",

  RETURNED:
    "bg-yellow-50 text-yellow-700 ring-yellow-700/20",

  CANCELLED:
    "bg-red-50 text-red-700 ring-red-600/20",
};

// ============================================================
// TIMELINE
// ============================================================

const STEPS = [
  "CREATED",
  "IN_WAREHOUSE",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

// ============================================================
// HELPERS
// ============================================================

function formatDate(iso?: string) {
  if (!iso) return "—";

  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(amount?: number) {
  return `Rs. ${(Number(amount) || 0).toLocaleString()}`;
}

function formatStatus(status?: string) {
  if (!status) return "—";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusStyle(status?: string) {
  return (
    STATUS_STYLES[status || ""] ||
    "bg-gray-50 text-gray-700 ring-gray-600/20"
  );
}

// ============================================================
// GET NEXT STATUS
// ============================================================

function getNextStatus(status?: string) {
  if (!status) return null;

  const currentIndex =
    STATUS_FLOW.indexOf(status);

  if (currentIndex === -1) {
    return null;
  }

  if (
    currentIndex >=
    STATUS_FLOW.length - 1
  ) {
    return null;
  }

  return STATUS_FLOW[currentIndex + 1];
}

// ============================================================
// TERMINAL STATUS
// ============================================================

function isTerminalStatus(status?: string) {
  return (
    status === "DELIVERED" ||
    status === "RETURNED" ||
    status === "CANCELLED"
  );
}

// ============================================================
// PAGE
// ============================================================

export default function VendorShipmentsPage() {
  // ============================================================
  // SHIPMENTS
  // ============================================================

  const [shipments, setShipments] =
    useState<Shipment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // DETAILS
  // ============================================================

  const [detailsShipment, setDetailsShipment] =
    useState<Shipment | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  // ============================================================
  // STATUS UPDATE
  // ============================================================

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusError, setStatusError] =
    useState("");

  // ============================================================
  // RIDER ASSIGNMENT
  // ============================================================

  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [ridersLoading, setRidersLoading] =
    useState(false);

  const [selectedRiderId, setSelectedRiderId] =
    useState("");

  const [assigningRider, setAssigningRider] =
    useState(false);

  const [assignError, setAssignError] =
    useState("");

  const [assignMessage, setAssignMessage] =
    useState("");

  // ============================================================
  // PRINT RECEIPT
  // ============================================================

  const [receiptShipment, setReceiptShipment] =
    useState<Shipment | null>(null);

  // ============================================================
  // LOAD SHIPMENTS
  // ============================================================

  useEffect(() => {
    loadShipments();
  }, []);

  async function loadShipments() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const data =
          await res.json().catch(() => null);

        throw new Error(
          data?.message ||
            `Failed to load shipments (${res.status})`
        );
      }

      const data = await res.json();

      setShipments(
        data.shipments || []
      );
    } catch (err) {
      console.error(
        "LOAD SHIPMENTS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not load shipments."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOAD RIDERS
  // ============================================================

  async function loadRiders() {
    try {
      setRidersLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rider/`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const data =
          await res.json().catch(() => null);

        throw new Error(
          data?.message ||
            `Failed to load riders (${res.status})`
        );
      }

      const data = await res.json();

      setRiders(
        Array.isArray(data)
          ? data
          : data.riders || []
      );
    } catch (err) {
      console.error(
        "LOAD RIDERS ERROR:",
        err
      );

      setRiders([]);
    } finally {
      setRidersLoading(false);
    }
  }

  // ============================================================
  // OPEN DETAILS
  // ============================================================

  async function openShipment(
    shipment: Shipment
  ) {
    setDetailsLoading(true);

    setStatusMessage("");
    setStatusError("");

    setAssignMessage("");
    setAssignError("");

    setSelectedRiderId("");

    setDetailsShipment(shipment);

    if (
      shipment.status ===
      "IN_WAREHOUSE"
    ) {
      await loadRiders();
    }

    setDetailsLoading(false);
  }

  // ============================================================
  // CLOSE DETAILS
  // ============================================================

  function closeDetails() {
    if (
      updatingStatus ||
      assigningRider
    ) {
      return;
    }

    setDetailsShipment(null);

    setStatusMessage("");
    setStatusError("");

    setAssignMessage("");
    setAssignError("");

    setSelectedRiderId("");
  }

  // ============================================================
  // NEXT STATUS
  // ============================================================

  const nextStatus = useMemo(() => {
    return getNextStatus(
      detailsShipment?.status
    );
  }, [detailsShipment?.status]);

  // ============================================================
  // CAN ASSIGN RIDER
  // ============================================================

  const canAssignRider =
    detailsShipment?.status ===
    "IN_WAREHOUSE";

  // ============================================================
  // AVAILABLE RIDERS
  // ============================================================

  const availableRiders =
    riders.filter(
      (rider) =>
        rider.isAvailable !== false
    );

  // ============================================================
  // UPDATE SHIPMENT STATUS
  // ============================================================

  async function updateShipmentStatus(
    newStatus: string
  ) {
    if (!detailsShipment) {
      return;
    }

    const currentStatus =
      detailsShipment.status;

    const expectedNextStatus =
      getNextStatus(currentStatus);

    if (
      newStatus !==
      expectedNextStatus
    ) {
      setStatusError(
        `Invalid status transition. Shipment must move from ${formatStatus(
          currentStatus
        )} to ${formatStatus(
          expectedNextStatus || ""
        )}.`
      );

      return;
    }

    try {
      setUpdatingStatus(true);

      setStatusMessage("");
      setStatusError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/${detailsShipment.id}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: newStatus,

            location:
              detailsShipment
                .locationRate
                ?.location?.name ||
              "Main Office",

            message: `Shipment moved from ${formatStatus(
              currentStatus
            )} to ${formatStatus(
              newStatus
            )}`,
          }),
        }
      );

      const data =
        await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to update status (${res.status})`
        );
      }

      const updatedShipment =
        data?.shipment || data;

      if (updatedShipment) {
        setDetailsShipment(
          updatedShipment
        );

        setShipments((current) =>
          current.map((item) =>
            item.id ===
            updatedShipment.id
              ? updatedShipment
              : item
          )
        );
      } else {
        setDetailsShipment(
          (previous) =>
            previous
              ? {
                  ...previous,
                  status: newStatus,
                }
              : previous
        );

        setShipments((current) =>
          current.map((item) =>
            item.id ===
            detailsShipment.id
              ? {
                  ...item,
                  status: newStatus,
                }
              : item
          )
        );
      }

      setStatusMessage(
        `Shipment moved to ${formatStatus(
          newStatus
        )} successfully.`
      );

      await loadShipments();
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      setStatusError(
        err instanceof Error
          ? err.message
          : "Failed to update shipment status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ============================================================
  // ASSIGN RIDER
  // ============================================================

  async function assignRiderToShipment() {
    if (!detailsShipment) {
      return;
    }

    if (
      detailsShipment.status !==
      "IN_WAREHOUSE"
    ) {
      setAssignError(
        "A rider can only be assigned when the shipment is in warehouse."
      );

      return;
    }

    if (!selectedRiderId) {
      setAssignError(
        "Please select a rider."
      );

      return;
    }

    try {
      setAssigningRider(true);

      setAssignError("");
      setAssignMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/${detailsShipment.id}/assign-rider`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            riderId:
              Number(selectedRiderId),
          }),
        }
      );

      const data =
        await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to assign rider (${res.status})`
        );
      }

      const updatedShipment =
        data?.shipment;

      const selectedRider =
        riders.find(
          (rider) =>
            rider.id ===
            Number(selectedRiderId)
        );

      setDetailsShipment((previous) =>
        previous
          ? {
              ...previous,

              rider:
                updatedShipment?.rider ||
                selectedRider ||
                previous.rider,

              riderId:
                updatedShipment?.riderId ||
                Number(selectedRiderId),

              status:
                updatedShipment?.status ||
                "ASSIGNED_TO_RIDER",
            }
          : previous
      );

      setShipments((current) =>
        current.map((item) =>
          item.id === detailsShipment.id
            ? {
                ...item,

                rider:
                  updatedShipment?.rider ||
                  selectedRider ||
                  item.rider,

                riderId:
                  updatedShipment?.riderId ||
                  Number(selectedRiderId),

                status:
                  updatedShipment?.status ||
                  "ASSIGNED_TO_RIDER",
              }
            : item
        )
      );

      setAssignMessage(
        "Rider assigned successfully. Shipment moved to Rider Assigned."
      );

      setSelectedRiderId("");

      await loadShipments();

      await loadRiders();
    } catch (err) {
      console.error(
        "ASSIGN RIDER ERROR:",
        err
      );

      setAssignError(
        err instanceof Error
          ? err.message
          : "Failed to assign rider."
      );
    } finally {
      setAssigningRider(false);
    }
  }

  // ============================================================
  // PRINT BILL
  // ============================================================

  function printReceipt(
    shipment: Shipment,
    e?: React.MouseEvent
  ) {
    e?.stopPropagation();

    setReceiptShipment(shipment);

    setTimeout(() => {
      window.print();
    }, 150);
  }

  // ============================================================
  // COMPLETED TRACKING STEPS
  // ============================================================

  const completedSteps =
    detailsShipment?.trackings?.map(
      (tracking) => tracking.status
    ) || [];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="mx-auto max-w-7xl text-black">

      {/* ======================================================
          PRINT CSS
      ======================================================= */}

      <style jsx global>{`

        @media print {

          /*
           * 80mm thermal / compact receipt
           */

          @page {
            size: 80mm auto;
            margin: 0;
          }

          html,
          body {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            overflow: visible !important;
          }

          /*
           * Hide everything
           */

          body * {
            visibility: hidden !important;
          }

          /*
           * Show only bill
           */

          #print-bill,
          #print-bill * {
            visibility: visible !important;
          }

          #print-bill {
            display: block !important;

            position: absolute !important;

            left: 0 !important;

            top: 0 !important;

            width: 80mm !important;

            min-height: auto !important;

            margin: 0 !important;

            padding: 5mm !important;

            box-sizing: border-box !important;

            background: white !important;

            color: black !important;

            border: none !important;

            box-shadow: none !important;
          }
        }

        /*
         * Hide printable bill normally.
         */

        @media screen {

          #print-bill {
            display: none;
          }

        }
      `}</style>

      {/* ======================================================
          NORMAL PAGE
      ======================================================= */}

      <div className="no-print">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              Shipments
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage shipments through the
              delivery workflow.
            </p>

          </div>

          <button
            onClick={loadShipments}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* ====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">

            <p className="text-sm text-gray-500">
              Loading shipments...
            </p>

          </div>
        )}

        {/* ====================================================
            TABLE
        ===================================================== */}

        {!loading && !error && (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">

            <table className="min-w-full divide-y divide-gray-200 text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-4 py-3 text-left font-semibold">
                    Tracking #
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Receiver
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Destination
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Package
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Payment
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Charge
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Rider
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    Receipt
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {shipments.length === 0 && (
                  <tr>

                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      No shipments found.
                    </td>

                  </tr>
                )}

                {shipments.map(
                  (shipment) => (
                    <tr
                      key={shipment.id}
                      onClick={() =>
                        openShipment(
                          shipment
                        )
                      }
                      className="cursor-pointer hover:bg-gray-50"
                    >

                      {/* TRACKING */}

                      <td className="px-4 py-4">

                        <p className="font-semibold">
                          {
                            shipment.trackingNumber
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(
                            shipment.createdAt
                          )}
                        </p>

                      </td>

                      {/* RECEIVER */}

                      <td className="px-4 py-4">

                        <p className="font-medium">
                          {
                            shipment.receiverName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            shipment.receiverPhone
                          }
                        </p>

                      </td>

                      {/* DESTINATION */}

                      <td className="px-4 py-4">

                        <p className="font-medium">
                          {
                            shipment
                              .locationRate
                              ?.location?.name ||
                            "—"
                          }
                        </p>

                        {shipment.locationRate
                          ?.deliveryType && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              shipment
                                .locationRate
                                .deliveryType
                                .name
                            }
                          </p>
                        )}

                      </td>

                      {/* PACKAGE */}

                      <td className="px-4 py-4">

                        <p className="font-medium">
                          {
                            shipment.packageType
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {shipment.weight} kg
                        </p>

                      </td>

                      {/* PAYMENT */}

                      <td className="px-4 py-4">

                        <p className="font-medium">
                          {
                            shipment.paymentType
                          }
                        </p>

                        {shipment.paymentType ===
                          "COD" && (
                          <p className="mt-1 text-xs text-gray-400">
                            COD{" "}
                            {formatCurrency(
                              shipment.codAmount
                            )}
                          </p>
                        )}

                      </td>

                      {/* CHARGE */}

                      <td className="px-4 py-4 font-medium">
                        {formatCurrency(
                          shipment.shippingCharge
                        )}
                      </td>

                      {/* RIDER */}

                      <td className="px-4 py-4">

                        {shipment.rider ? (
                          <>
                            <p className="font-medium">
                              {
                                shipment.rider
                                  .user
                                  ?.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {
                                shipment.rider.phone
                              }
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Unassigned
                          </span>
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                            shipment.status
                          )}`}
                        >
                          {formatStatus(
                            shipment.status
                          )}
                        </span>

                      </td>

                      {/* PRINT BILL */}

                      <td className="px-4 py-4 text-right">

                        <button
                          onClick={(e) =>
                            printReceipt(
                              shipment,
                              e
                            )
                          }
                          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-dark"
                        >
                          Print Bill
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ======================================================
          DETAILS MODAL
      ======================================================= */}

      {(detailsLoading ||
        detailsShipment) && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetails}
        >

          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ==================================================
                LOADING
            =================================================== */}

            {detailsLoading && (
              <div className="p-10 text-center">

                <p className="text-sm text-gray-500">
                  Loading shipment...
                </p>

              </div>
            )}

            {/* ==================================================
                DETAILS
            =================================================== */}

            {!detailsLoading &&
              detailsShipment && (
                <>

                  {/* ==================================================
                      HEADER
                  =================================================== */}

                  <div className="flex items-start justify-between border-b px-6 py-5">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Tracking Number
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        {
                          detailsShipment.trackingNumber
                        }
                      </h2>

                      <div className="mt-2">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                            detailsShipment.status
                          )}`}
                        >
                          {formatStatus(
                            detailsShipment.status
                          )}
                        </span>

                      </div>

                    </div>

                    <button
                      onClick={closeDetails}
                      disabled={
                        updatingStatus ||
                        assigningRider
                      }
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                    >
                      ✕
                    </button>

                  </div>

                  {/* ==================================================
                      CONTENT
                  =================================================== */}

                  <div className="grid gap-6 p-6 md:grid-cols-3">

                    {/* ==================================================
                        LEFT
                    =================================================== */}

                    <div className="md:col-span-2">

                      {/* SHIPMENT INFORMATION */}

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Shipment Information
                        </p>

                        <div className="mt-4 rounded-xl border">

                          <div className="grid grid-cols-2 divide-x divide-y">

                            <InfoItem
                              label="Receiver"
                              value={
                                detailsShipment.receiverName
                              }
                            />

                            <InfoItem
                              label="Phone"
                              value={
                                detailsShipment.receiverPhone
                              }
                            />

                            <InfoItem
                              label="Package"
                              value={`${detailsShipment.packageType} · ${detailsShipment.weight} kg`}
                            />

                            <InfoItem
                              label="Payment"
                              value={
                                detailsShipment.paymentType
                              }
                            />

                            {detailsShipment.paymentType ===
                              "COD" && (
                              <InfoItem
                                label="COD Amount"
                                value={formatCurrency(
                                  detailsShipment.codAmount
                                )}
                              />
                            )}

                            <InfoItem
                              label="Shipping Charge"
                              value={formatCurrency(
                                detailsShipment.shippingCharge
                              )}
                            />

                            <InfoItem
                              label="Destination"
                              value={
                                detailsShipment
                                  .locationRate
                                  ?.location
                                  ?.name ||
                                "—"
                              }
                            />

                            <InfoItem
                              label="Delivery Type"
                              value={
                                detailsShipment
                                  .locationRate
                                  ?.deliveryType
                                  ?.name ||
                                "—"
                              }
                            />

                            <InfoItem
                              label="Zone"
                              value={
                                detailsShipment.deliveryZone ||
                                detailsShipment
                                  .locationRate
                                  ?.location
                                  ?.zone ||
                                "—"
                              }
                            />

                            <InfoItem
                              label="Origin"
                              value={
                                detailsShipment.origin ||
                                "—"
                              }
                            />

                            <InfoItem
                              label="Created"
                              value={formatDate(
                                detailsShipment.createdAt
                              )}
                            />

                            <div className="col-span-2 px-4 py-4">

                              <p className="text-xs text-gray-400">
                                Receiver Address
                              </p>

                              <p className="mt-1 text-sm font-medium">
                                {
                                  detailsShipment.receiverAddress
                                }
                              </p>

                            </div>

                            {detailsShipment.notes && (
                              <div className="col-span-2 border-t px-4 py-4">

                                <p className="text-xs text-gray-400">
                                  Notes
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                  {
                                    detailsShipment.notes
                                  }
                                </p>

                              </div>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* ==================================================
                          TRACKING TIMELINE
                      =================================================== */}

                      <div className="mt-8 border-t pt-6">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Shipment Tracking
                        </p>

                        <div className="mt-5 space-y-4">

                          {STEPS.map(
                            (step, index) => {

                              const done =
                                completedSteps.includes(
                                  step
                                );

                              const record =
                                detailsShipment.trackings?.find(
                                  (
                                    tracking
                                  ) =>
                                    tracking.status ===
                                    step
                                );

                              const current =
                                detailsShipment.status ===
                                step;

                              return (
                                <div
                                  key={
                                    step
                                  }
                                  className="flex gap-4"
                                >

                                  <div className="flex flex-col items-center">

                                    <div
                                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                        done
                                          ? "bg-green-100 text-green-700"
                                          : current
                                          ? "bg-accent/10 text-accent"
                                          : "bg-gray-100 text-gray-400"
                                      }`}
                                    >
                                      {done
                                        ? "✓"
                                        : current
                                        ? "•"
                                        : "○"}
                                    </div>

                                    {index <
                                      STEPS.length -
                                        1 && (
                                      <div
                                        className={`mt-1 h-8 w-px ${
                                          done
                                            ? "bg-green-200"
                                            : "bg-gray-200"
                                        }`}
                                      />
                                    )}

                                  </div>

                                  <div className="pb-3">

                                    <p
                                      className={`text-sm font-semibold ${
                                        done
                                          ? "text-gray-900"
                                          : current
                                          ? "text-accent"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {formatStatus(
                                        step
                                      )}
                                    </p>

                                    {record && (
                                      <>
                                        <p className="mt-1 text-xs text-gray-400">
                                          {formatDate(
                                            record.createdAt
                                          )}

                                          {record.location
                                            ? ` · ${record.location}`
                                            : ""}
                                        </p>

                                        {record.message && (
                                          <p className="mt-1 text-xs text-gray-500">
                                            {
                                              record.message
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

                      </div>

                      {/* ==================================================
                          TRACKING HISTORY
                      =================================================== */}

                      {detailsShipment.trackings &&
                        detailsShipment
                          .trackings
                          .length > 0 && (
                          <div className="mt-8 border-t pt-6">

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Tracking History
                            </p>

                            <div className="mt-4 space-y-2">

                              {detailsShipment.trackings.map(
                                (
                                  tracking
                                ) => (
                                  <div
                                    key={
                                      tracking.id
                                    }
                                    className="rounded-xl bg-gray-50 p-3"
                                  >

                                    <div className="flex items-center justify-between gap-3">

                                      <span className="text-xs font-semibold">
                                        {formatStatus(
                                          tracking.status
                                        )}
                                      </span>

                                      <span className="text-xs text-gray-400">
                                        {formatDate(
                                          tracking.createdAt
                                        )}
                                      </span>

                                    </div>

                                    {tracking.location && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        Location:{" "}
                                        {
                                          tracking.location
                                        }
                                      </p>
                                    )}

                                    {tracking.message && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {
                                          tracking.message
                                        }
                                      </p>
                                    )}

                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                    </div>

                    {/* ==================================================
                        RIGHT
                    =================================================== */}

                    <div>

                      {/* STATUS */}

                      <div className="rounded-xl border p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Update Shipment Status
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Move the shipment through
                          the inside-valley delivery
                          process.
                        </p>

                        <div className="mt-4">

                          <select
                            value={
                              detailsShipment.status
                            }
                            onChange={(e) =>
                              updateShipmentStatus(
                                e.target.value
                              )
                            }
                            disabled={
                              updatingStatus ||
                              !nextStatus ||
                              isTerminalStatus(
                                detailsShipment.status
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                          >

                            <option
                              value={
                                detailsShipment.status
                              }
                            >
                              {formatStatus(
                                detailsShipment.status
                              )}
                            </option>

                            {nextStatus && (
                              <option
                                value={
                                  nextStatus
                                }
                              >
                                Move to{" "}
                                {formatStatus(
                                  nextStatus
                                )}
                              </option>
                            )}

                          </select>

                        </div>

                        {nextStatus && (
                          <div className="mt-3 rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-400">
                              Next step
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-700">
                              {formatStatus(
                                nextStatus
                              )}
                            </p>

                          </div>
                        )}

                        {!nextStatus &&
                          detailsShipment.status ===
                            "DELIVERED" && (
                          <div className="mt-3 rounded-lg bg-green-50 p-3">

                            <p className="text-xs font-medium text-green-700">
                              Shipment has been
                              delivered.
                            </p>

                          </div>
                        )}

                        {updatingStatus && (
                          <p className="mt-2 text-xs text-gray-500">
                            Updating shipment...
                          </p>
                        )}

                        {statusMessage && (
                          <div className="mt-3 rounded-lg bg-green-50 p-3">

                            <p className="text-xs font-medium text-green-700">
                              {
                                statusMessage
                              }
                            </p>

                          </div>
                        )}

                        {statusError && (
                          <div className="mt-3 rounded-lg bg-red-50 p-3">

                            <p className="text-xs font-medium text-red-700">
                              {statusError}
                            </p>

                          </div>
                        )}

                      </div>

                      {/* CURRENT STATUS */}

                      <div className="mt-4 rounded-xl border p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Current Status
                        </p>

                        <span
                          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                            detailsShipment.status
                          )}`}
                        >
                          {formatStatus(
                            detailsShipment.status
                          )}
                        </span>

                      </div>

                      {/* QR */}

                      <div className="mt-4 rounded-xl border p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Track Shipment
                        </p>

                        <div className="mt-4 flex justify-center">

                          <div className="rounded-xl border bg-white p-3">

                            <QRCode
                              value={`${process.env.NEXT_PUBLIC_APP_URL}/track/${detailsShipment.trackingNumber}`}
                              size={150}
                            />

                          </div>

                        </div>

                        <p className="mt-3 text-center text-xs text-gray-400">
                          Scan QR code to track
                          this shipment.
                        </p>

                      </div>

                      {/* PRINT */}

                      <button
                        onClick={() =>
                          printReceipt(
                            detailsShipment
                          )
                        }
                        className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
                      >
                        Print Bill
                      </button>

                      {/* RIDER */}

                      <div className="mt-4 rounded-xl border p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Delivery Rider
                        </p>

                        {detailsShipment.rider ? (
                          <div className="mt-3 space-y-2">

                            <div className="flex justify-between gap-3">

                              <span className="text-xs text-gray-400">
                                Name
                              </span>

                              <span className="text-right text-sm font-medium">
                                {
                                  detailsShipment
                                    .rider.user
                                    ?.name
                                }
                              </span>

                            </div>

                            <div className="flex justify-between gap-3">

                              <span className="text-xs text-gray-400">
                                Phone
                              </span>

                              <span className="text-right text-sm font-medium">
                                {
                                  detailsShipment
                                    .rider.phone
                                }
                              </span>

                            </div>

                            {detailsShipment
                              .rider
                              .vehicleNumber && (
                              <div className="flex justify-between gap-3">

                                <span className="text-xs text-gray-400">
                                  Vehicle
                                </span>

                                <span className="text-right text-sm font-medium">
                                  {
                                    detailsShipment
                                      .rider
                                      .vehicleNumber
                                  }
                                </span>

                              </div>
                            )}

                            <div className="border-t pt-3">

                              <p className="text-xs text-gray-400">
                                Live Location
                              </p>

                              {detailsShipment
                                .rider
                                .latitude !=
                                null &&
                              detailsShipment
                                .rider
                                .longitude !=
                                null ? (
                                <p className="mt-1 text-xs font-medium">
                                  {
                                    detailsShipment
                                      .rider
                                      .latitude
                                  }
                                  ,{" "}
                                  {
                                    detailsShipment
                                      .rider
                                      .longitude
                                  }
                                </p>
                              ) : (
                                <p className="mt-1 text-xs text-gray-400">
                                  Location not
                                  available
                                </p>
                              )}

                            </div>

                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-gray-400">
                            No rider has been
                            assigned yet.
                          </p>
                        )}

                        {/* ASSIGN RIDER */}

                        {canAssignRider && (
                          <div className="mt-4 border-t pt-4">

                            <p className="text-xs text-gray-400">
                              Assign a rider
                            </p>

                            <select
                              value={
                                selectedRiderId
                              }
                              onChange={(e) =>
                                setSelectedRiderId(
                                  e.target.value
                                )
                              }
                              disabled={
                                ridersLoading ||
                                assigningRider
                              }
                              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >

                              <option value="">
                                {ridersLoading
                                  ? "Loading riders..."
                                  : "Select a rider"}
                              </option>

                              {availableRiders.map(
                                (
                                  rider
                                ) => (
                                  <option
                                    key={
                                      rider.id
                                    }
                                    value={
                                      rider.id
                                    }
                                  >
                                    {
                                      rider.user
                                        ?.name
                                    }{" "}
                                    —{" "}
                                    {
                                      rider.phone
                                    }

                                    {rider.vehicleNumber
                                      ? ` (${rider.vehicleNumber})`
                                      : ""}
                                  </option>
                                )
                              )}

                            </select>

                            <button
                              onClick={
                                assignRiderToShipment
                              }
                              disabled={
                                !selectedRiderId ||
                                assigningRider ||
                                ridersLoading
                              }
                              className="mt-3 w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {assigningRider
                                ? "Assigning..."
                                : "Assign Rider"}
                            </button>

                            {assignMessage && (
                              <div className="mt-3 rounded-lg bg-green-50 p-3">

                                <p className="text-xs font-medium text-green-700">
                                  {
                                    assignMessage
                                  }
                                </p>

                              </div>
                            )}

                            {assignError && (
                              <div className="mt-3 rounded-lg bg-red-50 p-3">

                                <p className="text-xs font-medium text-red-700">
                                  {assignError}
                                </p>

                              </div>
                            )}

                            {!ridersLoading &&
                              availableRiders.length ===
                                0 && (
                                <p className="mt-3 text-xs text-gray-400">
                                  No available
                                  riders right
                                  now.
                                </p>
                              )}

                          </div>
                        )}

                        {detailsShipment.rider &&
                          !canAssignRider && (
                            <div className="mt-4 border-t pt-4">

                              <p className="text-xs text-gray-400">
                                Rider assignment
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Rider has already
                                been assigned to
                                this shipment.
                              </p>

                            </div>
                          )}

                      </div>

                    </div>

                  </div>

                </>
              )}

          </div>

        </div>
      )}

      {/* ======================================================
          PRINTABLE BILL
      ======================================================= */}

      {receiptShipment && (
        <div
          id="print-bill"
          className="text-black"
        >

          {/* ==================================================
              COMPANY HEADER
          =================================================== */}

          <div className="border-b-2 border-black pb-3">

            <div className="text-center">

              {/* FIXED CARGO COMPANY NAME */}

              <h1 className="text-[18px] font-black uppercase leading-tight">
                {CARGO_COMPANY_NAME}
              </h1>

              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-gray-500">
                Shipment Receipt
              </p>

            </div>

          </div>

          {/* ==================================================
              TRACKING
          =================================================== */}

          <div className="border-b py-3 text-center">

            <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">
              Tracking Number
            </p>

            <p className="mt-1 text-[16px] font-black tracking-wide">
              {
                receiptShipment.trackingNumber
              }
            </p>

          </div>

          {/* ==================================================
              FROM / TO
          =================================================== */}

          <div className="border-b py-3">

            {/* FROM */}

            <div>

              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                From / Sender
              </p>

              <p className="mt-1 text-[12px] font-bold">
                {
                  receiptShipment.vendor
                    ?.companyName ||
                  "Vendor"
                }
              </p>

              {receiptShipment.vendor
                ?.location && (
                <p className="mt-1 text-[9px] text-gray-500">
                  {
                    receiptShipment.vendor
                      .location
                  }
                </p>
              )}

            </div>

            {/* ARROW */}

            <div className="my-2 text-center text-[11px] font-bold">
              ↓
            </div>

            {/* TO */}

            <div>

              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                To / Receiver
              </p>

              <p className="mt-1 text-[12px] font-bold">
                {
                  receiptShipment.receiverName
                }
              </p>

              <p className="mt-1 text-[10px]">
                {
                  receiptShipment.receiverPhone
                }
              </p>

            </div>

          </div>

          {/* ==================================================
              ADDRESS
          =================================================== */}

          <div className="border-b py-3">

            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
              Delivery Address
            </p>

            <p className="mt-1 break-words text-[10px] leading-4">
              {
                receiptShipment.receiverAddress
              }
            </p>

          </div>

          {/* ==================================================
              DESTINATION
          =================================================== */}

          <div className="border-b py-3">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[8px] font-semibold uppercase text-gray-500">
                  Destination
                </p>

                <p className="mt-1 text-[11px] font-bold">
                  {
                    receiptShipment
                      .locationRate
                      ?.location?.name ||
                    "—"
                  }
                </p>

              </div>

              <div className="text-right">

                <p className="text-[8px] font-semibold uppercase text-gray-500">
                  Delivery Type
                </p>

                <p className="mt-1 text-[10px] font-semibold">
                  {
                    receiptShipment
                      .locationRate
                      ?.deliveryType
                      ?.name ||
                    "—"
                  }
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              PACKAGE
          =================================================== */}

          <div className="border-b py-3">

            <div className="grid grid-cols-2 gap-y-3">

              {/* PACKAGE */}

              <div>

                <p className="text-[8px] font-semibold uppercase text-gray-500">
                  Package
                </p>

                <p className="mt-1 text-[10px] font-semibold">
                  {
                    receiptShipment.packageType
                  }
                </p>

              </div>

              {/* WEIGHT */}

              <div className="text-right">

                <p className="text-[8px] font-semibold uppercase text-gray-500">
                  Weight
                </p>

                <p className="mt-1 text-[10px] font-semibold">
                  {
                    receiptShipment.weight
                  }{" "}
                  kg
                </p>

              </div>

              {/* PAYMENT */}

              <div>

                <p className="text-[8px] font-semibold uppercase text-gray-500">
                  Payment
                </p>

                <p className="mt-1 text-[10px] font-semibold">
                  {
                    receiptShipment.paymentType
                  }
                </p>

              </div>

              {/* COD */}

              {receiptShipment.paymentType ===
                "COD" && (
                <div className="text-right">

                  <p className="text-[8px] font-semibold uppercase text-gray-500">
                    COD Amount
                  </p>

                  <p className="mt-1 text-[11px] font-bold">
                    {formatCurrency(
                      receiptShipment.codAmount
                    )}
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* ==================================================
              SHIPPING CHARGE
          =================================================== */}

          <div className="border-b py-3">

            <div className="flex items-center justify-between">

              <span className="text-[11px] font-bold">
                Shipping Charge
              </span>

              <span className="text-[14px] font-black">
                {formatCurrency(
                  receiptShipment.shippingCharge
                )}
              </span>

            </div>

          </div>

          {/* ==================================================
              QR SECTION
          =================================================== */}

          <div className="flex items-center justify-between gap-4 py-4">

            <div className="flex-1">

              <p className="text-[9px] font-bold uppercase tracking-wider">
                Track Shipment
              </p>

              <p className="mt-1 text-[8px] leading-3 text-gray-500">
                Scan the QR code to see
                the latest shipment
                status.
              </p>

              <p className="mt-2 break-all text-[8px] font-bold">
                {
                  receiptShipment.trackingNumber
                }
              </p>

            </div>

            <div className="shrink-0 border border-black p-1">

              <QRCode
                value={`${process.env.NEXT_PUBLIC_APP_URL}/track/${receiptShipment.trackingNumber}`}
                size={82}
              />

            </div>

          </div>

          {/* ==================================================
              FOOTER
          =================================================== */}

          <div className="border-t pt-3 text-center">

            <p className="text-[9px] font-semibold">
              Thank you for choosing{" "}
              {CARGO_COMPANY_NAME}.
            </p>

            <p className="mt-1 text-[7px] text-gray-500">
              Please keep this receipt
              for your reference.
            </p>

            <p className="mt-2 text-[7px] text-gray-400">
              {formatDate(
                receiptShipment.createdAt
              )}
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-4 py-4">

      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}