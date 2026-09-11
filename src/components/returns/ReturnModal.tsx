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
// RETURN TRACKING STATUS
// ============================================================

const RETURN_TRACKING_STATUS: Record<
  ReturnStatus,
  string | null
> = {
  REQUESTED: "RETURN_REQUESTED",

  ASSIGNED_TO_RIDER:
    "RETURN_ASSIGNED_TO_RIDER",

  PICKED_UP_FROM_CUSTOMER:
    "RETURN_PICKED_UP_FROM_CUSTOMER",

  IN_WAREHOUSE:
    "RETURN_IN_WAREHOUSE",

  OUT_FOR_RETURN:
    "OUT_FOR_RETURN",

  RETURNED_TO_VENDOR:
    "RETURNED_TO_VENDOR",

  CANCELLED: null,
};


// ============================================================
// STATUS STYLE
// ============================================================

function getStatusStyle(status: ReturnStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-yellow-100 text-yellow-800";

    case "ASSIGNED_TO_RIDER":
      return "bg-blue-100 text-blue-800";

    case "PICKED_UP_FROM_CUSTOMER":
      return "bg-purple-100 text-purple-800";

    case "IN_WAREHOUSE":
      return "bg-amber-100 text-amber-800";

    case "OUT_FOR_RETURN":
      return "bg-orange-100 text-orange-800";

    case "RETURNED_TO_VENDOR":
      return "bg-green-100 text-green-800";

    case "CANCELLED":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";
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
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


// ============================================================
// FORMAT REASON
// ============================================================

function formatReason(reason?: string | null) {
  if (!reason) return "-";

  return reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
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

  if (
    returnRequest.status === "ASSIGNED_TO_RIDER"
  ) {
    nextStatus = "PICKED_UP_FROM_CUSTOMER";
  }

  if (
    returnRequest.status ===
    "PICKED_UP_FROM_CUSTOMER"
  ) {
    nextStatus = "IN_WAREHOUSE";
  }

  if (isVendorPickup) {
    nextStatus = "RETURNED_TO_VENDOR";
  }

  if (isVendorDelivery) {
    nextStatus = "OUT_FOR_RETURN";
  }

  if (
    returnRequest.status === "OUT_FOR_RETURN"
  ) {
    nextStatus = "RETURNED_TO_VENDOR";
  }


  // ============================================================
  // TRACKING
  // ============================================================

  const returnTrackings =
    shipment?.trackings?.filter((tracking) =>
      [
        "RETURN_REQUESTED",
        "RETURN_ASSIGNED_TO_RIDER",
        "RETURN_PICKED_UP_FROM_CUSTOMER",
        "RETURN_IN_WAREHOUSE",
        "OUT_FOR_RETURN",
        "RETURNED_TO_VENDOR",
      ].includes(tracking.status)
    ) ?? [];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-black bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-center justify-between border-b px-6 py-4">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Return Tracking
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {shipment?.trackingNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={
              assigningRider ||
              updatingStatus
            }
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            ✕
          </button>

        </div>


        {/* ================================================== */}
        {/* BODY */}
        {/* ================================================== */}

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-3">

          {/* ================================================== */}
          {/* LEFT */}
          {/* ================================================== */}

          <div className="space-y-6 border-r p-6 lg:col-span-2">

            {/* ================================================== */}
            {/* CURRENT STATUS */}
            {/* ================================================== */}

            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Shipment Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                    returnRequest.status
                  )}`}
                >
                  {formatStatus(returnRequest.status)}
                </span>
              </div>
            </div>


            {/* ================================================== */}
            {/* RETURN PROCESS */}
            {/* ================================================== */}

            <div>

              <h3 className="mb-4 text-lg font-bold">
                RETURN PROCESS
              </h3>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">

                {RETURN_FLOW.map((status) => {

                  const currentIndex =
                    RETURN_FLOW.indexOf(
                      returnRequest.status
                    );

                  const statusIndex =
                    RETURN_FLOW.indexOf(status);

                  const completed =
                    statusIndex <= currentIndex;

                  return (
                    <div
                      key={status}
                      className={`rounded-xl border p-4 ${
                        completed
                          ? "border-blue-200 bg-blue-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-500">
                        {statusIndex + 1}
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatStatus(status)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {status}
                      </p>
                    </div>
                  );
                })}

              </div>
            </div>


            {/* ================================================== */}
            {/* SHIPMENT DETAILS */}
            {/* ================================================== */}

            <div className="rounded-xl border p-5">

              <h3 className="mb-4 text-lg font-bold">
                Shipment Details
              </h3>

              <div className="grid gap-4 md:grid-cols-2">

                <Info
                  label="Tracking Number"
                  value={shipment?.trackingNumber}
                />

                <Info
                  label="Status"
                  value={formatStatus(returnRequest.status)}
                />

                <Info
                  label="Return Reason"
                  value={formatReason(returnRequest.reason)}
                />

                <Info
                  label="Requested At"
                  value={formatDate(
                    returnRequest.requestedAt
                  )}
                />

                <Info
                  label="Picked Up At"
                  value={formatDate(
                    returnRequest.pickedUpAt
                  )}
                />

              </div>

            </div>


            {/* ================================================== */}
            {/* DELIVERY TO VENDOR */}
            {/* ================================================== */}

            {isVendorDelivery && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="text-2xl">
                    🏠
                  </div>

                  <div>

                    <h3 className="font-bold text-blue-900">
                      Delivery To Vendor Selected
                    </h3>

                    <p className="mt-1 text-sm text-blue-800">
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

              </div>
            )}


            {/* ================================================== */}
            {/* VENDOR PICKUP */}
            {/* ================================================== */}

            {isVendorPickup && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">

                <h3 className="font-bold text-green-900">
                  Vendor Pickup Selected
                </h3>

                <p className="mt-1 text-sm text-green-800">
                  The vendor will collect the returned
                  package from the warehouse.
                </p>

              </div>
            )}


            {/* ================================================== */}
            {/* DESCRIPTION */}
            {/* ================================================== */}

            {returnRequest.description && (
              <div className="rounded-xl border p-5">

                <h3 className="mb-2 font-bold">
                  Description
                </h3>

                <p className="text-sm text-gray-600">
                  {returnRequest.description}
                </p>

              </div>
            )}


            {/* ================================================== */}
            {/* RECEIVER */}
            {/* ================================================== */}

            <div className="rounded-xl border p-5">

              <h3 className="mb-4 text-lg font-bold">
                Receiver Information
              </h3>

              <div className="grid gap-4 md:grid-cols-3">

                <Info
                  label="Name"
                  value={
                    shipment?.customer?.name
                  }
                />

                <Info
                  label="Phone"
                  value={
                    shipment?.customer?.phone
                  }
                />

                <Info
                  label="Address"
                  value={
                    shipment?.customer?.address
                  }
                />

              </div>

            </div>


            {/* ================================================== */}
            {/* DELIVERY INFORMATION */}
            {/* ================================================== */}

            <div className="rounded-xl border p-5">

              <h3 className="mb-4 text-lg font-bold">
                Delivery Information
              </h3>

              <div className="grid gap-4 md:grid-cols-3">

                <Info
                  label="Destination"
                  value={
                    shipment?.vendor?.location
                  }
                />

                <Info
                  label="Zone"
                  value={
                    shipment?.zone
                  }
                />

                <Info
                  label="Delivery Type"
                  value={
                    shipment?.deliveryType
                  }
                />

                <Info
                  label="Weight"
                  value={
                    shipment?.weight
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
                  value={
                    shipment?.packageType
                  }
                />

              </div>

            </div>


            {/* ================================================== */}
            {/* PAYMENT */}
            {/* ================================================== */}

            <div className="rounded-xl border p-5">

              <h3 className="mb-4 text-lg font-bold">
                Payment
              </h3>

              <Info
                label="Payment Type"
                value={
                  shipment?.paymentType
                }
              />

            </div>


            {/* ================================================== */}
            {/* TRACKING HISTORY */}
            {/* ================================================== */}

            <div className="rounded-xl border p-5">

              <h3 className="mb-1 text-lg font-bold">
                Tracking History
              </h3>

              <p className="mb-5 text-sm text-gray-500">
                Return updates use the same tracking number
              </p>

              <div className="space-y-5">

                {returnTrackings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No return tracking history available.
                  </p>
                ) : (
                  returnTrackings.map(
                    (tracking) => (
                      <div
                        key={tracking.id}
                        className="relative border-l-2 border-gray-200 pl-5"
                      >

                        <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-blue-600" />

                        <div className="flex flex-wrap items-center gap-2">

                          <h4 className="font-semibold">
                            {formatStatus(
                              tracking.status
                            )}
                          </h4>

                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
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
                          {formatDate(
                            tracking.createdAt
                          )}
                        </p>

                      </div>
                    )
                  )
                )}

              </div>

            </div>

          </div>


          {/* ================================================== */}
          {/* RIGHT SIDE */}
          {/* ================================================== */}

          <div className="space-y-5 bg-gray-50 p-6">

            {/* ================================================== */}
            {/* ORIGINAL PICKUP RIDER */}
            {/* ================================================== */}

            <div className="rounded-xl border bg-white p-5">

              <h3 className="font-bold">
                Original Return Rider
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Rider assigned to pick up the return
                from the customer.
              </p>

              {returnRequest.rider ? (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">

                  <p className="font-semibold">
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
                <p className="mt-4 text-sm text-gray-500">
                  Rider has not been assigned yet.
                </p>
              )}

            </div>


            {/* ================================================== */}
            {/* NEW RETURN DELIVERY RIDER */}
            {/* ================================================== */}

            {isVendorDelivery && (
              <div className="rounded-xl border border-blue-200 bg-white p-5">

                <h3 className="font-bold text-gray-900">
                  Return Delivery Rider
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  This is a separate rider who will take
                  the package from the warehouse to the
                  vendor.
                </p>


                {/* -------------------------------------------- */}
                {/* ALREADY ASSIGNED */}
                {/* -------------------------------------------- */}

                {returnRequest.returnDeliveryRider && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">

                    <p className="text-xs font-medium uppercase text-green-700">
                      Assigned Return Delivery Rider
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


                {/* -------------------------------------------- */}
                {/* NEW RIDER DROPDOWN */}
                {/* -------------------------------------------- */}

                {!returnRequest.returnDeliveryRiderId && (
                  <RiderAssignment
                    riders={availableRiders}
                    ridersLoading={ridersLoading}
                    selectedRiderId={
                      selectedRiderId
                    }
                    setSelectedRiderId={
                      setSelectedRiderId
                    }
                    assigningRider={
                      assigningRider
                    }
                    onAssignRider={
                      onAssignRider
                    }
                    title="Assign Return Delivery Rider"
                    description="Select a new rider to deliver the package from the warehouse to the vendor."
                  />
                )}

              </div>
            )}


            {/* ================================================== */}
            {/* VENDOR PICKUP MESSAGE */}
            {/* ================================================== */}

            {isVendorPickup && (
              <div className="rounded-xl border border-green-200 bg-white p-5">

                <h3 className="font-bold">
                  Vendor Pickup
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  No return delivery rider is required.
                  The vendor will collect the package
                  from the warehouse.
                </p>

              </div>
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
              <div className="rounded-xl border bg-white p-5">

                <h3 className="font-bold">
                  Next Step
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Move the return to:
                </p>

                <p className="mt-2 font-semibold">
                  {formatStatus(nextStatus)}
                </p>


                <button
                  onClick={() =>
                    onUpdateStatus(
                      nextStatus!
                    )
                  }
                  disabled={
                    updatingStatus ||
                    (
                      isVendorDelivery &&
                      !returnRequest.returnDeliveryRiderId
                    ) ||
                    (
                      returnRequest.status ===
                        "REQUESTED" &&
                      !returnRequest.riderId
                    )
                  }
                  className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus
                    ? "Updating..."
                    : `Mark ${formatStatus(
                        nextStatus
                      )}`}
                </button>


                {isVendorDelivery &&
                  !returnRequest.returnDeliveryRiderId && (
                    <p className="mt-2 text-xs text-amber-600">
                      Assign a return delivery rider
                      before moving the package to
                      Out For Return.
                    </p>
                  )}

              </div>
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

            {returnRequest.status ===
              "RETURNED_TO_VENDOR" && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">

                <h3 className="font-bold text-green-900">
                  Return Completed
                </h3>

                <p className="mt-1 text-sm text-green-700">
                  The returned package has been
                  delivered to the vendor.
                </p>

              </div>
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
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value || "-"}
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

  setSelectedRiderId: (
    value: string
  ) => void;

  assigningRider: boolean;

  onAssignRider: () => void;

  title: string;

  description: string;
}) {
  return (
    <div className="mt-5 rounded-xl border bg-gray-50 p-4">

      <h4 className="font-semibold">
        {title}
      </h4>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>


      {/* ====================================================== */}
      {/* DROPDOWN */}
      {/* ====================================================== */}

      <select
        value={selectedRiderId}
        onChange={(event) =>
          setSelectedRiderId(
            event.target.value
          )
        }
        disabled={
          ridersLoading ||
          assigningRider
        }
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
      >

        <option value="">
          {ridersLoading
            ? "Loading riders..."
            : "Select new rider"}
        </option>

        {riders.map((rider) => (
          <option
            key={rider.id}
            value={rider.id}
          >
            {rider.user?.name ||
              `Rider #${rider.id}`}
            {rider.phone
              ? ` — ${rider.phone}`
              : ""}
          </option>
        ))}

      </select>


      {/* ====================================================== */}
      {/* BUTTON */}
      {/* ====================================================== */}

      <button
        onClick={onAssignRider}
        disabled={
          !selectedRiderId ||
          assigningRider ||
          ridersLoading
        }
        className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {assigningRider
          ? "Assigning..."
          : "Assign Rider"}
      </button>

    </div>
  );
}