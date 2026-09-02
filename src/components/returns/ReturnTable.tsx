"use client";

import {
  ReturnRequest,
  ReturnStatus,
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

function getStatusStyle(
  status?: ReturnStatus
) {
  return (
    STATUS_STYLES[
      status || ""
    ] ||
    "bg-gray-50 text-gray-700 ring-gray-600/20"
  );
}

export default function ReturnTable({
  returns,
  loading,
  error,
  onRefresh,
  onOpenReturn,
}: ReturnTableProps) {
  return (
    <div className="mx-auto max-w-7xl text-black">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold">
            Return Requests
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage vendor return requests
            and assign riders.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">
            Loading return requests...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        returns.length === 0 && (
          <div className="mt-6 rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">

            <div className="text-4xl">
              ↩
            </div>

            <h2 className="mt-4 text-lg font-bold">
              No return requests
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Vendor return requests will
              appear here.
            </p>

          </div>
        )}

      {/* DESKTOP TABLE */}

      {!loading &&
        !error &&
        returns.length > 0 && (
          <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:block">

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200 text-sm">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left font-semibold">
                      Tracking #
                    </th>

                    <th className="px-5 py-4 text-left font-semibold">
                      Vendor
                    </th>

                    <th className="px-5 py-4 text-left font-semibold">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left font-semibold">
                      Reason
                    </th>

                    <th className="px-5 py-4 text-left font-semibold">
                      Rider
                    </th>

                    <th className="px-5 py-4 text-left font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {returns.map(
                    (item) => {

                      const shipment =
                        item.shipment;

                      return (
                        <tr
                          key={item.id}
                          onClick={() =>
                            onOpenReturn(
                              item
                            )
                          }
                          className="cursor-pointer hover:bg-gray-50"
                        >

                          <td className="px-5 py-4">

                            <p className="font-bold">
                              {
                                shipment?.trackingNumber ||
                                "—"
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {formatDate(
                                item.requestedAt
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <p className="font-medium">
                              {
                                shipment?.vendor
                                  ?.companyName ||
                                "Vendor"
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {
                                shipment?.vendor
                                  ?.location ||
                                "—"
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <p className="font-medium">
                              {
                                shipment?.receiverName ||
                                "—"
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {
                                shipment?.receiverPhone ||
                                "—"
                              }
                            </p>

                          </td>

                          <td className="px-5 py-4">
                            {formatReason(
                              item.reason
                            )}
                          </td>

                          <td className="px-5 py-4">

                            {item.rider ? (
                              <>
                                <p className="font-medium">
                                  {
                                    item.rider
                                      .user
                                      ?.name ||
                                    `Rider #${item.rider.id}`
                                  }
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {
                                    item.rider
                                      .phone
                                  }
                                </p>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Unassigned
                              </span>
                            )}

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                                item.status
                              )}`}
                            >
                              {formatStatus(
                                item.status
                              )}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-right">

                            <button
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                onOpenReturn(
                                  item
                                );
                              }}
                              className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-dark"
                            >
                              View
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      {/* MOBILE */}

      {!loading &&
        !error &&
        returns.length > 0 && (
          <div className="mt-6 space-y-4 lg:hidden">

            {returns.map(
              (item) => {

                const shipment =
                  item.shipment;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      onOpenReturn(
                        item
                      )
                    }
                    className="w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-xs font-semibold uppercase text-gray-400">
                          Tracking
                        </p>

                        <p className="mt-1 text-lg font-black">
                          {
                            shipment?.trackingNumber ||
                            "—"
                          }
                        </p>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {formatStatus(
                          item.status
                        )}
                      </span>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-xs text-gray-400">
                          Vendor
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            shipment?.vendor
                              ?.companyName ||
                            "—"
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-400">
                          Customer
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            shipment?.receiverName ||
                            "—"
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-400">
                          Reason
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatReason(
                            item.reason
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-gray-400">
                          Rider
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            item.rider
                              ?.user
                              ?.name ||
                            "Unassigned"
                          }
                        </p>

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

    </div>
  );
}