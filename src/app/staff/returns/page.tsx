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


// ============================================================
// API
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";


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
    async () => {

      setLoading(true);
      setError("");

      try {

        const token =
          localStorage.getItem(
            "token"
          );


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

      } catch (error) {

        console.error(
          "Load returns error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load returns"
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );


  // ==========================================================
  // LOAD RIDERS
  // ==========================================================

  const loadRiders = useCallback(
    async () => {

      setRidersLoading(true);

      try {

        const token =
          localStorage.getItem(
            "token"
          );


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


    // ========================================================
    // ORIGINAL PICKUP RIDER
    // ========================================================

    const needsInitialRider =
      returnRequest.status ===
      "REQUESTED";


    // ========================================================
    // NEW WAREHOUSE -> VENDOR RIDER
    // ========================================================

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


      // ======================================================
      // RIDER VALIDATION
      // ======================================================

      if (!selectedRiderId) {

        setAssignError(
          "Please select a rider first."
        );

        return;
      }


      const riderId =
        Number(
          selectedRiderId
        );


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


      // ======================================================
      // ASSIGNMENT TYPE
      // ======================================================

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


      // ======================================================
      // START
      // ======================================================

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


        // ====================================================
        // UPDATED RETURN
        // ====================================================

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
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  updatedReturn.id
                    ? updatedReturn
                    : item
              )
          );

        }


        setSelectedRiderId("");


        // ====================================================
        // MESSAGE
        // ====================================================

        if (
          assigningPickupRider
        ) {

          setAssignMessage(
            "Pickup rider assigned successfully."
          );

        } else {

          setAssignMessage(
            "New return delivery rider assigned successfully."
          );

        }


        // ====================================================
        // REFRESH
        // ====================================================

        await loadReturns();

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


      // ======================================================
      // REQUESTED
      // ======================================================

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


      // ======================================================
      // ASSIGNED
      // ======================================================

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


      // ======================================================
      // PICKED UP
      // ======================================================

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


      // ======================================================
      // IN WAREHOUSE
      // ======================================================

      if (
        currentStatus ===
        "IN_WAREHOUSE"
      ) {

        // ----------------------------------------------------
        // VENDOR PICKUP
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // DELIVER TO VENDOR
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // NO OPTION
        // ----------------------------------------------------

        if (
          !selectedReturn.deliveryOption
        ) {

          setStatusError(
            "Please select a return delivery option first."
          );

          return;
        }

      }


      // ======================================================
      // OUT FOR RETURN
      // ======================================================

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


      // ======================================================
      // SEND REQUEST
      // ======================================================

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


        // ====================================================
        // UPDATED RETURN
        // ====================================================

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
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  updatedReturn.id
                    ? updatedReturn
                    : item
              )
          );

        }


        setStatusMessage(
          `Return status updated to ${formatStatus(
            newStatus
          )}.`
        );


        await loadReturns();

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
  // FILTER RETURNS
  // ==========================================================

  const filteredReturns =
    useMemo(() => {

      const searchValue =
        search
          .trim()
          .toLowerCase();


      return returns.filter(
        (item) => {

          // --------------------------------------------------
          // STATUS
          // --------------------------------------------------

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            item.status ===
              statusFilter;


          if (!matchesStatus) {
            return false;
          }


          // --------------------------------------------------
          // SEARCH
          // --------------------------------------------------

          if (!searchValue) {
            return true;
          }


          const tracking =
            item.shipment
              ?.trackingNumber
              ?.toLowerCase() || "";


          const vendor =
            item.shipment
              ?.vendor?.name
              ?.toLowerCase() || "";


          const customer =
            item.shipment
              ?.customer?.name
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


  return (
    <div className="space-y-6 p-6">


      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Return Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer returns and vendor deliveries.
          </p>

        </div>


        <button
          onClick={loadReturns}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* ====================================================== */}
      {/* SUMMARY */}
      {/* ====================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <SummaryCard
          title="Total Returns"
          value={totalReturns}
        />

        <SummaryCard
          title="Requested"
          value={requestedReturns}
        />

        <SummaryCard
          title="In Warehouse"
          value={warehouseReturns}
        />

        <SummaryCard
          title="Completed"
          value={completedReturns}
        />

      </div>


      {/* ====================================================== */}
      {/* FILTER */}
      {/* ====================================================== */}

      <div className="rounded-xl border bg-white p-4">

        <div className="grid gap-4 md:grid-cols-2">

          {/* SEARCH */}

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search tracking, vendor, customer..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />


          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >

            <option value="ALL">
              All Statuses
            </option>

            <option value="REQUESTED">
              Requested
            </option>

            <option value="ASSIGNED_TO_RIDER">
              Assigned To Rider
            </option>

            <option value="PICKED_UP_FROM_CUSTOMER">
              Picked Up From Customer
            </option>

            <option value="IN_WAREHOUSE">
              In Warehouse
            </option>

            <option value="OUT_FOR_RETURN">
              Out For Return
            </option>

            <option value="RETURNED_TO_VENDOR">
              Returned To Vendor
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

          </select>

        </div>

      </div>


      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <ReturnTable
        returns={filteredReturns}
        loading={loading}
        error={error}
        onRefresh={loadReturns}
        onOpenReturn={openReturn}
      />


      {/* ====================================================== */}
      {/* MODAL */}
      {/* ====================================================== */}

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
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (
    <div className="rounded-xl border bg-white  p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-black">
        {value}
      </p>

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
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}