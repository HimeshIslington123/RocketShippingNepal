"use client";

import QRCode from "react-qr-code";
import { Shipment, Rider } from "./types";

type ShipmentModalProps = {
  shipment: Shipment | null;

  onClose: () => void;

  updatingStatus: boolean;

  statusMessage: string;

  statusError: string;

  onUpdateStatus: (newStatus: string) => void;

  riders: Rider[];

  ridersLoading: boolean;

  selectedRiderId: string;

  setSelectedRiderId: (value: string) => void;

  assigningRider: boolean;

  assignError: string;

  assignMessage: string;

  onAssignRider: () => void;

  onPrint: (shipment: Shipment) => void;
};

/* =========================================================
   STATUS FLOW
========================================================= */

const STATUS_FLOW = [
  "CREATED",
  "IN_WAREHOUSE",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STEPS = [
  "CREATED",
  "IN_WAREHOUSE",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

/* =========================================================
   STATUS STYLES
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function formatDate(iso?: string | null) {
  if (!iso) {
    return "—";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(
  amount?: number | null
) {
  return `Rs. ${(Number(amount) || 0).toLocaleString()}`;
}

function formatStatus(status?: string | null) {
  if (!status) {
    return "—";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusStyle(
  status?: string | null
) {
  return (
    STATUS_STYLES[status || ""] ||
    "bg-gray-50 text-gray-700 ring-gray-600/20"
  );
}

function getNextStatus(
  status?: string | null
) {
  if (!status) {
    return null;
  }

  const index =
    STATUS_FLOW.indexOf(status);

  if (index === -1) {
    return null;
  }

  if (
    index >=
    STATUS_FLOW.length - 1
  ) {
    return null;
  }

  return STATUS_FLOW[index + 1];
}

function isTerminalStatus(
  status?: string | null
) {
  return (
    status === "DELIVERED" ||
    status === "RETURNED" ||
    status === "CANCELLED"
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ShipmentModal({
  shipment,
  onClose,
  updatingStatus,
  statusMessage,
  statusError,
  onUpdateStatus,
  riders,
  ridersLoading,
  selectedRiderId,
  setSelectedRiderId,
  assigningRider,
  assignError,
  assignMessage,
  onAssignRider,
  onPrint,
}: ShipmentModalProps) {
  if (!shipment) {
    return null;
  }

  /* =======================================================
     STATUS
  ======================================================= */

  const nextStatus =
    getNextStatus(shipment.status);

  const canAssignRider =
    shipment.status === "IN_WAREHOUSE";

  /* =======================================================
     RIDERS
  ======================================================= */

  const availableRiders =
    riders.filter(
      (rider) =>
        rider.isAvailable !== false
    );

  /* =======================================================
     TRACKING
  ======================================================= */

  const completedSteps =
    shipment.trackings?.map(
      (tracking) => tracking.status
    ) || [];

  /* =======================================================
     TRACKING URL
  ======================================================= */

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "";

  const trackingUrl =
    `${appUrl}/track/${shipment.trackingNumber}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-black"
      onClick={onClose}
    >
      {/* ===================================================
          MODAL
      =================================================== */}

      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Tracking Number
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {shipment.trackingNumber ||
                "—"}
            </h2>

            <div className="mt-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                  shipment.status
                )}`}
              >
                {formatStatus(
                  shipment.status
                )}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={
              updatingStatus ||
              assigningRider
            }
            type="button"
            aria-label="Close"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-6 p-6 md:grid-cols-3">
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="md:col-span-2">
            {/* =================================================
                SHIPMENT INFORMATION
            ================================================= */}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Shipment Information
              </p>

              <div className="mt-4 overflow-hidden rounded-xl border">
                <div className="grid grid-cols-2 divide-x divide-y">
                  {/* RECEIVER */}

                  <InfoItem
                    label="Receiver"
                    value={
                      shipment.receiverName
                    }
                  />

                  {/* PHONE */}

                  <InfoItem
                    label="Phone"
                    value={
                      shipment.receiverPhone
                    }
                  />

                  {/* PACKAGE */}

                  <InfoItem
                    label="Package"
                    value={`${shipment.packageType || "—"} · ${
                      shipment.weight != null
                        ? `${shipment.weight} kg`
                        : "—"
                    }`}
                  />

                  {/* PAYMENT */}

                  <InfoItem
                    label="Payment"
                    value={
                      shipment.paymentType
                    }
                  />

                  {/* COD */}

                  {shipment.paymentType ===
                    "COD" && (
                    <InfoItem
                      label="COD Amount"
                      value={formatCurrency(
                        shipment.codAmount
                      )}
                    />
                  )}

                  {/* SHIPPING CHARGE */}

                  <InfoItem
                    label="Shipping Charge"
                    value={formatCurrency(
                      shipment.shippingCharge
                    )}
                  />

                  {/* DESTINATION */}

                  <InfoItem
                    label="Destination"
                    value={
                      shipment.locationRate
                        ?.location?.name
                    }
                  />

                  {/* DELIVERY TYPE */}

                  <InfoItem
                    label="Delivery Type"
                    value={
                      shipment.locationRate
                        ?.deliveryType
                        ?.name
                    }
                  />

                  {/* ZONE */}

                  <InfoItem
                    label="Zone"
                    value={
                      shipment.deliveryZone ||
                      shipment.locationRate
                        ?.location?.zone ||
                      shipment.zone
                    }
                  />

                  {/* ORIGIN */}

                  <InfoItem
                    label="Origin"
                    value={
                      shipment.origin
                    }
                  />

                  {/* CREATED */}

                  <InfoItem
                    label="Created"
                    value={formatDate(
                      shipment.createdAt
                    )}
                  />

                  {/* RECEIVER ADDRESS */}

                  <div className="col-span-2 px-4 py-4">
                    <p className="text-xs text-gray-400">
                      Receiver Address
                    </p>

                    <p className="mt-1 break-words text-sm font-medium">
                      {shipment.receiverAddress ||
                        "—"}
                    </p>
                  </div>

                  {/* NOTES */}

                  {shipment.notes && (
                    <div className="col-span-2 border-t px-4 py-4">
                      <p className="text-xs text-gray-400">
                        Notes
                      </p>

                      <p className="mt-1 break-words text-sm font-medium">
                        {shipment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                TRACKING TIMELINE
            ================================================= */}

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
                      shipment.trackings?.find(
                        (tracking) =>
                          tracking.status ===
                          step
                      );

                    const current =
                      shipment.status ===
                      step;

                    return (
                      <div
                        key={step}
                        className="flex gap-4"
                      >
                        {/* STEP ICON */}

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

                        {/* STEP DETAILS */}

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

            {/* =================================================
                TRACKING HISTORY
            ================================================= */}

            {shipment.trackings &&
              shipment.trackings.length >
                0 && (
                <div className="mt-8 border-t pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Tracking History
                  </p>

                  <div className="mt-4 space-y-2">
                    {shipment.trackings.map(
                      (tracking) => (
                        <div
                          key={tracking.id}
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

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div>
            {/* =================================================
                UPDATE STATUS
            ================================================= */}

            <div className="rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Update Shipment Status
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Move the shipment through the
                inside-valley delivery process.
              </p>

              <div className="mt-4">
                <select
                  value={shipment.status}
                  onChange={(e) =>
                    onUpdateStatus(
                      e.target.value
                    )
                  }
                  disabled={
                    updatingStatus ||
                    !nextStatus ||
                    isTerminalStatus(
                      shipment.status
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option
                    value={
                      shipment.status
                    }
                  >
                    {formatStatus(
                      shipment.status
                    )}
                  </option>

                  {nextStatus && (
                    <option
                      value={nextStatus}
                    >
                      Move to{" "}
                      {formatStatus(
                        nextStatus
                      )}
                    </option>
                  )}
                </select>
              </div>

              {/* NEXT STATUS */}

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

              {/* DELIVERED */}

              {!nextStatus &&
                shipment.status ===
                  "DELIVERED" && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3">
                    <p className="text-xs font-medium text-green-700">
                      Shipment has been
                      delivered.
                    </p>
                  </div>
                )}

              {/* UPDATING */}

              {updatingStatus && (
                <p className="mt-2 text-xs text-gray-500">
                  Updating shipment...
                </p>
              )}

              {/* SUCCESS */}

              {statusMessage && (
                <div className="mt-3 rounded-lg bg-green-50 p-3">
                  <p className="text-xs font-medium text-green-700">
                    {statusMessage}
                  </p>
                </div>
              )}

              {/* ERROR */}

              {statusError && (
                <div className="mt-3 rounded-lg bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">
                    {statusError}
                  </p>
                </div>
              )}
            </div>

            {/* =================================================
                CURRENT STATUS
            ================================================= */}

            <div className="mt-4 rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Current Status
              </p>

              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                  shipment.status
                )}`}
              >
                {formatStatus(
                  shipment.status
                )}
              </span>
            </div>

            {/* =================================================
                QR CODE
            ================================================= */}

            <div className="mt-4 rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Track Shipment
              </p>

              <div className="mt-4 flex justify-center">
                <div className="rounded-xl border bg-white p-3">
                  <QRCode
                    value={trackingUrl}
                    size={150}
                  />
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-gray-400">
                Scan QR code to track this
                shipment.
              </p>
            </div>

            {/* =================================================
                PRINT BILL
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                onPrint(shipment)
              }
              className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Print Bill
            </button>

            {/* =================================================
                RIDER
            ================================================= */}

            <div className="mt-4 rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Delivery Rider
              </p>

              {shipment.rider ? (
                <div className="mt-3 space-y-2">
                  {/* NAME */}

                  <div className="flex justify-between gap-3">
                    <span className="text-xs text-gray-400">
                      Name
                    </span>

                    <span className="text-right text-sm font-medium">
                      {shipment.rider.user
                        ?.name || "—"}
                    </span>
                  </div>

                  {/* PHONE */}

                  <div className="flex justify-between gap-3">
                    <span className="text-xs text-gray-400">
                      Phone
                    </span>

                    <span className="text-right text-sm font-medium">
                      {shipment.rider.phone ||
                        "—"}
                    </span>
                  </div>

                  {/* VEHICLE */}

                  {shipment.rider
                    .vehicleNumber && (
                    <div className="flex justify-between gap-3">
                      <span className="text-xs text-gray-400">
                        Vehicle
                      </span>

                      <span className="text-right text-sm font-medium">
                        {
                          shipment.rider
                            .vehicleNumber
                        }
                      </span>
                    </div>
                  )}

                  {/* LIVE LOCATION */}

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-400">
                      Live Location
                    </p>

                    {shipment.rider
                      .latitude != null &&
                    shipment.rider
                      .longitude != null ? (
                      <p className="mt-1 text-xs font-medium">
                        {
                          shipment.rider
                            .latitude
                        }
                        ,{" "}
                        {
                          shipment.rider
                            .longitude
                        }
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">
                        Location not available
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400">
                  No rider has been assigned
                  yet.
                </p>
              )}

              {/* =================================================
                  ASSIGN RIDER
              ================================================= */}

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
                      (rider) => (
                        <option
                          key={rider.id}
                          value={String(
                            rider.id
                          )}
                        >
                          {rider.user?.name ||
                            "Unnamed rider"}{" "}
                          —{" "}
                          {rider.phone ||
                            "No phone"}
                          {rider.vehicleNumber
                            ? ` (${rider.vehicleNumber})`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  {/* ASSIGN BUTTON */}

                  <button
                    type="button"
                    onClick={
                      onAssignRider
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

                  {/* SUCCESS */}

                  {assignMessage && (
                    <div className="mt-3 rounded-lg bg-green-50 p-3">
                      <p className="text-xs font-medium text-green-700">
                        {assignMessage}
                      </p>
                    </div>
                  )}

                  {/* ERROR */}

                  {assignError && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3">
                      <p className="text-xs font-medium text-red-700">
                        {assignError}
                      </p>
                    </div>
                  )}

                  {/* NO RIDERS */}

                  {!ridersLoading &&
                    availableRiders.length ===
                      0 && (
                      <p className="mt-3 text-xs text-gray-400">
                        No available riders
                        right now.
                      </p>
                    )}
                </div>
              )}

              {/* =================================================
                  ALREADY ASSIGNED
              ================================================= */}

              {shipment.rider &&
                !canAssignRider && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-xs text-gray-400">
                      Rider assignment
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Rider has already been
                      assigned to this shipment.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="px-4 py-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}