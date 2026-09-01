
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

export default function StaffPickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);

  const [loading, setLoading] = useState(true);
  const [ridersLoading, setRidersLoading] = useState(true);

  const [error, setError] = useState("");

  const [assigningPickup, setAssigningPickup] = useState<number | null>(
    null
  );

  const [cancellingPickup, setCancellingPickup] = useState<number | null>(
    null
  );

  // =====================================
  // GET ALL PICKUPS
  // =====================================

  const getAllPickups = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups/all`,
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
          data.message || "Failed to fetch pickup requests"
        );
      }

      setPickups(data.pickups || []);
    } catch (err) {
      console.error("GET PICKUPS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pickup requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // GET RIDERS
  // =====================================

  const getRiders = async () => {
    try {
      setRidersLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rider`,
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
          data.message || "Failed to fetch riders"
        );
      }

      setRiders(data || []);
    } catch (err) {
      console.error("GET RIDERS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load riders"
      );
    } finally {
      setRidersLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    getAllPickups();
    getRiders();
  }, []);

  // =====================================
  // ASSIGN RIDER
  // =====================================

  const assignRider = async (
    pickupId: number,
    riderId: number
  ) => {
    try {
      setAssigningPickup(pickupId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups/${pickupId}/assign-rider`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            riderId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to assign rider"
        );
      }

      /*
       * IMPORTANT:
       * After assigning rider, reload the complete table.
       *
       * This guarantees that:
       * - rider is updated
       * - status is updated to ASSIGNED
       * - backend data is reflected
       */
      await getAllPickups();

      // Refresh riders too because assigned rider
      // may no longer be available.
      await getRiders();

    } catch (err) {
      console.error("ASSIGN RIDER ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to assign rider"
      );
    } finally {
      setAssigningPickup(null);
    }
  };

  // =====================================
  // CANCEL PICKUP
  // =====================================

  const cancelPickup = async (pickupId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this pickup?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingPickup(pickupId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pickups/${pickupId}/cancel`,
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
          data.message || "Failed to cancel pickup"
        );
      }

      /*
       * Reload table after cancellation
       * so frontend always matches backend.
       */
      await getAllPickups();

      // Rider may become available again
      // after pickup cancellation.
      await getRiders();

    } catch (err) {
      console.error("CANCEL PICKUP ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel pickup"
      );
    } finally {
      setCancellingPickup(null);
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
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";

      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      case "PICKUP_DONE":
        return "bg-green-50 text-green-700 ring-1 ring-green-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";

      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
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
        return "Rider Assigned";

      case "PICKUP_DONE":
        return "Pickup Complete";

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
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="min-h-screen  p-6">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Pickup Requests
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Manage vendor pickup requests and assign available riders.
              </p>

            </div>

            {/* REFRESH */}

            <button
              onClick={() => {
                getAllPickups();
                getRiders();
              }}
              disabled={loading || ridersLoading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading || ridersLoading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

        </div>


        {/* =====================================
            ERROR
        ===================================== */}

        {error && (

          <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>

          </div>

        )}


        {/* =====================================
            TABLE CARD
        ===================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200  shadow-sm">

          {/* =====================================
              TABLE HEADER
          ===================================== */}

          <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                All Pickup Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {pickups.length} request
                {pickups.length !== 1 ? "s" : ""}
              </p>

            </div>


            {/* STATUS SUMMARY */}

            <div className="flex flex-wrap gap-2">

              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200">
                Requested:{" "}
                {
                  pickups.filter(
                    (pickup) =>
                      pickup.status === "REQUESTED"
                  ).length
                }
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                Assigned:{" "}
                {
                  pickups.filter(
                    (pickup) =>
                      pickup.status === "ASSIGNED"
                  ).length
                }
              </span>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                Complete:{" "}
                {
                  pickups.filter(
                    (pickup) =>
                      pickup.status === "PICKUP_DONE"
                  ).length
                }
              </span>

            </div>

          </div>


          {/* =====================================
              LOADING
          ===================================== */}

          {loading ? (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-700" />

              <p className="text-sm text-gray-500">
                Loading pickup requests...
              </p>

            </div>

          ) : pickups.length === 0 ? (

            /* =====================================
                EMPTY
            ===================================== */

            <div className="px-6 py-16 text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <span className="text-xl text-gray-400">
                  —
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-900">
                No pickup requests
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no pickup requests from vendors.
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

                  <tr className="border-b border-gray-200">

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
                      Rider
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
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >

                      {/* =====================================
                          PICKUP ID
                      ===================================== */}

                      <td className="whitespace-nowrap px-6 py-5">

                        <span className="font-semibold text-gray-900">
                          #{pickup.id}
                        </span>

                      </td>


                      {/* =====================================
                          VENDOR
                      ===================================== */}

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-medium text-gray-900">
                            {pickup.vendor.companyName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Vendor #{pickup.vendor.id}
                          </p>

                        </div>

                      </td>


                      {/* =====================================
                          PACKAGES
                      ===================================== */}

                      <td className="px-6 py-5">

                        <span className="font-semibold text-gray-900">
                          {pickup.totalPackages}
                        </span>

                        <span className="ml-1 text-sm text-gray-500">
                          package
                          {pickup.totalPackages !== 1
                            ? "s"
                            : ""}
                        </span>

                      </td>


                      {/* =====================================
                          ADDRESS
                      ===================================== */}

                      <td className="max-w-xs px-6 py-5">

                        <p
                          title={pickup.pickupAddress}
                          className="truncate text-sm text-gray-700"
                        >
                          {pickup.pickupAddress}
                        </p>

                      </td>


                      {/* =====================================
                          PHONE
                      ===================================== */}

                      <td className="whitespace-nowrap px-6 py-5">

                        <span className="text-sm text-gray-700">
                          {pickup.pickupPhone}
                        </span>

                      </td>


                      {/* =====================================
                          RIDER
                      ===================================== */}

                      <td className="px-6 py-5">

                        {pickup.rider ? (

                          <div className="flex items-center gap-3">

                            {/* Rider avatar */}

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">

                              {pickup.rider.profilePicture ? (

                                <img
                                  src={
                                    pickup.rider.profilePicture
                                  }
                                  alt={
                                    pickup.rider.user.name
                                  }
                                  className="h-full w-full object-cover"
                                />

                              ) : (

                                <span className="text-sm font-semibold text-gray-600">
                                  {pickup.rider.user.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>

                              )}

                            </div>


                            <div>

                              <p className="font-medium text-gray-900">
                                {pickup.rider.user.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {pickup.rider.phone}
                              </p>

                            </div>

                          </div>

                        ) : pickup.status === "REQUESTED" ? (

                          /* ASSIGN RIDER */

                          <select
                            defaultValue=""
                            disabled={
                              assigningPickup ===
                                pickup.id ||
                              ridersLoading
                            }
                            onChange={(e) => {

                              const riderId =
                                Number(
                                  e.target.value
                                );

                              if (riderId) {

                                assignRider(
                                  pickup.id,
                                  riderId
                                );

                              }

                            }}
                            className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                          >

                            <option value="">

                              {assigningPickup ===
                              pickup.id
                                ? "Assigning..."
                                : ridersLoading
                                ? "Loading riders..."
                                : "Select rider"}

                            </option>


                            {riders
                              .filter(
                                (rider) =>
                                  rider.isAvailable
                              )
                              .map((rider) => (

                                <option
                                  key={rider.id}
                                  value={rider.id}
                                >
                                  {rider.user.name} —{" "}
                                  {rider.phone}
                                </option>

                              ))}

                          </select>

                        ) : (

                          <span className="text-sm text-gray-400">
                            No rider
                          </span>

                        )}

                      </td>


                      {/* =====================================
                          STATUS
                      ===================================== */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            pickup.status
                          )}`}
                        >
                          {getStatusLabel(
                            pickup.status
                          )}
                        </span>

                      </td>


                      {/* =====================================
                          DATE
                      ===================================== */}

                      <td className="whitespace-nowrap px-6 py-5">

                        <p className="text-sm text-gray-700">
                          {formatDate(
                            pickup.createdAt
                          )}
                        </p>

                      </td>


                      {/* =====================================
                          ACTION
                      ===================================== */}

                      <td className="px-6 py-5">

                        {/* REQUESTED */}

                        {pickup.status ===
                          "REQUESTED" && (

                          <button
                            onClick={() =>
                              cancelPickup(
                                pickup.id
                              )
                            }
                            disabled={
                              cancellingPickup ===
                              pickup.id
                            }
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingPickup ===
                            pickup.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>

                        )}


                        {/* ASSIGNED */}

                        {pickup.status ===
                          "ASSIGNED" && (

                          <button
                            onClick={() =>
                              cancelPickup(
                                pickup.id
                              )
                            }
                            disabled={
                              cancellingPickup ===
                              pickup.id
                            }
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingPickup ===
                            pickup.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>

                        )}


                        {/* PICKUP COMPLETE */}

                        {pickup.status ===
                          "PICKUP_DONE" && (

                          <span className="inline-flex items-center rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 ring-1 ring-green-200">
                            ✓ Pickup Complete
                          </span>

                        )}


                        {/* CANCELLED */}

                        {pickup.status ===
                          "CANCELLED" && (

                          <span className="inline-flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-red-200">
                            Cancelled
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

