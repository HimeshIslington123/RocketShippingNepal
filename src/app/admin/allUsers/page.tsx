"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "VENDOR" | "STAFF" | "RIDER" | string;
  isActive: boolean;
  createdAt: string;
}

type RoleFilter = "ALL" | "RIDER" | "STAFF" | "VENDOR";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<number | null>(
    null
  );

  // ======================================================
  // ROLE FILTER
  // ======================================================

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("ALL");

  // ======================================================
  // GET TOKEN
  // ======================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ======================================================
  // LOAD USERS
  // ======================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to load users"
        );
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD ON PAGE OPEN
  // ======================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // ======================================================
  // FREEZE / UNFREEZE USER
  // ======================================================

  const handleFreeze = async (user: User) => {
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
      setActionLoading(user.id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/freeze`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to ${action} user`
        );
      }

      // Update immediately in UI
      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isActive: data.isActive,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "FREEZE USER ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} user`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // FILTER USERS
  // ======================================================

  const filteredUsers =
    roleFilter === "ALL"
      ? users
      : users.filter(
          (user) => user.role === roleFilter
        );

  // ======================================================
  // ROLE COUNTS
  // ======================================================

  const allCount = users.length;

  const riderCount = users.filter(
    (user) => user.role === "RIDER"
  ).length;

  const staffCount = users.filter(
    (user) => user.role === "STAFF"
  ).length;

  const vendorCount = users.filter(
    (user) => user.role === "VENDOR"
  ).length;

  // ======================================================
  // ROLE STYLE
  // ======================================================

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "VENDOR":
        return "bg-purple-50 text-purple-600";

      case "RIDER":
        return "bg-blue-50 text-blue-600";

      case "STAFF":
        return "bg-amber-50 text-amber-600";

      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-black">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Users
          </h1>

          <p className="mt-1 text-sm text-ink/50">
            Manage vendors, staff and riders.
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="mx-auto max-w-6xl text-black">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Users
        </h1>

        <p className="mt-1 text-sm text-ink/50">
          Manage vendors, staff and riders.
        </p>
      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="mt-5 flex flex-wrap gap-2">
        {/* ALL USERS */}

        <button
          onClick={() => setRoleFilter("ALL")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter === "ALL"
              ? "bg-accent text-white"
              : "bg-white text-ink/60 ring-1 ring-black/5 hover:bg-gray-50"
          }`}
        >
          All Users ({allCount})
        </button>

        {/* RIDERS */}

        <button
          onClick={() => setRoleFilter("RIDER")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter === "RIDER"
              ? "bg-accent text-white"
              : "bg-white text-ink/60 ring-1 ring-black/5 hover:bg-gray-50"
          }`}
        >
          Riders ({riderCount})
        </button>

        {/* STAFF */}

        <button
          onClick={() => setRoleFilter("STAFF")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter === "STAFF"
              ? "bg-accent text-white"
              : "bg-white text-ink/60 ring-1 ring-black/5 hover:bg-gray-50"
          }`}
        >
          Staff ({staffCount})
        </button>

        {/* VENDORS */}

        <button
          onClick={() => setRoleFilter("VENDOR")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter === "VENDOR"
              ? "bg-accent text-white"
              : "bg-white text-ink/60 ring-1 ring-black/5 hover:bg-gray-50"
          }`}
        >
          Vendors ({vendorCount})
        </button>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        {/* ==================================================
            DESKTOP
        ================================================== */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink/40">
                <th className="px-6 py-4">
                  User
                </th>

                <th className="px-6 py-4">
                  Role
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-ink/40"
                  >
                    No{" "}
                    {roleFilter === "ALL"
                      ? "users"
                      : roleFilter.toLowerCase() +
                        "s"}{" "}
                    found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isLoading =
                    actionLoading === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      {/* USER */}

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-ink">
                            {user.name}
                          </p>

                          <p className="mt-0.5 text-sm text-ink/45">
                            {user.email}
                          </p>
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Frozen
                          </span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              handleFreeze(user)
                            }
                            disabled={isLoading}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.isActive ? (
                              <ShieldOff className="h-4 w-4" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}

                            {user.isActive
                              ? "Freeze"
                              : "Unfreeze"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ==================================================
            MOBILE
        ================================================== */}

        <div className="space-y-3 p-4 md:hidden">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink/40">
              No{" "}
              {roleFilter === "ALL"
                ? "users"
                : roleFilter.toLowerCase() +
                  "s"}{" "}
              found.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isLoading =
                actionLoading === user.id;

              return (
                <div
                  key={user.id}
                  className="rounded-xl border border-black/5 p-4"
                >
                  {/* TOP */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {user.name}
                      </p>

                      <p className="mt-1 truncate text-sm text-ink/45">
                        {user.email}
                      </p>
                    </div>

                    {/* ROLE */}

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleStyle(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Frozen
                      </span>
                    )}
                  </div>

                  {/* ACTION */}

                  <button
                    onClick={() =>
                      handleFreeze(user)
                    }
                    disabled={isLoading}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      user.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.isActive ? (
                      <ShieldOff className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}

                    {user.isActive
                      ? "Freeze User"
                      : "Unfreeze User"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}