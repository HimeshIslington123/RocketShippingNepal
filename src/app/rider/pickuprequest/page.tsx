
"use client";

import { useEffect, useState } from "react";

interface Vendor {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
}

interface Rider {
  id: number;
  phone: string;
  profilePicture?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isAvailable: boolean;

  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Pickup {
  id: number;
  totalPackages: number;
  pickupAddress: string;
  pickupPhone: string;

  status:
    | "REQUESTED"
    | "ASSIGNED"
    | "PICKUP_DONE"
    | "CANCELLED";

  notes?: string | null;
  createdAt: string;
  updatedAt?: string;

  vendor: Vendor;
  rider?: Rider | null;
}

export default function RiderPickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingPickup, setUpdatingPickup] = useState<number | null>(
    null
  );

  // =====================================
  // GET RIDER PICKUPS
  // =====================================

  const getMyPickups = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups/rider`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch pickups"
        );
      }

      setPickups(data.pickups || []);
    } catch (err) {
      console.error("GET RIDER PICKUPS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pickups"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    getMyPickups();
  }, []);

  // =====================================
  // MARK PICKUP AS DONE
  // =====================================

  const markPickupDone = async (pickupId: number) => {
    const confirmed = window.confirm(
      "Have you successfully picked up all packages from this vendor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingPickup(pickupId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups/${pickupId}/pickup-done`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to complete pickup"
        );
      }

      // Replace the updated pickup in the table
      setPickups((currentPickups) =>
        currentPickups.map((pickup) =>
          pickup.id === pickupId
            ? data.pickup
            : pickup
        )
      );
    } catch (err) {
      console.error("PICKUP DONE ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete pickup"
      );
    } finally {
      setUpdatingPickup(null);
    }
  };

  // =====================================
  // STATUS STYLE
  // =====================================

  const getStatusStyle = (
    status: Pickup["status"]
  ) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-700";

      case "ASSIGNED":
        return "bg-blue-100 text-blue-700";

      case "PICKUP_DONE":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================
  // STATUS LABEL
  // =====================================

  const getStatusLabel = (
    status: Pickup["status"]
  ) => {
    switch (status) {
      case "REQUESTED":
        return "Requested";

      case "ASSIGNED":
        return "Assigned";

      case "PICKUP_DONE":
        return "Pickup Done";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;
    }
  };

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Pickup Requests
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage pickup requests assigned to you.
          </p>
        </div>

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-4 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* =====================================
            SUMMARY CARDS
        ===================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Pickups
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pickups.length}
            </p>
          </div>

          {/* ACTIVE */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active Pickups
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {
                pickups.filter(
                  (pickup) =>
                    pickup.status === "ASSIGNED"
                ).length
              }
            </p>
          </div>

          {/* COMPLETED */}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                pickups.filter(
                  (pickup) =>
                    pickup.status === "PICKUP_DONE"
                ).length
              }
            </p>
          </div>

        </div>

        {/* =====================================
            TABLE CARD
        ===================================== */}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Assigned Pickups
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {pickups.length} pickup
                {pickups.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={getMyPickups}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

          </div>

          {/* =====================================
              LOADING
          ===================================== */}

          {loading ? (

            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="text-gray-500">
                Loading your pickups...
              </p>
            </div>

          ) : pickups.length === 0 ? (

            /* =====================================
               EMPTY
            ===================================== */

            <div className="px-6 py-16 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl">📦</span>
              </div>

              <h3 className="font-semibold text-gray-900">
                No pickups assigned
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                You don't have any pickup requests assigned to you yet.
              </p>

            </div>

          ) : (

            /* =====================================
               TABLE
            ===================================== */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                {/* =====================================
                    TABLE HEAD
                ===================================== */}

                <thead className="bg-gray-50">

                  <tr className="border-b">

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Pickup
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Vendor
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Packages
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Pickup Address
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Notes
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Requested
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>

                {/* =====================================
                    TABLE BODY
                ===================================== */}

                <tbody>

                  {pickups.map((pickup) => (

                    <tr
                      key={pickup.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >

                      {/* PICKUP */}

                      <td className="whitespace-nowrap px-6 py-5">
                        <span className="font-semibold text-gray-900">
                          #{pickup.id}
                        </span>
                      </td>

                      {/* VENDOR */}

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-medium text-gray-900">
                            {pickup.vendor.companyName}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Vendor #{pickup.vendor.id}
                          </p>

                          <p className="text-xs text-gray-400">
                            {pickup.vendor.location}
                          </p>

                        </div>

                      </td>

                      {/* PACKAGES */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <span className="font-semibold text-gray-900">
                            {pickup.totalPackages}
                          </span>

                          <span className="text-sm text-gray-500">
                            package
                            {pickup.totalPackages !== 1
                              ? "s"
                              : ""}
                          </span>

                        </div>

                      </td>

                      {/* ADDRESS */}

                      <td className="max-w-xs px-6 py-5">

                        <p
                          title={pickup.pickupAddress}
                          className="truncate text-sm text-gray-700"
                        >
                          {pickup.pickupAddress}
                        </p>

                      </td>

                      {/* PHONE */}

                      <td className="whitespace-nowrap px-6 py-5">

                        <a
                          href={`tel:${pickup.pickupPhone}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {pickup.pickupPhone}
                        </a>

                      </td>

                      {/* NOTES */}

                      <td className="max-w-xs px-6 py-5">

                        {pickup.notes ? (

                          <p
                            title={pickup.notes}
                            className="truncate text-sm text-gray-600"
                          >
                            {pickup.notes}
                          </p>

                        ) : (

                          <span className="text-sm text-gray-400">
                            No notes
                          </span>

                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            pickup.status
                          )}`}
                        >
                          {getStatusLabel(
                            pickup.status
                          )}
                        </span>

                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                        {formatDate(
                          pickup.createdAt
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">

                        {pickup.status === "ASSIGNED" && (

                          <button
                            onClick={() =>
                              markPickupDone(
                                pickup.id
                              )
                            }
                            disabled={
                              updatingPickup ===
                              pickup.id
                            }
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingPickup ===
                            pickup.id
                              ? "Completing..."
                              : "Pickup Done"}
                          </button>

                        )}

                        {pickup.status === "PICKUP_DONE" && (

                          <span className="text-sm font-medium text-green-600">
                            ✓ Completed
                          </span>

                        )}

                        {pickup.status === "CANCELLED" && (

                          <span className="text-sm font-medium text-red-500">
                            Cancelled
                          </span>

                        )}

                        {pickup.status === "REQUESTED" && (

                          <span className="text-sm text-gray-400">
                            Waiting for assignment
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

