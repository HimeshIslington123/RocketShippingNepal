"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

type Vendor = {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
  userId: number;
};

type Rider = {
  id: number;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  isAvailable?: boolean;
  vehicleNumber?: string | null;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

type Tracking = {
  id: number;
  status: string;
  createdAt: string;
  location?: string | null;
  note?: string | null;
};

type Shipment = {
  id: string;
  trackingNumber: string;
  qrCode: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageType: string;
  weight: number;
  paymentType: "PREPAID" | "COD";
  codAmount: number;
  priceLocationId: number;
  shippingCharge: number;
  notes: string;
  vendorId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  vendor: Vendor;
  trackings?: Tracking[];
  rider?: Rider | null;
  riderId?: number | null;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  IN_TRANSIT: "bg-blue-50 text-blue-700 ring-blue-600/20",
  DELIVERED: "bg-green-50 text-green-700 ring-green-600/20",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
};

const STEPS = [
  "RECEIVED",
  "IN_WAREHOUSE",
  "DISPATCHED",
  "ARRIVED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString()}`;
}

// Given the shipment's current status, return the only status staff can move to next.
function getNextStatus(currentStatus: string): string | null {
  const idx = STEPS.indexOf(currentStatus);
  if (idx === -1 || idx === STEPS.length - 1) return null;
  return STEPS[idx + 1];
}

export default function ShipmentsListPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptShipment, setReceiptShipment] = useState<Shipment | null>(
    null
  );
  const [detailsShipment, setDetailsShipment] = useState<Shipment | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Status-update panel state
  const [locationInput, setLocationInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Rider-assignment panel state
  const [riders, setRiders] = useState<Rider[]>([]);
  const [ridersLoading, setRidersLoading] = useState(false);
  const [ridersError, setRidersError] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");
  const [riderLocationInput, setRiderLocationInput] = useState("");
  const [riderMessageInput, setRiderMessageInput] = useState("");
  const [assigningRider, setAssigningRider] = useState(false);
  const [assignRiderError, setAssignRiderError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipment`);

        if (!res.ok) {
          throw new Error("Failed to load shipments");
        }

        const data = await res.json();
        setShipments(data);
      } catch (err) {
        console.error(err);
        setError("Could not load shipments.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function loadRiders() {
    try {
      setRidersError("");
      setRidersLoading(true);
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rider`);

      if (!res.ok) {
        throw new Error(`Failed to load riders (status ${res.status})`);
      }

      const data = await res.json();
      setRiders(data);
    } catch (err) {
      console.error("loadRiders error:", err);
      setRidersError(
        "Could not load riders. Check that /api/rider is reachable and CORS is enabled."
      );
    } finally {
      setRidersLoading(false);
    }
  }

  async function openShipment(trackingNumber: string) {
    try {
      setDetailsError("");
      setDetailsLoading(true);
      setDetailsShipment(null);
      setLocationInput("");
      setMessageInput("");
      setUpdateError("");
      setSelectedRiderId("");
      setRiderLocationInput("");
      setRiderMessageInput("");
      setAssignRiderError("");

      const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/tracking/${trackingNumber}`
      );

      if (!res.ok) {
        throw new Error("Failed to load shipment details");
      }

      const data = await res.json();
      setDetailsShipment(data);

      // Load riders every time details are opened
      loadRiders();
    } catch (err) {
      console.error(err);
      setDetailsError("Could not load shipment details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    setDetailsShipment(null);
    setDetailsError("");
    setLocationInput("");
    setMessageInput("");
    setUpdateError("");
    setSelectedRiderId("");
    setRiderLocationInput("");
    setRiderMessageInput("");
    setAssignRiderError("");
  }

  function handleDownloadReceipt(shipment: Shipment, e: React.MouseEvent) {
    e.stopPropagation();
    setReceiptShipment(shipment);

    // wait for the receipt to render before opening the print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  }

  async function handleUpdateStatus() {
    if (!detailsShipment) return;

    const nextStatus = getNextStatus(detailsShipment.status);
    if (!nextStatus) return;

    try {
      setUpdating(true);
      setUpdateError("");

      const res = await fetch(
`${process.env.NEXT_PUBLIC_API_URL}/api/shipment/${detailsShipment.id}/status`,
        {
     method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
            location: locationInput || undefined,
            message: messageInput || undefined,
          }),
        }
      );

     if (!res.ok) {
  const error = await res.json();

  console.error("Backend error:", error);

  throw new Error(error.message || "Failed to update status");
}

      const updated = await res.json();

      setDetailsShipment(updated);
      setLocationInput("");
      setMessageInput("");

      setShipments((prev) =>
        prev.map((s) =>
          s.id === updated.id ? { ...s, status: updated.status } : s
        )
      );
    } catch (err) {
      console.error(err);
      setUpdateError("Could not update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleAssignRider() {
    if (!detailsShipment || !selectedRiderId) return;

    try {
      setAssigningRider(true);
      setAssignRiderError("");

      const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/${detailsShipment.id}/assign-rider`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            riderId: Number(selectedRiderId),
            location: riderLocationInput || undefined,
            message: riderMessageInput || undefined,
          }),
        }
      );

      if (!res.ok) {
  const error = await res.json();
  console.log(error);

  throw new Error(error.message);
}

      const updated = await res.json();

      setDetailsShipment(updated);
      setRiderLocationInput("");
      setRiderMessageInput("");

      setShipments((prev) =>
        prev.map((s) =>
          s.id === updated.id
            ? { ...s, status: updated.status, rider: updated.rider }
            : s
        )
      );
    } catch (err) {
  console.error(err);
}finally {
      setAssigningRider(false);
    }
  }

  const completedSteps =
    detailsShipment?.trackings?.map((t) => t.status) ?? [];

  const isDetailsOpen = detailsLoading || !!detailsShipment || !!detailsError;

  const nextStatus = detailsShipment
    ? getNextStatus(detailsShipment.status)
    : null;

  return (
    <div className="mx-auto max-w-6xl text-black">
      {/* Print-only styles: only the parcel receipt is visible when printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-2xl font-bold text-ink">Shipping Tickets</h1>
        <p className="mt-1 text-sm text-gray-500">
          All shipments created across vendors.
        </p>
      </div>

      {loading && (
        <p className="mt-6 text-sm text-gray-500 no-print">
          Loading shipments...
        </p>
      )}

      {error && <p className="mt-6 text-sm text-red-600 no-print">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5 no-print">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  Tracking #
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Receiver
                </th>
                <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Package
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Payment
                </th>
                <th className="px-4 py-3 text-left font-semibold">Charge</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Created
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
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No shipments found.
                  </td>
                </tr>
              )}

              {shipments.map((shipment) => {
                const statusStyle =
                  STATUS_STYLES[shipment.status] ??
                  "bg-gray-50 text-gray-700 ring-gray-600/20";

                return (
                  <tr
                    key={shipment.id}
                    onClick={() => openShipment(shipment.trackingNumber)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {shipment.trackingNumber}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {shipment.receiverName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {shipment.receiverPhone}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {shipment.vendor?.companyName ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      {shipment.packageType}
                      <span className="text-gray-400"> · </span>
                      {shipment.weight}kg
                    </td>

                    <td className="px-4 py-3">{shipment.paymentType}</td>

                    <td className="px-4 py-3">
                      {formatCurrency(shipment.shippingCharge)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle}`}
                      >
                        {shipment.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(shipment.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => handleDownloadReceipt(shipment, e)}
                        className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-dark"
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details modal: 70/30 layout (details+timeline | actions) */}
      {isDetailsOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetails}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailsLoading && (
              <p className="py-8 text-center text-sm text-gray-400">
                Loading shipment...
              </p>
            )}

            {!detailsLoading && detailsError && (
              <div className="py-8 text-center">
                <p className="text-sm text-red-600">{detailsError}</p>
                <button
                  onClick={closeDetails}
                  className="mt-4 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            )}

            {!detailsLoading && !detailsError && detailsShipment && (
              <>
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Tracking Number
                    </p>
                    <h2 className="mt-1 text-lg font-bold">
                      {detailsShipment.trackingNumber}
                    </h2>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-10">
                  {/* Left column ~70%: shipment info + timeline */}
                  <div className="md:col-span-7">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Shipment Information
                    </p>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Receiver</span>
                        <span className="font-medium">
                          {detailsShipment.receiverName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone</span>
                        <span className="font-medium">
                          {detailsShipment.receiverPhone}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="shrink-0 text-gray-400">
                          Address
                        </span>
                        <span className="text-right font-medium">
                          {detailsShipment.receiverAddress}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vendor</span>
                        <span className="font-medium">
                          {detailsShipment.vendor?.companyName ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Package</span>
                        <span className="font-medium">
                          {detailsShipment.packageType} ·{" "}
                          {detailsShipment.weight}kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payment</span>
                        <span className="font-medium">
                          {detailsShipment.paymentType}
                        </span>
                      </div>
                      {detailsShipment.paymentType === "COD" && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">COD Amount</span>
                          <span className="font-medium">
                            {formatCurrency(detailsShipment.codAmount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-400">
                          Shipping Charge
                        </span>
                        <span className="font-medium">
                          {formatCurrency(detailsShipment.shippingCharge)}
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-6 border-t pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Timeline
                      </p>
                      <div className="mt-3 space-y-3">
                        {STEPS.map((step) => {
                          const done = completedSteps.includes(step);
                          const record = detailsShipment.trackings?.find(
                            (t) => t.status === step
                          );

                          return (
                            <div
                              key={step}
                              className="flex items-center gap-3"
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  done
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {done ? "✓" : "○"}
                              </span>
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    done ? "text-ink" : "text-gray-400"
                                  }`}
                                >
                                  {step.replaceAll("_", " ")}
                                </p>
                                {record && (
                                  <p className="text-xs text-gray-400">
                                    {formatDate(record.createdAt)}
                                    {record.location
                                      ? ` · ${record.location}`
                                      : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tracking history (raw log) */}
                    {detailsShipment.trackings &&
                      detailsShipment.trackings.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Tracking History
                          </p>
                          <div className="mt-3 space-y-2">
                            {detailsShipment.trackings.map((t) => (
                              <div
                                key={t.id}
                                className="rounded-lg bg-gray-50 px-3 py-2 text-xs"
                              >
                                <div className="flex justify-between font-medium">
                                  <span>{t.status.replaceAll("_", " ")}</span>
                                  <span className="text-gray-400">
                                    {formatDate(t.createdAt)}
                                  </span>
                                </div>
                                {(t.location || t.note) && (
                                  <p className="mt-1 text-gray-500">
                                    {t.location}
                                    {t.location && t.note ? " · " : ""}
                                    {t.note}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Right column ~30%: actions */}
                  <div className="md:col-span-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Actions
                    </p>

                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs text-gray-400">
                          Current Status
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                            STATUS_STYLES[detailsShipment.status] ??
                            "bg-gray-50 text-gray-700 ring-gray-600/20"
                          }`}
                        >
                          {detailsShipment.status.replace("_", " ")}
                        </span>
                      </div>

                      <button
                        onClick={(e) =>
                          handleDownloadReceipt(detailsShipment, e)
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Download Receipt
                      </button>

                      {/* Status update */}
                      {nextStatus ? (
                        <div className="rounded-xl border p-3">
                          <p className="text-xs font-semibold text-gray-500">
                            Next Status
                          </p>
                          <div className="mt-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm font-medium">
                            {nextStatus.replaceAll("_", " ")}
                          </div>

                          <label
                            htmlFor="location"
                            className="mt-2 block text-xs text-gray-400"
                          >
                            Location
                          </label>
                          <input
                            id="location"
                            type="text"
                            value={locationInput}
                            onChange={(e) =>
                              setLocationInput(e.target.value)
                            }
                            placeholder="e.g. Kathmandu Warehouse"
                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-accent focus:outline-none"
                          />

                          <label
                            htmlFor="message"
                            className="mt-2 block text-xs text-gray-400"
                          >
                            Message
                          </label>
                          <textarea
                            id="message"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="e.g. Stored safely in warehouse."
                            rows={2}
                            className="mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:border-accent focus:outline-none"
                          />

                          {updateError && (
                            <p className="mt-2 text-xs text-red-600">
                              {updateError}
                            </p>
                          )}

                          <button
                            onClick={handleUpdateStatus}
                            disabled={updating}
                            className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updating ? "Updating..." : "Update Status"}
                          </button>
                        </div>
                      ) : (
                        <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          This shipment has reached its final status.
                        </p>
                      )}

                      {/* Assign Rider — always visible, no status gate */}
                      <div className="rounded-xl border p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Assign Rider
                        </p>

                        {detailsShipment.rider && (
                          <p className="mt-1 text-xs text-gray-400">
                            Currently assigned:{" "}
                            <span className="font-medium text-gray-600">
                              {detailsShipment.rider.user.name}
                            </span>
                            . Selecting a new rider below will reassign.
                          </p>
                        )}

                        {ridersLoading && (
                          <p className="mt-2 text-xs text-gray-400">
                            Loading riders...
                          </p>
                        )}

                        {!ridersLoading && ridersError && (
                          <p className="mt-2 text-xs text-red-600">
                            {ridersError}
                          </p>
                        )}

                        {!ridersLoading &&
                          !ridersError &&
                          riders.length === 0 && (
                            <p className="mt-2 text-xs text-gray-400">
                              No riders found. Check GET /api/rider returns
                              data.
                            </p>
                          )}

                        {!ridersLoading &&
                          !ridersError &&
                          riders.length > 0 && (
                            <>
                              <select
                                value={selectedRiderId}
                                onChange={(e) =>
                                  setSelectedRiderId(e.target.value)
                                }
                                className="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:border-accent focus:outline-none"
                              >
                                <option value="">Select a rider</option>
                                {riders.map((rider) => (
                                  <option key={rider.id} value={rider.id}>
                                    {rider.user.name}
                                   
                                  </option>
                                ))}
                              </select>

                              <label
                                htmlFor="riderLocation"
                                className="mt-2 block text-xs text-gray-400"
                              >
                                Location
                              </label>
                              <input
                                id="riderLocation"
                                type="text"
                                value={riderLocationInput}
                                onChange={(e) =>
                                  setRiderLocationInput(e.target.value)
                                }
                                placeholder="e.g. Pokhara Hub"
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-accent focus:outline-none"
                              />

                              <label
                                htmlFor="riderMessage"
                                className="mt-2 block text-xs text-gray-400"
                              >
                                Message
                              </label>
                              <textarea
                                id="riderMessage"
                                value={riderMessageInput}
                                onChange={(e) =>
                                  setRiderMessageInput(e.target.value)
                                }
                                placeholder="e.g. Assigned to Ram Bahadur"
                                rows={2}
                                className="mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:border-accent focus:outline-none"
                              />

                              {assignRiderError && (
                                <p className="mt-2 text-xs text-red-600">
                                  {assignRiderError}
                                </p>
                              )}

                              <button
                                onClick={handleAssignRider}
                                disabled={
                                  assigningRider || !selectedRiderId
                                }
                                className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {assigningRider
                                  ? "Assigning..."
                                  : "Assign & Update"}
                              </button>
                            </>
                          )}
                      </div>

                      {/* Rider details, once assigned */}
                      {detailsShipment.rider && (
                        <div className="rounded-xl border p-3">
                          <p className="text-xs font-semibold text-gray-500">
                            Rider Details
                          </p>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Name</span>
                              <span className="font-medium">
                                {detailsShipment.rider.user.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Phone</span>
                              <span className="font-medium">
                                {detailsShipment.rider.phone}
                              </span>
                            </div>
                            {detailsShipment.rider.vehicleNumber && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  Vehicle
                                </span>
                                <span className="font-medium">
                                  {detailsShipment.rider.vehicleNumber}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Live Location — uses rider.latitude/longitude */}
                          <div className="mt-3 border-t pt-3">
                            <p className="text-xs font-semibold text-gray-500">
                              Live Location
                            </p>
                            {detailsShipment.rider.latitude != null &&
                            detailsShipment.rider.longitude != null ? (
                              <p className="mt-1 text-xs text-gray-600">
                                {detailsShipment.rider.latitude.toFixed(5)}
                                ,{" "}
                                {detailsShipment.rider.longitude.toFixed(5)}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-gray-400">
                                Rider hasn't shared a location yet.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden parcel receipt, only shown/printed when a shipment is selected */}
      {receiptShipment && (
        <div
          id="printable-receipt"
          className="mx-auto mt-6 w-full max-w-sm rounded-2xl border p-6 print:mt-0 print:max-w-full print:rounded-none print:border-0"
        >
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Parcel Receipt
            </p>
            <h2 className="mt-1 text-lg font-bold">
              {receiptShipment.trackingNumber}
            </h2>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Receiver</span>
              <span className="font-medium">
                {receiptShipment.receiverName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Phone</span>
              <span className="font-medium">
                {receiptShipment.receiverPhone}
              </span>
            </div>

            <div>
              <span className="text-gray-400">Address</span>
              <p className="font-medium">{receiptShipment.receiverAddress}</p>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Vendor</span>
              <span className="font-medium">
                {receiptShipment.vendor?.companyName ?? "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Package</span>
              <span className="font-medium">
                {receiptShipment.packageType} · {receiptShipment.weight}kg
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Payment</span>
              <span className="font-medium">
                {receiptShipment.paymentType}
              </span>
            </div>

            {receiptShipment.paymentType === "COD" && (
              <div className="flex justify-between">
                <span className="text-gray-400">COD Amount</span>
                <span className="font-medium">
                  {formatCurrency(receiptShipment.codAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-400">Shipping Charge</span>
              <span className="font-medium">
                {formatCurrency(receiptShipment.shippingCharge)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="rounded-xl border p-5">
             <QRCode
  value={`${process.env.NEXT_PUBLIC_APP_URL}/track/${receiptShipment.trackingNumber}`}
  size={180}
/>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            Attach this receipt to the parcel before dispatch.
          </p>
        </div>
      )}
    </div>
  );
}