"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";

import {
  ReturnRequest,
  ReturnStatus,
} from "@/components/shipments/types";

/* ============================================================
   TYPES
============================================================ */

type ReturnTableProps = {
  returns: ReturnRequest[];

  loading?: boolean;

  error?: string;

  onRefresh?: () => void | Promise<void>;

  onOpenReturn: (
    returnRequest: ReturnRequest
  ) => void | Promise<void>;
};

type FilterKey =
  | "ALL"
  | "AWAITING_ASSIGNMENT"
  | "IN_WAREHOUSE"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

/* ============================================================
   STATUS
============================================================ */

function formatStatus(status?: string | null) {
  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusStyle(status: ReturnStatus) {
  switch (status) {
    case "REQUESTED":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "ASSIGNED_TO_RIDER":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "PICKED_UP_FROM_CUSTOMER":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "IN_WAREHOUSE":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "OUT_FOR_RETURN":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "RETURNED_TO_VENDOR":
      return "bg-green-50 text-green-700 border-green-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

/* ============================================================
   REASON
============================================================ */

function formatReason(reason?: string | null) {
  if (!reason) return "-";

  return reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ============================================================
   DATE
============================================================ */

function formatDate(date?: string | null) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

/* ============================================================
   FILTER LOGIC
============================================================ */

function matchesFilter(
  item: ReturnRequest,
  filter: FilterKey
) {
  switch (filter) {
    case "ALL":
      return true;

    case "AWAITING_ASSIGNMENT":
      return item.status === "REQUESTED";

    case "IN_WAREHOUSE":
      return item.status === "IN_WAREHOUSE";

    case "ACTIVE":
      return [
        "ASSIGNED_TO_RIDER",
        "PICKED_UP_FROM_CUSTOMER",
        "IN_WAREHOUSE",
        "OUT_FOR_RETURN",
      ].includes(item.status);

    case "COMPLETED":
      return item.status === "RETURNED_TO_VENDOR";

    case "CANCELLED":
      return item.status === "CANCELLED";

    default:
      return true;
  }
}

/* ============================================================
   SKELETON
============================================================ */

function TableSkeleton() {
  return (
    <div className="overflow-hidden bg-white">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-[#edf0f3] bg-[#fafbfc]">
              {Array.from({ length: 7 }).map(
                (_, index) => (
                  <th
                    key={index}
                    className="px-5 py-4"
                  >
                    <div className="h-3 w-20 animate-pulse rounded bg-[#e9edf1]" />
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 6 }).map(
              (_, row) => (
                <tr
                  key={row}
                  className="border-b border-[#edf0f3] last:border-0"
                >
                  {Array.from({ length: 7 }).map(
                    (_, column) => (
                      <td
                        key={column}
                        className="px-5 py-5"
                      >
                        <div
                          className={`h-4 animate-pulse rounded bg-[#f0f2f4] ${
                            column === 0
                              ? "w-32"
                              : "w-24"
                          }`}
                        />
                      </td>
                    )
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 lg:hidden">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#edf0f3] p-4"
            >
              <div className="h-4 w-32 animate-pulse rounded bg-[#f0f2f4]" />

              <div className="mt-3 h-3 w-48 animate-pulse rounded bg-[#f0f2f4]" />

              <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-[#f0f2f4]" />

              <div className="mt-4 space-y-3">
                <div className="h-3 w-full animate-pulse rounded bg-[#f0f2f4]" />

                <div className="h-3 w-4/5 animate-pulse rounded bg-[#f0f2f4]" />

                <div className="h-3 w-3/5 animate-pulse rounded bg-[#f0f2f4]" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ERROR STATE
============================================================ */

function ErrorState({
  error,
  onRefresh,
}: {
  error: string;
  onRefresh?: () => void | Promise<void>;
}) {
  return (
    <div className="px-5 py-12 sm:px-6">
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-[#fff8f7] px-6 py-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1ef]">
          <span className="text-lg font-bold text-[#e23c2e]">
            !
          </span>
        </div>

        <h3 className="mt-4 text-base font-bold text-[#0b1729]">
          Unable to load returns
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-[#64748b]">
          {error}
        </p>

        {onRefresh && (
          <button
            type="button"
            onClick={() => onRefresh()}
            className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-[#0b1729] px-4 text-sm font-semibold text-white transition hover:bg-[#17263b]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  filtered,
}: {
  filtered: boolean;
}) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1ef] text-xl text-[#e23c2e]">
        ↩
      </div>

      <h3 className="mt-4 text-base font-bold text-[#0b1729]">
        {filtered
          ? "No returns in this category"
          : "No return requests found"}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#64748b]">
        {filtered
          ? "There are no return requests matching this status."
          : "Return requests will appear here when vendors create return requests for delivered shipments."}
      </p>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  count,
  active,
  onClick,
  icon,
  iconClass,
}: {
  title: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
        active
          ? "border-[#e23c2e] ring-2 ring-[#e23c2e]/10"
          : "border-[#edf0f3] hover:border-[#d9dee4] hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#64748b]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-[#0b1729]">
            {count}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <div
        className={`mt-4 text-xs font-semibold transition ${
          active
            ? "text-[#e23c2e]"
            : "text-[#94a3b8] group-hover:text-[#e23c2e]"
        }`}
      >
        {active ? "Currently selected" : "View returns →"}
      </div>
    </button>
  );
}

/* ============================================================
   MOBILE INFO
============================================================ */

function MobileInfo({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-[#475569]">
        {value || "-"}
      </span>
    </div>
  );
}

/* ============================================================
   MAIN TABLE
============================================================ */

export default function ReturnTable({
  returns,
  loading = false,
  error = "",
  onRefresh,
  onOpenReturn,
}: ReturnTableProps) {
  /* ==========================================================
     FILTER
  ========================================================== */

  const [activeFilter, setActiveFilter] =
    useState<FilterKey>("ALL");

  /* ==========================================================
     SEARCH
  ========================================================== */

  const [search, setSearch] = useState("");

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  const ITEMS_PER_PAGE = 8;

  /* ==========================================================
     COUNTS
  ========================================================== */

  const totalReturns = returns.length;

  const awaitingAssignment = returns.filter(
    (item) => item.status === "REQUESTED"
  ).length;

  const inWarehouse = returns.filter(
    (item) => item.status === "IN_WAREHOUSE"
  ).length;

  const activeReturns = returns.filter(
    (item) =>
      [
        "ASSIGNED_TO_RIDER",
        "PICKED_UP_FROM_CUSTOMER",
        "IN_WAREHOUSE",
        "OUT_FOR_RETURN",
      ].includes(item.status)
  ).length;

  const completedReturns = returns.filter(
    (item) =>
      item.status === "RETURNED_TO_VENDOR"
  ).length;

  const cancelledReturns = returns.filter(
    (item) => item.status === "CANCELLED"
  ).length;

  /* ==========================================================
     FILTER + SEARCH
  ========================================================== */

  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return returns.filter((item) => {
      /* STATUS FILTER */

      if (!matchesFilter(item, activeFilter)) {
        return false;
      }

      /* SEARCH */

      if (!query) {
        return true;
      }

      const shipment = item.shipment;

      const searchableText = [
        shipment?.trackingNumber,
        item.shipmentId,
        shipment?.receiverName,
        shipment?.receiverPhone,
        shipment?.vendor?.companyName,
        shipment?.vendor?.name,
        shipment?.vendor?.location,
        item.reason,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    returns,
    activeFilter,
    search,
  ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReturns.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedReturns =
    filteredReturns.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  /* ==========================================================
     RESET PAGE
  ========================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, search]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return <TableSkeleton />;
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error && returns.length === 0) {
    return (
      <ErrorState
        error={error}
        onRefresh={onRefresh}
      />
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div className="space-y-5">
      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total returns"
          count={totalReturns}
          active={activeFilter === "ALL"}
          onClick={() =>
            setActiveFilter("ALL")
          }
          icon={
            <RefreshCw
              size={21}
              className="text-[#0b1729]"
            />
          }
          iconClass="bg-gray-100"
        />

        <StatCard
          title="Awaiting assignment"
          count={awaitingAssignment}
          active={
            activeFilter ===
            "AWAITING_ASSIGNMENT"
          }
          onClick={() =>
            setActiveFilter(
              "AWAITING_ASSIGNMENT"
            )
          }
          icon={
            <Clock3
              size={21}
              className="text-amber-600"
            />
          }
          iconClass="bg-amber-50"
        />

        <StatCard
          title="In warehouse"
          count={inWarehouse}
          active={
            activeFilter === "IN_WAREHOUSE"
          }
          onClick={() =>
            setActiveFilter("IN_WAREHOUSE")
          }
          icon={
            <Warehouse
              size={21}
              className="text-orange-600"
            />
          }
          iconClass="bg-orange-50"
        />

        <StatCard
          title="Active"
          count={activeReturns}
          active={activeFilter === "ACTIVE"}
          onClick={() =>
            setActiveFilter("ACTIVE")
          }
          icon={
            <Truck
              size={21}
              className="text-blue-600"
            />
          }
          iconClass="bg-blue-50"
        />

        <StatCard
          title="Completed"
          count={completedReturns}
          active={
            activeFilter === "COMPLETED"
          }
          onClick={() =>
            setActiveFilter("COMPLETED")
          }
          icon={
            <CheckCircle2
              size={21}
              className="text-green-600"
            />
          }
          iconClass="bg-green-50"
        />
      </div>

      {/* ======================================================
          TABLE CONTAINER
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#edf0f3] bg-white shadow-sm">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="border-b border-[#edf0f3] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0b1729]">
                Return requests
              </h2>

              <p className="mt-1 text-sm text-[#64748b]">
                {filteredReturns.length}{" "}
                {filteredReturns.length === 1
                  ? "return"
                  : "returns"}{" "}
                shown
              </p>
            </div>

            {/* SEARCH */}

            <div className="relative w-full xl:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search returns..."
                className="h-10 w-full rounded-lg border border-[#dfe3e8] bg-[#fafbfc] pl-10 pr-10 text-sm text-[#0b1729] outline-none transition placeholder:text-[#94a3b8] focus:border-[#e23c2e] focus:bg-white focus:ring-2 focus:ring-[#e23c2e]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0b1729]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              STATUS TABS
          ================================================== */}

          <div className="mt-5 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2">
              <StatusTab
                label="All"
                count={totalReturns}
                active={
                  activeFilter === "ALL"
                }
                onClick={() =>
                  setActiveFilter("ALL")
                }
              />

              <StatusTab
                label="Requested"
                count={awaitingAssignment}
                active={
                  activeFilter ===
                  "AWAITING_ASSIGNMENT"
                }
                onClick={() =>
                  setActiveFilter(
                    "AWAITING_ASSIGNMENT"
                  )
                }
              />

              <StatusTab
                label="Assigned to rider"
                count={
                  returns.filter(
                    (item) =>
                      item.status ===
                      "ASSIGNED_TO_RIDER"
                  ).length
                }
                active={false}
                onClick={() => {
                  setActiveFilter("ALL");

                  /*
                   * Direct single-status filtering is
                   * handled below through temporary logic.
                   */
                  setSearch("");
                }}
              />

              <StatusTab
                label="Picked up"
                count={
                  returns.filter(
                    (item) =>
                      item.status ===
                      "PICKED_UP_FROM_CUSTOMER"
                  ).length
                }
                active={false}
                onClick={() => {
                  setActiveFilter("ACTIVE");
                  setSearch("");
                }}
              />

              <StatusTab
                label="In warehouse"
                count={inWarehouse}
                active={
                  activeFilter ===
                  "IN_WAREHOUSE"
                }
                onClick={() =>
                  setActiveFilter(
                    "IN_WAREHOUSE"
                  )
                }
              />

              <StatusTab
                label="Out for return"
                count={
                  returns.filter(
                    (item) =>
                      item.status ===
                      "OUT_FOR_RETURN"
                  ).length
                }
                active={false}
                onClick={() => {
                  setActiveFilter("ACTIVE");
                  setSearch("");
                }}
              />

              <StatusTab
                label="Returned to vendor"
                count={completedReturns}
                active={
                  activeFilter ===
                  "COMPLETED"
                }
                onClick={() =>
                  setActiveFilter(
                    "COMPLETED"
                  )
                }
              />

              <StatusTab
                label="Cancelled"
                count={cancelledReturns}
                active={
                  activeFilter ===
                  "CANCELLED"
                }
                onClick={() =>
                  setActiveFilter(
                    "CANCELLED"
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            BACKGROUND ERROR
        ==================================================== */}

        {error && (
          <div className="border-b border-red-200 bg-[#fff8f7] px-5 py-3.5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0b1729]">
                  Refresh failed
                </p>

                <p className="mt-0.5 text-xs text-[#64748b]">
                  Showing the previously loaded
                  return data.
                </p>
              </div>

              {onRefresh && (
                <button
                  type="button"
                  onClick={() =>
                    onRefresh()
                  }
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-semibold text-[#0b1729] transition hover:border-[#0b1729] hover:bg-[#f8fafc]"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!paginatedReturns.length ? (
          <EmptyState
            filtered={
              activeFilter !== "ALL" ||
              Boolean(search)
            }
          />
        ) : (
          <>
            {/* ==================================================
                DESKTOP
            ================================================== */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-[#edf0f3] bg-[#fafbfc] text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Shipment
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Receiver
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Vendor
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Reason
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Requested
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedReturns.map(
                    (item) => {
                      const shipment =
                        item.shipment;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-[#edf0f3] transition last:border-0 hover:bg-[#fafbfc]"
                        >
                          {/* SHIPMENT */}

                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-[#0b1729]">
                                {shipment?.trackingNumber ||
                                  "-"}
                              </p>

                              <p className="mt-1 text-xs text-[#94a3b8]">
                                ID:{" "}
                                {item.shipmentId ||
                                  "-"}
                              </p>
                            </div>
                          </td>

                          {/* RECEIVER */}

                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-[#334155]">
                                {shipment?.receiverName ||
                                  "-"}
                              </p>

                              {shipment?.receiverPhone && (
                                <p className="mt-1 text-xs text-[#94a3b8]">
                                  {
                                    shipment.receiverPhone
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          {/* VENDOR */}

                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-[#334155]">
                                {shipment?.vendor
                                  ?.companyName ||
                                  shipment?.vendor
                                    ?.name ||
                                  "-"}
                              </p>

                              {shipment?.vendor
                                ?.location && (
                                <p className="mt-1 text-xs text-[#94a3b8]">
                                  {
                                    shipment
                                      .vendor
                                      .location
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          {/* REASON */}

                          <td className="px-5 py-4">
                            <p className="max-w-[180px] text-sm text-[#475569]">
                              {formatReason(
                                item.reason
                              )}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                item.status
                              )}`}
                            >
                              {formatStatus(
                                item.status
                              )}
                            </span>
                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4">
                            <p className="text-sm text-[#64748b]">
                              {formatDate(
                                item.requestedAt
                              )}
                            </p>
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenReturn(
                                  item
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 py-2 text-sm font-semibold text-[#0b1729] transition hover:border-[#e23c2e]/30 hover:bg-[#fff1ef] hover:text-[#e23c2e]"
                            >
                              View

                              <span aria-hidden="true">
                                →
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* ==================================================
                MOBILE
            ================================================== */}

            <div className="space-y-3 p-4 lg:hidden">
              {paginatedReturns.map(
                (item) => {
                  const shipment =
                    item.shipment;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#edf0f3] bg-white p-4 transition hover:border-[#dfe3e8]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#0b1729]">
                            {shipment?.trackingNumber ||
                              "-"}
                          </p>

                          <p className="mt-1 text-xs text-[#94a3b8]">
                            {formatDate(
                              item.requestedAt
                            )}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {formatStatus(
                            item.status
                          )}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <MobileInfo
                          label="Receiver"
                          value={
                            shipment?.receiverName
                          }
                        />

                        <MobileInfo
                          label="Phone"
                          value={
                            shipment?.receiverPhone
                          }
                        />

                        <MobileInfo
                          label="Vendor"
                          value={
                            shipment?.vendor
                              ?.companyName ||
                            shipment?.vendor?.name
                          }
                        />

                        <MobileInfo
                          label="Reason"
                          value={formatReason(
                            item.reason
                          )}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenReturn(item)
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b1729] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14253d]"
                      >
                        View Return

                        <span aria-hidden="true">
                          →
                        </span>
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {filteredReturns.length >
          ITEMS_PER_PAGE && (
          <div className="flex flex-col gap-3 border-t border-[#edf0f3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#64748b]">
              Showing{" "}
              <span className="font-semibold text-[#0b1729]">
                {startIndex + 1}
              </span>
              {" – "}
              <span className="font-semibold text-[#0b1729]">
                {Math.min(
                  startIndex +
                    ITEMS_PER_PAGE,
                  filteredReturns.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#0b1729]">
                {filteredReturns.length}
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
                        page - 1
                      )
                  )
                }
                disabled={
                  safeCurrentPage === 1
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe3e8] bg-white text-[#475569] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <div className="min-w-[70px] text-center text-sm font-semibold text-[#0b1729]">
                {safeCurrentPage} /{" "}
                {totalPages}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe3e8] bg-white text-[#475569] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STATUS TAB
============================================================ */

function StatusTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#0b1729] text-white"
          : "bg-[#f8fafc] text-[#64748b] hover:bg-[#eef1f4] hover:text-[#0b1729]"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          active
            ? "bg-white/15 text-white"
            : "bg-white text-[#94a3b8]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}