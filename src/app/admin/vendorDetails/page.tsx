"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  X,
  UserPlus,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Search,
  RefreshCw,
  Pencil,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Vendor {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
  userId: number;

  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };

  createdAt: string;
  updatedAt: string;
}

interface VendorForm {
  name: string;
  email: string;
  password: string;
  companyName: string;
  contactId: string;
  location: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PAGE_SIZE = 8;

/* =========================================================
   CACHE
========================================================= */

let vendorCache: Vendor[] | null = null;

let vendorRequest: Promise<Vendor[]> | null =
  null;

/* =========================================================
   FETCH VENDORS
========================================================= */

async function fetchVendors(
  force = false
): Promise<Vendor[]> {
  if (!force && vendorCache) {
    return vendorCache;
  }

  if (vendorRequest) {
    return vendorRequest;
  }

  const request = (async () => {
    const response = await fetch(
      `${API_URL}/api/vendor/getvendor`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch vendors"
      );
    }

    const data = await response.json();

    const vendors: Vendor[] =
      Array.isArray(data) ? data : [];

    vendorCache = vendors;

    return vendors;
  })();

  vendorRequest = request;

  try {
    return await request;
  } finally {
    if (vendorRequest === request) {
      vendorRequest = null;
    }
  }
}

/* =========================================================
   SHIMMER
========================================================= */

function Shimmer({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`management-shimmer rounded-lg ${className}`}
    />
  );
}

/* =========================================================
   SKELETON
========================================================= */

function VendorsSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px] text-[#0b1729]">
      {/* HEADER */}

      <div className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Shimmer className="h-8 w-36" />

          <Shimmer className="mt-3 h-4 w-80 max-w-full" />
        </div>

        <Shimmer className="h-10 w-40" />
      </div>

      {/* SUMMARY */}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-black/5 bg-white p-4"
            >
              <Shimmer className="h-9 w-9 rounded-lg" />

              <Shimmer className="mt-4 h-3 w-24" />

              <Shimmer className="mt-2 h-7 w-16" />
            </div>
          )
        )}
      </div>

      {/* TABLE */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        <div className="border-b border-black/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <Shimmer className="h-5 w-28" />

              <Shimmer className="mt-2 h-3 w-48" />
            </div>

            <Shimmer className="h-9 w-24" />
          </div>

          <Shimmer className="mt-5 h-10 w-full" />
        </div>

        <div className="space-y-0">
          {Array.from({ length: 7 }).map(
            (_, index) => (
              <div
                key={index}
                className="grid grid-cols-5 items-center gap-5 border-b border-black/5 px-5 py-5"
              >
                <div className="flex items-center gap-3">
                  <Shimmer className="h-10 w-10 rounded-lg" />

                  <div>
                    <Shimmer className="h-4 w-32" />

                    <Shimmer className="mt-2 h-3 w-24" />
                  </div>
                </div>

                <Shimmer className="h-4 w-24" />

                <Shimmer className="h-4 w-24" />

                <Shimmer className="h-4 w-36" />

                <Shimmer className="h-4 w-20" />
              </div>
            )
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes management-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .management-shimmer {
          background: linear-gradient(
            90deg,
            #eceef1 0%,
            #fafafa 45%,
            #eceef1 100%
          );
          background-size: 200% 100%;
          animation: management-shimmer 1.35s ease-in-out
            infinite;
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/[0.035] text-black/35">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-sm font-semibold text-black/60">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-black/35">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-black/5 px-4 py-3">
      <p className="text-xs text-black/40">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() =>
            onPageChange(page - 1)
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({
          length: totalPages,
        }).map((_, index) => {
          const pageNumber = index + 1;

          if (
            totalPages > 7 &&
            pageNumber > 2 &&
            pageNumber < totalPages - 1 &&
            Math.abs(pageNumber - page) > 1
          ) {
            if (
              pageNumber === 3 ||
              pageNumber === totalPages - 2
            ) {
              return (
                <span
                  key={pageNumber}
                  className="px-1 text-xs text-black/30"
                >
                  ...
                </span>
              );
            }

            return null;
          }

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() =>
                onPageChange(pageNumber)
              }
              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                page === pageNumber
                  ? "bg-[#0b1729] text-white"
                  : "text-black/50 hover:bg-black/5"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() =>
            onPageChange(page + 1)
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-black/50 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function VendorsPage() {
  /* =======================================================
     DATA
  ======================================================= */

  const [vendors, setVendors] = useState<
    Vendor[]
  >(vendorCache ?? []);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(
    vendorCache === null
  );

  const [refreshing, setRefreshing] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  /* =======================================================
     MODAL
  ======================================================= */

  const [showModal, setShowModal] =
    useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] =
    useState("");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] = useState(1);

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] =
    useState<VendorForm>({
      name: "",
      email: "",
      password: "",
      companyName: "",
      contactId: "",
      location: "",
    });

  /* =======================================================
     ERROR / SUCCESS
  ======================================================= */

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  const loadVendors = useCallback(
    async (force = false) => {
      try {
        if (force) {
          setRefreshing(true);
        } else if (!vendorCache) {
          setLoading(true);
        }

        setError("");

        const data =
          await fetchVendors(force);

        setVendors(data);
      } catch (err) {
        console.error(
          "Error fetching vendors:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch vendors"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadVendors(false);
  }, [loadVendors]);

  /* =======================================================
     SUCCESS MESSAGE
  ======================================================= */

  const showSuccess = (
    message: string
  ) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      companyName: "",
      contactId: "",
      location: "",
    });
  };

  /* =======================================================
     OPEN MODAL
  ======================================================= */

  const openModal = () => {
    resetForm();
    setError("");
    setShowModal(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    if (creating) {
      return;
    }

    setShowModal(false);
    resetForm();
    setError("");
  };

  /* =======================================================
     CREATE VENDOR
  ======================================================= */

  const handleCreateVendor = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,

            role: "VENDOR",

            companyName:
              form.companyName.trim(),

            contactId:
              form.contactId.trim(),

            location:
              form.location.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create vendor"
        );
      }

      setShowModal(false);
      resetForm();

      /*
       * Invalidate cache so the newly-created
       * vendor is fetched from the backend.
       */

      vendorCache = null;

      await loadVendors(true);

      setPage(1);

      showSuccess(
        "Vendor created successfully."
      );
    } catch (err) {
      console.error(
        "Create vendor error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create vendor"
      );
    } finally {
      setCreating(false);
    }
  };

  /* =======================================================
     FILTER VENDORS
  ======================================================= */

  const filteredVendors = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return vendors;
    }

    return vendors.filter((vendor) => {
      return (
        vendor.companyName
          ?.toLowerCase()
          .includes(query) ||
        vendor.location
          ?.toLowerCase()
          .includes(query) ||
        vendor.contactId
          ?.toLowerCase()
          .includes(query) ||
        vendor.user?.name
          ?.toLowerCase()
          .includes(query) ||
        vendor.user?.email
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [vendors, search]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredVendors.length /
        PAGE_SIZE
    )
  );

  const paginatedVendors =
    filteredVendors.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  /* =======================================================
     RESET PAGE WHEN SEARCH CHANGES
  ======================================================= */

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalVendors = vendors.length;

  const locationsCount = new Set(
    vendors
      .map((vendor) =>
        vendor.location
          ?.trim()
          .toLowerCase()
      )
      .filter(Boolean)
  ).size;

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (
    loading &&
    vendors.length === 0
  ) {
    return <VendorsSkeleton />;
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="mx-auto max-w-[1500px] text-[#0b1729]">
      {/* ===================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Vendors
            </h1>

            {refreshing && (
              <RefreshCw className="h-4 w-4 animate-spin text-[#E23C2E]" />
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
            Manage vendor accounts,
            company information and
            contact details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* REFRESH */}

          <button
            type="button"
            onClick={() => {
              vendorCache = null;
              loadVendors(true);
            }}
            disabled={refreshing}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-semibold text-black/65 transition hover:border-black/20 hover:bg-black/[0.025] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            <span className="hidden sm:inline">
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

          {/* ADD VENDOR */}

          <button
            type="button"
            onClick={openModal}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#E23C2E] px-4 text-sm font-semibold text-white transition hover:bg-[#CE3122]"
          >
            <Plus className="h-4 w-4" />

            Add Vendor
          </button>
        </div>
      </div>

      {/* ===================================================
          SUCCESS
      ================================================== */}

      {success && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {/* ===================================================
          ERROR
      ================================================== */}

      {error && !showModal && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================
          SUMMARY
      ================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1729]/[0.045] text-[#0b1729]/60">
              <Users className="h-4 w-4" />
            </div>

            <span className="text-xs text-black/35">
              Total
            </span>
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Vendors
          </p>

          <p className="mt-1 text-2xl font-bold">
            {totalVendors}
          </p>
        </div>

        {/* COMPANIES */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>

            <span className="text-xs text-black/35">
              Unique
            </span>
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Companies
          </p>

          <p className="mt-1 text-2xl font-bold">
            {totalVendors}
          </p>
        </div>

        {/* LOCATIONS */}

        <div className="rounded-xl border border-black/5 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <MapPin className="h-4 w-4" />
            </div>

            <span className="text-xs text-black/35">
              Active
            </span>
          </div>

          <p className="mt-4 text-xs font-medium text-black/40">
            Locations
          </p>

          <p className="mt-1 text-2xl font-bold">
            {locationsCount}
          </p>
        </div>
      </div>

      {/* ===================================================
          VENDOR TABLE
      ================================================== */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        {/* TABLE HEADER */}

        <div className="border-b border-black/5 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1729]/[0.045] text-[#0b1729]/65">
                <Building2 className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-base font-bold">
                  Vendor Directory
                </h2>

                <p className="mt-0.5 text-xs text-black/40">
                  {filteredVendors.length}{" "}
                  {filteredVendors.length ===
                  1
                    ? "vendor"
                    : "vendors"}{" "}
                  found
                </p>
              </div>
            </div>

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search vendor, company, email..."
                className="h-10 w-full rounded-lg border border-black/10 bg-white pl-9 pr-9 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/50 focus:ring-2 focus:ring-[#E23C2E]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-black/30 hover:bg-black/5 hover:text-black/60"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}

        {filteredVendors.length ===
        0 ? (
          <EmptyState
            icon={Users}
            title={
              search
                ? "No vendors found"
                : "No vendors yet"
            }
            description={
              search
                ? "Try a different company, name, location, phone number or email."
                : "Create your first vendor account to get started."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.012] text-[11px] font-semibold uppercase tracking-wider text-black/35">
                    <th className="px-5 py-3">
                      Company
                    </th>

                    <th className="px-5 py-3">
                      Contact
                    </th>

                    <th className="px-5 py-3">
                      Location
                    </th>

                    <th className="px-5 py-3">
                      Email
                    </th>

                    <th className="px-5 py-3">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedVendors.map(
                    (vendor) => (
                      <tr
                        key={vendor.id}
                        className="border-b border-black/5 transition last:border-0 hover:bg-black/[0.012]"
                      >
                        {/* COMPANY */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0b1729]/[0.045] text-[#0b1729]/60">
                              <Building2 className="h-[18px] w-[18px]" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {
                                  vendor.companyName
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-black/40">
                                {vendor.user
                                  ?.name ||
                                  "No contact name"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-black/60">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-black/30" />

                            <span>
                              {
                                vendor.contactId
                              }
                            </span>
                          </div>
                        </td>

                        {/* LOCATION */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-black/60">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-black/30" />

                            <span>
                              {
                                vendor.location
                              }
                            </span>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4">
                          <div className="flex max-w-[240px] items-center gap-2 text-sm text-black/60">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-black/30" />

                            <span className="truncate">
                              {vendor.user
                                ?.email ||
                                "No email"}
                            </span>
                          </div>
                        </td>

                        {/* CREATED */}

                        <td className="px-5 py-4 text-sm text-black/45">
                          {vendor.createdAt
                            ? new Date(
                                vendor.createdAt
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* ===================================================
          ADD VENDOR MODAL
      ================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0b1729]/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-black/5 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b1729]/[0.045] text-[#0b1729]/65">
                  <UserPlus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#0b1729]">
                    Add New Vendor
                  </h2>

                  <p className="mt-0.5 text-xs leading-5 text-black/40">
                    Create a new vendor
                    account and company
                    profile.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-lg p-2 text-black/35 transition hover:bg-black/5 hover:text-black/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreateVendor
              }
              className="p-5"
            >
              {error && (
                <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* COMPANY */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-black/65">
                    Company Name
                  </label>

                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                    <input
                      type="text"
                      name="companyName"
                      value={
                        form.companyName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="BrandKTM"
                      required
                      autoFocus
                      className="h-11 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                    />
                  </div>
                </div>

                {/* CONTACT PERSON */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-black/65">
                    Contact Person
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
                    className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-black/65">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={
                        handleChange
                      }
                      placeholder="brandktm@gmail.com"
                      required
                      className="h-11 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-black/65">
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
                    className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                  />

                  <p className="mt-1.5 text-[11px] text-black/35">
                    Minimum 6 characters.
                  </p>
                </div>

                {/* CONTACT + LOCATION */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-black/65">
                      Contact ID
                    </label>

                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                      <input
                        type="text"
                        name="contactId"
                        value={
                          form.contactId
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="9841555676"
                        required
                        className="h-11 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-black/65">
                      Location
                    </label>

                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                      <input
                        type="text"
                        name="location"
                        value={
                          form.location
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Kathmandu"
                        required
                        className="h-11 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#E23C2E]/60 focus:ring-2 focus:ring-[#E23C2E]/10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="h-11 flex-1 rounded-lg border border-black/10 text-sm font-semibold text-black/55 transition hover:bg-black/[0.035] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#E23C2E] text-sm font-semibold text-white transition hover:bg-[#CE3122] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />

                      Create Vendor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          SHIMMER CSS
      ================================================== */}

      <style jsx global>{`
        @keyframes management-shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .management-shimmer {
          background: linear-gradient(
            90deg,
            #eceef1 0%,
            #fafafa 45%,
            #eceef1 100%
          );
          background-size: 200% 100%;
          animation: management-shimmer 1.35s ease-in-out
            infinite;
        }
      `}</style>
    </div>
  );
}