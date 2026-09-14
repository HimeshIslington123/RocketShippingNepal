"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ReturnTable from "@/components/returns/ReturnTable";
import ReturnModal from "@/components/returns/ReturnModal";

import {
  ReturnRequest,
  ReturnStatus,
  Rider,
} from "@/components/shipments/types";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  X,
} from "lucide-react";

// ============================================================
// API
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

const RETURNS_CACHE_KEY =
  "admin_returns_cache";

const RETURNS_CACHE_TIME_KEY =
  "admin_returns_cache_time";

const CACHE_DURATION =
  60 * 1000; // 1 minute

// ============================================================
// CACHE HELPERS
// ============================================================

function getCachedReturns(): ReturnRequest[] | null {
  try {
    const cached =
      sessionStorage.getItem(
        RETURNS_CACHE_KEY
      );

    const cachedTime =
      sessionStorage.getItem(
        RETURNS_CACHE_TIME_KEY
      );

    if (!cached || !cachedTime) {
      return null;
    }

    const age =
      Date.now() -
      Number(cachedTime);

    if (
      age > CACHE_DURATION
    ) {
      return null;
    }

    const parsed =
      JSON.parse(cached);

    return Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function cacheReturns(
  data: ReturnRequest[]
) {
  try {
    sessionStorage.setItem(
      RETURNS_CACHE_KEY,
      JSON.stringify(data)
    );

    sessionStorage.setItem(
      RETURNS_CACHE_TIME_KEY,
      String(Date.now())
    );
  } catch {
    // Ignore cache errors.
  }
}

function clearReturnsCache() {
  try {
    sessionStorage.removeItem(
      RETURNS_CACHE_KEY
    );

    sessionStorage.removeItem(
      RETURNS_CACHE_TIME_KEY
    );
  } catch {
    // Ignore cache errors.
  }
}

// ============================================================
// PAGE
// ============================================================

export default function ReturnsPage() {
  // ==========================================================
  // RETURNS
  // ==========================================================

  const [returns, setReturns] =
    useState<ReturnRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // FILTER
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<string>("ALL");

  // ==========================================================
  // SELECTED RETURN
  // ==========================================================

  const [selectedReturn, setSelectedReturn] =
    useState<ReturnRequest | null>(null);

  // ==========================================================
  // RIDERS
  // ==========================================================

  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [ridersLoading, setRidersLoading] =
    useState(false);

  // ==========================================================
  // SELECTED RIDER
  // ==========================================================

  const [selectedRiderId, setSelectedRiderId] =
    useState("");

  // ==========================================================
  // ASSIGN RIDER
  // ==========================================================

  const [assigningRider, setAssigningRider] =
    useState(false);

  const [assignError, setAssignError] =
    useState("");

  const [assignMessage, setAssignMessage] =
    useState("");

  // ==========================================================
  // STATUS
  // ==========================================================

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusError, setStatusError] =
    useState("");

  const [statusMessage, setStatusMessage] =
    useState("");

  // ==========================================================
  // LOAD RETURNS
  // ==========================================================

  const loadReturns = useCallback(
    async (
      forceRefresh = false
    ) => {
      setError("");

      // ------------------------------------------------------
      // CACHE FIRST
      // ------------------------------------------------------

      if (!forceRefresh) {
        const cached =
          getCachedReturns();

        if (cached) {
          setReturns(cached);
          setLoading(false);

          // Still refresh silently in background.
          void loadReturns(true);

          return;
        }
      }

      setLoading(true);

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "Authentication token not found."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/returns/all`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load returns"
          );
        }

        const result =
          Array.isArray(data)
            ? data
            : data?.returns ||
              data?.data ||
              [];

        setReturns(result);

        cacheReturns(result);
      } catch (error) {
        console.error(
          "Load returns error:",
          error
        );

        // Do not destroy already displayed
        // cached data if background refresh fails.
        if (returns.length === 0) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load returns"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [returns.length]
  );

  // ==========================================================
  // LOAD RIDERS
  // ==========================================================

  const loadRiders = useCallback(
    async () => {
      setRidersLoading(true);
      setAssignError("");

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "Authentication token not found."
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/rider/`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load riders"
          );
        }

        const result =
          Array.isArray(data)
            ? data
            : data?.riders ||
              data?.data ||
              [];

        setRiders(result);
      } catch (error) {
        console.error(
          "Load riders error:",
          error
        );

        setAssignError(
          error instanceof Error
            ? error.message
            : "Failed to load riders"
        );
      } finally {
        setRidersLoading(false);
      }
    },
    []
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  // ==========================================================
  // OPEN RETURN
  // ==========================================================

  const openReturn = async (
    returnRequest: ReturnRequest
  ) => {
    setSelectedReturn(
      returnRequest
    );

    setSelectedRiderId("");

    setAssignError("");
    setAssignMessage("");

    setStatusError("");
    setStatusMessage("");

    const needsInitialRider =
      returnRequest.status ===
      "REQUESTED";

    const needsReturnDeliveryRider =
      returnRequest.status ===
        "IN_WAREHOUSE" &&
      returnRequest.deliveryOption ===
        "DELIVER_TO_VENDOR" &&
      !returnRequest.returnDeliveryRiderId;

    if (
      needsInitialRider ||
      needsReturnDeliveryRider
    ) {
      await loadRiders();
    }
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeReturn = () => {
    if (
      assigningRider ||
      updatingStatus
    ) {
      return;
    }

    setSelectedReturn(null);
    setSelectedRiderId("");

    setAssignError("");
    setAssignMessage("");

    setStatusError("");
    setStatusMessage("");
  };

  // ==========================================================
  // ASSIGN RIDER
  // ==========================================================

  const assignReturnRider =
    async () => {
      if (!selectedReturn) {
        return;
      }

      setAssignError("");
      setAssignMessage("");

      if (!selectedRiderId) {
        setAssignError(
          "Please select a rider first."
        );
        return;
      }

      const riderId =
        Number(selectedRiderId);

      if (
        !Number.isInteger(
          riderId
        )
      ) {
        setAssignError(
          "Invalid rider selected."
        );
        return;
      }

      const assigningPickupRider =
        selectedReturn.status ===
        "REQUESTED";

      const assigningReturnDeliveryRider =
        selectedReturn.status ===
          "IN_WAREHOUSE" &&
        selectedReturn.deliveryOption ===
          "DELIVER_TO_VENDOR";

      if (
        !assigningPickupRider &&
        !assigningReturnDeliveryRider
      ) {
        setAssignError(
          "A rider cannot be assigned at this stage."
        );
        return;
      }

      setAssigningRider(true);

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/api/returns/${selectedReturn.id}/assign-rider`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                riderId,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to assign rider"
          );
        }

        const updatedReturn =
          data?.returnRequest ||
          data?.return ||
          data?.data ||
          data;

        if (
          updatedReturn &&
          updatedReturn.id
        ) {
          setSelectedReturn(
            updatedReturn
          );

          setReturns(
            (previous) => {
              const updated =
                previous.map(
                  (item) =>
                    item.id ===
                    updatedReturn.id
                      ? updatedReturn
                      : item
                );

              cacheReturns(updated);

              return updated;
            }
          );
        }

        setSelectedRiderId("");

        setAssignMessage(
          assigningPickupRider
            ? "Pickup rider assigned successfully."
            : "Return delivery rider assigned successfully."
        );

        clearReturnsCache();

        await loadReturns(true);
      } catch (error) {
        console.error(
          "Assign rider error:",
          error
        );

        setAssignError(
          error instanceof Error
            ? error.message
            : "Failed to assign rider"
        );
      } finally {
        setAssigningRider(false);
      }
    };

  // ==========================================================
  // UPDATE RETURN STATUS
  // ==========================================================

  const updateReturnStatus =
    async (
      newStatus: ReturnStatus
    ) => {
      if (!selectedReturn) {
        return;
      }

      setStatusError("");
      setStatusMessage("");

      const currentStatus =
        selectedReturn.status;

      // REQUESTED
      if (
        currentStatus ===
        "REQUESTED"
      ) {
        if (
          newStatus !==
          "ASSIGNED_TO_RIDER"
        ) {
          setStatusError(
            "Invalid return status transition."
          );
          return;
        }

        if (
          !selectedReturn.riderId
        ) {
          setStatusError(
            "Please assign the pickup rider first."
          );
          return;
        }
      }

      // ASSIGNED
      if (
        currentStatus ===
        "ASSIGNED_TO_RIDER"
      ) {
        if (
          newStatus !==
          "PICKED_UP_FROM_CUSTOMER"
        ) {
          setStatusError(
            "Invalid return status transition."
          );
          return;
        }
      }

      // PICKED UP
      if (
        currentStatus ===
        "PICKED_UP_FROM_CUSTOMER"
      ) {
        if (
          newStatus !==
          "IN_WAREHOUSE"
        ) {
          setStatusError(
            "Invalid return status transition."
          );
          return;
        }
      }

      // IN WAREHOUSE
      if (
        currentStatus ===
        "IN_WAREHOUSE"
      ) {
        if (
          selectedReturn.deliveryOption ===
          "VENDOR_PICKUP"
        ) {
          if (
            newStatus !==
            "RETURNED_TO_VENDOR"
          ) {
            setStatusError(
              "Vendor pickup returns must be completed as Returned To Vendor."
            );
            return;
          }
        }

        if (
          selectedReturn.deliveryOption ===
          "DELIVER_TO_VENDOR"
        ) {
          if (
            newStatus !==
            "OUT_FOR_RETURN"
          ) {
            setStatusError(
              "This return must move to Out For Return."
            );
            return;
          }

          if (
            !selectedReturn.returnDeliveryRiderId
          ) {
            setStatusError(
              "Please assign a new return delivery rider first."
            );
            return;
          }
        }

        if (
          !selectedReturn.deliveryOption
        ) {
          setStatusError(
            "Please select a return delivery option first."
          );
          return;
        }
      }

      // OUT FOR RETURN
      if (
        currentStatus ===
        "OUT_FOR_RETURN"
      ) {
        if (
          newStatus !==
          "RETURNED_TO_VENDOR"
        ) {
          setStatusError(
            "Invalid return status transition."
          );
          return;
        }

        if (
          !selectedReturn.returnDeliveryRiderId
        ) {
          setStatusError(
            "Return delivery rider is required."
          );
          return;
        }
      }

      setUpdatingStatus(true);

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}/api/returns/${selectedReturn.id}/status`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                status: newStatus,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to update return status"
          );
        }

        const updatedReturn =
          data?.returnRequest ||
          data?.return ||
          data?.data ||
          data;

        if (
          updatedReturn &&
          updatedReturn.id
        ) {
          setSelectedReturn(
            updatedReturn
          );

          setReturns(
            (previous) => {
              const updated =
                previous.map(
                  (item) =>
                    item.id ===
                    updatedReturn.id
                      ? updatedReturn
                      : item
                );

              cacheReturns(updated);

              return updated;
            }
          );
        }

        setStatusMessage(
          `Return status updated to ${formatStatus(
            newStatus
          )}.`
        );

        clearReturnsCache();

        await loadReturns(true);
      } catch (error) {
        console.error(
          "Update return status error:",
          error
        );

        setStatusError(
          error instanceof Error
            ? error.message
            : "Failed to update return status"
        );
      } finally {
        setUpdatingStatus(false);
      }
    };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredReturns =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return returns.filter(
        (item) => {
          const matchesStatus =
            statusFilter === "ALL" ||
            item.status ===
              statusFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!searchValue) {
            return true;
          }

          const tracking =
            item.shipment
              ?.trackingNumber
              ?.toLowerCase() || "";

          const vendor =
            item.shipment
              ?.vendor?.companyName
              ?.toLowerCase() || "";

          const customer =
            item.shipment
              ?.receiverName
              ?.toLowerCase() || "";

          const reason =
            item.reason
              ?.toLowerCase() || "";

          return (
            tracking.includes(
              searchValue
            ) ||
            vendor.includes(
              searchValue
            ) ||
            customer.includes(
              searchValue
            ) ||
            reason.includes(
              searchValue
            )
          );
        }
      );
    }, [
      returns,
      search,
      statusFilter,
    ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalReturns =
    returns.length;

  const requestedReturns =
    returns.filter(
      (item) =>
        item.status ===
        "REQUESTED"
    ).length;

  const warehouseReturns =
    returns.filter(
      (item) =>
        item.status ===
        "IN_WAREHOUSE"
    ).length;

  const completedReturns =
    returns.filter(
      (item) =>
        item.status ===
        "RETURNED_TO_VENDOR"
    ).length;

  const activeReturns =
    returns.filter(
      (item) =>
        ![
          "RETURNED_TO_VENDOR",
          "CANCELLED",
        ].includes(item.status)
    ).length;

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-7 lg:px-10">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff1ef]">
                  <PackageCheck
                    size={16}
                    strokeWidth={2.2}
                    className="text-[#e23c2e]"
                  />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
                  Operations
                </span>
              </div>

              <h1 className="text-[30px] font-bold tracking-[-0.035em] text-[#0b1729]">
                Return Management
              </h1>

              <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-[#64748b]">
                Monitor customer returns,
                warehouse processing and
                final delivery back to
                vendors.
              </p>
            </div>

            <button
              onClick={() =>
                loadReturns(true)
              }
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b1729] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#17263b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1ef]">
                  <AlertCircle
                    size={18}
                    className="text-[#e23c2e]"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#0b1729]">
                    Unable to load returns
                  </p>

                  <p className="mt-1 text-sm text-[#64748b]">
                    {error}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  loadReturns(true)
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#dfe3e8] px-4 text-sm font-semibold text-[#0b1729] transition hover:border-[#0b1729] hover:bg-[#f8fafc]"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* KPI */}
        {/* ================================================== */}

        {loading &&
        returns.length === 0 ? (
          <MetricSkeleton />
        ) : (
          <div className="mb-7 overflow-hidden rounded-xl border border-[#e6e9ee] bg-white">
            <div className="grid grid-cols-2 divide-x divide-y divide-[#edf0f3] lg:grid-cols-5 lg:divide-y-0">

              <Metric
                label="Total returns"
                value={totalReturns}
                icon={
                  <PackageCheck size={17} />
                }
              />

              <Metric
                label="Awaiting assignment"
                value={requestedReturns}
                icon={
                  <Clock3 size={17} />
                }
                accent="red"
              />

              <Metric
                label="In warehouse"
                value={warehouseReturns}
                icon={
                  <Truck size={17} />
                }
                accent="green"
              />

              <Metric
                label="Active"
                value={activeReturns}
                icon={
                  <RefreshCw size={17} />
                }
              />

              <Metric
                label="Completed"
                value={completedReturns}
                icon={
                  <CheckCircle2 size={17} />
                }
                accent="green"
              />
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-xl border border-[#e6e9ee] bg-white">

          {/* TOOLBAR */}

          <div className="border-b border-[#edf0f3] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <h2 className="text-[15px] font-bold text-[#0b1729]">
                  Return requests
                </h2>

                <p className="mt-0.5 text-xs text-[#94a3b8]">
                  {loading &&
                  returns.length === 0
                    ? "Loading returns..."
                    : `${filteredReturns.length} ${
                        filteredReturns.length ===
                        1
                          ? "return"
                          : "returns"
                      } shown`}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                {/* SEARCH */}

                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search tracking, vendor..."
                    className="h-10 w-full rounded-lg border border-[#dfe3e8] bg-white pl-10 pr-10 text-sm text-[#0b1729] outline-none transition placeholder:text-[#9aa5b1] focus:border-[#0b1729] sm:w-[270px]"
                  />

                  {search && (
                    <button
                      onClick={() =>
                        setSearch("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] transition hover:text-[#0b1729]"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* STATUS */}

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="h-10 min-w-[190px] rounded-lg border border-[#dfe3e8] bg-white px-3 text-sm font-medium text-[#334155] outline-none transition focus:border-[#0b1729]"
                >
                  <option value="ALL">
                    All statuses
                  </option>

                  <option value="REQUESTED">
                    Requested
                  </option>

                  <option value="ASSIGNED_TO_RIDER">
                    Assigned to rider
                  </option>

                  <option value="PICKED_UP_FROM_CUSTOMER">
                    Picked up
                  </option>

                  <option value="IN_WAREHOUSE">
                    In warehouse
                  </option>

                  <option value="OUT_FOR_RETURN">
                    Out for return
                  </option>

                  <option value="RETURNED_TO_VENDOR">
                    Returned to vendor
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER */}

          {(search ||
            statusFilter !==
              "ALL") && (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#edf0f3] bg-[#fafbfc] px-5 py-2.5 sm:px-6">

              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                Filters
              </span>

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e5ea] bg-white px-2.5 py-1 text-xs font-medium text-[#475569] transition hover:border-[#cbd5e1]"
                >
                  Search: {search}
                  <X size={12} />
                </button>
              )}

              {statusFilter !==
                "ALL" && (
                <button
                  onClick={() =>
                    setStatusFilter(
                      "ALL"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e5ea] bg-white px-2.5 py-1 text-xs font-medium text-[#475569] transition hover:border-[#cbd5e1]"
                >
                  Status:{" "}
                  {formatStatus(
                    statusFilter
                  )}
                  <X size={12} />
                </button>
              )}

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "ALL"
                  );
                }}
                className="ml-1 text-xs font-semibold text-[#e23c2e] hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* TABLE */}

          <ReturnTable
            returns={filteredReturns}
            loading={
              loading &&
              returns.length === 0
            }
            error={error}
            onRefresh={() =>
              loadReturns(true)
            }
            onOpenReturn={
              openReturn
            }
          />
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL */}
      {/* ==================================================== */}

      {selectedReturn && (
        <ReturnModal
          returnRequest={
            selectedReturn
          }
          riders={riders}
          ridersLoading={
            ridersLoading
          }
          selectedRiderId={
            selectedRiderId
          }
          setSelectedRiderId={
            setSelectedRiderId
          }
          assigningRider={
            assigningRider
          }
          assignError={
            assignError
          }
          assignMessage={
            assignMessage
          }
          updatingStatus={
            updatingStatus
          }
          statusError={
            statusError
          }
          statusMessage={
            statusMessage
          }
          onAssignRider={
            assignReturnRider
          }
          onUpdateStatus={
            updateReturnStatus
          }
          onClose={
            closeReturn
          }
        />
      )}
    </div>
  );
}

// ============================================================
// METRIC
// ============================================================

function Metric({
  label,
  value,
  icon,
  accent = "navy",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "navy" | "red" | "green";
}) {
  const iconClass =
    accent === "red"
      ? "bg-[#fff1ef] text-[#e23c2e]"
      : accent === "green"
      ? "bg-[#edf8f2] text-[#1e8449]"
      : "bg-[#f1f4f7] text-[#0b1729]";

  return (
    <div className="group px-5 py-5 transition-colors hover:bg-[#fafbfc] sm:px-6">
      <div className="flex items-start justify-between">

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">
            {label}
          </p>

          <p className="mt-2 text-[25px] font-bold tracking-[-0.03em] text-[#0b1729]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// METRIC SKELETON
// ============================================================

function MetricSkeleton() {
  return (
    <div className="mb-7 overflow-hidden rounded-xl border border-[#e6e9ee] bg-white">
      <div className="grid grid-cols-2 divide-x divide-y divide-[#edf0f3] lg:grid-cols-5 lg:divide-y-0">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="px-5 py-5 sm:px-6"
          >
            <div className="flex items-start justify-between">
              <div className="w-full">
                <div className="h-3 w-24 animate-pulse rounded bg-[#edf0f3]" />

                <div className="mt-3 h-7 w-12 animate-pulse rounded bg-[#e7ebef]" />
              </div>

              <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[#f1f4f7]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(
  status?: string | null
) {
  if (!status) {
    return "-";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}