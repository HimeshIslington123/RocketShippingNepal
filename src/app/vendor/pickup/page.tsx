"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Truck,
} from "lucide-react";

interface Pickup {
  id: number;
  totalPackages: number;
  pickupAddress: string;
  pickupPhone: string;
  status: "REQUESTED" | "RECEIVED" | "CANCELLED";
  notes?: string | null;
  createdAt: string;
}

export default function PickupPage() {
  const [showForm, setShowForm] = useState(false);

  const [totalPackages, setTotalPackages] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [pickups, setPickups] = useState<Pickup[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================
  // GET PICKUPS
  // =====================================

  const getPickups = async () => {
    try {
      setFetching(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pickups");
      }

      setPickups(data.pickups || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch pickup requests"
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    getPickups();
  }, []);

  // =====================================
  // CREATE PICKUP
  // =====================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            totalPackages: Number(totalPackages),
            pickupAddress,
            pickupPhone,
            notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create pickup request"
        );
      }

      setMessage("Pickup request created successfully");

      // Reset form
      setTotalPackages("");
      setPickupAddress("");
      setPickupPhone("");
      setNotes("");

      // Refresh list
      await getPickups();

      // Go back to table
      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // STATUS
  // =====================================

  const getStatusStyle = (status: Pickup["status"]) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

      case "RECEIVED":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";

      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  // =====================================
  // FORM VIEW
  // =====================================

  if (showForm) {
    return (
      <div className="min-h-screen  px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Back */}
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setError("");
              setMessage("");
            }}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pickup requests
          </button>

          {/* Form Header */}
          <div className="mb-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              New Pickup Request
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Enter the details below to request a package pickup.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 p-6 sm:p-8">
                {/* Packages */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Total Packages
                  </label>

                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="number"
                      min="1"
                      value={totalPackages}
                      onChange={(e) =>
                        setTotalPackages(e.target.value)
                      }
                      placeholder="e.g. 5"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Pickup Address
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                    <textarea
                      value={pickupAddress}
                      onChange={(e) =>
                        setPickupAddress(e.target.value)
                      }
                      placeholder="Enter the complete pickup address"
                      required
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Pickup Phone
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="tel"
                      value={pickupPhone}
                      onChange={(e) =>
                        setPickupPhone(e.target.value)
                      }
                      placeholder="Enter contact number"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Notes
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything the pickup team should know?"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* Success */}
                {message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {message}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 p-6 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                    setMessage("");
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Sending Request..." : "Request Pickup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =====================================
  // TABLE VIEW
  // =====================================

  return (
    <div className="min-h-screen  px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Pickup Requests
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and track your package pickup requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={getPickups}
              disabled={fetching}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  fetching ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setError("");
                setMessage("");
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Pickup
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={getPickups}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Requests
              </p>

              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Truck className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {pickups.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Pending
              </p>

              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Package className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {
                pickups.filter(
                  (pickup) => pickup.status === "REQUESTED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Received
              </p>

              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Package className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {
                pickups.filter(
                  (pickup) => pickup.status === "RECEIVED"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Pickup Requests
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                A list of your pickup requests and their current status.
              </p>
            </div>
          </div>

          {fetching ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading pickup requests...
              </div>
            </div>
          ) : pickups.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Truck className="h-6 w-6 text-gray-400" />
              </div>

              <h3 className="font-semibold text-gray-900">
                No pickup requests
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                You haven't created any pickup requests yet.
                Create your first request to get started.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New Pickup
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Request
                      </th>

                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Packages
                      </th>

                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Pickup Details
                      </th>

                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {pickups.map((pickup) => (
                      <tr
                        key={pickup.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            #{pickup.id}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-400">
                            Pickup Request
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />

                            <span className="font-medium text-gray-800">
                              {pickup.totalPackages}
                            </span>

                            <span className="text-sm text-gray-400">
                              {pickup.totalPackages === 1
                                ? "package"
                                : "packages"}
                            </span>
                          </div>
                        </td>

                        <td className="max-w-xs px-6 py-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                            <div>
                              <p className="truncate font-medium text-gray-800">
                                {pickup.pickupAddress}
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                <Phone className="h-3 w-3" />
                                {pickup.pickupPhone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              pickup.status
                            )}`}
                          >
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                            {pickup.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays className="h-4 w-4 text-gray-400" />

                            {new Date(
                              pickup.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {pickups.map((pickup) => (
                  <div
                    key={pickup.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{pickup.id}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(
                            pickup.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          pickup.status
                        )}`}
                      >
                        {pickup.status}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          Packages
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />

                          <span className="text-sm font-semibold text-gray-800">
                            {pickup.totalPackages}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Phone
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />

                          <span className="truncate text-sm font-medium text-gray-800">
                            {pickup.pickupPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-50 p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <p className="text-sm leading-5 text-gray-700">
                          {pickup.pickupAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}