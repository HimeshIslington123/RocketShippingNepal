"use client";

import { Shipment } from "./types";



type ShipmentTableProps = {
  shipments: Shipment[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onOpenShipment: (shipment: Shipment) => void;
  onPrint: (
    shipment: Shipment,
    e?: React.MouseEvent
  ) => void;
};

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

export default function ShipmentTable({
  shipments,
  loading,
  error,
  onRefresh,
  onOpenShipment,
  onPrint,
}: ShipmentTableProps) {
  return (
    <div className="mx-auto max-w-7xl text-black">

      {/* HEADER */}

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

      {!loading && error && (
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
            Loading shipments...
          </p>
        </div>
      )}

      {/* TABLE */}

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

              {shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  onClick={() =>
                    onOpenShipment(shipment)
                  }
                  className="cursor-pointer hover:bg-gray-50"
                >

                  {/* TRACKING */}

                  <td className="px-4 py-4">

                    <p className="font-semibold">
                      {shipment.trackingNumber}
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
                      {shipment.receiverName}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {shipment.receiverPhone}
                    </p>

                  </td>

                  {/* DESTINATION */}

                  <td className="px-4 py-4">

                    <p className="font-medium">
                      {shipment.locationRate
                        ?.location?.name || "—"}
                    </p>

                    {shipment.locationRate
                      ?.deliveryType && (
                      <p className="mt-1 text-xs text-gray-400">
                        {
                          shipment
                            .locationRate
                            .deliveryType.name
                        }
                      </p>
                    )}

                  </td>

                  {/* PACKAGE */}

                  <td className="px-4 py-4">

                    <p className="font-medium">
                      {shipment.packageType}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {shipment.weight} kg
                    </p>

                  </td>

                  {/* PAYMENT */}

                  <td className="px-4 py-4">

                    <p className="font-medium">
                      {shipment.paymentType}
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
                              .user?.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            shipment.rider
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

                  {/* PRINT */}

                  <td className="px-4 py-4 text-right">

                    <button
                      onClick={(e) =>
                        onPrint(
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
              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}