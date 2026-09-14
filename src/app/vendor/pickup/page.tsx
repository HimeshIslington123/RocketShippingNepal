"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Truck,
  X,
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

/* ============================================================
   API
============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ============================================================
   IN-MEMORY CACHE
============================================================

   Normal navigation:

   Pickup page
      ↓
   Other page
      ↓
   Back to Pickup page
      ↓
   NO API REQUEST

   Browser refresh:

   F5 / Cmd + R
      ↓
   Memory resets
      ↓
   ONE API REQUEST

============================================================ */

let pickupsCache: Pickup[] | null = null;

/*
  Prevent duplicate requests from React StrictMode
  or multiple components/effects requesting the
  same data at the same time.
*/
let pickupsRequest: Promise<Pickup[]> | null = null;

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
   FULL PAGE SKELETON
============================================================ */

function PickupPageSkeleton() {
  const rows = Array.from({ length: 6 });

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-52" />

          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />

          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />

              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>

            <Skeleton className="mt-4 h-8 w-16" />
          </div>
        ))}
      </div>

      {/* FILTER */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-xl" />

          <Skeleton className="h-10 w-full sm:w-40 rounded-xl" />
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <Skeleton className="h-5 w-44" />

          <Skeleton className="mt-2 h-3.5 w-80 max-w-full" />
        </div>

        {/* DESKTOP */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                {[
                  "Request",
                  "Packages",
                  "Pickup Details",
                  "Status",
                  "Created",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
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
                    <Skeleton className="h-5 w-16" />

                    <Skeleton className="mt-2 h-3 w-24" />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />

                      <Skeleton className="h-5 w-8" />

                      <Skeleton className="h-4 w-16" />
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-4 w-4" />

                      <div>
                        <Skeleton className="h-5 w-64" />

                        <Skeleton className="mt-2 h-3 w-28" />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />

                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}

        <div className="divide-y divide-gray-100 md:hidden">
          {rows.map((_, index) => (
            <div key={index} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Skeleton className="h-5 w-16" />

                  <Skeleton className="mt-2 h-3 w-24" />
                </div>

                <Skeleton className="h-7 w-24 rounded-full" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-3 w-16" />

                  <Skeleton className="mt-2 h-5 w-20" />
                </div>

                <div>
                  <Skeleton className="h-3 w-12" />

                  <Skeleton className="mt-2 h-5 w-24" />
                </div>
              </div>

              <Skeleton className="mt-4 h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CREATE PICKUP MODAL
============================================================ */

function CreatePickupModal({
  totalPackages,
  pickupAddress,
  pickupPhone,
  notes,
  loading,
  error,
  message,
  setTotalPackages,
  setPickupAddress,
  setPickupPhone,
  setNotes,
  onClose,
  onSubmit,
}: {
  totalPackages: string;
  pickupAddress: string;
  pickupPhone: string;
  notes: string;
  loading: boolean;
  error: string;
  message: string;

  setTotalPackages: (value: string) => void;
  setPickupAddress: (value: string) => void;
  setPickupPhone: (value: string) => void;
  setNotes: (value: string) => void;

  onClose: () => void;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>
  ) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        /*
          Clicking the dark/blurred background closes modal.
          Clicking inside the modal does not.
        */
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-pickup-title"
      >
        {/* ==================================================
            MODAL HEADER
        ================================================== */}

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>

            <div>
              <h2
                id="create-pickup-title"
                className="text-lg font-bold text-gray-900"
              >
                New Pickup Request
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Enter the details for your pickup.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form onSubmit={onSubmit}>
          <div className="space-y-5 p-5 sm:p-6">
            {/* PACKAGES */}

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
                    setTotalPackages(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 5"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* ADDRESS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Pickup Address
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                <textarea
                  value={pickupAddress}
                  onChange={(e) =>
                    setPickupAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter the complete pickup address"
                  required
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* PHONE */}

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
                    setPickupPhone(
                      e.target.value
                    )
                  }
                  placeholder="Enter contact number"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* NOTES */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Notes

                <span className="ml-1 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                placeholder="Anything the pickup team should know?"
                rows={4}
                disabled={loading}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* SUCCESS */}

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 p-5 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? "Sending Request..."
                : "Request Pickup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function PickupPage() {
  /* ==========================================================
     MODAL
  ========================================================== */

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  /* ==========================================================
     FORM
  ========================================================== */

  const [totalPackages, setTotalPackages] =
    useState("");

  const [pickupAddress, setPickupAddress] =
    useState("");

  const [pickupPhone, setPickupPhone] =
    useState("");

  const [notes, setNotes] = useState("");

  /* ==========================================================
     DATA
  ========================================================== */

  const [pickups, setPickups] = useState<Pickup[]>(
    pickupsCache ?? []
  );

  const [fetching, setFetching] = useState(
    pickupsCache === null
  );

  const [loading, setLoading] = useState(false);

  /* ==========================================================
     MESSAGE
  ========================================================== */

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ==========================================================
     FILTER
  ========================================================== */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "ALL" | Pickup["status"]
    >("ALL");

  /* ==========================================================
     GET PICKUPS
  ========================================================== */

  const getPickups = async (
    force = false
  ): Promise<Pickup[]> => {
    /*
      Existing cache.

      Navigation back to this page uses memory instead
      of making another request.
    */

    if (!force && pickupsCache !== null) {
      setPickups(pickupsCache);
      setFetching(false);

      return pickupsCache;
    }

    /*
      Reuse an existing request.

      This prevents duplicate API calls when multiple
      effects request the same data.
    */

    if (!force && pickupsRequest) {
      try {
        setFetching(true);

        const result = await pickupsRequest;

        setPickups(result);

        return result;
      } finally {
        setFetching(false);
      }
    }

    try {
      setFetching(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const request = fetch(
        `${API_URL}/api/pickups`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      )
        .then(async (response) => {
          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Failed to fetch pickups"
            );
          }

          const newPickups: Pickup[] =
            data.pickups || [];

          /*
            Update memory cache.
          */

          pickupsCache = newPickups;

          return newPickups;
        })
        .finally(() => {
          if (pickupsRequest === request) {
            pickupsRequest = null;
          }
        });

      pickupsRequest = request;

      const result = await request;

      setPickups(result);

      return result;
    } catch (err) {
      console.error(
        "GET PICKUPS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch pickup requests"
      );

      throw err;
    } finally {
      setFetching(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (pickupsCache !== null) {
      setPickups(pickupsCache);
      setFetching(false);

      return;
    }

    getPickups().catch(() => {
      // Error handled inside getPickups
    });
  }, []);

  /* ==========================================================
     FILTERED PICKUPS
  ========================================================== */

  const filteredPickups = useMemo(() => {
    const query =
      search.trim().toLowerCase();

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
        pickup.pickupAddress
          .toLowerCase()
          .includes(query) ||
        pickup.pickupPhone
          .toLowerCase()
          .includes(query) ||
        pickup.status
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    pickups,
    search,
    statusFilter,
  ]);

  /* ==========================================================
     STATS
  ========================================================== */

  const stats = useMemo(() => {
    return {
      total: pickups.length,

      pending: pickups.filter(
        (pickup) =>
          pickup.status === "REQUESTED"
      ).length,

      received: pickups.filter(
        (pickup) =>
          pickup.status === "RECEIVED"
      ).length,
    };
  }, [pickups]);

  /* ==========================================================
     OPEN MODAL
  ========================================================== */

  const openCreateModal = () => {
    setTotalPackages("");
    setPickupAddress("");
    setPickupPhone("");
    setNotes("");

    setMessage("");
    setError("");

    setShowCreateModal(true);
  };

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const closeCreateModal = () => {
    if (loading) {
      return;
    }

    setShowCreateModal(false);

    setTotalPackages("");
    setPickupAddress("");
    setPickupPhone("");
    setNotes("");

    setMessage("");
    setError("");
  };

  /* ==========================================================
     CREATE PICKUP
  ========================================================== */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in"
        );
      }

      const response = await fetch(
        `${API_URL}/api/pickups`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            totalPackages:
              Number(totalPackages),

            pickupAddress,

            pickupPhone,

            notes,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create pickup request"
        );
      }

      /*
        Refresh because a new pickup now exists.

        This makes exactly one GET request.
      */

      await getPickups(true);

      /*
        Close modal after successful creation.
      */

      setShowCreateModal(false);

      setTotalPackages("");
      setPickupAddress("");
      setPickupPhone("");
      setNotes("");

      /*
        Small success message on the main page.
      */

      setMessage(
        "Pickup request created successfully."
      );
    } catch (err) {
      console.error(
        "CREATE PICKUP ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = async () => {
    if (fetching) {
      return;
    }

    try {
      setError("");

      await getPickups(true);
    } catch {
      // Error handled inside getPickups
    }
  };

  /* ==========================================================
     STATUS STYLE
  ========================================================== */

  const getStatusStyle = (
    status: Pickup["status"]
  ) => {
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

  /* ==========================================================
     INITIAL SHIMMER
  ========================================================== */

  const showInitialSkeleton =
    fetching && pickups.length === 0;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      {/* ======================================================
          SHIMMER CSS
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

          animation: skeleton-shimmer 1.5s
            ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        {/* ====================================================
            SKELETON
        ==================================================== */}

        {showInitialSkeleton ? (
          <PickupPageSkeleton />
        ) : (
          <>
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Pickup Requests
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage and track your package pickup
                  requests.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* REFRESH */}

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={fetching}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      fetching
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  <span className="hidden sm:inline">
                    {fetching
                      ? "Refreshing..."
                      : "Refresh"}
                  </span>
                </button>

                {/* NEW PICKUP */}

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />

                  New Pickup
                </button>
              </div>
            </div>

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {message && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <span>{message}</span>

                <button
                  type="button"
                  onClick={() =>
                    setMessage("")
                  }
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="shrink-0 font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ==================================================
                STATS
            ================================================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* TOTAL */}

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
                  {stats.total}
                </p>
              </div>

              {/* PENDING */}

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
                  {stats.pending}
                </p>
              </div>

              {/* RECEIVED */}

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
                  {stats.received}
                </p>
              </div>
            </div>

            {/* ==================================================
                FILTER BAR
            ================================================== */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                {/* SEARCH */}

                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search pickup, address, phone or status..."
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* STATUS */}

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "ALL"
                        | Pickup["status"]
                    )
                  }
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="ALL">
                    All statuses
                  </option>

                  <option value="REQUESTED">
                    Requested
                  </option>

                  <option value="RECEIVED">
                    Received
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>

                {/* CLEAR */}

                {(search ||
                  statusFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter(
                        "ALL"
                      );
                    }}
                    className="h-10 rounded-xl px-3 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* ==================================================
                MAIN TABLE
            ================================================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* TABLE HEADER */}

              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    All Pickup Requests
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {search ||
                    statusFilter !==
                      "ALL"
                      ? `${filteredPickups.length} of ${pickups.length} requests`
                      : "A list of your pickup requests and their current status."}
                  </p>
                </div>

                {(search ||
                  statusFilter !== "ALL") && (
                  <span className="text-xs font-medium text-gray-400">
                    Filtered results
                  </span>
                )}
              </div>

              {/* ==================================================
                  NO RESULTS
              ================================================== */}

              {filteredPickups.length ===
              0 ? (
                <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>

                  <h3 className="font-semibold text-gray-900">
                    {pickups.length ===
                    0
                      ? "No pickup requests"
                      : "No matching requests"}
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {pickups.length ===
                    0
                      ? "You haven't created any pickup requests yet."
                      : "Try changing your search or status filter."}
                  </p>

                  {pickups.length >
                    0 &&
                    (search ||
                      statusFilter !==
                        "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter(
                            "ALL"
                          );
                        }}
                        className="mt-5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Clear Filters
                      </button>
                    )}

                  {pickups.length ===
                    0 && (
                    <button
                      type="button"
                      onClick={
                        openCreateModal
                      }
                      className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />

                      New Pickup
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* ==================================================
                      DESKTOP TABLE
                  ================================================== */}

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
                        {filteredPickups.map(
                          (pickup) => (
                            <tr
                              key={pickup.id}
                              className="transition hover:bg-gray-50/70"
                            >
                              {/* REQUEST */}

                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">
                                  #{pickup.id}
                                </div>

                                <div className="mt-0.5 text-xs text-gray-400">
                                  Pickup Request
                                </div>
                              </td>

                              {/* PACKAGES */}

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />

                                  <span className="font-medium text-gray-800">
                                    {
                                      pickup.totalPackages
                                    }
                                  </span>

                                  <span className="text-sm text-gray-400">
                                    {pickup.totalPackages ===
                                    1
                                      ? "package"
                                      : "packages"}
                                  </span>
                                </div>
                              </td>

                              {/* DETAILS */}

                              <td className="max-w-xs px-6 py-4">
                                <div className="flex items-start gap-2">
                                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                                  <div>
                                    <p className="truncate font-medium text-gray-800">
                                      {
                                        pickup.pickupAddress
                                      }
                                    </p>

                                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                      <Phone className="h-3 w-3" />

                                      {
                                        pickup.pickupPhone
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* STATUS */}

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                    pickup.status
                                  )}`}
                                >
                                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

                                  {
                                    pickup.status
                                  }
                                </span>
                              </td>

                              {/* DATE */}

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <CalendarDays className="h-4 w-4 text-gray-400" />

                                  {new Date(
                                    pickup.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ==================================================
                      MOBILE
                  ================================================== */}

                  <div className="divide-y divide-gray-100 md:hidden">
                    {filteredPickups.map(
                      (pickup) => (
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
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

                              {
                                pickup.status
                              }
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
                                  {
                                    pickup.totalPackages
                                  }
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
                                  {
                                    pickup.pickupPhone
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 rounded-xl bg-gray-50 p-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                              <p className="text-sm leading-5 text-gray-700">
                                {
                                  pickup.pickupAddress
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ======================================================
          CREATE PICKUP MODAL
      ====================================================== */}

      {showCreateModal && (
        <CreatePickupModal
          totalPackages={totalPackages}
          pickupAddress={pickupAddress}
          pickupPhone={pickupPhone}
          notes={notes}
          loading={loading}
          error={error}
          message={message}
          setTotalPackages={
            setTotalPackages
          }
          setPickupAddress={
            setPickupAddress
          }
          setPickupPhone={
            setPickupPhone
          }
          setNotes={setNotes}
          onClose={closeCreateModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}