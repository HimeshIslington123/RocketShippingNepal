
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

  setSelectedRiderId: (
    value: string
  ) => void;

  assigningRider: boolean;

  assignError: string;

  assignMessage: string;

  updatingStatus: boolean;

  statusError: string;

  statusMessage: string;

  onAssignRider: () => void;

  onUpdateStatus: (
    status: ReturnStatus
  ) => void;

  onClose: () => void;
};

/* ============================================================
   RETURN FLOW
============================================================ */

const RETURN_FLOW: ReturnStatus[] = [
  "REQUESTED",
  "ASSIGNED_TO_RIDER",
  "PICKED_UP_FROM_CUSTOMER",
  "IN_WAREHOUSE",
  "OUT_FOR_RETURN",
  "RETURNED_TO_VENDOR",
];

/* ============================================================
   RETURN TRACKING STATUS MAP
============================================================ */

const RETURN_TRACKING_STATUS: Record<
  ReturnStatus,
  string | null
> = {
  REQUESTED:
    "RETURN_REQUESTED",

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

/* ============================================================
   STATUS STYLES
============================================================ */

const STATUS_STYLES: Record<
  string,
  string
> = {
  REQUESTED:
    "bg-yellow-50 text-yellow-700 ring-yellow-600/20",

  ASSIGNED_TO_RIDER:
    "bg-blue-50 text-blue-700 ring-blue-600/20",

  PICKED_UP_FROM_CUSTOMER:
    "bg-purple-50 text-purple-700 ring-purple-600/20",

  IN_WAREHOUSE:
    "bg-amber-50 text-amber-700 ring-amber-600/20",

  OUT_FOR_RETURN:
    "bg-orange-50 text-orange-700 ring-orange-600/20",

  RETURNED_TO_VENDOR:
    "bg-green-50 text-green-700 ring-green-600/20",

  CANCELLED:
    "bg-red-50 text-red-700 ring-red-600/20",
};

/* ============================================================
   FORMAT STATUS
============================================================ */

function formatStatus(
  status?: string
) {
  if (!status) return "—";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ============================================================
   FORMAT REASON
============================================================ */

function formatReason(
  reason?: string
) {
  if (!reason) return "—";

  return reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(
  iso?: string
) {
  if (!iso) return "—";

  return new Date(
    iso
  ).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ============================================================
   STATUS STYLE
============================================================ */

function getStatusStyle(
  status?: string
) {
  return (
    STATUS_STYLES[
      status || ""
    ] ||
    "bg-gray-50 text-gray-700 ring-gray-600/20"
  );
}

/* ============================================================
   GET NEXT STATUS
============================================================ */

function getNextStatus(
  status?: ReturnStatus
) {
  if (!status) {
    return null;
  }

  const index =
    RETURN_FLOW.indexOf(status);

  if (
    index < 0 ||
    index >=
      RETURN_FLOW.length - 1
  ) {
    return null;
  }

  return RETURN_FLOW[
    index + 1
  ];
}

/* ============================================================
   COMPONENT
============================================================ */

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

  const shipment =
    returnRequest.shipment;

  const nextStatus =
    getNextStatus(
      returnRequest.status
    );

  /* ==========================================================
     AVAILABLE RIDERS
  ========================================================== */

  const availableRiders =
    riders.filter(
      (rider) =>
        rider.isAvailable !== false
    );

  /* ==========================================================
     CURRENT RETURN INDEX
  ========================================================== */

  const completedIndex =
    RETURN_FLOW.indexOf(
      returnRequest.status
    );

  /* ==========================================================
     IMPORTANT:

     ONLY RETURN TRACKING EVENTS ARE USED FOR THE
     RETURN TIMELINE.

     Normal shipment events such as:

       IN_WAREHOUSE
       ASSIGNED_TO_RIDER
       OUT_FOR_DELIVERY
       DELIVERED

     ARE NOT USED HERE.

     Instead we use:

       RETURN_REQUESTED
       RETURN_ASSIGNED_TO_RIDER
       RETURN_PICKED_UP_FROM_CUSTOMER
       RETURN_IN_WAREHOUSE
       OUT_FOR_RETURN
       RETURNED_TO_VENDOR
  ========================================================== */

  const returnTrackings =
    shipment?.trackings?.filter(
      (tracking) =>
        [
          "RETURN_REQUESTED",
          "RETURN_ASSIGNED_TO_RIDER",
          "RETURN_PICKED_UP_FROM_CUSTOMER",
          "RETURN_IN_WAREHOUSE",
          "OUT_FOR_RETURN",
          "RETURNED_TO_VENDOR",
        ].includes(
          tracking.status
        )
    ) ?? [];

  /* ==========================================================
     FIND RETURN TRACKING EVENT
  ========================================================== */

  const getReturnTracking = (
    status: ReturnStatus
  ) => {
    const trackingStatus =
      RETURN_TRACKING_STATUS[
        status
      ];

    if (!trackingStatus) {
      return undefined;
    }

    return returnTrackings.find(
      (tracking) =>
        tracking.status ===
        trackingStatus
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-black"
      onClick={onClose}
    >

      <div
        className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-start justify-between border-b px-6 py-5">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Return Tracking
            </p>

            {/* SAME ORIGINAL TRACKING NUMBER */}

            <h2 className="mt-1 text-xl font-black">
              {
                shipment?.trackingNumber ||
                "—"
              }
            </h2>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                returnRequest.status
              )}`}
            >
              {formatStatus(
                returnRequest.status
              )}
            </span>

          </div>

          <button
            onClick={onClose}
            disabled={
              assigningRider ||
              updatingStatus
            }
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>

        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="grid gap-6 p-6 md:grid-cols-3">

          {/* ===================================================
              LEFT SIDE
          ==================================================== */}

          <div className="space-y-7 md:col-span-2">

            {/* =================================================
                ORIGINAL SHIPMENT
            ================================================== */}

            <section>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Original Shipment
              </p>

              <div className="mt-4 rounded-xl border">

                <div className="grid grid-cols-2 divide-x divide-y">

                  <InfoItem
                    label="Tracking Number"
                    value={
                      shipment?.trackingNumber ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Original Shipment Status"
                    value={
                      shipment?.status ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Vendor"
                    value={
                      shipment?.vendor
                        ?.companyName ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Vendor Location"
                    value={
                      shipment?.vendor
                        ?.location ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Customer"
                    value={
                      shipment?.receiverName ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Customer Phone"
                    value={
                      shipment?.receiverPhone ||
                      "—"
                    }
                  />

                  <div className="col-span-2 px-4 py-4">

                    <p className="text-xs text-gray-400">
                      Customer Address
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        shipment?.receiverAddress ||
                        "—"
                      }
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                RETURN DETAILS
            ================================================== */}

            <section>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Return Details
              </p>

              <div className="mt-4 rounded-xl border">

                <div className="grid grid-cols-2 divide-x divide-y">

                  <InfoItem
                    label="Reason"
                    value={formatReason(
                      returnRequest.reason
                    )}
                  />

                  <InfoItem
                    label="Requested"
                    value={formatDate(
                      returnRequest.requestedAt
                    )}
                  />

                  <InfoItem
                    label="Picked Up"
                    value={formatDate(
                      returnRequest.pickedUpAt ||
                        undefined
                    )}
                  />

                  <InfoItem
                    label="Completed"
                    value={formatDate(
                      returnRequest.completedAt ||
                        undefined
                    )}
                  />

                  <div className="col-span-2 px-4 py-4">

                    <p className="text-xs text-gray-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        returnRequest.description ||
                        "No description provided."
                      }
                    </p>

                  </div>

                  <div className="col-span-2 px-4 py-4">

                    <p className="text-xs text-gray-400">
                      Notes
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        returnRequest.notes ||
                        "No notes."
                      }
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                RETURN TIMELINE
            ================================================== */}

            <section>

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Return Timeline
              </p>

              <div className="mt-4 rounded-xl border p-5">

                <div className="space-y-5">

                  {RETURN_FLOW.map(
                    (
                      step,
                      index
                    ) => {

                      /* ========================================
                         FIND ONLY THE RETURN TRACKING EVENT

                         Example:

                         Step:
                           IN_WAREHOUSE

                         Search:
                           RETURN_IN_WAREHOUSE

                         NOT:
                           IN_WAREHOUSE
                      ======================================== */

                      const tracking =
                        getReturnTracking(
                          step
                        );

                      /* ========================================
                         STEP IS COMPLETED ONLY WHEN ITS
                         RETURN TRACKING EVENT EXISTS

                         This prevents the old shipment
                         IN_WAREHOUSE event from appearing
                         in the return timeline.
                      ======================================== */

                      const done =
                        !!tracking;

                      const current =
                        step ===
                        returnRequest.status;

                      return (
                        <div
                          key={step}
                          className="flex gap-4"
                        >

                          {/* ==================================
                              TIMELINE ICON
                          =================================== */}

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
                                : "○"}
                            </div>

                            {index <
                              RETURN_FLOW.length -
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

                          {/* ==================================
                              TIMELINE CONTENT
                          =================================== */}

                          <div>

                            <p
                              className={`text-sm font-semibold ${
                                current
                                  ? "text-accent"
                                  : done
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {formatStatus(
                                step
                              )}
                            </p>

                            {/* =================================
                                ONLY SHOW DATE/MESSAGE WHEN
                                THE RETURN EVENT EXISTS
                            ================================== */}

                            {tracking && (
                              <>
                                <p className="mt-1 text-xs text-gray-400">
                                  {formatDate(
                                    tracking.createdAt
                                  )}

                                  {tracking.location
                                    ? ` · ${tracking.location}`
                                    : ""}
                                </p>

                                {tracking.message && (
                                  <p className="mt-1 text-xs text-gray-500">
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

              </div>

            </section>

            {/* =================================================
                COMPLETE TRACKING HISTORY
                IMPORTANT:
                KEEP ALL EVENTS HERE
            ================================================== */}

            {shipment?.trackings &&
              shipment.trackings.length >
                0 && (
                <section>

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Tracking History
                  </p>

                  <div className="mt-4 space-y-2">

                    {shipment.trackings.map(
                      (tracking) => (
                        <div
                          key={tracking.id}
                          className="rounded-xl bg-gray-50 p-4"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <p className="text-sm font-semibold">
                              {formatStatus(
                                tracking.status
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              {formatDate(
                                tracking.createdAt
                              )}
                            </p>

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

                </section>
              )}

          </div>

          {/* ===================================================
              RIGHT SIDE
          ==================================================== */}

          <div className="space-y-4">

            {/* =================================================
                CURRENT RIDER
            ================================================== */}

            {returnRequest.rider && (
              <div className="rounded-xl border p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Return Rider
                </p>

                <div className="mt-4 space-y-3">

                  <InfoRow
                    label="Name"
                    value={
                      returnRequest.rider
                        .user?.name ||
                      `Rider #${returnRequest.rider.id}`
                    }
                  />

                  <InfoRow
                    label="Phone"
                    value={
                      returnRequest.rider
                        .phone ||
                      "—"
                    }
                  />

                  <InfoRow
                    label="Vehicle"
                    value={
                      returnRequest.rider
                        .vehicleNumber ||
                      "—"
                    }
                  />

                </div>

              </div>
            )}

            {/* =================================================
                ASSIGN RIDER
            ================================================== */}

            {returnRequest.status ===
              "REQUESTED" && (
              <div className="rounded-xl border p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Assign Rider
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Rider will pick up the package
                  from the customer.
                </p>

                <select
                  value={
                    selectedRiderId
                  }
                  onChange={(event) =>
                    setSelectedRiderId(
                      event.target.value
                    )
                  }
                  disabled={
                    ridersLoading ||
                    assigningRider
                  }
                  className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-gray-100"
                >

                  <option value="">
                    {ridersLoading
                      ? "Loading riders..."
                      : "Select rider"}
                  </option>

                  {availableRiders.map(
                    (rider) => (
                      <option
                        key={rider.id}
                        value={rider.id}
                      >
                        {
                          rider.user?.name ||
                          `Rider #${rider.id}`
                        }
                        {" — "}
                        {
                          rider.phone
                        }
                      </option>
                    )
                  )}

                </select>

                <button
                  onClick={
                    onAssignRider
                  }
                  disabled={
                    !selectedRiderId ||
                    assigningRider ||
                    ridersLoading
                  }
                  className="mt-3 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assigningRider
                    ? "Assigning..."
                    : "Assign Rider"}
                </button>

                {assignMessage && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3">
                    <p className="text-xs font-medium text-green-700">
                      {assignMessage}
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

              </div>
            )}

            {/* =================================================
                NEXT STATUS
            ================================================== */}

            {nextStatus &&
              returnRequest.status !==
                "REQUESTED" && (
                <div className="rounded-xl border p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Next Return Step
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    {formatStatus(
                      nextStatus
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    This will add a tracking
                    event using the same
                    shipment tracking number.
                  </p>

                  <button
                    onClick={() =>
                      onUpdateStatus(
                        nextStatus
                      )
                    }
                    disabled={
                      updatingStatus
                    }
                    className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
                  >
                    {updatingStatus
                      ? "Updating..."
                      : `Mark ${formatStatus(
                          nextStatus
                        )}`}
                  </button>

                </div>
              )}

            {/* =================================================
                STATUS MESSAGE
            ================================================== */}

            {statusMessage && (
              <div className="rounded-xl bg-green-50 p-4">

                <p className="text-xs font-medium text-green-700">
                  {statusMessage}
                </p>

              </div>
            )}

            {statusError && (
              <div className="rounded-xl bg-red-50 p-4">

                <p className="text-xs font-medium text-red-700">
                  {statusError}
                </p>

              </div>
            )}

            {/* =================================================
                FINAL
            ================================================== */}

            {returnRequest.status ===
              "RETURNED_TO_VENDOR" && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                <p className="text-sm font-bold text-green-800">
                  Return completed
                </p>

                <p className="mt-1 text-xs text-green-700">
                  Package has been returned
                  to the vendor.
                </p>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

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

      <p className="mt-1 break-words text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-xs text-gray-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium">
        {value}
      </span>

    </div>
  );
}

