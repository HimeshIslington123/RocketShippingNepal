"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

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

/* ============================================================
   IN-MEMORY CACHE

   Normal navigation:
   Page → another page → back to this page
   = no API request.

   Browser refresh:
   F5 / Cmd + R
   = cache resets and API request happens again.
============================================================ */

let pickupsCache: Pickup[] | null = null;
let ridersCache: Rider[] | null = null;

/* ============================================================
   SKELETON
============================================================ */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`skeleton-shimmer rounded-md bg-gray-200 ${className}`}
    />
  );
}

/* ============================================================
   TABLE SKELETON
============================================================ */

function PickupTableSkeleton() {
  const rows = Array.from({ length: 6 });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            {[
              "Pickup",
              "Vendor",
              "Packages",
              "Pickup Address",
              "Phone",
              "Rider",
              "Status",
              "Requested",
              "Action",
            ].map((heading) => (
              <th
                key={heading}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((_, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 last:border-0"
            >
              <td className="px-6 py-5">
                <Skeleton className="h-5 w-14" />
              </td>

              <td className="px-6 py-5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-3 w-20" />
              </td>

              <td className="px-6 py-5">
                <Skeleton className="h-5 w-24" />
              </td>

              <td className="px-6 py-5">
                <Skeleton className="h-5 w-48" />
              </td>

              <td className="px-6 py-5">
                <Skeleton className="h-5 w-28" />
              </td>

              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

                  <div>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-2 h-3 w-20" />
                  </div>
                </div>
              </td>

              <td className="px-6 py-5">
                <Skeleton className="h-7 w-24 rounded-full" />
              </td>

              <td className="px-6 py-5">
                <Skeleton className="h-5 w-24" />
              </td>

              <td className="px-6 py-5">
                <Skeleton className="h-9 w-20 rounded-lg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function StaffPickupsPage() {
  const [pickups, setPickups] = useState<Pickup[]>(
    pickupsCache ?? []
  );

  const [riders, setRiders] = useState<Rider[]>(
    ridersCache ?? []
  );

  const [loading, setLoading] = useState(
    pickupsCache === null
  );

  const [ridersLoading, setRidersLoading] = useState(
    ridersCache === null
  );

  const [error, setError] = useState("");

  const [assigningPickup, setAssigningPickup] = useState<
    number | null
  >(null);

  const [cancellingPickup, setCancellingPickup] = useState<
    number | null
  >(null);

  /* ==========================================================
     FILTER STATE
  ========================================================== */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | Pickup["status"]
  >("ALL");

  /* ==========================================================
     GET PICKUPS
  ========================================================== */

  const getAllPickups = async (force = false) => {
    if (!force && pickupsCache !== null) {
      setPickups(pickupsCache);
      setLoading(false);
      return;
    }

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
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch pickup requests"
        );
      }

      const newPickups: Pickup[] = data.pickups || [];

      pickupsCache = newPickups;

      setPickups(newPickups);
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

  /* ==========================================================
     GET RIDERS
  ========================================================== */

  const getRiders = async (force = false) => {
    if (!force && ridersCache !== null) {
      setRiders(ridersCache);
      setRidersLoading(false);
      return;
    }

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
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch riders"
        );
      }

      const newRiders: Rider[] = Array.isArray(data)
        ? data
        : data.riders || [];

      ridersCache = newRiders;

      setRiders(newRiders);
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

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    getAllPickups();
    getRiders();
  }, []);

  /* ==========================================================
     FILTERED PICKUPS
  ========================================================== */

  const filteredPickups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pickups.filter((pickup) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        pickup.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        String(pickup.id).includes(query) ||
        pickup.vendor.companyName
          .toLowerCase()
          .includes(query) ||
        pickup.pickupAddress
          .toLowerCase()
          .includes(query) ||
        pickup.pickupPhone
          .toLowerCase()
          .includes(query) ||
        pickup.rider?.user.name
          .toLowerCase()
          .includes(query) ||
        pickup.rider?.phone
          .toLowerCase()
          .includes(query)
      );
    });
  }, [pickups, search, statusFilter]);

  /* ==========================================================
     ASSIGN RIDER
  ========================================================== */

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

      await Promise.all([
        getAllPickups(true),
        getRiders(true),
      ]);
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

  /* ==========================================================
     CANCEL PICKUP
  ========================================================== */

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

      await Promise.all([
        getAllPickups(true),
        getRiders(true),
      ]);
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

  /* ==========================================================
     STATUS STYLE

     Kept deliberately subtle.
     No overly bright / "AI dashboard" colors.
  ========================================================== */

  const getStatusStyle = (
    status: Pickup["status"]
  ) => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border border-amber-200";

      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border border-blue-200";

      case "PICKUP_DONE":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600 border border-gray-200";

      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  /* ==========================================================
     STATUS ICON
  ========================================================== */

  const StatusIcon = ({
    status,
  }: {
    status: Pickup["status"];
  }) => {
    switch (status) {
      case "REQUESTED":
        return <Clock3 className="h-3.5 w-3.5" />;

      case "ASSIGNED":
        return <Truck className="h-3.5 w-3.5" />;

      case "PICKUP_DONE":
        return <CheckCircle2 className="h-3.5 w-3.5" />;

      case "CANCELLED":
        return <XCircle className="h-3.5 w-3.5" />;

      default:
        return null;
    }
  };

  /* ==========================================================
     STATUS LABEL
  ========================================================== */

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

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /* ==========================================================
     STATUS COUNTS
  ========================================================== */

  const statusCounts = {
    requested: pickups.filter(
      (pickup) => pickup.status === "REQUESTED"
    ).length,

    assigned: pickups.filter(
      (pickup) => pickup.status === "ASSIGNED"
    ).length,

    completed: pickups.filter(
      (pickup) => pickup.status === "PICKUP_DONE"
    ).length,

    cancelled: pickups.filter(
      (pickup) => pickup.status === "CANCELLED"
    ).length,
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen p-6">
      {/* ======================================================
          SHIMMER
      ====================================================== */}

      <style jsx global>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-shimmer {
          background-image: linear-gradient(
            90deg,
            #e5e7eb 0%,
            #f9fafb 50%,
            #e5e7eb 100%
          );

          background-size: 200% 100%;

          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Pickup Requests
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Manage vendor pickup requests and assign
                available riders.
              </p>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => {
                getAllPickups(true);
                getRiders(true);
              }}
              disabled={loading || ridersLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading || ridersLoading
                    ? "animate-spin"
                    : ""
                }`}
              />

              {loading || ridersLoading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* ====================================================
            FILTER BAR
        ==================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search pickup, vendor, phone or rider..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* STATUS */}

            <div className="flex items-center gap-2">
              <label
                htmlFor="pickup-status"
                className="hidden text-sm text-gray-500 sm:block"
              >
                Status
              </label>

              <select
                id="pickup-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "ALL"
                      | Pickup["status"]
                  )
                }
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
              >
                <option value="ALL">All statuses</option>
                <option value="REQUESTED">
                  Requested
                </option>
                <option value="ASSIGNED">
                  Rider Assigned
                </option>
                <option value="PICKUP_DONE">
                  Pickup Complete
                </option>
                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>

            {/* CLEAR FILTER */}

            {(search || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="h-10 rounded-lg px-3 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* ====================================================
            TABLE CARD
        ==================================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* ==================================================
              TABLE HEADER
          ================================================== */}

          <div className="flex flex-col gap-4 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500" />

                <h2 className="text-lg font-semibold text-gray-900">
                  All Pickup Requests
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading requests..."
                  : `${filteredPickups.length} of ${
                      pickups.length
                    } request${
                      pickups.length !== 1
                        ? "s"
                        : ""
                    }`}
              </p>
            </div>

            {/* QUIET SUMMARY */}

            {!loading && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                <span>
                  <span className="font-medium text-gray-800">
                    {statusCounts.requested}
                  </span>{" "}
                  requested
                </span>

                <span>
                  <span className="font-medium text-gray-800">
                    {statusCounts.assigned}
                  </span>{" "}
                  assigned
                </span>

                <span>
                  <span className="font-medium text-gray-800">
                    {statusCounts.completed}
                  </span>{" "}
                  completed
                </span>

                <span>
                  <span className="font-medium text-gray-800">
                    {statusCounts.cancelled}
                  </span>{" "}
                  cancelled
                </span>
              </div>
            )}
          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <PickupTableSkeleton />
          ) : filteredPickups.length === 0 ? (
            /* ==================================================
                EMPTY / NO FILTER RESULTS
            ================================================== */

            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-5 w-5 text-gray-400" />
              </div>

              <h3 className="text-sm font-semibold text-gray-900">
                {pickups.length === 0
                  ? "No pickup requests"
                  : "No matching requests"}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {pickups.length === 0
                  ? "There are currently no pickup requests from vendors."
                  : "Try changing your search or status filter."}
              </p>

              {pickups.length > 0 &&
                (search ||
                  statusFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-4 text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900"
                  >
                    Clear filters
                  </button>
                )}
            </div>
          ) : (
            /* ==================================================
                TABLE
            ================================================== */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                {/* TABLE HEAD */}

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

                {/* TABLE BODY */}

                <tbody>
                  {filteredPickups.map((pickup) => (
                    <tr
                      key={pickup.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
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

                          <p className="mt-1 text-xs text-gray-500">
                            Vendor #{pickup.vendor.id}
                          </p>
                        </div>
                      </td>

                      {/* PACKAGES */}

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
                        <span className="text-sm text-gray-700">
                          {pickup.pickupPhone}
                        </span>
                      </td>

                      {/* RIDER */}

                      <td className="px-6 py-5">
                        {pickup.rider ? (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                              {pickup.rider.profilePicture ? (
                                <img
                                  src={
                                    pickup.rider
                                      .profilePicture
                                  }
                                  alt={
                                    pickup.rider.user
                                      .name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-500">
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
                              const riderId = Number(
                                e.target.value
                              );

                              if (riderId) {
                                assignRider(
                                  pickup.id,
                                  riderId
                                );
                              }
                            }}
                            className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
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

                      {/* STATUS */}

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            pickup.status
                          )}`}
                        >
                          <StatusIcon
                            status={pickup.status}
                          />

                          {getStatusLabel(
                            pickup.status
                          )}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="whitespace-nowrap px-6 py-5">
                        <p className="text-sm text-gray-700">
                          {formatDate(
                            pickup.createdAt
                          )}
                        </p>
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">
                        {pickup.status === "REQUESTED" && (
                          <button
                            type="button"
                            onClick={() =>
                              cancelPickup(
                                pickup.id
                              )
                            }
                            disabled={
                              cancellingPickup ===
                              pickup.id
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingPickup ===
                            pickup.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}

                        {pickup.status === "ASSIGNED" && (
                          <button
                            type="button"
                            onClick={() =>
                              cancelPickup(
                                pickup.id
                              )
                            }
                            disabled={
                              cancellingPickup ===
                              pickup.id
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingPickup ===
                            pickup.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}

                        {pickup.status ===
                          "PICKUP_DONE" && (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600">
                            <CheckCircle2 className="h-4 w-4 text-gray-500" />
                            Complete
                          </span>
                        )}

                        {pickup.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
                            <XCircle className="h-4 w-4 text-gray-400" />
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