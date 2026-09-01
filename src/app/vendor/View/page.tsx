"use client";

import { useEffect, useState } from "react";

type Shipment = {
  id: string;
  trackingNumber: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  packageType: string;

  weight: number;

  paymentType: "PREPAID" | "COD";

  codAmount: number;
  shippingCharge: number;

  origin: string;
  deliveryZone: string;
  status: string;

  qrCode?: string;

  createdAt: string;

  locationRate?: {
    id: number;
    price: number;

    location?: {
      id: number;
      name: string;
      zone: string;
    };

    deliveryType?: {
      id: number;
      name: string;
    };
  };

  rider?: {
    id: number;

    user?: {
      name: string;
      phone?: string;
    };
  };

  trackings?: {
    id: string;
    status: string;
    location?: string;
    message?: string;
    createdAt: string;
  }[];
};

export default function VendorShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [selectedShipment, setSelectedShipment] =
    useState<Shipment | null>(null);

  // =====================================================
  // LOAD MY SHIPMENTS
  // =====================================================

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
        setError(
          "You are not logged in. Please login again."
        );

        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/my`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to load shipments"
        );
      }

      setShipments(
        Array.isArray(data)
          ? data
          : data.shipments || []
      );
    } catch (error) {
      console.error(
        "LOAD SHIPMENTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load shipments"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date: string) {
    return new Date(date).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // STATUS COLOR
  // =====================================================

  function getStatusClass(status: string) {
    switch (status) {
      case "CREATED":
        return "bg-blue-50 text-blue-700";

      case "RECEIVED":
        return "bg-indigo-50 text-indigo-700";

      case "PICKED_UP":
        return "bg-purple-50 text-purple-700";

      case "OUT_FOR_DELIVERY":
        return "bg-orange-50 text-orange-700";

      case "DELIVERED":
        return "bg-green-50 text-green-700";

      case "CANCELLED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredShipments =
    shipments.filter((shipment) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        shipment.trackingNumber
          .toLowerCase()
          .includes(searchText) ||
        shipment.receiverName
          .toLowerCase()
          .includes(searchText) ||
        shipment.receiverPhone
          .toLowerCase()
          .includes(searchText) ||
        shipment.locationRate?.location?.name
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        shipment.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalShipments =
    shipments.length;

  const createdCount =
    shipments.filter(
      (s) => s.status === "CREATED"
    ).length;

  const deliveryCount =
    shipments.filter(
      (s) =>
        s.status === "OUT_FOR_DELIVERY"
    ).length;

  const deliveredCount =
    shipments.filter(
      (s) => s.status === "DELIVERED"
    ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-sm text-gray-500">
            Loading your shipments...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto max-w-7xl text-black">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-2xl font-bold text-ink">
            My Shipments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and track all shipments created by you.
          </p>
        </div>

        <button
          onClick={loadShipments}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">
            Total Shipments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalShipments}
          </p>
        </div>

        {/* CREATED */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">
            Created
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {createdCount}
          </p>
        </div>

        {/* OUT FOR DELIVERY */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">
            Out for Delivery
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {deliveryCount}
          </p>
        </div>

        {/* DELIVERED */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-500">
            Delivered
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {deliveredCount}
          </p>
        </div>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* SEARCH */}

          <div className="flex-1">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tracking number, receiver or destination..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-accent"
            />

          </div>

          {/* STATUS */}

          <div className="md:w-56">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="CREATED">
                Created
              </option>

              <option value="RECEIVED">
                Received
              </option>

              <option value="PICKED_UP">
                Picked Up
              </option>

              <option value="OUT_FOR_DELIVERY">
                Out for Delivery
              </option>

              <option value="DELIVERED">
                Delivered
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          DESKTOP TABLE
      ================================================= */}

      <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 lg:block">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Shipment
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Receiver
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Destination
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Delivery
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Weight
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Charge
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {filteredShipments.length === 0 ? (

                <tr>

                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center"
                  >
                    <div className="text-sm font-medium text-gray-700">
                      No shipments found
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Try changing your search or filter.
                    </p>
                  </td>

                </tr>

              ) : (

                filteredShipments.map(
                  (shipment) => (

                    <tr
                      key={shipment.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* SHIPMENT */}

                      <td className="px-5 py-4">

                        <div className="font-semibold">
                          {shipment.trackingNumber}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            shipment.createdAt
                          )}
                        </div>

                      </td>

                      {/* RECEIVER */}

                      <td className="px-5 py-4">

                        <div className="font-medium">
                          {shipment.receiverName}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {shipment.receiverPhone}
                        </div>

                      </td>

                      {/* DESTINATION */}

                      <td className="px-5 py-4">

                        <div className="font-medium">
                          {
                            shipment.locationRate
                              ?.location?.name ||
                            "N/A"
                          }
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {
                            shipment.deliveryZone ||
                            shipment.locationRate
                              ?.location?.zone ||
                            ""
                          }
                        </div>

                      </td>

                      {/* DELIVERY TYPE */}

                      <td className="px-5 py-4">

                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium">
                          {
                            shipment.locationRate
                              ?.deliveryType?.name ||
                            "N/A"
                          }
                        </span>

                      </td>

                      {/* WEIGHT */}

                      <td className="px-5 py-4">

                        {shipment.weight} kg

                      </td>

                      {/* CHARGE */}

                      <td className="px-5 py-4">

                        <div className="font-semibold">
                          Rs.{" "}
                          {Number(
                            shipment.shippingCharge
                          ).toLocaleString()}
                        </div>

                      </td>

                      {/* PAYMENT */}

                      <td className="px-5 py-4">

                        <div className="text-sm font-medium">
                          {shipment.paymentType ===
                          "COD"
                            ? "COD"
                            : "Prepaid"}
                        </div>

                        {shipment.paymentType ===
                          "COD" && (
                          <div className="mt-1 text-xs text-gray-500">
                            Rs.{" "}
                            {Number(
                              shipment.codAmount
                            ).toLocaleString()}
                          </div>
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            shipment.status
                          )}`}
                        >
                          {shipment.status.replace(
                            /_/g,
                            " "
                          )}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <button
                          onClick={() =>
                            setSelectedShipment(
                              shipment
                            )
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold transition hover:bg-gray-50"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          MOBILE CARDS
      ================================================= */}

      <div className="mt-6 space-y-4 lg:hidden">

        {filteredShipments.length === 0 ? (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">

            <div className="font-medium text-gray-700">
              No shipments found
            </div>

          </div>

        ) : (

          filteredShipments.map(
            (shipment) => (

              <div
                key={shipment.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="font-bold">
                      {shipment.trackingNumber}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(
                        shipment.createdAt
                      )}
                    </p>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      shipment.status
                    )}`}
                  >
                    {shipment.status.replace(
                      /_/g,
                      " "
                    )}
                  </span>

                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Receiver
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {shipment.receiverName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Destination
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        shipment.locationRate
                          ?.location?.name ||
                        "N/A"
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Delivery
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        shipment.locationRate
                          ?.deliveryType?.name ||
                        "N/A"
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Weight
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {shipment.weight} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Shipping Charge
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      Rs.{" "}
                      {Number(
                        shipment.shippingCharge
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Payment
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {shipment.paymentType ===
                      "COD"
                        ? `COD Rs. ${Number(
                            shipment.codAmount
                          ).toLocaleString()}`
                        : "Prepaid"}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedShipment(
                      shipment
                    )
                  }
                  className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
                >
                  View Shipment
                </button>

              </div>

            )
          )

        )}

      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedShipment && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() =>
            setSelectedShipment(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-lg font-bold">
                  Shipment Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {
                    selectedShipment.trackingNumber
                  }
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedShipment(null)
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-6 p-6">

              {/* STATUS */}

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">

                <div>

                  <p className="text-xs text-gray-500">
                    Current Status
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedShipment.status.replace(
                      /_/g,
                      " "
                    )}
                  </p>

                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    selectedShipment.status
                  )}`}
                >
                  {selectedShipment.status.replace(
                    /_/g,
                    " "
                  )}
                </span>

              </div>

              {/* RECEIVER */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Receiver Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  <Info
                    label="Name"
                    value={
                      selectedShipment.receiverName
                    }
                  />

                  <Info
                    label="Phone"
                    value={
                      selectedShipment.receiverPhone
                    }
                  />

                  <div className="sm:col-span-2">
                    <Info
                      label="Address"
                      value={
                        selectedShipment.receiverAddress
                      }
                    />
                  </div>

                </div>

              </div>

              {/* DELIVERY */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Delivery Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  <Info
                    label="Destination"
                    value={
                      selectedShipment
                        .locationRate
                        ?.location?.name ||
                      "N/A"
                    }
                  />

                  <Info
                    label="Zone"
                    value={
                      selectedShipment
                        .deliveryZone ||
                      selectedShipment
                        .locationRate
                        ?.location?.zone ||
                      "N/A"
                    }
                  />

                  <Info
                    label="Delivery Type"
                    value={
                      selectedShipment
                        .locationRate
                        ?.deliveryType
                        ?.name ||
                      "N/A"
                    }
                  />

                  <Info
                    label="Weight"
                    value={`${selectedShipment.weight} kg`}
                  />

                  <Info
                    label="Shipping Charge"
                    value={`Rs. ${Number(
                      selectedShipment.shippingCharge
                    ).toLocaleString()}`}
                  />

                  <Info
                    label="Package Type"
                    value={
                      selectedShipment.packageType
                    }
                  />

                </div>

              </div>

              {/* PAYMENT */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Payment
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  <Info
                    label="Payment Type"
                    value={
                      selectedShipment.paymentType ===
                      "COD"
                        ? "Cash On Delivery"
                        : "Prepaid"
                    }
                  />

                  {selectedShipment.paymentType ===
                    "COD" && (
                    <Info
                      label="COD Amount"
                      value={`Rs. ${Number(
                        selectedShipment.codAmount
                      ).toLocaleString()}`}
                    />
                  )}

                </div>

              </div>

              {/* RIDER */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Rider
                </h3>

                {selectedShipment.rider ? (

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="font-medium">
                      {
                        selectedShipment.rider
                          .user?.name ||
                        "Rider"
                      }
                    </p>

                    {selectedShipment.rider
                      .user?.phone && (
                      <p className="mt-1 text-sm text-gray-500">
                        {
                          selectedShipment.rider
                            .user.phone
                        }
                      </p>
                    )}

                  </div>

                ) : (

                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    Rider has not been assigned yet.
                  </div>

                )}

              </div>

              {/* TRACKING */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Tracking History
                </h3>

                {selectedShipment.trackings &&
                selectedShipment.trackings.length >
                  0 ? (

                  <div className="space-y-4">

                    {selectedShipment.trackings.map(
                      (tracking) => (

                        <div
                          key={tracking.id}
                          className="relative border-l-2 border-gray-200 pl-4"
                        >

                          <div className="font-medium">
                            {tracking.status.replace(
                              /_/g,
                              " "
                            )}
                          </div>

                          {tracking.location && (
                            <div className="mt-1 text-sm text-gray-500">
                              {tracking.location}
                            </div>
                          )}

                          {tracking.message && (
                            <div className="mt-1 text-sm text-gray-600">
                              {tracking.message}
                            </div>
                          )}

                          <div className="mt-1 text-xs text-gray-400">
                            {formatDate(
                              tracking.createdAt
                            )}
                          </div>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="text-sm text-gray-500">
                    No tracking history available.
                  </div>

                )}

              </div>

              {/* QR */}

              {selectedShipment.qrCode && (

                <div className="border-t pt-6 text-center">

                  <h3 className="mb-3 font-semibold">
                    Shipment QR Code
                  </h3>

                  <img
                    src={
                      selectedShipment.qrCode
                    }
                    alt="Shipment QR Code"
                    className="mx-auto h-40 w-40 object-contain"
                  />

                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t px-6 py-4">

              <button
                onClick={() =>
                  setSelectedShipment(null)
                }
                className="w-full rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-dark"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// =====================================================
// INFO COMPONENT
// =====================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>
    </div>
  );
}