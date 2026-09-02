"use client";

import {
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const RETURN_STATUSES: ReturnStatus[] = [
  "REQUESTED",
  "ASSIGNED_TO_RIDER",
  "PICKED_UP_FROM_CUSTOMER",
  "IN_WAREHOUSE",
  "OUT_FOR_RETURN",
  "RETURNED_TO_VENDOR",
  "CANCELLED",
];

function formatStatus(
  status?: string
) {
  if (!status) return "—";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function StaffReturnsPage() {

  // ============================================================
  // RETURNS
  // ============================================================

  const [returns, setReturns] =
    useState<ReturnRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // FILTER
  // ============================================================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<string>("ALL");

  // ============================================================
  // MODAL
  // ============================================================

  const [selectedReturn, setSelectedReturn] =
    useState<ReturnRequest | null>(
      null
    );

  // ============================================================
  // RIDERS
  // ============================================================

  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [ridersLoading, setRidersLoading] =
    useState(false);

  const [selectedRiderId, setSelectedRiderId] =
    useState("");

  // ============================================================
  // ASSIGN
  // ============================================================

  const [assigningRider, setAssigningRider] =
    useState(false);

  const [assignError, setAssignError] =
    useState("");

  const [assignMessage, setAssignMessage] =
    useState("");

  // ============================================================
  // STATUS
  // ============================================================

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusError, setStatusError] =
    useState("");

  const [statusMessage, setStatusMessage] =
    useState("");

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadReturns();
  }, []);

  // ============================================================
  // LOAD RETURNS
  // ============================================================

  async function loadReturns() {
    try {
      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const res = await fetch(
        `${API_URL}/api/returns/all`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await res.json().catch(
          () => null
        );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to load returns (${res.status})`
        );
      }

      /*
       * Support:
       *
       * { returns: [...] }
       *
       * or
       *
       * [...]
       */

      const returnList =
        Array.isArray(data)
          ? data
          : data?.returns || [];

      setReturns(returnList);

    } catch (err) {
      console.error(
        "LOAD RETURNS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not load return requests."
      );

      setReturns([]);

    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOAD RIDERS
  // ============================================================

  async function loadRiders() {
    try {
      setRidersLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const res = await fetch(
        `${API_URL}/api/rider/`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await res.json().catch(
          () => null
        );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to load riders (${res.status})`
        );
      }

      setRiders(
        Array.isArray(data)
          ? data
          : data?.riders || []
      );

    } catch (err) {
      console.error(
        "LOAD RETURN RIDERS ERROR:",
        err
      );

      setRiders([]);

    } finally {
      setRidersLoading(false);
    }
  }

  // ============================================================
  // OPEN RETURN
  // ============================================================

  async function openReturn(
    returnRequest: ReturnRequest
  ) {
    setSelectedReturn(
      returnRequest
    );

    setSelectedRiderId("");

    setAssignError("");
    setAssignMessage("");

    setStatusError("");
    setStatusMessage("");

    /*
     * Riders are required when
     * return status is REQUESTED.
     */

    if (
      returnRequest.status ===
      "REQUESTED"
    ) {
      await loadRiders();
    }
  }

  // ============================================================
  // CLOSE RETURN
  // ============================================================

  function closeReturn() {
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
  }

  // ============================================================
  // ASSIGN RIDER
  // ============================================================

  async function assignReturnRider() {
    if (!selectedReturn) {
      return;
    }

    if (
      selectedReturn.status !==
      "REQUESTED"
    ) {
      setAssignError(
        "Rider can only be assigned when the return is requested."
      );

      return;
    }

    if (!selectedRiderId) {
      setAssignError(
        "Please select a rider."
      );

      return;
    }

    const riderId =
      Number(selectedRiderId);

    if (!Number.isInteger(riderId)) {
      setAssignError(
        "Invalid rider selected."
      );

      return;
    }

    try {
      setAssigningRider(true);

      setAssignError("");
      setAssignMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const res = await fetch(
        `${API_URL}/api/returns/${selectedReturn.id}/assign-rider`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            riderId,
          }),
        }
      );

      const data =
        await res.json().catch(
          () => null
        );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to assign rider (${res.status})`
        );
      }

      /*
       * Backend should return:
       *
       * {
       *   returnRequest: {...}
       * }
       *
       * But support other response shapes.
       */

      const updatedReturn =
        data?.returnRequest ||
        data?.return ||
        data;

      if (
        updatedReturn &&
        updatedReturn.id
      ) {
        setSelectedReturn(
          updatedReturn
        );

        setReturns(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updatedReturn.id
                  ? updatedReturn
                  : item
            )
        );
      }

      setSelectedRiderId("");

      setAssignMessage(
        "Rider assigned successfully. Return moved to Assigned To Rider."
      );

      await loadReturns();

    } catch (err) {
      console.error(
        "ASSIGN RETURN RIDER ERROR:",
        err
      );

      setAssignError(
        err instanceof Error
          ? err.message
          : "Failed to assign rider."
      );

    } finally {
      setAssigningRider(false);
    }
  }

  // ============================================================
  // UPDATE RETURN STATUS
  // ============================================================

  async function updateReturnStatus(
    newStatus: ReturnStatus
  ) {
    if (!selectedReturn) {
      return;
    }

    const currentStatus =
      selectedReturn.status;

    /*
     * Expected flow.
     */

    const flow: ReturnStatus[] = [
      "REQUESTED",
      "ASSIGNED_TO_RIDER",
      "PICKED_UP_FROM_CUSTOMER",
      "IN_WAREHOUSE",
      "OUT_FOR_RETURN",
      "RETURNED_TO_VENDOR",
    ];

    const currentIndex =
      flow.indexOf(currentStatus);

    const expectedNext =
      currentIndex >= 0 &&
      currentIndex <
        flow.length - 1
        ? flow[currentIndex + 1]
        : null;

    if (
      newStatus !==
      expectedNext
    ) {
      setStatusError(
        `Invalid return transition. Return must move from ${formatStatus(
          currentStatus
        )} to ${formatStatus(
          expectedNext || ""
        )}.`
      );

      return;
    }

    try {
      setUpdatingStatus(true);

      setStatusError("");
      setStatusMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const res = await fetch(
        `${API_URL}/api/returns/${selectedReturn.id}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await res.json().catch(
          () => null
        );

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Failed to update return status (${res.status})`
        );
      }

      const updatedReturn =
        data?.returnRequest ||
        data?.return ||
        data;

      if (
        updatedReturn &&
        updatedReturn.id
      ) {
        setSelectedReturn(
          updatedReturn
        );

        setReturns(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updatedReturn.id
                  ? updatedReturn
                  : item
            )
        );
      } else {
        setSelectedReturn(
          (previous) =>
            previous
              ? {
                  ...previous,
                  status:
                    newStatus,
                }
              : previous
        );

        setReturns(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                selectedReturn.id
                  ? {
                      ...item,
                      status:
                        newStatus,
                    }
                  : item
            )
        );
      }

      setStatusMessage(
        `Return moved to ${formatStatus(
          newStatus
        )} successfully.`
      );

      await loadReturns();

    } catch (err) {
      console.error(
        "UPDATE RETURN STATUS ERROR:",
        err
      );

      setStatusError(
        err instanceof Error
          ? err.message
          : "Failed to update return status."
      );

    } finally {
      setUpdatingStatus(false);
    }
  }

  // ============================================================
  // FILTERED RETURNS
  // ============================================================

  const filteredReturns =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return returns.filter(
        (item) => {

          const shipment =
            item.shipment;

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            item.status ===
              statusFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!query) {
            return true;
          }

          const values = [
            shipment?.trackingNumber,

            shipment?.receiverName,

            shipment?.receiverPhone,

            shipment?.vendor
              ?.companyName,

            item.reason,

            item.status,

            item.rider?.user?.name,

            item.rider?.phone,
          ];

          return values.some(
            (value) =>
              String(
                value || ""
              )
                .toLowerCase()
                .includes(query)
          );
        }
      );
    }, [
      returns,
      search,
      statusFilter,
    ]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(
    () => ({
      total: returns.length,

      requested: returns.filter(
        (item) =>
          item.status ===
          "REQUESTED"
      ).length,

      assigned: returns.filter(
        (item) =>
          item.status ===
          "ASSIGNED_TO_RIDER"
      ).length,

      pickup: returns.filter(
        (item) =>
          item.status ===
          "PICKED_UP_FROM_CUSTOMER"
      ).length,

      warehouse: returns.filter(
        (item) =>
          item.status ===
          "IN_WAREHOUSE"
      ).length,

      outForReturn: returns.filter(
        (item) =>
          item.status ===
          "OUT_FOR_RETURN"
      ).length,

      completed: returns.filter(
        (item) =>
          item.status ===
          "RETURNED_TO_VENDOR"
      ).length,
    }),
    [returns]
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black sm:p-6 lg:p-8">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mx-auto max-w-7xl">

        <div className="mb-6">

          <h1 className="text-2xl font-black">
            Return Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Process vendor returns using the
            original shipment tracking number.
          </p>

        </div>

        {/* ====================================================
            SUMMARY
        ===================================================== */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">

          <SummaryCard
            label="Total"
            value={summary.total}
          />

          <SummaryCard
            label="Requested"
            value={
              summary.requested
            }
          />

          <SummaryCard
            label="Assigned"
            value={
              summary.assigned
            }
          />

          <SummaryCard
            label="Picked Up"
            value={
              summary.pickup
            }
          />

          <SummaryCard
            label="Warehouse"
            value={
              summary.warehouse
            }
          />

          <SummaryCard
            label="Out For Return"
            value={
              summary.outForReturn
            }
          />

          <SummaryCard
            label="Completed"
            value={
              summary.completed
            }
          />

        </div>

        {/* ====================================================
            FILTERS
        ===================================================== */}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:flex-row">

          <div className="flex-1">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search tracking, vendor, customer, rider..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

          </div>

          <div>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 md:w-64"
            >

              <option value="ALL">
                All Return Statuses
              </option>

              {RETURN_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(
                      status
                    )}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* ====================================================
            TABLE
        ===================================================== */}

        <div className="mt-6">

          <ReturnTable
            returns={
              filteredReturns
            }
            loading={loading}
            error={error}
            onRefresh={
              loadReturns
            }
            onOpenReturn={
              openReturn
            }
          />

        </div>

      </div>

      {/* ======================================================
          MODAL
      ======================================================= */}

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

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black">
        {value}
      </p>

    </div>
  );
}