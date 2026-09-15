"use client";

import {
  ReturnRequest,
  ReturnStatus,
  Rider,
} from "@/components/shipments/types";

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  User,
  X,
} from "lucide-react";

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
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "ASSIGNED_TO_RIDER":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "PICKED_UP_FROM_CUSTOMER":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "IN_WAREHOUSE":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "OUT_FOR_RETURN":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "RETURNED_TO_VENDOR":
      return "border-green-200 bg-green-50 text-green-700";

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

// ============================================================
// STATUS DOT
// ============================================================

function getStatusDot(status: ReturnStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-amber-500";

    case "ASSIGNED_TO_RIDER":
      return "bg-blue-500";

    case "PICKED_UP_FROM_CUSTOMER":
      return "bg-purple-500";

    case "IN_WAREHOUSE":
      return "bg-orange-500";

    case "OUT_FOR_RETURN":
      return "bg-indigo-500";

    case "RETURNED_TO_VENDOR":
      return "bg-green-500";

    case "CANCELLED":
      return "bg-red-500";

    default:
      return "bg-gray-400";
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

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-US", {
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

  // ==========================================================
  // STATES
  // ==========================================================

  const isRequested =
    returnRequest.status === "REQUESTED";

  const isWarehouse =
    returnRequest.status === "IN_WAREHOUSE";

  const isOutForReturn =
    returnRequest.status === "OUT_FOR_RETURN";

  const isCompleted =
    returnRequest.status === "RETURNED_TO_VENDOR";

  const isCancelled =
    returnRequest.status === "CANCELLED";

  // ==========================================================
  // DELIVERY OPTIONS
  // ==========================================================

  const isVendorPickup =
    isWarehouse &&
    returnRequest.deliveryOption ===
      "VENDOR_PICKUP";

  const isVendorDelivery =
    isWarehouse &&
    returnRequest.deliveryOption ===
      "DELIVER_TO_VENDOR";

  // ==========================================================
  // AVAILABLE RIDERS
  // ==========================================================

  const availableRiders = riders.filter(
    (rider) => rider.isAvailable !== false
  );

  // ==========================================================
  // RIDER TYPE
  // ==========================================================

  const needsPickupRider =
    isRequested &&
    !returnRequest.riderId;

  const needsReturnDeliveryRider =
    isVendorDelivery &&
    !returnRequest.returnDeliveryRiderId;

  // ==========================================================
  // NEXT STATUS
  // ==========================================================

  let nextStatus: ReturnStatus | null = null;

  if (isRequested) {
    nextStatus = "ASSIGNED_TO_RIDER";
  } else if (
    returnRequest.status ===
    "ASSIGNED_TO_RIDER"
  ) {
    nextStatus =
      "PICKED_UP_FROM_CUSTOMER";
  } else if (
    returnRequest.status ===
    "PICKED_UP_FROM_CUSTOMER"
  ) {
    nextStatus = "IN_WAREHOUSE";
  } else if (isVendorPickup) {
    nextStatus = "RETURNED_TO_VENDOR";
  } else if (isVendorDelivery) {
    nextStatus = "OUT_FOR_RETURN";
  } else if (isOutForReturn) {
    nextStatus = "RETURNED_TO_VENDOR";
  }

  // ==========================================================
  // TRACKING
  // ==========================================================

  const returnTrackingStatuses = [
    "RETURN_REQUESTED",
    "RETURN_ASSIGNED_TO_RIDER",
    "RETURN_PICKED_UP_FROM_CUSTOMER",
    "RETURN_IN_WAREHOUSE",
    "OUT_FOR_RETURN",
    "RETURNED_TO_VENDOR",
  ];

  const returnTrackings =
    shipment?.trackings?.filter(
      (tracking) =>
        returnTrackingStatuses.includes(
          tracking.status
        )
    ) ?? [];

  // ==========================================================
  // CURRENT FLOW INDEX
  // ==========================================================

  const currentIndex =
    RETURN_FLOW.indexOf(
      returnRequest.status
    );

  // ==========================================================
  // CAN UPDATE STATUS
  // ==========================================================

  const cannotAdvance =
    updatingStatus ||
    isCompleted ||
    isCancelled ||
    (isRequested &&
      !returnRequest.riderId) ||
    (isVendorDelivery &&
      !returnRequest.returnDeliveryRiderId);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1729]/70 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[96vh] w-full max-w-[1380px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_80px_rgba(11,23,41,0.28)]">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="flex shrink-0 items-center justify-between border-b border-[#e8ebef] bg-white px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1ef]">
                <RefreshCw
                  size={17}
                  className="text-[#e23c2e]"
                />
              </div>

              <h2 className="text-lg font-bold tracking-[-0.02em] text-[#0b1729] sm:text-xl">
                Return Details
              </h2>

              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusStyle(
                  returnRequest.status
                )}`}
              >
                {formatStatus(
                  returnRequest.status
                )}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748b]">
              <span>
                Tracking{" "}
                <strong className="font-bold text-[#0b1729]">
                  {shipment?.trackingNumber ||
                    "-"}
                </strong>
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-[#cbd5e1] sm:block" />

              <span>
                Return ID{" "}
                <strong className="font-semibold text-[#475569]">
                  {returnRequest.id}
                </strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              assigningRider ||
              updatingStatus
            }
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-[#94a3b8] transition hover:border-[#e2e6eb] hover:bg-[#f8fafc] hover:text-[#0b1729] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close return details"
          >
            <X size={19} />
          </button>
        </header>

        {/* ==================================================
            BODY
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">

            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="space-y-6 p-5 sm:p-7">

              {/* ==================================================
                  CURRENT STATUS BANNER
              ================================================== */}

              <section className="rounded-2xl border border-[#e8ebef] bg-[#fafbfc] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                      Current stage
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded-full ${getStatusDot(
                          returnRequest.status
                        )}`}
                      />

                      <h3 className="text-xl font-bold tracking-[-0.025em] text-[#0b1729]">
                        {formatStatus(
                          returnRequest.status
                        )}
                      </h3>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                      Return reason
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#334155]">
                      {formatReason(
                        returnRequest.reason
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  RETURN PROGRESS
              ================================================== */}

              <section>
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                    Workflow
                  </p>

                  <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#0b1729]">
                    Return progress
                  </h3>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-[760px]">
                    {RETURN_FLOW.map(
                      (status, index) => {
                        const completed =
                          currentIndex >=
                          index;

                        const current =
                          returnRequest.status ===
                          status;

                        const last =
                          index ===
                          RETURN_FLOW.length -
                            1;

                        return (
                          <div
                            key={status}
                            className="flex flex-1 items-start"
                          >
                            <div className="relative flex flex-col items-center">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                                  current
                                    ? "border-[#e23c2e] bg-[#fff1ef] text-[#e23c2e]"
                                    : completed
                                      ? "border-[#1e8449] bg-[#edf8f2] text-[#1e8449]"
                                      : "border-[#dfe4e9] bg-white text-[#94a3b8]"
                                }`}
                              >
                                {completed &&
                                !current ? (
                                  <Check
                                    size={15}
                                    strokeWidth={
                                      2.5
                                    }
                                  />
                                ) : (
                                  <span className="text-xs font-bold">
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <p
                                className={`mt-2 max-w-[105px] text-center text-[11px] font-semibold leading-4 ${
                                  current
                                    ? "text-[#e23c2e]"
                                    : completed
                                      ? "text-[#334155]"
                                      : "text-[#94a3b8]"
                                }`}
                              >
                                {formatStatus(
                                  status
                                )}
                              </p>
                            </div>

                            {!last && (
                              <div
                                className={`mt-[17px] h-[2px] flex-1 ${
                                  currentIndex >
                                  index
                                    ? "bg-[#1e8449]"
                                    : "bg-[#e5e9ed]"
                                }`}
                              />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </section>

              {/* ==================================================
                  RECEIVER + VENDOR
              ================================================== */}

              <div className="grid gap-5 xl:grid-cols-2">

                {/* RECEIVER */}

                <DetailSection
                  icon={<User size={17} />}
                  title="Customer"
                  subtitle="Customer who requested the return"
                >
                  <div className="space-y-4">
                    <DetailRow
                      label="Name"
                      value={
                        shipment?.receiverName
                      }
                    />

                    <DetailRow
                      label="Phone"
                      value={
                        shipment?.receiverPhone
                      }
                      icon={
                        <Phone size={14} />
                      }
                    />

                    <DetailRow
                      label="Address"
                      value={
                        shipment?.receiverAddress
                      }
                      icon={
                        <MapPin size={14} />
                      }
                    />
                  </div>
                </DetailSection>

                {/* VENDOR */}

                <DetailSection
                  icon={<Package size={17} />}
                  title="Vendor"
                  subtitle="Vendor receiving the returned shipment"
                >
                  <div className="space-y-4">
                    <DetailRow
                      label="Company"
                      value={
                        shipment?.vendor
                          ?.companyName ||
                        shipment?.vendor?.name
                      }
                    />

                    <DetailRow
                      label="Location"
                      value={
                        shipment?.vendor
                          ?.location
                      }
                      icon={
                        <MapPin size={14} />
                      }
                    />

                    <DetailRow
                      label="Address"
                      value={
                        shipment?.vendor
                          ?.address
                      }
                      icon={
                        <MapPin size={14} />
                      }
                    />
                  </div>
                </DetailSection>
              </div>

              {/* ==================================================
                  SHIPMENT
              ================================================== */}

              <DetailSection
                icon={<Truck size={17} />}
                title="Shipment information"
                subtitle="Original shipment details"
              >
                <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailRow
                    label="Tracking number"
                    value={
                      shipment?.trackingNumber
                    }
                    strong
                  />

                  <DetailRow
                    label="Origin"
                    value={
                      shipment?.origin
                    }
                  />

                  <DetailRow
                    label="Destination"
                    value={
                      shipment?.deliveryZone ||
                      shipment?.zone
                    }
                  />

                  <DetailRow
                    label="Delivery type"
                    value={
                      shipment?.deliveryType
                    }
                  />

                  <DetailRow
                    label="Package type"
                    value={
                      shipment?.packageType
                    }
                  />

                  <DetailRow
                    label="Weight"
                    value={
                      shipment?.weight != null
                        ? `${shipment.weight} kg`
                        : "-"
                    }
                  />

                  <DetailRow
                    label="Shipping charge"
                    value={
                      shipment?.shippingCharge !=
                      null
                        ? `Rs. ${shipment.shippingCharge}`
                        : "-"
                    }
                  />

                  <DetailRow
                    label="Payment type"
                    value={
                      shipment?.paymentType
                    }
                  />

                  <DetailRow
                    label="COD amount"
                    value={
                      shipment?.codAmount != null
                        ? `Rs. ${shipment.codAmount}`
                        : "-"
                    }
                  />
                </div>
              </DetailSection>

              {/* ==================================================
                  RETURN INFORMATION
              ================================================== */}

              <DetailSection
                icon={
                  <RefreshCw size={17} />
                }
                title="Return information"
                subtitle="Details related to this return request"
              >
                <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailRow
                    label="Return reason"
                    value={formatReason(
                      returnRequest.reason
                    )}
                    strong
                  />

                  <DetailRow
                    label="Return status"
                    value={formatStatus(
                      returnRequest.status
                    )}
                  />

                  <DetailRow
                    label="Delivery option"
                    value={
                      returnRequest.deliveryOption
                        ? formatStatus(
                            returnRequest.deliveryOption
                          )
                        : "Not selected"
                    }
                  />

                  <DetailRow
                    label="Requested at"
                    value={formatDate(
                      returnRequest.requestedAt
                    )}
                  />

                  <DetailRow
                    label="Picked up at"
                    value={formatDate(
                      returnRequest.pickedUpAt
                    )}
                  />

                  <DetailRow
                    label="Completed at"
                    value={formatDate(
                      returnRequest.completedAt
                    )}
                  />

               
                </div>
              </DetailSection>

              {/* ==================================================
                  DESCRIPTION
              ================================================== */}

              {returnRequest.description && (
                <DetailSection
                  icon={
                    <AlertCircle size={17} />
                  }
                  title="Return description"
                  subtitle="Reason provided by the customer/vendor"
                >
                  <div className="rounded-xl bg-[#f8fafc] p-4">
                    <p className="text-sm leading-6 text-[#475569]">
                      {
                        returnRequest.description
                      }
                    </p>
                  </div>
                </DetailSection>
              )}

              {/* ==================================================
                  DELIVERY OPTION INFO
              ================================================== */}

              {isVendorPickup && (
                <div className="rounded-2xl border border-green-200 bg-[#f4fbf7] p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle2
                        size={19}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-green-900">
                        Vendor pickup selected
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-green-800">
                        The vendor will collect
                        the returned package
                        directly from the
                        warehouse. No delivery
                        rider is required.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isVendorDelivery && (
                <div className="rounded-2xl border border-blue-200 bg-[#f5f9ff] p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <ArrowRight
                        size={19}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-blue-900">
                        Deliver to vendor
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-blue-800">
                        The returned shipment
                        will be delivered from
                        the warehouse to the
                        vendor.
                      </p>

                      {shipment?.vendor
                        ?.location && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-900">
                          <MapPin
                            size={14}
                          />

                          {
                            shipment.vendor
                              .location
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  TRACKING HISTORY
              ================================================== */}

              <DetailSection
                icon={<Clock3 size={17} />}
                title="Return tracking"
                subtitle="History of return movement"
              >
                {returnTrackings.length ===
                0 ? (
                  <div className="rounded-xl bg-[#f8fafc] px-5 py-8 text-center">
                    <Clock3
                      size={22}
                      className="mx-auto text-[#cbd5e1]"
                    />

                    <p className="mt-2 text-sm font-medium text-[#64748b]">
                      No return tracking
                      history available.
                    </p>
                  </div>
                ) : (
                  <div className="relative ml-2 border-l border-[#e2e8f0]">
                    {returnTrackings.map(
                      (
                        tracking,
                        index
                      ) => (
                        <div
                          key={tracking.id}
                          className="relative pb-6 pl-7 last:pb-0"
                        >
                          <div className="absolute -left-[6px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#e23c2e] ring-1 ring-[#e23c2e]/20" />

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-[#0b1729]">
                                  {formatStatus(
                                    tracking.status
                                  )}
                                </h4>

                                <span className="rounded-full bg-[#fff1ef] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#e23c2e]">
                                  Return
                                </span>
                              </div>

                              {tracking.location && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-[#64748b]">
                                  <MapPin
                                    size={12}
                                  />
                                  {
                                    tracking.location
                                  }
                                </p>
                              )}

                              {tracking.message && (
                                <p className="mt-1 text-sm leading-5 text-[#475569]">
                                  {
                                    tracking.message
                                  }
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 text-[11px] text-[#94a3b8]">
                              {formatDate(
                                tracking.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </DetailSection>
            </main>

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="border-t border-[#e8ebef] bg-[#f8fafb] p-5 sm:p-7 lg:border-l lg:border-t-0">

              {/* ==================================================
                  PICKUP RIDER
              ================================================== */}

              <section className="rounded-2xl border border-[#e5e9ee] bg-white">
                <div className="border-b border-[#edf0f3] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ef] text-[#e23c2e]">
                      <Truck size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#0b1729]">
                        Pickup rider
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#64748b]">
                        Rider responsible for
                        collecting the package
                        from the customer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">

                  {/* ASSIGNED RIDER */}

                  {returnRequest.rider ? (
                    <AssignedRider
                      rider={
                        returnRequest.rider
                      }
                      label="Pickup rider assigned"
                    />
                  ) : isRequested ? (
                    <RiderAssignment
                      riders={
                        availableRiders
                      }
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
                      onAssignRider={
                        onAssignRider
                      }
                      title="Assign pickup rider"
                      description="Choose a rider to collect the return from the customer."
                    />
                  ) : (
                    <EmptyRider
                      text="Pickup rider has not been assigned."
                    />
                  )}
                </div>
              </section>

              {/* ==================================================
                  RETURN DELIVERY RIDER
              ================================================== */}

              {isWarehouse ||
                isOutForReturn ||
                returnRequest.returnDeliveryRider ? (
                <section className="mt-5 rounded-2xl border border-[#e5e9ee] bg-white">
                  <div className="border-b border-[#edf0f3] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-blue-600">
                        <ArrowRight
                          size={18}
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-[#0b1729]">
                          Return delivery rider
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#64748b]">
                          Rider who delivers the
                          package from the warehouse
                          back to the vendor.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">

                    {returnRequest.returnDeliveryRider ? (
                      <AssignedRider
                        rider={
                          returnRequest.returnDeliveryRider
                        }
                        label="Return rider assigned"
                      />
                    ) : isVendorDelivery ? (
                      <RiderAssignment
                        riders={
                          availableRiders
                        }
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
                        onAssignRider={
                          onAssignRider
                        }
                        title="Assign return rider"
                        description="Choose a rider to deliver the package to the vendor."
                      />
                    ) : isVendorPickup ? (
                      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                        <div className="flex gap-3">
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-green-600"
                          />

                          <div>
                            <p className="text-sm font-semibold text-green-900">
                              No rider required
                            </p>

                            <p className="mt-1 text-xs leading-5 text-green-700">
                              Vendor pickup is
                              selected, so the
                              vendor will collect
                              the package from the
                              warehouse.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyRider
                        text="Return delivery rider will be assigned after the delivery option is selected."
                      />
                    )}
                  </div>
                </section>
              ) : null}

              {/* ==================================================
                  ASSIGN ERROR / SUCCESS
              ================================================== */}

              {assignError && (
                <AlertBox
                  type="error"
                  message={assignError}
                />
              )}

              {assignMessage && (
                <AlertBox
                  type="success"
                  message={assignMessage}
                />
              )}

              {/* ==================================================
                  NEXT STEP
              ================================================== */}

              {nextStatus &&
                !isCompleted &&
                !isCancelled && (
                  <section className="mt-5 rounded-2xl border border-[#e5e9ee] bg-white p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                      Next action
                    </p>

                    <h3 className="mt-1 text-base font-bold text-[#0b1729]">
                      Move return forward
                    </h3>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff1ef] text-[#e23c2e]">
                        <ArrowRight
                          size={16}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                          Next status
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#0b1729]">
                          {formatStatus(
                            nextStatus
                          )}
                        </p>
                      </div>
                    </div>

                    {/* PICKUP RIDER WARNING */}

                    {isRequested &&
                      !returnRequest.riderId && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <div className="flex gap-2.5">
                            <AlertCircle
                              size={16}
                              className="mt-0.5 shrink-0 text-amber-600"
                            />

                            <p className="text-xs leading-5 text-amber-800">
                              Assign a pickup rider
                              before moving this
                              return to Assigned To
                              Rider.
                            </p>
                          </div>
                        </div>
                      )}

                    {/* RETURN DELIVERY RIDER WARNING */}

                    {isVendorDelivery &&
                      !returnRequest.returnDeliveryRiderId && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <div className="flex gap-2.5">
                            <AlertCircle
                              size={16}
                              className="mt-0.5 shrink-0 text-amber-600"
                            />

                            <p className="text-xs leading-5 text-amber-800">
                              Assign a return delivery
                              rider before moving
                              this package to Out For
                              Return.
                            </p>
                          </div>
                        </div>
                      )}

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateStatus(
                          nextStatus
                        )
                      }
                      disabled={
                        cannotAdvance
                      }
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-bold text-white transition hover:bg-[#ce3122] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <>
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />

                          Updating...
                        </>
                      ) : (
                        <>
                          Mark as{" "}
                          {formatStatus(
                            nextStatus
                          )}

                          <ArrowRight
                            size={16}
                          />
                        </>
                      )}
                    </button>
                  </section>
                )}

              {/* ==================================================
                  STATUS ERROR
              ================================================== */}

              {statusError && (
                <AlertBox
                  type="error"
                  message={statusError}
                  className="mt-5"
                />
              )}

              {/* ==================================================
                  STATUS SUCCESS
              ================================================== */}

              {statusMessage && (
                <AlertBox
                  type="success"
                  message={statusMessage}
                  className="mt-5"
                />
              )}

              {/* ==================================================
                  COMPLETED
              ================================================== */}

              {isCompleted && (
                <section className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle2
                        size={19}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-green-900">
                        Return completed
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-green-700">
                        The returned package has
                        successfully reached the
                        vendor.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* ==================================================
                  CANCELLED
              ================================================== */}

              {isCancelled && (
                <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                      <X size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-red-900">
                        Return cancelled
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-red-700">
                        This return request has
                        been cancelled and cannot
                        be progressed further.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e8ebef] bg-white px-5 py-3 sm:px-7">
          <p className="hidden text-xs text-[#94a3b8] sm:block">
            Return ID:{" "}
            <span className="font-medium text-[#64748b]">
              {returnRequest.id}
            </span>
          </p>

          <button
            type="button"
            onClick={onClose}
            disabled={
              assigningRider ||
              updatingStatus
            }
            className="ml-auto inline-flex h-9 items-center justify-center rounded-lg border border-[#dfe3e8] px-4 text-sm font-semibold text-[#334155] transition hover:border-[#cbd5e1] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL SECTION
// ============================================================

function DetailSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e9ee] bg-white">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f4f7] text-[#0b1729]">
            {icon}
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#0b1729]">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-0.5 text-xs text-[#94a3b8]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

// ============================================================
// DETAIL ROW
// ============================================================

function DetailRow({
  label,
  value,
  icon,
  strong = false,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
  strong?: boolean;
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
      ? String(value)
      : "-";

  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
        {label}
      </p>

      <div className="mt-1.5 flex min-w-0 items-start gap-1.5">
        {icon && (
          <span className="mt-0.5 shrink-0 text-[#94a3b8]">
            {icon}
          </span>
        )}

        <p
          className={`break-words text-sm leading-5 ${
            strong
              ? "font-bold text-[#0b1729]"
              : "font-semibold text-[#334155]"
          }`}
        >
          {displayValue}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// ASSIGNED RIDER
// ============================================================

function AssignedRider({
  rider,
  label,
}: {
  rider: Rider;
  label: string;
}) {
  const riderName =
    rider.user?.name ||
    `Rider #${rider.id}`;

  return (
    <div className="rounded-xl border border-[#e5e9ee] bg-[#fafbfc] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b1729] text-sm font-bold text-white">
          {riderName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#0b1729]">
                {riderName}
              </p>

              <p className="mt-0.5 text-[11px] font-medium text-[#1e8449]">
                {label}
              </p>
            </div>

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check
                size={13}
                strokeWidth={3}
              />
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {rider.phone && (
              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                <Phone size={13} />

                <span>
                  {rider.phone}
                </span>
              </div>
            )}

            {rider.vehicleNumber && (
              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                <Truck size={13} />

                <span>
                  {rider.vehicleNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY RIDER
// ============================================================

function EmptyRider({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#dfe4e9] bg-[#fafbfc] p-4">
      <div className="flex gap-2.5">
        <Truck
          size={16}
          className="mt-0.5 shrink-0 text-[#94a3b8]"
        />

        <p className="text-xs leading-5 text-[#64748b]">
          {text}
        </p>
      </div>
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
  const selectedRider =
    riders.find(
      (rider) =>
        String(rider.id) ===
        selectedRiderId
    );

  return (
    <div className="rounded-xl border border-[#e5e9ee] bg-[#fafbfc] p-4">
      <div className="mb-4">
        <p className="text-sm font-bold text-[#0b1729]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#64748b]">
          {description}
        </p>
      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {ridersLoading ? (
        <div className="space-y-3">
          <div className="h-11 animate-pulse rounded-xl bg-[#e9edf1]" />

          <div className="h-11 animate-pulse rounded-xl bg-[#e9edf1]" />
        </div>
      ) : riders.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <div className="flex gap-2.5">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-xs font-bold text-amber-900">
                No available riders
              </p>

              <p className="mt-1 text-[11px] leading-5 text-amber-800">
                There are currently no active
                riders available for this
                assignment.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ==================================================
              RIDER SELECT
          ================================================== */}

          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
            Select rider
          </label>

          <select
            value={selectedRiderId}
            onChange={(event) =>
              setSelectedRiderId(
                event.target.value
              )
            }
            disabled={assigningRider}
            className="h-11 w-full rounded-xl border border-[#dfe3e8] bg-white px-3 text-sm font-medium text-[#0b1729] outline-none transition focus:border-[#0b1729] focus:ring-2 focus:ring-[#0b1729]/5 disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
          >
            <option value="">
              Select a rider...
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
                {rider.vehicleNumber
                  ? ` — ${rider.vehicleNumber}`
                  : ""}
              </option>
            ))}
          </select>

          {/* ==================================================
              SELECTED RIDER PREVIEW
          ================================================== */}

          {selectedRider && (
            <div className="mt-3 rounded-xl border border-[#e1e6eb] bg-white p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1729] text-xs font-bold text-white">
                  {(
                    selectedRider.user
                      ?.name ||
                    "R"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#0b1729]">
                    {selectedRider.user
                      ?.name ||
                      `Rider #${selectedRider.id}`}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#64748b]">
                    {selectedRider.phone && (
                      <span className="flex items-center gap-1">
                        <Phone
                          size={10}
                        />
                        {
                          selectedRider.phone
                        }
                      </span>
                    )}

                    {selectedRider.vehicleNumber && (
                      <span className="flex items-center gap-1">
                        <Truck
                          size={10}
                        />
                        {
                          selectedRider.vehicleNumber
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              ASSIGN BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={onAssignRider}
            disabled={
              !selectedRiderId ||
              assigningRider
            }
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e23c2e] px-4 text-sm font-bold text-white transition hover:bg-[#ce3122] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {assigningRider ? (
              <>
                <RefreshCw
                  size={15}
                  className="animate-spin"
                />

                Assigning...
              </>
            ) : (
              <>
                <Truck size={15} />

                Assign Rider
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// ALERT BOX
// ============================================================

function AlertBox({
  type,
  message,
  className = "",
}: {
  type: "error" | "success";
  message: string;
  className?: string;
}) {
  const isError =
    type === "error";

  return (
    <div
      className={`rounded-xl border p-3.5 ${
        isError
          ? "border-red-200 bg-red-50"
          : "border-green-200 bg-green-50"
      } ${className}`}
    >
      <div className="flex gap-2.5">
        {isError ? (
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-red-600"
          />
        ) : (
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-green-600"
          />
        )}

        <p
          className={`text-xs leading-5 ${
            isError
              ? "text-red-700"
              : "text-green-700"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}