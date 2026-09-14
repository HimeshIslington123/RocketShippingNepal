"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Truck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";

/* ============================================================
   DYNAMIC MAP
============================================================ */

const RiderMap = dynamic(() => import("@/components/RiderMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-2xl bg-gray-100">
      <Loader2 className="h-6 w-6 animate-spin text-[#0b1729]" />
    </div>
  ),
});

/* ============================================================
   TYPES
============================================================ */

interface Rider {
  id: number;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  isAvailable: boolean;

  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Location {
  latitude: number;
  longitude: number;
}

interface RiderForm {
  name: string;
  email: string;
  password: string;
  phone: string;
}

/* ============================================================
   CACHE
   - Survives SPA navigation
   - Resets automatically on browser hard refresh
============================================================ */

let riderCache: Rider[] | null = null;
let riderRequest: Promise<Rider[]> | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ============================================================
   FETCH RIDERS
============================================================ */

async function fetchRiders(force = false): Promise<Rider[]> {
  if (!force && riderCache) {
    return riderCache;
  }

  // Prevent duplicate requests from StrictMode/remounts
  if (riderRequest) {
    return riderRequest;
  }

  const request = (async () => {
    const response = await fetch(`${API_URL}/api/rider`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch riders");
    }

    const data = await response.json();

    const riders: Rider[] = Array.isArray(data) ? data : [];

    riderCache = riders;

    return riders;
  })();

  riderRequest = request;

  try {
    return await request;
  } finally {
    if (riderRequest === request) {
      riderRequest = null;
    }
  }
}

/* ============================================================
   SKELETON
============================================================ */

function RidersSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="management-shimmer absolute inset-0" />

            <div className="relative">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-4 h-8 w-20 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-32 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="relative">
          <div className="management-shimmer absolute inset-0" />

          <div className="grid grid-cols-4 gap-4 border-b bg-gray-50 px-6 py-4">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
          </div>

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="grid grid-cols-4 gap-4 border-b px-6 py-5 last:border-0"
            >
              <div>
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-44 rounded bg-gray-200" />
              </div>

              <div className="h-4 w-24 rounded bg-gray-200" />

              <div className="h-6 w-20 rounded-full bg-gray-200" />

              <div className="h-9 w-28 rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [location, setLocation] = useState<Location | null>(null);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<RiderForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const ITEMS_PER_PAGE = 8;

  /* ==========================================================
     LOAD RIDERS
  ========================================================== */

  const loadRiders = useCallback(async (force = false) => {
    try {
      setError("");

      if (force) {
        setRefreshing(true);
        riderCache = null;
      } else if (!riderCache) {
        setLoading(true);
      }

      const data = await fetchRiders(force);

      setRiders(data);
    } catch (err) {
      console.error("Error fetching riders:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load riders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadRiders(false);
  }, [loadRiders]);

  /* ==========================================================
     AUTO CLEAR SUCCESS MESSAGE
  ========================================================== */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  /* ==========================================================
     FORM INPUT
  ========================================================== */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredRiders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return riders;
    }

    return riders.filter((rider) => {
      return (
        rider.user?.name?.toLowerCase().includes(query) ||
        rider.user?.email?.toLowerCase().includes(query) ||
        rider.phone?.toLowerCase().includes(query) ||
        String(rider.id).includes(query)
      );
    });
  }, [riders, search]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRiders.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * ITEMS_PER_PAGE;

  const paginatedRiders = filteredRiders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const totalRiders = riders.length;

  const availableRiders = riders.filter(
    (rider) => rider.isAvailable
  ).length;

  const unavailableRiders =
    totalRiders - availableRiders;

  const ridersWithLocation = riders.filter(
    (rider) =>
      rider.latitude !== null &&
      rider.longitude !== null
  ).length;

  /* ==========================================================
     CREATE RIDER
  ========================================================== */

  const handleCreateRider = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/rider`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create rider"
        );
      }

      /* Invalidate cache */
      riderCache = null;

      /* Reset form */
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      setShowModal(false);

      setSuccess("Rider created successfully.");

      /* Force fresh data */
      await loadRiders(true);
    } catch (err) {
      console.error("Create rider error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create rider."
      );
    } finally {
      setCreating(false);
    }
  };

  /* ==========================================================
     VIEW LOCATION
  ========================================================== */

  const handleViewLocation = (rider: Rider) => {
    if (
      rider.latitude === null ||
      rider.longitude === null
    ) {
      setError(
        `${rider.user?.name || "This rider"} does not have a location available.`
      );

      return;
    }

    setError("");

    setSelectedRider(rider);

    setLocation({
      latitude: rider.latitude,
      longitude: rider.longitude,
    });

    /* Smooth scroll toward map */
    setTimeout(() => {
      document
        .getElementById("rider-location")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* ==========================================================
     CLOSE LOCATION
  ========================================================== */

  const closeLocation = () => {
    setLocation(null);
    setSelectedRider(null);
  };

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const closeModal = () => {
    if (creating) return;

    setShowModal(false);

    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
    });
  };

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="min-h-screen  p-4 text-[#0b1729] sm:p-6 lg:p-8">

      {/* ======================================================
          GLOBAL SHIMMER
      ====================================================== */}

      <style jsx global>{`
        .management-shimmer {
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.7) 45%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(255, 255, 255, 0.7) 55%,
            transparent 75%
          );
          background-size: 250% 100%;
          animation: management-shimmer 1.7s linear infinite;
          pointer-events: none;
        }

        @keyframes management-shimmer {
          0% {
            background-position: 150% 0;
          }

          100% {
            background-position: -150% 0;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1729] text-white shadow-sm">
                <Truck size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Riders
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage delivery riders and monitor their current locations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => loadRiders(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#0b1729] shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {/* ADD RIDER */}

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E23C2E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#CE3122]"
            >
              <Plus size={18} />
              Add New Rider
            </button>

          </div>
        </div>

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto rounded-lg p-1 hover:bg-green-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && !showModal && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-lg p-1 hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ====================================================
            LOADING SKELETON
        ==================================================== */}

        {loading ? (
          <RidersSkeleton />
        ) : (
          <>
            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* TOTAL */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Riders
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#0b1729]">
                      {totalRiders}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1729] text-white">
                    <Users size={20} />
                  </div>

                </div>
              </div>

              {/* AVAILABLE */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Available
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                      {availableRiders}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <CheckCircle2 size={20} />
                  </div>

                </div>
              </div>

              {/* UNAVAILABLE */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Unavailable
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-600">
                      {unavailableRiders}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <XCircle size={20} />
                  </div>

                </div>
              </div>

              {/* LOCATION */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      With Location
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#E23C2E]">
                      {ridersWithLocation}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E23C2E]">
                    <MapPin size={20} />
                  </div>

                </div>
              </div>

            </div>

            {/* ==================================================
                SEARCH / TOOLBAR
            ================================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="relative w-full lg:max-w-md">

                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search rider, email, phone..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={17} />
                    </button>
                  )}

                </div>

                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-[#0b1729]">
                    {filteredRiders.length}
                  </span>{" "}
                  rider
                  {filteredRiders.length === 1
                    ? ""
                    : "s"}
                </p>

              </div>

            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px] text-sm">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Rider
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Location
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {paginatedRiders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-16 text-center"
                        >
                          <div className="mx-auto flex max-w-sm flex-col items-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                              <Users size={24} />
                            </div>

                            <h3 className="mt-4 font-semibold text-[#0b1729]">
                              No riders found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {search
                                ? "Try changing your search."
                                : "There are no riders available yet."}
                            </p>

                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRiders.map((rider) => (
                        <tr
                          key={rider.id}
                          className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/80"
                        >

                          {/* RIDER */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b1729] text-sm font-bold text-white">
                                {rider.user?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "R"}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate font-semibold text-[#0b1729]">
                                  {rider.user?.name ||
                                    "Unknown Rider"}
                                </p>

                                <p className="mt-1 truncate text-xs text-gray-500">
                                  {rider.user?.email ||
                                    "No email"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* PHONE */}

                          <td className="px-6 py-5 font-medium text-gray-700">
                            {rider.phone || "—"}
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                rider.isAvailable
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >

                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  rider.isAvailable
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />

                              {rider.isAvailable
                                ? "Available"
                                : "Unavailable"}

                            </span>

                          </td>

                          {/* LOCATION */}

                          <td className="px-6 py-5">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewLocation(rider)
                              }
                              disabled={
                                rider.latitude ===
                                  null ||
                                rider.longitude ===
                                  null
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-[#0b1729] transition hover:border-[#E23C2E] hover:text-[#E23C2E] disabled:cursor-not-allowed disabled:opacity-40"
                            >

                              <MapPin size={16} />

                              {rider.latitude === null ||
                              rider.longitude === null
                                ? "No Location"
                                : "View Location"}

                            </button>

                          </td>

                        </tr>
                      ))
                    )}

                  </tbody>

                </table>

              </div>

              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {filteredRiders.length > ITEMS_PER_PAGE && (
                <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm text-gray-500">
                    Page{" "}
                    <span className="font-semibold text-[#0b1729]">
                      {safeCurrentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#0b1729]">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                      disabled={safeCurrentPage === 1}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(
                            totalPages,
                            page + 1
                          )
                        )
                      }
                      disabled={
                        safeCurrentPage === totalPages
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={17} />
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* ==================================================
                MAP
            ================================================== */}

            {location && selectedRider && (
              <div
                id="rider-location"
                className="scroll-mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >

                <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E23C2E]">
                      <MapPin size={20} />
                    </div>

                    <div>

                      <h2 className="font-semibold text-[#0b1729]">
                        {selectedRider.user?.name}'s Location
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        {location.latitude},{" "}
                        {location.longitude}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={closeLocation}
                    className="self-start rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-[#0b1729] sm:self-auto"
                  >
                    <X size={18} />
                  </button>

                </div>

                <div className="p-4 sm:p-5">
                  <RiderMap
                    latitude={location.latitude}
                    longitude={location.longitude}
                  />
                </div>

              </div>
            )}

          </>
        )}

      </div>

      {/* ======================================================
          ADD RIDER MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1729]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !creating
            ) {
              closeModal();
            }
          }}
        >

          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1729] text-white">
                  <UserPlus size={20} />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-[#0b1729]">
                    Add New Rider
                  </h2>

                  <p className="text-xs text-gray-500">
                    Create a rider account.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#0b1729] disabled:opacity-40"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleCreateRider}
              className="space-y-5 p-6"
            >

              {/* MODAL ERROR */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  <XCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>

                </div>
              )}

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ram Bahadur"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ram@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Minimum 6 characters.
                </p>

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9841555676"
                  required
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#0b1729] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E23C2E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#CE3122] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {creating ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Rider
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}