"use client";

import {
  ReturnRequest,
  ReturnStatus,
  Rider,
} from "@/components/shipments/types";

type ReturnModalProps = {
  returnRequest: ReturnRequest | null;

  riders: Rider[];

  ridersLoading: boolean;

  selectedRiderId: string;

  setSelectedRiderId: (value: string) => void;

  assigningRider: boolean;

  assignError: string;

  assignMessage: string;

  updatingStatus: boolean;

  statusError: string;

  statusMessage: string;

  onAssignRider: () => void;

  onUpdateStatus: (status: ReturnStatus) => void;

  onClose: () => void;
};

// ============================================================
// RETURN FLOW
// ============================================================

const RETURN_FLOW: ReturnStatus[] = [
  "REQUESTED",
  "ASSIGNED_TO_RIDER",
  "PICKED_UP_FROM_CUSTOMER",
  "IN_WAREHOUSE",
  "OUT_FOR_RETURN",
  "RETURNED_TO_VENDOR",
];

// ============================================================
// STATUS STYLE
// ============================================================

function getStatusStyle(status: ReturnStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "ASSIGNED_TO_RIDER":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "PICKED_UP_FROM_CUSTOMER":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "IN_WAREHOUSE":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "OUT_FOR_RETURN":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "RETURNED_TO_VENDOR":
      return "bg-green-50 text-green-700 border-green-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(status?: string | null) {
  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// ============================================================
// FORMAT REASON
// ============================================================

function formatReason(reason?: string | null) {
  if (!reason) return "-";

  return reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ReturnModal({
  returnRequest,
  riders,
  ridersLoading,
  selectedRiderId,
  setSelectedRiderId,
  assigningRider,
  assignError,
  assignMessage,
  updatingStatus,
  statusError,
  statusMessage,
  onAssignRider,
  onUpdateStatus,
  onClose,
}: ReturnModalProps) {
  if (!returnRequest) {
    return null;
  }

  const shipment = returnRequest.shipment;

  // ============================================================
  // CURRENT STAGE
  // ============================================================

  const isWarehouse =
    returnRequest.status === "IN_WAREHOUSE";

  // ============================================================
  // DELIVERY OPTIONS
  // ============================================================

  const isVendorPickup =
    isWarehouse &&
    returnRequest.deliveryOption === "VENDOR_PICKUP";

  const isVendorDelivery =
    isWarehouse &&
    returnRequest.deliveryOption === "DELIVER_TO_VENDOR";

  // ============================================================
  // AVAILABLE RIDERS
  // ============================================================

  const availableRiders = riders.filter(
    (rider) => rider.isAvailable !== false
  );

  // ============================================================
  // NEXT STATUS
  // ============================================================

  let nextStatus: ReturnStatus | null = null;

  if (returnRequest.status === "REQUESTED") {
    nextStatus = "ASSIGNED_TO_RIDER";
  }

  if (returnRequest.status === "ASSIGNED_TO_RIDER") {
    nextStatus = "PICKED_UP_FROM_CUSTOMER";
  }

  if (returnRequest.status === "PICKED_UP_FROM_CUSTOMER") {
    nextStatus = "IN_WAREHOUSE";
  }

  if (isVendorPickup) {
    nextStatus = "RETURNED_TO_VENDOR";
  }

  if (isVendorDelivery) {
    nextStatus = "OUT_FOR_RETURN";
  }

  if (returnRequest.status === "OUT_FOR_RETURN") {
    nextStatus = "RETURNED_TO_VENDOR";
  }

  // ============================================================
  // TRACKING
  // ============================================================

  const returnTrackingStatuses = [
    "RETURN_REQUESTED",
    "RETURN_ASSIGNED_TO_RIDER",
    "RETURN_PICKED_UP_FROM_CUSTOMER",
    "RETURN_IN_WAREHOUSE",
    "OUT_FOR_RETURN",
    "RETURNED_TO_VENDOR",
  ];

  const returnTrackings =
    shipment?.trackings?.filter((tracking) =>
      returnTrackingStatuses.includes(tracking.status)
    ) ?? [];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1729]/60 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#0b1729]">
                Return Tracking
              </h2>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  returnRequest.status
                )}`}
              >
                {formatStatus(returnRequest.status)}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Tracking #{shipment?.trackingNumber || "-"}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={assigningRider || updatingStatus}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-[#0b1729] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ================================================== */}
        {/* BODY */}
        {/* ================================================== */}

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-3">

          {/* ================================================== */}
          {/* LEFT */}
          {/* ================================================== */}

          <div className="space-y-6 border-r border-gray-100 p-6 lg:col-span-2">

            {/* ================================================== */}
            {/* CURRENT STATUS */}
            {/* ================================================== */}

            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Current Return Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${getStatusStyle(
                    returnRequest.status
                  )}`}
                >
                  {formatStatus(returnRequest.status)}
                </span>
              </div>
            </section>

            {/* ================================================== */}
            {/* RETURN PROCESS */}
            {/* ================================================== */}

            <section>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0b1729]">
                  Return Process
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Current progress of this return request.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {RETURN_FLOW.map((status) => {
                  const currentIndex = RETURN_FLOW.indexOf(
                    returnRequest.status
                  );

                  const statusIndex = RETURN_FLOW.indexOf(status);

                  const completed =
                    statusIndex <= currentIndex;

                  const isCurrent =
                    status === returnRequest.status;

                  return (
                    <div
                      key={status}
                      className={`rounded-xl border p-4 transition ${
                        isCurrent
                          ? "border-[#E23C2E]/30 bg-[#fff1ef]"
                          : completed
                            ? "border-green-200 bg-green-50"
                            : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">
                          STEP {statusIndex + 1}
                        </span>

                        {completed && (
                          <span className="text-xs font-bold text-green-600">
                            ✓
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-[#0b1729]">
                        {formatStatus(status)}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ================================================== */}
            {/* SHIPMENT DETAILS */}
            {/* ================================================== */}

            <section className="rounded-xl border border-gray-100 p-5">
              <h3 className="mb-4 text-lg font-bold text-[#0b1729]">
                Shipment Details
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <Info
                  label="Tracking Number"
                  value={shipment?.trackingNumber}
                />

                <Info
                  label="Return Status"
                  value={formatStatus(returnRequest.status)}
                />

                <Info
                  label="Return Reason"
                  value={formatReason(returnRequest.reason)}
                />

                <Info
                  label="Requested At"
                  value={formatDate(returnRequest.requestedAt)}
                />

                <Info
                  label="Picked Up At"
                  value={formatDate(returnRequest.pickedUpAt)}
                />

                <Info
                  label="Completed At"
                  value={formatDate(returnRequest.completedAt)}
                />
              </div>
            </section>

            {/* ================================================== */}
            {/* DELIVERY TO VENDOR */}
            {/* ================================================== */}

            {isVendorDelivery && (
              <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-lg">
                    ↗
                  </div>

                  <div>
                    <h3 className="font-bold text-blue-900">
                      Delivery To Vendor Selected
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      The returned package will be delivered
                      to the registered vendor address.
                    </p>

                    <p className="mt-2 text-sm font-semibold text-blue-900">
                      Delivery Option: Deliver To Vendor
                    </p>

                    {shipment?.vendor?.location && (
                      <p className="mt-2 text-sm text-blue-800">
                        Vendor Location:{" "}
                        <strong>
                          {shipment.vendor.location}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ================================================== */}
            {/* VENDOR PICKUP */}
            {/* ================================================== */}

            {isVendorPickup && (
              <section className="rounded-xl border border-green-100 bg-green-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-bold text-green-900">
                      Vendor Pickup Selected
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-green-800">
                      The vendor will collect the returned
                      package from the warehouse.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ================================================== */}
            {/* DESCRIPTION */}
            {/* ================================================== */}

            {returnRequest.description && (
              <section className="rounded-xl border border-gray-100 p-5">
                <h3 className="mb-2 font-bold text-[#0b1729]">
                  Description
                </h3>

                <p className="text-sm leading-6 text-gray-600">
                  {returnRequest.description}
                </p>
              </section>
            )}

            {/* ================================================== */}
            {/* RECEIVER */}
            {/* ================================================== */}

            <section className="rounded-xl border border-gray-100 p-5">
              <h3 className="mb-4 text-lg font-bold text-[#0b1729]">
                Receiver Information
              </h3>

              <div className="grid gap-5 md:grid-cols-3">
                <Info
                  label="Name"
                  value={shipment?.receiverName}
                />

                <Info
                  label="Phone"
                  value={shipment?.receiverPhone}
                />

                <Info
                  label="Address"
                  value={shipment?.receiverAddress}
                />
              </div>
            </section>

            {/* ================================================== */}
            {/* DELIVERY INFORMATION */}
            {/* ================================================== */}

            <section className="rounded-xl border border-gray-100 p-5">
              <h3 className="mb-4 text-lg font-bold text-[#0b1729]">
                Delivery Information
              </h3>

              <div className="grid gap-5 md:grid-cols-3">
                <Info
                  label="Destination"
                  value={shipment?.vendor?.location}
                />

                <Info
                  label="Zone"
                  value={shipment?.zone}
                />

                <Info
                  label="Delivery Type"
                  value={shipment?.deliveryType}
                />

                <Info
                  label="Weight"
                  value={
                    shipment?.weight != null
                      ? `${shipment.weight} kg`
                      : "-"
                  }
                />

                <Info
                  label="Shipping Charge"
                  value={
                    shipment?.shippingCharge != null
                      ? `Rs. ${shipment.shippingCharge}`
                      : "-"
                  }
                />

                <Info
                  label="Package Type"
                  value={shipment?.packageType}
                />
              </div>
            </section>

            {/* ================================================== */}
            {/* PAYMENT */}
            {/* ================================================== */}

            <section className="rounded-xl border border-gray-100 p-5">
              <h3 className="mb-4 text-lg font-bold text-[#0b1729]">
                Payment
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <Info
                  label="Payment Type"
                  value={shipment?.paymentType}
                />

                <Info
                  label="COD Amount"
                  value={
                    shipment?.codAmount != null
                      ? `Rs. ${shipment.codAmount}`
                      : "-"
                  }
                />
              </div>
            </section>

            {/* ================================================== */}
            {/* TRACKING HISTORY */}
            {/* ================================================== */}

            <section className="rounded-xl border border-gray-100 p-5">
              <h3 className="text-lg font-bold text-[#0b1729]">
                Tracking History
              </h3>

              <p className="mb-5 mt-1 text-sm text-gray-500">
                Return updates use the same shipment tracking number.
              </p>

              <div className="space-y-5">
                {returnTrackings.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 px-4 py-6 text-center">
                    <p className="text-sm text-gray-500">
                      No return tracking history available.
                    </p>
                  </div>
                ) : (
                  returnTrackings.map((tracking) => (
                    <div
                      key={tracking.id}
                      className="relative border-l-2 border-gray-200 pl-5"
                    >
                      <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#E23C2E]" />

                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-[#0b1729]">
                          {formatStatus(tracking.status)}
                        </h4>

                        <span className="rounded-full bg-[#fff1ef] px-2 py-1 text-xs font-medium text-[#E23C2E]">
                          RETURN
                        </span>
                      </div>

                      {tracking.location && (
                        <p className="mt-1 text-sm text-gray-600">
                          {tracking.location}
                        </p>
                      )}

                      {tracking.message && (
                        <p className="mt-1 text-sm text-gray-700">
                          {tracking.message}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(tracking.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* ================================================== */}
          {/* RIGHT SIDE */}
          {/* ================================================== */}

          <div className="space-y-5 bg-[#f8fafb] p-6">

            {/* ================================================== */}
            {/* ORIGINAL PICKUP RIDER */}
            {/* ================================================== */}

            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="font-bold text-[#0b1729]">
                Original Return Rider
              </h3>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Rider assigned to pick up the return from the customer.
              </p>

              {returnRequest.rider ? (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-[#0b1729]">
                    {returnRequest.rider.user?.name ||
                      `Rider #${returnRequest.rider.id}`}
                  </p>

                  {returnRequest.rider.phone && (
                    <p className="mt-1 text-sm text-gray-500">
                      {returnRequest.rider.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                  Rider has not been assigned yet.
                </p>
              )}
            </section>

            {/* ================================================== */}
            {/* RETURN DELIVERY RIDER */}
            {/* ================================================== */}

            {isVendorDelivery && (
              <section className="rounded-xl border border-blue-100 bg-white p-5">
                <h3 className="font-bold text-[#0b1729]">
                  Return Delivery Rider
                </h3>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Separate rider responsible for delivering the
                  returned package from the warehouse to the vendor.
                </p>

                {returnRequest.returnDeliveryRider && (
                  <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Assigned Rider
                    </p>

                    <p className="mt-1 font-semibold text-green-900">
                      {returnRequest.returnDeliveryRider.user?.name ||
                        `Rider #${returnRequest.returnDeliveryRider.id}`}
                    </p>

                    {returnRequest.returnDeliveryRider.phone && (
                      <p className="mt-1 text-sm text-green-700">
                        {returnRequest.returnDeliveryRider.phone}
                      </p>
                    )}
                  </div>
                )}

                {!returnRequest.returnDeliveryRiderId && (
                  <RiderAssignment
                    riders={availableRiders}
                    ridersLoading={ridersLoading}
                    selectedRiderId={selectedRiderId}
                    setSelectedRiderId={setSelectedRiderId}
                    assigningRider={assigningRider}
                    onAssignRider={onAssignRider}
                    title="Assign Return Delivery Rider"
                    description="Select a rider to deliver the package from the warehouse to the vendor."
                  />
                )}
              </section>
            )}

            {/* ================================================== */}
            {/* VENDOR PICKUP */}
            {/* ================================================== */}

            {isVendorPickup && (
              <section className="rounded-xl border border-green-100 bg-white p-5">
                <h3 className="font-bold text-[#0b1729]">
                  Vendor Pickup
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  No return delivery rider is required. The vendor
                  will collect the package from the warehouse.
                </p>
              </section>
            )}

            {/* ================================================== */}
            {/* ASSIGN MESSAGE */}
            {/* ================================================== */}

            {assignMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {assignMessage}
              </div>
            )}

            {assignError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {assignError}
              </div>
            )}

            {/* ================================================== */}
            {/* NEXT STEP */}
            {/* ================================================== */}

            {nextStatus && (
              <section className="rounded-xl border border-gray-100 bg-white p-5">
                <h3 className="font-bold text-[#0b1729]">
                  Next Step
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Move this return to:
                </p>

                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="font-semibold text-[#0b1729]">
                    {formatStatus(nextStatus)}
                  </p>
                </div>

                <button
                  onClick={() => onUpdateStatus(nextStatus)}
                  disabled={
                    updatingStatus ||
                    (isVendorDelivery &&
                      !returnRequest.returnDeliveryRiderId) ||
                    (returnRequest.status === "REQUESTED" &&
                      !returnRequest.riderId)
                  }
                  className="mt-4 w-full rounded-lg bg-[#E23C2E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#CE3122] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus
                    ? "Updating..."
                    : `Mark ${formatStatus(nextStatus)}`}
                </button>

                {isVendorDelivery &&
                  !returnRequest.returnDeliveryRiderId && (
                    <p className="mt-2 text-xs leading-5 text-amber-600">
                      Assign a return delivery rider before moving
                      the package to Out For Return.
                    </p>
                  )}

                {returnRequest.status === "REQUESTED" &&
                  !returnRequest.riderId && (
                    <p className="mt-2 text-xs leading-5 text-amber-600">
                      Assign the original pickup rider before
                      moving this return forward.
                    </p>
                  )}
              </section>
            )}

            {/* ================================================== */}
            {/* STATUS MESSAGE */}
            {/* ================================================== */}

            {statusMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {statusMessage}
              </div>
            )}

            {statusError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {statusError}
              </div>
            )}

            {/* ================================================== */}
            {/* COMPLETED */}
            {/* ================================================== */}

            {returnRequest.status === "RETURNED_TO_VENDOR" && (
              <section className="rounded-xl border border-green-100 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-bold text-green-900">
                      Return Completed
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-green-700">
                      The returned package has been delivered
                      to the vendor.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO COMPONENT
// ============================================================

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
      ? String(value)
      : "-";

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {displayValue}
      </p>
    </div>
  );
}

// ============================================================
// RIDER ASSIGNMENT
// ============================================================

function RiderAssignment({
  riders,
  ridersLoading,
  selectedRiderId,
  setSelectedRiderId,
  assigningRider,
  onAssignRider,
  title,
  description,
}: {
  riders: Rider[];

  ridersLoading: boolean;

  selectedRiderId: string;

  setSelectedRiderId: (value: string) => void;

  assigningRider: boolean;

  onAssignRider: () => void;

  title: string;

  description: string;
}) {
  return (
    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <h4 className="font-semibold text-[#0b1729]">
        {title}
      </h4>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>

      <select
        value={selectedRiderId}
        onChange={(event) =>
          setSelectedRiderId(event.target.value)
        }
        disabled={ridersLoading || assigningRider}
        className="mt-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">
          {ridersLoading
            ? "Loading riders..."
            : "Select new rider"}
        </option>

        {riders.map((rider) => (
          <option key={rider.id} value={rider.id}>
            {rider.user?.name || `Rider #${rider.id}`}
            {rider.phone ? ` — ${rider.phone}` : ""}
          </option>
        ))}
      </select>

      <button
        onClick={onAssignRider}
        disabled={
          !selectedRiderId ||
          assigningRider ||
          ridersLoading
        }
        className="mt-3 w-full rounded-lg bg-[#0b1729] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#14253d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {assigningRider ? "Assigning..." : "Assign Rider"}
      </button>
    </div>
  );
}