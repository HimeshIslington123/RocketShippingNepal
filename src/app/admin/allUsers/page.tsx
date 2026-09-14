"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Users,
  UserRound,
  BriefcaseBusiness,
  Bike,
  X,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "VENDOR" | "STAFF" | "RIDER" | string;
  isActive: boolean;
  createdAt: string;
}

type RoleFilter = "ALL" | "VENDOR" | "STAFF" | "RIDER";
type StatusFilter = "ALL" | "ACTIVE" | "FROZEN";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ======================================================
// CACHE
// ======================================================

let usersCache: User[] | null = null;
let usersRequest: Promise<User[]> | null = null;

// ======================================================
// FETCH USERS
// ======================================================

async function fetchUsers(force = false): Promise<User[]> {
  if (!force && usersCache) {
    return usersCache;
  }

  if (usersRequest) {
    return usersRequest;
  }

  const request = (async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_URL}/api/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to load users");
    }

    const users: User[] = Array.isArray(data?.users) ? data.users : [];

    usersCache = users;

    return users;
  })();

  usersRequest = request;

  try {
    return await request;
  } finally {
    if (usersRequest === request) {
      usersRequest = null;
    }
  }
}

// ======================================================
// SKELETON
// ======================================================

function UsersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="relative h-[72px] overflow-hidden rounded-xl border border-gray-100 bg-white"
        >
          <div className="absolute inset-0 management-shimmer" />

          <div className="relative flex h-full items-center gap-5 px-5">
            <div className="h-10 w-10 rounded-full bg-gray-100" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-36 rounded bg-gray-100" />
              <div className="h-3 w-52 rounded bg-gray-100" />
            </div>

            <div className="h-7 w-20 rounded-full bg-gray-100" />
            <div className="h-7 w-20 rounded-full bg-gray-100" />
            <div className="h-9 w-24 rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[#0b1729]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// ROLE BADGE
// ======================================================

function RoleBadge({ role }: { role: string }) {
  const normalizedRole = role.toUpperCase();

  if (normalizedRole === "VENDOR") {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
        Vendor
      </span>
    );
  }

  if (normalizedRole === "STAFF") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Staff
      </span>
    );
  }

  if (normalizedRole === "RIDER") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
        Rider
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
      {role}
    </span>
  );
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Frozen
    </span>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("ALL");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const ITEMS_PER_PAGE = 8;

  // ====================================================
  // LOAD USERS
  // ====================================================

  const loadUsers = useCallback(async (force = false) => {
    try {
      setError("");

      if (force) {
        usersCache = null;
        setRefreshing(true);
      } else if (!usersCache) {
        setLoading(true);
      }

      const data = await fetchUsers(force);

      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load users";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ====================================================
  // COUNTS
  // ====================================================

  const totalUsers = users.length;

  const totalVendors = users.filter(
    (user) => user.role.toUpperCase() === "VENDOR"
  ).length;

  const totalStaff = users.filter(
    (user) => user.role.toUpperCase() === "STAFF"
  ).length;

  const totalRiders = users.filter(
    (user) => user.role.toUpperCase() === "RIDER"
  ).length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const frozenUsers = users.filter(
    (user) => !user.isActive
  ).length;

  // ====================================================
  // FILTER
  // ====================================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "ALL" ||
        user.role.toUpperCase() === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive) ||
        (statusFilter === "FROZEN" && !user.isActive);

      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        String(user.id).includes(query);

      return (
        matchesRole &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedUsers = useMemo(() => {
    const start =
      (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredUsers.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredUsers, safeCurrentPage]);

  // Keep page valid when filters change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  // ====================================================
  // FREEZE / UNFREEZE
  // ====================================================

  const handleToggleActive = async (user: User) => {
    const action = user.isActive
      ? "freeze"
      : "unfreeze";

    const confirmed = window.confirm(
      user.isActive
        ? `Are you sure you want to freeze ${user.name}?`
        : `Are you sure you want to unfreeze ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(user.id);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_URL}/api/users/${user.id}/freeze`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to ${action} user`
        );
      }

      const newIsActive =
        typeof data?.isActive === "boolean"
          ? data.isActive
          : !user.isActive;

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isActive: newIsActive,
              }
            : item
        )
      );

      // Update cache too
      if (usersCache) {
        usersCache = usersCache.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isActive: newIsActive,
              }
            : item
        );
      }

      setSuccess(
        `${user.name} has been ${
          newIsActive ? "unfrozen" : "frozen"
        } successfully.`
      );

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to ${action} user`;

      setError(message);
    } finally {
      setProcessingId(null);
    }
  };

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const hasFilters =
    search.trim() !== "" ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL";

  // ====================================================
  // PAGINATION NUMBERS
  // ====================================================

  const paginationItems = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (safeCurrentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(
      totalPages - 1,
      safeCurrentPage + 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safeCurrentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }, [safeCurrentPage, totalPages]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading && users.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#0b1729]">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage vendors, staff and riders.
          </p>
        </div>

        <UsersSkeleton />

        <style jsx global>{`
          .management-shimmer {
            background: linear-gradient(
              110deg,
              transparent 25%,
              rgba(255, 255, 255, 0.7) 45%,
              rgba(255, 255, 255, 0.95) 50%,
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
      </div>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="w-full">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1729]">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage vendors, staff and riders.
          </p>
        </div>

        <button
          onClick={() => loadUsers(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-[#0b1729] transition hover:border-[#E23C2E] hover:text-[#E23C2E] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              refreshing ? "animate-spin" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            {error}
          </div>

          <button
            onClick={() => setError("")}
            className="shrink-0 text-red-400 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            {success}
          </div>

          <button
            onClick={() => setSuccess("")}
            className="shrink-0 text-green-400 hover:text-green-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ==================================================
          STATS
      ================================================== */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          iconClass="bg-gray-100 text-[#0b1729]"
        />

        <StatCard
          title="Vendors"
          value={totalVendors}
          icon={BriefcaseBusiness}
          iconClass="bg-purple-50 text-purple-700"
        />

        <StatCard
          title="Staff"
          value={totalStaff}
          icon={UserRound}
          iconClass="bg-amber-50 text-amber-700"
        />

        <StatCard
          title="Riders"
          value={totalRiders}
          icon={Bike}
          iconClass="bg-blue-50 text-blue-700"
        />

        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={ShieldCheck}
          iconClass="bg-green-50 text-green-700"
        />

        <StatCard
          title="Frozen Users"
          value={frozenUsers}
          icon={ShieldOff}
          iconClass="bg-red-50 text-red-600"
        />
      </div>

      {/* ==================================================
          FILTER BAR
      ================================================== */}

      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* Search */}

          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, role or ID..."
              className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-[#0b1729] outline-none transition placeholder:text-gray-400 focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
            />
          </div>

          {/* Role */}

          <div className="relative w-full xl:w-[190px]">
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value as RoleFilter
                )
              }
              className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm font-medium text-[#0b1729] outline-none transition focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="VENDOR">
                Vendors
              </option>

              <option value="STAFF">
                Staff
              </option>

              <option value="RIDER">
                Riders
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Status */}

          <div className="relative w-full xl:w-[190px]">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
              className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm font-medium text-[#0b1729] outline-none transition focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="FROZEN">
                Frozen
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Clear */}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="h-11 rounded-lg px-4 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-[#0b1729]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ==================================================
          RESULT COUNT
      ================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-[#0b1729]">
            {filteredUsers.length}
          </span>{" "}
          {filteredUsers.length === 1
            ? "user"
            : "users"}
        </p>

        {hasFilters && (
          <p className="text-xs text-gray-400">
            Filters applied
          </p>
        )}
      </div>

      {/* ==================================================
          DESKTOP TABLE
      ================================================== */}

      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  User
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Joined
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Users size={21} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#0b1729]">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Try changing your search or filters.
                    </p>

                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 text-sm font-semibold text-[#E23C2E] hover:text-[#CE3122]"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                  >
                    {/* User */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b1729] text-sm font-bold text-white">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#0b1729]">
                            {user.name}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>

                          <p className="mt-0.5 text-[11px] text-gray-400">
                            ID #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}

                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <StatusBadge
                        active={user.isActive}
                      />
                    </td>

                    {/* Date */}

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </td>

                    {/* Action */}

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          handleToggleActive(user)
                        }
                        disabled={
                          processingId === user.id
                        }
                        className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {processingId === user.id ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : user.isActive ? (
                          <ShieldOff size={14} />
                        ) : (
                          <ShieldCheck size={14} />
                        )}

                        {processingId === user.id
                          ? "Updating..."
                          : user.isActive
                          ? "Freeze"
                          : "Unfreeze"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================
          MOBILE CARDS
      ================================================== */}

      <div className="space-y-3 md:hidden">
        {paginatedUsers.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Users size={21} />
            </div>

            <p className="mt-3 text-sm font-semibold text-[#0b1729]">
              No users found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try changing your search or filters.
            </p>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-[#E23C2E]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b1729] text-sm font-bold text-white">
                    {user.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0b1729]">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <StatusBadge
                  active={user.isActive}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    Role
                  </p>

                  <div className="mt-1">
                    <RoleBadge role={user.role} />
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    User ID
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#0b1729]">
                    #{user.id}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400">
                  {user.createdAt
                    ? new Date(
                        user.createdAt
                      ).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )
                    : "—"}
                </p>

                <button
                  onClick={() =>
                    handleToggleActive(user)
                  }
                  disabled={
                    processingId === user.id
                  }
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    user.isActive
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {processingId === user.id ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : user.isActive ? (
                    <ShieldOff size={14} />
                  ) : (
                    <ShieldCheck size={14} />
                  )}

                  {processingId === user.id
                    ? "Updating..."
                    : user.isActive
                    ? "Freeze"
                    : "Unfreeze"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==================================================
          PAGINATION
      ================================================== */}

      {filteredUsers.length > ITEMS_PER_PAGE && (
        <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
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

          <div className="flex items-center gap-1">
            {/* Previous */}

            <button
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              disabled={safeCurrentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#E23C2E] hover:text-[#E23C2E] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {/* Numbers */}

            {paginationItems.map((item, index) => {
              if (item === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-9 w-8 items-center justify-center text-sm text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const page = item as number;

              return (
                <button
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                    safeCurrentPage === page
                      ? "bg-[#E23C2E] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-[#E23C2E] hover:text-[#E23C2E]"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}

            <button
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              disabled={
                safeCurrentPage === totalPages
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#E23C2E] hover:text-[#E23C2E] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          SHIMMER CSS
      ================================================== */}

      <style jsx global>{`
        .management-shimmer {
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.7) 45%,
            rgba(255, 255, 255, 0.95) 50%,
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
    </div>
  );
}