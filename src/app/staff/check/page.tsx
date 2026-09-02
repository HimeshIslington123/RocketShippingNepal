
"use client";

import { useEffect, useState } from "react";

import ShipmentTable from "@/components/shipments/ShipmentTable";
import ShipmentModal from "@/components/shipments/ShipmentModal";
import ShipmentQRCode from "@/components/shipments/ShipmentQRCode";

import {
  Shipment,
  Rider,
} from "@/components/shipments/types";

const CARGO_COMPANY_NAME =
  "Rocket Shipping Cargo";

const STATUS_FLOW = [
  "CREATED",
  "IN_WAREHOUSE",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

// ============================================================
// HELPERS
// ============================================================

function formatStatus(status?: string) {
  if (!status) return "—";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatCurrency(amount?: number) {
  return `Rs. ${(Number(amount) || 0).toLocaleString()}`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";

  return new Date(iso).toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
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
  // STATUS
  // ============================================================

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusError, setStatusError] =
    useState("");

  // ============================================================
  // RIDERS
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
  // PRINT
  // ============================================================

  const [receiptShipment, setReceiptShipment] =
    useState<Shipment | null>(null);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadShipments();
  }, []);

  // ============================================================
  // LOAD SHIPMENTS
  // ============================================================

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

      const data =
        await res.json();

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

      const data =
        await res.json();

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
  // OPEN SHIPMENT
  // ============================================================

  async function openShipment(
    shipment: Shipment
  ) {
    setDetailsLoading(true);

    // Clear old messages
    setStatusMessage("");
    setStatusError("");

    setAssignMessage("");
    setAssignError("");

    // Clear old rider selection
    setSelectedRiderId("");

    // Open selected shipment
    setDetailsShipment(shipment);

    /*
     * ONLY load available riders when:
     *
     * status = IN_WAREHOUSE
     * AND rider has not already been assigned.
     *
     * Once a rider is assigned, the dropdown
     * should no longer be needed.
     */
    if (
      shipment.status ===
        "IN_WAREHOUSE" &&
      !shipment.rider
    ) {
      await loadRiders();
    }

    setDetailsLoading(false);
  }

  // ============================================================
  // CLOSE MODAL
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

    // ==========================================================
    // IMPORTANT BUSINESS RULE
    //
    // IN_WAREHOUSE -> ASSIGNED_TO_RIDER
    //
    // CANNOT happen through this status dropdown.
    //
    // It MUST happen through Assign Rider.
    // ==========================================================

    if (
      currentStatus ===
        "IN_WAREHOUSE" &&
      newStatus ===
        "ASSIGNED_TO_RIDER"
    ) {
      setStatusError(
        "Please assign a rider first. The shipment will automatically move to Assigned To Rider."
      );

      return;
    }

    // ==========================================================
    // CALCULATE EXPECTED NEXT STATUS
    // ==========================================================

    const currentIndex =
      STATUS_FLOW.indexOf(
        currentStatus
      );

    const expectedNextStatus =
      currentIndex >= 0 &&
      currentIndex <
        STATUS_FLOW.length - 1
        ? STATUS_FLOW[
            currentIndex + 1
          ]
        : null;

    // ==========================================================
    // VALIDATE TRANSITION
    // ==========================================================

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

      // ========================================================
      // UPDATE STATUS API
      // ========================================================

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

      // ========================================================
      // GET UPDATED SHIPMENT
      // ========================================================

      const updatedShipment =
        data?.shipment || data;

      // ========================================================
      // UPDATE MODAL
      // ========================================================

      if (updatedShipment) {
        setDetailsShipment(
          updatedShipment
        );

        // ======================================================
        // UPDATE TABLE
        // ======================================================

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

      // ========================================================
      // SUCCESS
      // ========================================================

      setStatusMessage(
        `Shipment moved to ${formatStatus(
          newStatus
        )} successfully.`
      );

      // Refresh table
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

    // ==========================================================
    // ONLY ALLOW ASSIGNMENT FROM IN_WAREHOUSE
    // ==========================================================

    if (
      detailsShipment.status !==
      "IN_WAREHOUSE"
    ) {
      setAssignError(
        "A rider can only be assigned when the shipment is in warehouse."
      );

      return;
    }

    // ==========================================================
    // RIDER MUST BE SELECTED
    // ==========================================================

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

      const riderId =
        Number(selectedRiderId);

      // ========================================================
      // FIND SELECTED RIDER
      // ========================================================

      const selectedRider =
        riders.find(
          (rider) =>
            rider.id === riderId
        );

      if (!selectedRider) {
        throw new Error(
          "Selected rider not found."
        );
      }

      // ========================================================
      // ASSIGN RIDER API
      // ========================================================

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/${detailsShipment.id}/assign-rider`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            riderId,
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

      // ========================================================
      // BACKEND RESPONSE
      // ========================================================

      const updatedShipment =
        data?.shipment || null;

      // ========================================================
      // USE BACKEND RIDER IF AVAILABLE
      // OTHERWISE USE SELECTED RIDER
      // ========================================================

      const finalRider =
        updatedShipment?.rider ||
        selectedRider;

      const finalRiderId =
        updatedShipment?.riderId ??
        riderId;

      /*
       * IMPORTANT:
       *
       * If backend returns a status, use it.
       *
       * Otherwise automatically use:
       *
       * ASSIGNED_TO_RIDER
       */

      const finalStatus =
        updatedShipment?.status ||
        "ASSIGNED_TO_RIDER";

      // ========================================================
      // UPDATE MODAL IMMEDIATELY
      // ========================================================

      setDetailsShipment(
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,

            // Rider
            rider: finalRider,

            // Rider ID
            riderId: finalRiderId,

            // AUTOMATIC STATUS CHANGE
            status: finalStatus,
          };
        }
      );

      // ========================================================
      // UPDATE TABLE IMMEDIATELY
      // ========================================================

      setShipments(
        (current) =>
          current.map(
            (item) => {
              if (
                item.id !==
                detailsShipment.id
              ) {
                return item;
              }

              return {
                ...item,

                rider: finalRider,

                riderId:
                  finalRiderId,

                // AUTOMATIC STATUS CHANGE
                status: finalStatus,
              };
            }
          )
      );

      // ========================================================
      // CLEAR RIDER DROPDOWN
      // ========================================================

      setSelectedRiderId("");

      // ========================================================
      // SUCCESS MESSAGE
      // ========================================================

      setAssignMessage(
        "Rider assigned successfully. Shipment moved to Assigned To Rider."
      );

      // ========================================================
      // REFRESH SHIPMENTS
      // ========================================================

      await loadShipments();

      // ========================================================
      // REFRESH RIDERS
      // ========================================================

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
  // PRINT RECEIPT
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
  // RENDER
  // ============================================================

  return (
    <>
      {/* ======================================================
          PRINT CSS
      ======================================================= */}

      <style jsx global>{`
        @media print {
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

          body * {
            visibility: hidden !important;
          }

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

        @media screen {
          #print-bill {
            display: none;
          }
        }
      `}</style>

      {/* ======================================================
          SHIPMENT TABLE
      ======================================================= */}

      <div className="no-print">
        <ShipmentTable
          shipments={shipments}
          loading={loading}
          error={error}
          onRefresh={loadShipments}
          onOpenShipment={openShipment}
          onPrint={printReceipt}
        />
      </div>

      {/* ======================================================
          SHIPMENT MODAL
      ======================================================= */}

      <div className="no-print">
        {detailsShipment && (
          <ShipmentModal
            shipment={detailsShipment}

            onClose={closeDetails}

            updatingStatus={
              updatingStatus
            }

            statusMessage={
              statusMessage
            }

            statusError={
              statusError
            }

            onUpdateStatus={
              updateShipmentStatus
            }

            riders={riders}

            ridersLoading={
              ridersLoading
            }

            selectedRiderId={
              selectedRiderId
            }

            setSelectedRiderId={
              setSelectedRiderId
            }

            assigningRider={
              assigningRider
            }

            assignError={
              assignError
            }

            assignMessage={
              assignMessage
            }

            onAssignRider={
              assignRiderToShipment
            }

            onPrint={printReceipt}
          />
        )}
      </div>

      {/* ======================================================
          PRINTABLE BILL
      ======================================================= */}

      {receiptShipment && (
        <div
          id="print-bill"
          className="text-black"
        >
          {/* COMPANY */}

          <div className="border-b-2 border-black pb-3">
            <div className="text-center">
              <h1 className="text-[18px] font-black uppercase leading-tight">
                {CARGO_COMPANY_NAME}
              </h1>

              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-gray-500">
                Shipment Receipt
              </p>
            </div>
          </div>

          {/* TRACKING */}

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

          {/* FROM / TO */}

          <div className="border-b py-3">
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

            <div className="my-2 text-center text-[11px] font-bold">
              ↓
            </div>

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

          {/* ADDRESS */}

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

          {/* DESTINATION */}

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

          {/* PACKAGE */}

          <div className="border-b py-3">
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <p className="text-[8px] font-semibold uppercase text-gray-500">
                  Package
                </p>

                <p className="mt-1 text-[10px] font-semibold">
                  {
                    receiptShipment
                      .packageType
                  }
                </p>
              </div>

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

          {/* SHIPPING CHARGE */}

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

          {/* QR */}

          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wider">
                Track Shipment
              </p>

              <p className="mt-1 text-[8px] leading-3 text-gray-500">
                Scan the QR code to see
                the latest shipment status.
              </p>

              <p className="mt-2 break-all text-[8px] font-bold">
                {
                  receiptShipment.trackingNumber
                }
              </p>
            </div>

            <div className="shrink-0 border border-black p-1">
              <ShipmentQRCode
                trackingNumber={
                  receiptShipment.trackingNumber
                }
                size={82}
              />
            </div>
          </div>

          {/* FOOTER */}

          <div className="border-t pt-3 text-center">
            <p className="text-[9px] font-semibold">
              Thank you for choosing{" "}
              {CARGO_COMPANY_NAME}.
            </p>

            <p className="mt-1 text-[7px] text-gray-500">
              Please keep this receipt for
              your reference.
            </p>

            <p className="mt-2 text-[7px] text-gray-400">
              {formatDate(
                receiptShipment.createdAt
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

