"use client";

import {
  ReturnRequest,
} from "@/components/shipments/types";

type ReturnTableProps = {
  returns: ReturnRequest[];

  loading: boolean;

  error: string;

  onRefresh: () => void;

  onOpenReturn: (
    returnRequest: ReturnRequest
  ) => void;
};


// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(
  status?: string | null
) {
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

function formatReason(
  reason?: string | null
) {
  if (!reason) return "-";

  return reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


// ============================================================
// DELIVERY OPTION
// ============================================================

function formatDeliveryOption(
  option?: string | null
) {
  if (!option) {
    return "Not selected";
  }

  if (
    option === "VENDOR_PICKUP"
  ) {
    return "Vendor Pickup";
  }

  if (
    option === "DELIVER_TO_VENDOR"
  ) {
    return "Deliver To Vendor";
  }

  return formatStatus(option);
}


// ============================================================
// STATUS STYLE
// ============================================================

function getStatusStyle(
  status: string
) {
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
// MAIN COMPONENT
// ============================================================

export default function ReturnTable({
  returns,
  loading,
  error,
  onRefresh,
  onOpenReturn,
}: ReturnTableProps) {

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="rounded-xl border bg-white p-10 text-center">

        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

        <p className="mt-3 text-sm text-gray-500">
          Loading returns...
        </p>

      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">

        <p className="font-semibold text-red-700">
          Failed to load returns
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={onRefresh}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>

      </div>
    );
  }


  // ==========================================================
  // EMPTY
  // ==========================================================

  if (returns.length === 0) {

    return (
      <div className="rounded-xl border bg-white p-10 text-center">

        <p className="text-lg font-semibold text-gray-800">
          No return requests found
        </p>

        <p className="mt-1 text-sm text-gray-500">
          There are currently no returns matching
          your filters.
        </p>

        <button
          onClick={onRefresh}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Refresh
        </button>

      </div>
    );
  }


  return (
    <>

      {/* ====================================================== */}
      {/* DESKTOP TABLE */}
      {/* ====================================================== */}

      <div className="hidden overflow-hidden rounded-xl border bg-white md:block">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Tracking
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Vendor
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Reason
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Return Option
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Rider
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody className="divide-y">

              {returns.map(
                (item) => (

                  <tr
                    key={item.id}
                    onClick={() =>
                      onOpenReturn(item)
                    }
                    className="cursor-pointer transition hover:bg-gray-50"
                  >

                    {/* ====================================== */}
                    {/* TRACKING */}
                    {/* ====================================== */}

                    <td className="px-5 py-4">

                      <p className="font-semibold text-gray-900">
                        {
                          item.shipment
                            ?.trackingNumber
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Return ID: {item.id}
                      </p>

                    </td>


                    {/* ====================================== */}
                    {/* VENDOR */}
                    {/* ====================================== */}

                    <td className="px-5 py-4">

                      <p className="font-medium text-gray-800">
                        {
                          item.shipment
                            ?.vendor?.name ||
                          "-"
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {
                          item.shipment
                            ?.vendor?.location ||
                          "-"
                        }
                      </p>

                    </td>


                    {/* ====================================== */}
                    {/* CUSTOMER */}
                    {/* ====================================== */}

                    <td className="px-5 py-4">

                      <p className="font-medium text-gray-800">
                        {
                          item.shipment
                            ?.customer?.name ||
                          "-"
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {
                          item.shipment
                            ?.customer?.phone ||
                          "-"
                        }
                      </p>

                    </td>


                    {/* ====================================== */}
                    {/* REASON */}
                    {/* ====================================== */}

                    <td className="px-5 py-4">

                      <p className="text-sm font-medium">
                        {formatReason(
                          item.reason
                        )}
                      </p>

                    </td>


                    {/* ====================================== */}
                    {/* DELIVERY OPTION */}
                    {/* ====================================== */}

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {formatDeliveryOption(
                          item.deliveryOption
                        )}
                      </span>

                    </td>


                    {/* ====================================== */}
                    {/* RIDER */}
                    {/* ====================================== */}

                    <td className="px-5 py-4">

                      {item.returnDeliveryRider ? (

                        <div>

                          <p className="font-medium text-gray-800">
                            {
                              item
                                .returnDeliveryRider
                                .user?.name ||
                              "-"
                            }
                          </p>

                          <p className="mt-1 text-xs text-blue-600">
                            Return delivery
                          </p>

                        </div>

                      ) : item.rider ? (

                        <div>

                          <p className="font-medium text-gray-800">
                            {
                              item.rider
                                .user?.name ||
                              "-"
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Original pickup
                          </p>

                        </div>

                      ) : (

                        <span className="text-sm text-gray-400">
                          Unassigned
                        </span>

                      )}

                    </td>


                    {/* ====================================== */}
                    {/* STATUS */}
                    {/* ====================================== */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {formatStatus(
                          item.status
                        )}
                      </span>

                    </td>


                    {/* ====================================== */}
                    {/* ACTION */}
                    {/* ====================================== */}

                    <td
                      className="px-5 py-4 text-right"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      <button
                        onClick={() =>
                          onOpenReturn(item)
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        View
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ====================================================== */}
      {/* MOBILE */}
      {/* ====================================================== */}

      <div className="space-y-4 md:hidden">

        {returns.map(
          (item) => (

            <div
              key={item.id}
              onClick={() =>
                onOpenReturn(item)
              }
              className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm"
            >

              {/* ============================================ */}
              {/* HEADER */}
              {/* ============================================ */}

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="text-sm font-bold text-gray-900">
                    {
                      item.shipment
                        ?.trackingNumber
                    }
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {
                      item.shipment
                        ?.vendor?.name ||
                      "-"
                    }
                  </p>

                </div>


                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                    item.status
                  )}`}
                >
                  {formatStatus(
                    item.status
                  )}
                </span>

              </div>


              {/* ============================================ */}
              {/* DETAILS */}
              {/* ============================================ */}

              <div className="mt-4 space-y-3">

                <MobileInfo
                  label="Customer"
                  value={
                    item.shipment
                      ?.customer?.name
                  }
                />

                <MobileInfo
                  label="Reason"
                  value={formatReason(
                    item.reason
                  )}
                />

                <MobileInfo
                  label="Return Option"
                  value={formatDeliveryOption(
                    item.deliveryOption
                  )}
                />


                <MobileInfo
                  label="Rider"
                  value={
                    item.returnDeliveryRider
                      ?.user?.name
                      ? `${item.returnDeliveryRider.user.name} (Return Delivery)`
                      : item.rider?.user?.name
                        ? `${item.rider.user.name} (Original Pickup)`
                        : "Unassigned"
                  }
                />

              </div>


              {/* ============================================ */}
              {/* BUTTON */}
              {/* ============================================ */}

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenReturn(item);
                }}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View Return
              </button>

            </div>

          )
        )}

      </div>

    </>
  );
}


// ============================================================
// MOBILE INFO
// ============================================================

function MobileInfo({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-800">
        {value || "-"}
      </span>

    </div>
  );
}