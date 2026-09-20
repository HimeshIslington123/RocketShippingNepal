
"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
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

  vehicleType: string | null;

  vehicleNumber: string | null;

  latitude: number | null;

  longitude: number | null;

  isAvailable: boolean;

  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
    isActive?: boolean;
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
  vehicleType: string;
  vehicleNumber: string;
}

interface EditRiderForm {
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isAvailable: boolean;
}

/* ============================================================
   CACHE
============================================================ */

let riderCache: Rider[] | null = null;

let riderRequest: Promise<Rider[]> | null = null;

/* ============================================================
   API URL
============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ============================================================
   GET AUTH TOKEN
============================================================ */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

/* ============================================================
   FETCH RIDERS
============================================================ */

async function fetchRiders(force = false): Promise<Rider[]> {
  if (!force && riderCache) {
    return riderCache;
  }

  if (riderRequest) {
    return riderRequest;
  }

  const request = (async () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again.",
      );
    }

    const response = await fetch(`${API_URL}/api/rider`, {
      method: "GET",
      cache: "no-store",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Failed to fetch riders (${response.status})`,
      );
    }

    const riders: Rider[] = Array.isArray(data?.riders)
      ? data.riders
      : [];

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
      {/* SUMMARY SKELETON */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="management-shimmer absolute inset-0" />

            <div className="relative">
              <div className="h-4 w-28 rounded bg-gray-200" />

              <div className="mt-4 h-8 w-16 rounded bg-gray-200" />

              <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR SKELETON */}

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4">
        <div className="management-shimmer absolute inset-0" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="h-11 w-full max-w-md rounded-xl bg-gray-200" />

          <div className="h-5 w-28 rounded bg-gray-200" />
        </div>
      </div>

      {/* TABLE SKELETON */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="relative">
          <div className="management-shimmer absolute inset-0" />

          <div className="grid grid-cols-5 gap-4 border-b bg-gray-50 px-6 py-4">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
          </div>

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="grid grid-cols-5 gap-4 border-b px-6 py-5 last:border-0"
            >
              <div>
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-44 rounded bg-gray-200" />
              </div>

              <div className="h-4 w-24 rounded bg-gray-200" />

              <div className="h-4 w-28 rounded bg-gray-200" />

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
  /* ==========================================================
     DATA
  ========================================================== */

  const [riders, setRiders] = useState<Rider[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /* ==========================================================
     LOCATION
  ========================================================== */

  const [location, setLocation] = useState<Location | null>(null);

  const [selectedRider, setSelectedRider] =
    useState<Rider | null>(null);

  /* ==========================================================
     CREATE MODAL
  ========================================================== */

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] = useState(false);

  /* ==========================================================
     EDIT MODAL
  ========================================================== */

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingRider, setEditingRider] =
    useState<Rider | null>(null);

  const [updating, setUpdating] = useState(false);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  /* ==========================================================
     MESSAGES
  ========================================================== */

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ==========================================================
     CREATE FORM
  ========================================================== */

  const [form, setForm] = useState<RiderForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  /* ==========================================================
     EDIT FORM
  ========================================================== */

  const [editForm, setEditForm] =
    useState<EditRiderForm>({
      name: "",
      phone: "",
      vehicleType: "",
      vehicleNumber: "",
      isAvailable: true,
    });

  const ITEMS_PER_PAGE = 8;

  /* ==========================================================
     LOAD RIDERS
  ========================================================== */

  const loadRiders = useCallback(
    async (force = false) => {
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
            : "Failed to load riders.",
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [],
  );

  /* ==========================================================
     INITIAL LOAD — ONLY ONCE
  ========================================================== */

  useEffect(() => {
    loadRiders(false);
  }, [loadRiders]);

  /* ==========================================================
     AUTO CLEAR SUCCESS
  ========================================================== */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  /* ==========================================================
     CREATE FORM INPUT
  ========================================================== */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
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
        rider.user?.name
          ?.toLowerCase()
          .includes(query) ||
        rider.user?.email
          ?.toLowerCase()
          .includes(query) ||
        rider.phone
          ?.toLowerCase()
          .includes(query) ||
        rider.vehicleType
          ?.toLowerCase()
          .includes(query) ||
        rider.vehicleNumber
          ?.toLowerCase()
          .includes(query) ||
        String(rider.id).includes(query)
      );
    });
  }, [riders, search]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRiders.length / ITEMS_PER_PAGE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedRiders =
    filteredRiders.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const totalRiders = riders.length;

  const availableRiders = riders.filter(
    (rider) => rider.isAvailable,
  ).length;

  const unavailableRiders =
    totalRiders - availableRiders;

  const ridersWithLocation = riders.filter(
    (rider) =>
      rider.latitude !== null &&
      rider.longitude !== null,
  ).length;

  /* ==========================================================
     CREATE RIDER
  ========================================================== */

  const handleCreateRider = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setCreating(true);

      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again.",
        );
      }

      const response = await fetch(
        `${API_URL}/api/rider`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,

            vehicleType:
              form.vehicleType.trim() || null,

            vehicleNumber:
              form.vehicleNumber.trim() || null,
          }),
        },
      );

      const data =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to create rider (${response.status})`,
        );
      }

      riderCache = null;

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        vehicleType: "",
        vehicleNumber: "",
      });

      setShowCreateModal(false);

      setSuccess(
        data?.message ||
          "Rider created successfully.",
      );

      await loadRiders(true);
    } catch (err) {
      console.error(
        "Create rider error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create rider.",
      );
    } finally {
      setCreating(false);
    }
  };

  /* ==========================================================
     OPEN EDIT MODAL
  ========================================================== */

  const handleEditRider = (rider: Rider) => {
    setError("");

    setEditingRider(rider);

    setEditForm({
      name: rider.user?.name || "",
      phone: rider.phone || "",
      vehicleType:
        rider.vehicleType || "",
      vehicleNumber:
        rider.vehicleNumber || "",
      isAvailable: rider.isAvailable,
    });

    setShowEditModal(true);
  };

  /* ==========================================================
     EDIT FORM INPUT
  ========================================================== */

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ==========================================================
     UPDATE RIDER
  ========================================================== */

  const handleUpdateRider = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!editingRider) {
      return;
    }

    try {
      setUpdating(true);

      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again.",
        );
      }

      const response = await fetch(
        `${API_URL}/api/rider/${editingRider.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: editForm.name.trim(),

            phone: editForm.phone.trim(),

            /*
             * Empty vehicle fields become null.
             * Vehicle is optional.
             */

            vehicleType:
              editForm.vehicleType.trim() ||
              null,

            vehicleNumber:
              editForm.vehicleNumber.trim() ||
              null,

            isAvailable:
              editForm.isAvailable,
          }),
        },
      );

      const data =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to update rider (${response.status})`,
        );
      }

      /*
       * Update local state immediately.
       * This avoids waiting for another GET request.
       */

      setRiders((previous) =>
        previous.map((rider) => {
          if (
            rider.id !== editingRider.id
          ) {
            return rider;
          }

          return {
            ...rider,

            phone: editForm.phone.trim(),

            vehicleType:
              editForm.vehicleType.trim() ||
              null,

            vehicleNumber:
              editForm.vehicleNumber.trim() ||
              null,

            isAvailable:
              editForm.isAvailable,

            user: {
              ...rider.user,

              name: editForm.name.trim(),
            },
          };
        }),
      );

      /*
       * Update cache too.
       */

      if (riderCache) {
        riderCache = riderCache.map(
          (rider) => {
            if (
              rider.id !== editingRider.id
            ) {
              return rider;
            }

            return {
              ...rider,

              phone:
                editForm.phone.trim(),

              vehicleType:
                editForm.vehicleType.trim() ||
                null,

              vehicleNumber:
                editForm.vehicleNumber.trim() ||
                null,

              isAvailable:
                editForm.isAvailable,

              user: {
                ...rider.user,

                name:
                  editForm.name.trim(),
              },
            };
          },
        );
      }

      setShowEditModal(false);

      setEditingRider(null);

      setSuccess(
        data?.message ||
          "Rider updated successfully.",
      );
    } catch (err) {
      console.error(
        "Update rider error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update rider.",
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ==========================================================
     CLOSE EDIT MODAL
  ========================================================== */

  const closeEditModal = () => {
    if (updating) {
      return;
    }

    setShowEditModal(false);

    setEditingRider(null);
  };

  /* ==========================================================
     VIEW LOCATION
  ========================================================== */

  const handleViewLocation = (
    rider: Rider,
  ) => {
    if (
      rider.latitude === null ||
      rider.longitude === null
    ) {
      setError(
        `${
          rider.user?.name ||
          "This rider"
        } does not have a location available.`,
      );

      return;
    }

    setError("");

    setSelectedRider(rider);

    setLocation({
      latitude: rider.latitude,
      longitude: rider.longitude,
    });

    setTimeout(() => {
      document
        .getElementById(
          "rider-location",
        )
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
     CLOSE CREATE MODAL
  ========================================================== */

  const closeCreateModal = () => {
    if (creating) {
      return;
    }

    setShowCreateModal(false);

    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      vehicleType: "",
      vehicleNumber: "",
    });
  };

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="min-h-screen p-4 text-[#0b1729] sm:p-6 lg:p-8">
      {/* ======================================================
          SHIMMER
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

          animation:
            management-shimmer 1.7s linear
            infinite;

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
                  Manage delivery riders and
                  monitor their current
                  locations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                loadRiders(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#0b1729] shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            {/* ADD RIDER */}

            <button
              type="button"
              onClick={() => {
                setError("");

                setShowCreateModal(
                  true,
                );
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
              onClick={() =>
                setSuccess("")
              }
              className="ml-auto rounded-lg p-1 hover:bg-green-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error &&
          !showCreateModal &&
          !showEditModal && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle size={18} />

              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="ml-auto rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <RidersSkeleton />
        ) : (
          <>
            {/* ==================================================
                SUMMARY
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
                SEARCH
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
                      setSearch(
                        e.target.value,
                      )
                    }
                    placeholder="Search rider, email, phone, vehicle..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-[#0b1729]">
                    {
                      filteredRiders.length
                    }
                  </span>{" "}
                  rider
                  {filteredRiders.length ===
                  1
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
                <table className="w-full min-w-[1100px] text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Rider
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Vehicle
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Location
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRiders.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={6}
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
                      paginatedRiders.map(
                        (rider) => (
                          <tr
                            key={rider.id}
                            className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/80"
                          >
                            {/* RIDER */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b1729] text-sm font-bold text-white">
                                  {rider.user?.name
                                    ?.charAt(
                                      0,
                                    )
                                    ?.toUpperCase() ||
                                    "R"}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-[#0b1729]">
                                    {rider.user
                                      ?.name ||
                                      "Unknown Rider"}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-gray-500">
                                    {rider.user
                                      ?.email ||
                                      "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* PHONE */}

                            <td className="px-6 py-5 font-medium text-gray-700">
                              {rider.phone ||
                                "—"}
                            </td>

                            {/* VEHICLE */}

                            <td className="px-6 py-5">
                              {rider.vehicleType ||
                              rider.vehicleNumber ? (
                                <div>
                                  <p className="font-medium text-[#0b1729]">
                                    {rider.vehicleType ||
                                      "Vehicle"}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    {rider.vehicleNumber ||
                                      "No number"}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  No vehicle
                                </span>
                              )}
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
                                  handleViewLocation(
                                    rider,
                                  )
                                }
                                disabled={
                                  rider.latitude ===
                                    null ||
                                  rider.longitude ===
                                    null
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-[#0b1729] transition hover:border-[#E23C2E] hover:text-[#E23C2E] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <MapPin
                                  size={16}
                                />

                                {rider.latitude ===
                                  null ||
                                rider.longitude ===
                                  null
                                  ? "No Location"
                                  : "View Location"}
                              </button>
                            </td>

                            {/* ACTION */}

                            <td className="px-6 py-5 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditRider(
                                    rider,
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#0b1729] transition hover:border-[#E23C2E] hover:bg-red-50 hover:text-[#E23C2E]"
                              >
                                <Edit3
                                  size={16}
                                />

                                Edit
                              </button>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {filteredRiders.length >
                ITEMS_PER_PAGE && (
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
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1,
                            ),
                        )
                      }
                      disabled={
                        safeCurrentPage ===
                        1
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft
                        size={17}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1,
                            ),
                        )
                      }
                      disabled={
                        safeCurrentPage ===
                        totalPages
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight
                        size={17}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ==================================================
                MAP
            ================================================== */}

            {location &&
              selectedRider && (
                <div
                  id="rider-location"
                  className="scroll-mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#E23C2E]">
                        <MapPin
                          size={20}
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#0b1729]">
                          {
                            selectedRider
                              .user
                              ?.name
                          }
                          's Location
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            location.latitude
                          }
                          ,{" "}
                          {
                            location.longitude
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        closeLocation
                      }
                      className="self-start rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-[#0b1729] sm:self-auto"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5">
                    <RiderMap
                      latitude={
                        location.latitude
                      }
                      longitude={
                        location.longitude
                      }
                    />
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {/* ======================================================
          CREATE RIDER MODAL
      ====================================================== */}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1729]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !creating
            ) {
              closeCreateModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1729] text-white">
                  <UserPlus
                    size={20}
                  />
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
                onClick={
                  closeCreateModal
                }
                disabled={creating}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#0b1729] disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreateRider
              }
              className="space-y-5 p-6"
            >
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
                  placeholder="9841555676"
                  required
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                />
              </div>

              {/* VEHICLE TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                  Vehicle Type{" "}
                  <span className="font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  name="vehicleType"
                  value={
                    form.vehicleType
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Bike, Scooter, Car..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                />
              </div>

              {/* VEHICLE NUMBER */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                  Vehicle Number{" "}
                  <span className="font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  name="vehicleNumber"
                  value={
                    form.vehicleNumber
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="BA 12 PA 3456"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm uppercase outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    closeCreateModal
                  }
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
                      <UserPlus
                        size={18}
                      />

                      Create Rider
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          EDIT RIDER MODAL
      ====================================================== */}

      {showEditModal &&
        editingRider && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0b1729]/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (
                e.target ===
                  e.currentTarget &&
                !updating
              ) {
                closeEditModal();
              }
            }}
          >
            <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1729] text-white">
                    <Edit3 size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#0b1729]">
                      Edit Rider
                    </h2>

                    <p className="text-xs text-gray-500">
                      Update rider information.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  disabled={updating}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#0b1729] disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleUpdateRider
                }
                className="space-y-5 p-6"
              >
                {/* ERROR */}

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <XCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* RIDER INFO */}

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Account
                  </p>

                  <p className="mt-1 font-semibold text-[#0b1729]">
                    {editingRider
                      .user?.email ||
                      "No email"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                    from this page.
                  </p>
                </div>

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      editForm.name
                    }
                    onChange={
                      handleEditChange
                    }
                    placeholder="Rider name"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      editForm.phone
                    }
                    onChange={
                      handleEditChange
                    }
                    placeholder="9841555676"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                  />
                </div>

                {/* VEHICLE TYPE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                    Vehicle Type{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="vehicleType"
                    value={
                      editForm.vehicleType
                    }
                    onChange={
                      handleEditChange
                    }
                    placeholder="Bike, Scooter, Car..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                  />
                </div>

                {/* VEHICLE NUMBER */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0b1729]">
                    Vehicle Number{" "}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="vehicleNumber"
                    value={
                      editForm.vehicleNumber
                    }
                    onChange={
                      handleEditChange
                    }
                    placeholder="BA 12 PA 3456"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm uppercase outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:bg-white focus:ring-2 focus:ring-[#E23C2E]/10"
                  />
                </div>

                {/* AVAILABILITY */}

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0b1729]">
                        Rider Availability
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Set whether this rider
                        can currently receive
                        deliveries.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditForm(
                          (
                            previous,
                          ) => ({
                            ...previous,
                            isAvailable:
                              !previous.isAvailable,
                          }),
                        )
                      }
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        editForm.isAvailable
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                      aria-label="Toggle rider availability"
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                          editForm.isAvailable
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        editForm.isAvailable
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          editForm.isAvailable
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />

                      {editForm.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* BUTTONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      closeEditModal
                    }
                    disabled={updating}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#0b1729] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b1729] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#16243a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updating ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={18}
                        />

                        Save Changes
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

