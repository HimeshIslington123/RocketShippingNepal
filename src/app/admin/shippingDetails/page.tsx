
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import QRCode from "react-qr-code";

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Printer,
  RefreshCw,
  Truck,
  User,
  X,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type Vendor = {
  id: number;
  companyName: string;
  contactId?: string;
  location?: string | null;
  address?: string | null;
  userId?: number;
};

type Location = {
  id: number;
  name: string;
  zone?: string | null;
};

type DeliveryType = {
  id: number;
  name: string;
};

type LocationRate = {
  id: number;
  price: number;
  location?: Location | null;
  deliveryType?: DeliveryType | null;
};

type Rider = {
  id: number;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  vehicleNumber?: string | null;
  isAvailable?: boolean;
  userId?: number;

  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

type Tracking = {
  id: string;
  status: string;
  createdAt: string;
  location?: string | null;
  message?: string | null;
  createdBy?: string | null;
};

type ReturnRequest = {
  id: string;
  shipmentId: string;
  status: string;
  reason: string;
  description?: string | null;

  riderId?: number | null;
  returnDeliveryRiderId?: number | null;

  deliveryOption?: string | null;

  returnCharge?: number | null;

  requestedAt?: string | null;
  pickedUpAt?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  rider?: Rider | null;
  returnDeliveryRider?: Rider | null;
};

type Shipment = {
  id: string;
  trackingNumber: string;

  qrCode?: string | null;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  packageType: string;
  weight: number;

  paymentType: "PREPAID" | "COD";

  codAmount: number;
  shippingCharge: number;

  notes?: string | null;

  vendorId?: number | null;

  status: string;

  origin?: string | null;
  deliveryZone?: string | null;

  locationRateId?: number;

  createdAt: string;
  updatedAt?: string;

  vendor?: Vendor | null;

  createdByStaff?: {
    id: number;

    user?: {
      id: number;
      name: string;
      email: string;
    } | null;
  } | null;

  locationRate?: LocationRate | null;

  rider?: Rider | null;
  riderId?: number | null;

  trackings?: Tracking[];

  returnRequest?: ReturnRequest | null;
};

// ============================================================
// COMPANY
// ============================================================

const CARGO_COMPANY_NAME =
  "Rocket Shipping Cargo";

// ============================================================
// API
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "";

// ============================================================
// NORMAL SHIPMENT FLOW
// ============================================================

const STATUS_FLOW = [
  "CREATED",
  "IN_WAREHOUSE",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

// ============================================================
// TRACKING STEPS
// ============================================================

const TRACKING_STEPS = [
  "CREATED",
  "IN_WAREHOUSE",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

// ============================================================
// SHIPMENT STATUS STYLES
// ============================================================

const STATUS_STYLES: Record<string, string> = {
  CREATED:
    "bg-slate-100 text-slate-700 ring-slate-600/10",

  IN_WAREHOUSE:
    "bg-amber-50 text-amber-700 ring-amber-600/10",

  ASSIGNED_TO_RIDER:
    "bg-blue-50 text-blue-700 ring-blue-600/10",

  OUT_FOR_DELIVERY:
    "bg-orange-50 text-orange-700 ring-orange-600/10",

  DELIVERED:
    "bg-green-50 text-green-700 ring-green-600/10",

  RETURN_REQUESTED:
    "bg-red-50 text-red-700 ring-red-600/10",

  RETURN_ASSIGNED_TO_RIDER:
    "bg-blue-50 text-blue-700 ring-blue-600/10",

  RETURN_PICKED_UP_FROM_CUSTOMER:
    "bg-purple-50 text-purple-700 ring-purple-600/10",

  RETURN_IN_WAREHOUSE:
    "bg-orange-50 text-orange-700 ring-orange-600/10",

  OUT_FOR_RETURN:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/10",

  RETURNED_TO_VENDOR:
    "bg-green-50 text-green-700 ring-green-600/10",

  CANCELLED:
    "bg-red-50 text-red-700 ring-red-600/10",
};

// ============================================================
// RETURN STATUS STYLES
// ============================================================

const RETURN_STATUS_STYLES: Record<string, string> = {
  REQUESTED:
    "bg-amber-50 text-amber-700 border-amber-200",

  ASSIGNED_TO_RIDER:
    "bg-blue-50 text-blue-700 border-blue-200",

  PICKED_UP_FROM_CUSTOMER:
    "bg-purple-50 text-purple-700 border-purple-200",

  IN_WAREHOUSE:
    "bg-orange-50 text-orange-700 border-orange-200",

  OUT_FOR_RETURN:
    "bg-indigo-50 text-indigo-700 border-indigo-200",

  RETURNED_TO_VENDOR:
    "bg-green-50 text-green-700 border-green-200",

  CANCELLED:
    "bg-red-50 text-red-700 border-red-200",
};

// ============================================================
// HELPERS
// ============================================================

function formatStatus(
  status?: string | null
) {
  if (!status) {
    return "—";
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

function formatReason(
  reason?: string | null
) {
  if (!reason) {
    return "—";
  }

  return reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatDate(
  iso?: string | null
) {
  if (!iso) {
    return "—";
  }

  const date =
    new Date(iso);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function formatShortDate(
  iso?: string | null
) {
  if (!iso) {
    return "—";
  }

  const date =
    new Date(iso);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatCurrency(
  amount?: number | null
) {
  return `Rs. ${(
    Number(amount) || 0
  ).toLocaleString()}`;
}

function getStatusStyle(
  status?: string | null
) {
  return (
    STATUS_STYLES[
      status || ""
    ] ||
    "bg-slate-50 text-slate-600 ring-slate-600/10"
  );
}

function getReturnStatusStyle(
  status?: string | null
) {
  return (
    RETURN_STATUS_STYLES[
      status || ""
    ] ||
    "bg-slate-50 text-slate-600 border-slate-200"
  );
}

function getNextStatus(
  status?: string
) {
  if (!status) {
    return null;
  }

  const index =
    STATUS_FLOW.indexOf(status);

  if (
    index === -1 ||
    index >=
      STATUS_FLOW.length - 1
  ) {
    return null;
  }

  return STATUS_FLOW[
    index + 1
  ];
}

function isTerminalStatus(
  status?: string
) {
  return [
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
  ].includes(
    status || ""
  );
}

function getTrackingRecord(
  shipment: Shipment,
  status: string
) {
  return shipment.trackings?.find(
    (tracking) =>
      tracking.status === status
  );
}

// ============================================================
// PAGE
// ============================================================

export default function VendorShipmentsPage() {
  // ==========================================================
  // SHIPMENTS
  // ==========================================================

  const [
    shipments,
    setShipments,
  ] = useState<Shipment[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // CLIENT-SIDE FILTERS
  // ==========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vendorFilter, setVendorFilter] = useState("ALL");
  const [deliveryFilter, setDeliveryFilter] = useState("ALL");
  const [riderFilter, setRiderFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [returnFilter, setReturnFilter] = useState("ALL");

  // ==========================================================
  // RETURNS
  // ==========================================================

  const [
    returns,
    setReturns,
  ] = useState<ReturnRequest[]>(
    []
  );

  const [
    returnsLoading,
    setReturnsLoading,
  ] = useState(false);

  // ==========================================================
  // DETAILS
  // ==========================================================

  const [
    detailsShipment,
    setDetailsShipment,
  ] =
    useState<Shipment | null>(
      null
    );

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  // ==========================================================
  // STATUS
  // ==========================================================

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const [
    statusError,
    setStatusError,
  ] = useState("");

  // ==========================================================
  // RIDERS
  // ==========================================================

  const [
    riders,
    setRiders,
  ] = useState<Rider[]>([]);

  const [
    ridersLoading,
    setRidersLoading,
  ] = useState(false);

  const [
    selectedRiderId,
    setSelectedRiderId,
  ] = useState("");

  const [
    assigningRider,
    setAssigningRider,
  ] = useState(false);

  const [
    assignError,
    setAssignError,
  ] = useState("");

  const [
    assignMessage,
    setAssignMessage,
  ] = useState("");

  // ==========================================================
  // PRINT
  // ==========================================================

  const [
    printShipment,
    setPrintShipment,
  ] =
    useState<Shipment | null>(
      null
    );

  const [
    printMode,
    setPrintMode,
  ] =
    useState<
      "bill" | "customer" | null
    >(null);

  // ==========================================================
  // INITIAL LOAD — ONCE PER PAGE MOUNT
  // ==========================================================

  const initialLoadStarted = useRef(false);

  useEffect(() => {
    if (initialLoadStarted.current) return;

    initialLoadStarted.current = true;
    void loadAll();
  }, []);

  // ==========================================================
  // ESC KEY + BODY SCROLL
  // ==========================================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        detailsShipment &&
        !updatingStatus &&
        !assigningRider
      ) {
        closeDetails();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    detailsShipment,
    updatingStatus,
    assigningRider,
  ]);

  // ==========================================================
  // PRINT BODY CLASS
  // ==========================================================

  useEffect(() => {
    document.body.classList.remove(
      "print-bill",
      "print-customer"
    );

    if (printMode === "bill") {
      document.body.classList.add(
        "print-bill"
      );
    }

    if (
      printMode ===
      "customer"
    ) {
      document.body.classList.add(
        "print-customer"
      );
    }

    return () => {
      document.body.classList.remove(
        "print-bill",
        "print-customer"
      );
    };
  }, [printMode]);

  // ==========================================================
  // AFTER PRINT
  // ==========================================================

  useEffect(() => {
    function handleAfterPrint() {
      document.body.classList.remove(
        "print-bill",
        "print-customer"
      );

      setPrintShipment(null);
      setPrintMode(null);
    }

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, []);

  // ==========================================================
  // LOAD EVERYTHING
  // ==========================================================

  async function loadAll() {
    await Promise.all([
      loadShipments(),
      loadReturns(),
      loadRiders(),
    ]);
  }

  // ==========================================================
  // LOAD SHIPMENTS
  // ==========================================================

  async function loadShipments() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/shipment/`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => null
          );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load shipments (${response.status})`
        );
      }

      const result =
        Array.isArray(
          data?.shipments
        )
          ? data.shipments
          : [];

      setShipments(result);
    } catch (err) {
      console.error(
        "LOAD SHIPMENTS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not load shipments."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOAD RETURNS
  // ==========================================================

  async function loadReturns() {
    try {
      setReturnsLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/returns/all`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => null
          );

      if (!response.ok) {
        console.warn(
          "Could not load returns:",
          data?.message
        );

        setReturns([]);

        return;
      }

      const result =
        Array.isArray(data)
          ? data
          : data?.returns ||
            data?.data ||
            [];

      setReturns(result);
    } catch (err) {
      console.error(
        "LOAD RETURNS ERROR:",
        err
      );

      setReturns([]);
    } finally {
      setReturnsLoading(false);
    }
  }

  // ==========================================================
  // LOAD RIDERS
  // ==========================================================

  async function loadRiders() {
    try {
      setRidersLoading(true);

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

              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => null
          );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load riders (${response.status})`
        );
      }

      const result =
        Array.isArray(data)
          ? data
          : data?.riders ||
            data?.data ||
            [];

      setRiders(result);
    } catch (err) {
      console.error(
        "LOAD RIDERS ERROR:",
        err
      );

      setRiders([]);
    } finally {
      setRidersLoading(false);
    }
  }

  // ==========================================================
  // OPEN SHIPMENT
  // ==========================================================

  async function openShipment(
    shipment: Shipment
  ) {
    setDetailsLoading(true);

    setStatusMessage("");
    setStatusError("");

    setAssignMessage("");
    setAssignError("");

    setSelectedRiderId("");

    const shipmentReturn =
      returns.find(
        (item) =>
          item.shipmentId ===
          shipment.id
      ) || null;

    setDetailsShipment({
      ...shipment,

      returnRequest:
        shipmentReturn,
    });

    // Riders are loaded once during the initial page load.
    setDetailsLoading(false);
  }

  // ==========================================================
  // CLOSE
  // ==========================================================

  function closeDetails() {
    if (
      updatingStatus ||
      assigningRider
    ) {
      return;
    }

    setDetailsShipment(null);

    setStatusMessage("");
    setStatusError("");

    setAssignMessage("");
    setAssignError("");

    setSelectedRiderId("");
  }

  // ==========================================================
  // CURRENT RETURN
  // ==========================================================

  const selectedReturn =
    useMemo(() => {
      if (!detailsShipment) {
        return null;
      }

      return (
        detailsShipment.returnRequest ||
        returns.find(
          (item) =>
            item.shipmentId ===
            detailsShipment.id
        ) ||
        null
      );
    }, [
      detailsShipment,
      returns,
    ]);

  // ==========================================================
  // NEXT STATUS
  // ==========================================================

  const nextStatus =
    useMemo(() => {
      return getNextStatus(
        detailsShipment?.status
      );
    }, [
      detailsShipment?.status,
    ]);

  // ==========================================================
  // CAN ASSIGN RIDER
  // ==========================================================

  const canAssignRider =
    detailsShipment?.status ===
    "IN_WAREHOUSE";

  // ==========================================================
  // AVAILABLE RIDERS
  // ==========================================================

  const availableRiders =
    useMemo(() => {
      return riders.filter(
        (rider) =>
          rider.isAvailable !==
          false
      );
    }, [riders]);

  // ==========================================================
  // UPDATE SHIPMENT STATUS
  // ==========================================================

  async function updateShipmentStatus(
    newStatus: string
  ) {
    if (!detailsShipment) {
      return;
    }

    const currentStatus =
      detailsShipment.status;

    const expectedNextStatus =
      getNextStatus(
        currentStatus
      );

    // ========================================================
    // VALID TRANSITION
    // ========================================================

    if (
      newStatus !==
      expectedNextStatus
    ) {
      setStatusError(
        `Invalid status transition. Shipment must move from ${formatStatus(
          currentStatus
        )} to ${formatStatus(
          expectedNextStatus || ""
        )}.`
      );

      return;
    }

    // ========================================================
    // BLOCK ASSIGNMENT WITHOUT RIDER
    // ========================================================

    if (
      newStatus ===
        "ASSIGNED_TO_RIDER" &&
      !detailsShipment.riderId &&
      !detailsShipment.rider
    ) {
      setStatusError(
        "You must assign a rider before moving the shipment to Assigned To Rider."
      );

      setStatusMessage("");

      return;
    }

    // ========================================================
    // ASSIGNED STATUS MUST COME FROM WAREHOUSE
    // ========================================================

    if (
      newStatus ===
        "ASSIGNED_TO_RIDER" &&
      currentStatus !==
        "IN_WAREHOUSE"
    ) {
      setStatusError(
        "A rider can only be assigned when the shipment is in warehouse."
      );

      return;
    }

    try {
      setUpdatingStatus(true);

      setStatusMessage("");
      setStatusError("");

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
          `${API_URL}/api/shipment/${detailsShipment.id}/status`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status:
                newStatus,

              location:
                detailsShipment
                  .locationRate
                  ?.location
                  ?.name ||
                "Main Office",

              message:
                `Shipment moved from ${formatStatus(
                  currentStatus
                )} to ${formatStatus(
                  newStatus
                )}`,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => null
          );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to update status (${response.status})`
        );
      }

      const updatedShipment =
        data?.shipment ||
        data;

      // ======================================================
      // PRESERVE RIDER
      // ======================================================

      const preservedRider =
        updatedShipment?.rider ||
        detailsShipment.rider ||
        null;

      const preservedRiderId =
        updatedShipment?.riderId ??
        detailsShipment.riderId ??
        null;

      // ======================================================
      // PRESERVE RETURN
      // ======================================================

      const returnRequest =
        selectedReturn ||
        detailsShipment.returnRequest ||
        null;

      // ======================================================
      // MERGE
      // ======================================================

      const mergedShipment: Shipment =
        {
          ...detailsShipment,

          ...(updatedShipment || {}),

          status:
            updatedShipment?.status ||
            newStatus,

          rider:
            preservedRider,

          riderId:
            preservedRiderId,

          returnRequest:
            returnRequest,
        };

      // ======================================================
      // UPDATE MODAL
      // ======================================================

      setDetailsShipment(
        mergedShipment
      );

      // ======================================================
      // UPDATE TABLE
      // ======================================================

      setShipments(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              detailsShipment.id
                ? {
                    ...item,
                    ...mergedShipment,
                  }
                : item
          )
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      setStatusMessage(
        `Shipment moved to ${formatStatus(
          newStatus
        )} successfully.`
      );

      // No GET refresh here. Local state is already synchronized.
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      setStatusError(
        err instanceof Error
          ? err.message
          : "Failed to update shipment status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ==========================================================
  // ASSIGN RIDER
  // ==========================================================

  async function assignRiderToShipment() {
    if (!detailsShipment) {
      return;
    }

    // ========================================================
    // ONLY WAREHOUSE
    // ========================================================

    if (
      detailsShipment.status !==
      "IN_WAREHOUSE"
    ) {
      setAssignError(
        "A rider can only be assigned when the shipment is in warehouse."
      );

      return;
    }

    // ========================================================
    // RIDER REQUIRED
    // ========================================================

    if (!selectedRiderId) {
      setAssignError(
        "Please select a rider."
      );

      return;
    }

    try {
      setAssigningRider(true);

      setAssignError("");
      setAssignMessage("");

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const riderId =
        Number(
          selectedRiderId
        );

      const response =
        await fetch(
          `${API_URL}/api/shipment/${detailsShipment.id}/assign-rider`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              riderId,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => null
          );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to assign rider (${response.status})`
        );
      }

      // ======================================================
      // SELECTED RIDER
      // ======================================================

      const selectedRider =
        riders.find(
          (rider) =>
            rider.id ===
            riderId
        );

      // ======================================================
      // API RIDER
      // ======================================================

      const updatedShipment =
        data?.shipment ||
        data;

      const updatedRider =
        updatedShipment?.rider ||
        selectedRider ||
        detailsShipment.rider ||
        null;

      // ======================================================
      // IMPORTANT:
      // ASSIGNING RIDER AUTOMATICALLY MOVES STATUS
      // ======================================================

      const updatedStatus =
        updatedShipment?.status ||
        "ASSIGNED_TO_RIDER";

      const updatedRiderId =
        updatedShipment?.riderId ??
        riderId;

      // ======================================================
      // UPDATE MODAL IMMEDIATELY
      // ======================================================

      setDetailsShipment(
        (previous) =>
          previous
            ? {
                ...previous,

                rider:
                  updatedRider,

                riderId:
                  updatedRiderId,

                status:
                  updatedStatus,
              }
            : previous
      );

      // ======================================================
      // UPDATE TABLE IMMEDIATELY
      // ======================================================

      setShipments(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              detailsShipment.id
                ? {
                    ...item,

                    rider:
                      updatedRider,

                    riderId:
                      updatedRiderId,

                    status:
                      updatedStatus,
                  }
                : item
          )
      );

      // ======================================================
      // CLEAR SELECTION
      // ======================================================

      setSelectedRiderId("");

      // ======================================================
      // SUCCESS
      // ======================================================

      setAssignMessage(
        "Rider assigned successfully. Shipment moved to Assigned To Rider."
      );

      setStatusMessage(
        "Shipment moved to Assigned To Rider."
      );

      setStatusError("");

      // No GET refresh here. Local state is already synchronized.
    } catch (err) {
      console.error(
        "ASSIGN RIDER ERROR:",
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

  // ==========================================================
  // PRINT BILL
  // ==========================================================

  function printBill(
    shipment: Shipment
  ) {
    setPrintShipment(
      shipment
    );

    setPrintMode("bill");

    // Wait for React to render the print
    // container and apply body.print-bill.
    setTimeout(() => {
      window.print();
    }, 300);
  }

  // ==========================================================
  // PRINT CUSTOMER DETAILS
  // ==========================================================

  function printCustomerDetails(
    shipment: Shipment
  ) {
    setPrintShipment(
      shipment
    );

    setPrintMode(
      "customer"
    );

    // Wait for React to render the print
    // container and apply body.print-customer.
    setTimeout(() => {
      window.print();
    }, 300);
  }

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const filterOptions = useMemo(() => {
    const vendors = Array.from(
      new Map(
        shipments
          .filter((shipment) => shipment.vendor)
          .map((shipment) => [
            String(shipment.vendor!.id),
            shipment.vendor!.companyName,
          ])
      ).entries()
    );

    const deliveryTypes = Array.from(
      new Set(
        shipments
          .map(
            (shipment) =>
              shipment.locationRate?.deliveryType?.name ||
              shipment.deliveryZone ||
              ""
          )
          .filter(Boolean)
      )
    ).sort();

    return { vendors, deliveryTypes };
  }, [shipments]);

  // ==========================================================
  // FILTERED SHIPMENTS — CLIENT SIDE ONLY
  // ==========================================================

  const filteredShipments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const hasReturn = returns.some(
        (item) => item.shipmentId === shipment.id
      );

      const vendorName = shipment.vendor?.companyName || "";
      const riderName = shipment.rider?.user?.name || "";
      const deliveryType =
        shipment.locationRate?.deliveryType?.name ||
        shipment.deliveryZone ||
        "";
      const destination =
        shipment.locationRate?.location?.name ||
        shipment.deliveryZone ||
        "";

      const searchableText = [
        shipment.id,
        shipment.trackingNumber,
        shipment.receiverName,
        shipment.receiverPhone,
        shipment.receiverAddress,
        shipment.packageType,
        shipment.paymentType,
        shipment.status,
        shipment.vendorId,
        vendorName,
        shipment.riderId,
        riderName,
        deliveryType,
        destination,
        shipment.origin,
        shipment.deliveryZone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        shipment.status === statusFilter;

      const matchesVendor =
        vendorFilter === "ALL" ||
        String(shipment.vendorId ?? "") === vendorFilter;

      const matchesDelivery =
        deliveryFilter === "ALL" ||
        deliveryType === deliveryFilter;

      const matchesRider =
        riderFilter === "ALL" ||
        (riderFilter === "UNASSIGNED"
          ? !shipment.riderId && !shipment.rider
          : String(
              shipment.riderId ??
                shipment.rider?.id ??
                ""
            ) === riderFilter);

      const matchesPayment =
        paymentFilter === "ALL" ||
        shipment.paymentType === paymentFilter;

      const matchesReturn =
        returnFilter === "ALL" ||
        (returnFilter === "RETURN" && hasReturn) ||
        (returnFilter === "NO_RETURN" && !hasReturn);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesVendor &&
        matchesDelivery &&
        matchesRider &&
        matchesPayment &&
        matchesReturn
      );
    });
  }, [
    shipments,
    returns,
    searchQuery,
    statusFilter,
    vendorFilter,
    deliveryFilter,
    riderFilter,
    paymentFilter,
    returnFilter,
  ]);

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("ALL");
    setVendorFilter("ALL");
    setDeliveryFilter("ALL");
    setRiderFilter("ALL");
    setPaymentFilter("ALL");
    setReturnFilter("ALL");
  }

  // ==========================================================
  // COMPLETED STEPS
  // ==========================================================

  const completedSteps =
    detailsShipment?.trackings?.map(
      (tracking) =>
        tracking.status
    ) || [];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ================================================== */}
      {/* PRINT CSS */}
      {/* ================================================== */}

      <style jsx global>{`
        /* ================================================
           NORMAL SCREEN
        ================================================= */

        @media screen {
          #print-bill,
          #print-customer {
            display: none !important;
          }
        }

        /* ================================================
           PRINT
        ================================================= */

        @media print {
          @page {
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide EVERYTHING by default */

          body * {
            visibility: hidden !important;
          }

          /* ============================================
             BILL
          ============================================ */

          body.print-bill
            #print-bill,
          body.print-bill
            #print-bill * {
            visibility: visible !important;
          }

          body.print-bill
            #print-bill {
            display: block !important;

            position: absolute !important;

            left: 0 !important;
            top: 0 !important;

            width: 80mm !important;

            min-height: 100mm !important;

            margin: 0 !important;
            padding: 5mm !important;

            box-sizing: border-box !important;

            background: white !important;
            color: black !important;
          }

          /* ============================================
             CUSTOMER LABEL
          ============================================ */

          body.print-customer
            #print-customer,
          body.print-customer
            #print-customer * {
            visibility: visible !important;
          }

          body.print-customer
            #print-customer {
            display: block !important;

            position: absolute !important;

            left: 0 !important;
            top: 0 !important;

            width: 100mm !important;

            min-height: 100mm !important;

            margin: 0 !important;
            padding: 8mm !important;

            box-sizing: border-box !important;

            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* ================================================== */}
      {/* NORMAL PAGE */}
      {/* ================================================== */}

      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-7 lg:px-10">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff1ef]">
                <PackageCheck
                  size={16}
                  className="text-[#e23c2e]"
                />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
                Operations
              </span>
            </div>

            <h1 className="text-[30px] font-bold tracking-[-0.035em] text-[#0b1729]">
              Shipments
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#64748b]">
              Manage shipments, delivery
              progress, riders and customer
              returns from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadAll()
            }
            disabled={
              loading ||
              returnsLoading
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b1729] px-4 text-sm font-semibold text-white transition hover:bg-[#17263b] disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

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
                    Unable to load shipments
                  </p>

                  <p className="mt-1 text-sm text-[#64748b]">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  loadShipments
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#dfe3e8] px-4 text-sm font-semibold transition hover:border-[#0b1729] hover:bg-[#f8fafc]"
              >
                <RefreshCw
                  size={14}
                />

                Try again
              </button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* FILTERS */}

        <div className="mb-5 overflow-hidden rounded-2xl border border-[#e4e8ed] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="border-b border-[#edf0f3] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-bold text-[#0b1729]">
                  Filter shipments
                </p>
                <p className="mt-1 text-xs text-[#94a3b8]">
                  Search and filter instantly without another API request.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#64748b]">
                  Showing {filteredShipments.length} of {shipments.length}
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={
                    !searchQuery &&
                    statusFilter === "ALL" &&
                    vendorFilter === "ALL" &&
                    deliveryFilter === "ALL" &&
                    riderFilter === "ALL" &&
                    paymentFilter === "ALL" &&
                    returnFilter === "ALL"
                  }
                  className="text-xs font-bold text-[#e23c2e] transition hover:text-[#b72d22] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-3 xl:col-span-1">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search ID, tracking, customer, phone..."
                className="h-10 w-full rounded-lg border border-[#dfe3e8] bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-[#a3adb9] focus:border-[#0b1729] focus:ring-2 focus:ring-[#0b1729]/5"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All statuses"
              options={Array.from(new Set(shipments.map((item) => item.status))).sort().map((value) => ({
                value,
                label: formatStatus(value),
              }))}
            />

            <FilterSelect
              value={vendorFilter}
              onChange={setVendorFilter}
              placeholder="All vendors"
              options={filterOptions.vendors.map(([value, label]) => ({
                value,
                label,
              }))}
            />

            <FilterSelect
              value={deliveryFilter}
              onChange={setDeliveryFilter}
              placeholder="All delivery types"
              options={filterOptions.deliveryTypes.map((value) => ({
                value,
                label: value,
              }))}
            />

            <FilterSelect
              value={riderFilter}
              onChange={setRiderFilter}
              placeholder="All riders"
              options={[
                { value: "UNASSIGNED", label: "Unassigned" },
                ...riders.map((rider) => ({
                  value: String(rider.id),
                  label: rider.user?.name || `Rider #${rider.id}`,
                })),
              ]}
            />

            <FilterSelect
              value={paymentFilter}
              onChange={setPaymentFilter}
              placeholder="All payments"
              options={[
                { value: "PREPAID", label: "Prepaid" },
                { value: "COD", label: "Cash on delivery" },
              ]}
            />

            <FilterSelect
              value={returnFilter}
              onChange={setReturnFilter}
              placeholder="All returns"
              options={[
                { value: "RETURN", label: "With return" },
                { value: "NO_RETURN", label: "No return" },
              ]}
            />
          </div>
        </div>

        {/* TABLE */}
        {/* ================================================= */}

        {loading ? (
          <ShipmentTableSkeleton />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e4e8ed] bg-white">
            {/* DESKTOP */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1250px]">
                <thead>
                  <tr className="border-b border-[#edf0f3] bg-[#fafbfc] text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Shipment
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Destination
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Package
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Rider
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShipments.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center"
                      >
                        <Package
                          size={28}
                          className="mx-auto text-[#cbd5e1]"
                        />

                        <p className="mt-3 text-sm font-semibold">
                          No shipments found
                        </p>

                        <p className="mt-1 text-xs text-[#94a3b8]">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map(
                      (
                        shipment
                      ) => {
                        const hasReturn =
                          returns.some(
                            (
                              item
                            ) =>
                              item.shipmentId ===
                              shipment.id
                          );

                        return (
                          <tr
                            key={
                              shipment.id
                            }
                            onClick={() =>
                              void openShipment(
                                shipment
                              )
                            }
                            className="cursor-pointer border-b border-[#edf0f3] transition last:border-0 hover:bg-[#fafbfc]"
                          >
                            {/* SHIPMENT */}

                            <td className="px-5 py-4">
                              <p className="font-bold text-[#0b1729]">
                                {
                                  shipment.trackingNumber
                                }
                              </p>

                              <p className="mt-1 text-xs text-[#94a3b8]">
                                {formatShortDate(
                                  shipment.createdAt
                                )}
                              </p>

                              {hasReturn && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#fff1ef] px-2 py-0.5 text-[10px] font-semibold text-[#e23c2e]">
                                  Return
                                </span>
                              )}
                            </td>

                            {/* CUSTOMER */}

                            <td className="px-5 py-4">
                              <p className="font-medium text-[#334155]">
                                {
                                  shipment.receiverName
                                }
                              </p>

                              <p className="mt-1 text-xs text-[#94a3b8]">
                                {
                                  shipment.receiverPhone
                                }
                              </p>
                            </td>

                            {/* DESTINATION */}

                            <td className="px-5 py-4">
                              <p className="font-medium text-[#334155]">
                                {shipment
                                  .locationRate
                                  ?.location
                                  ?.name ||
                                  "—"}
                              </p>

                              <p className="mt-1 text-xs text-[#94a3b8]">
                                {shipment
                                  .locationRate
                                  ?.deliveryType
                                  ?.name ||
                                  shipment.deliveryZone ||
                                  "—"}
                              </p>
                            </td>

                            {/* PACKAGE */}

                            <td className="px-5 py-4">
                              <p className="font-medium text-[#334155]">
                                {
                                  shipment.packageType
                                }
                              </p>

                              <p className="mt-1 text-xs text-[#94a3b8]">
                                {
                                  shipment.weight
                                }{" "}
                                kg
                              </p>
                            </td>

                            {/* PAYMENT */}

                            <td className="px-5 py-4">
                              <p className="font-medium text-[#334155]">
                                {
                                  shipment.paymentType
                                }
                              </p>

                              {shipment.paymentType ===
                                "COD" && (
                                <p className="mt-1 text-xs font-medium text-[#64748b]">
                                  {formatCurrency(
                                    shipment.codAmount
                                  )}
                                </p>
                              )}
                            </td>

                            {/* RIDER */}

                            <td className="px-5 py-4">
                              {shipment.rider ? (
                                <>
                                  <p className="font-medium text-[#334155]">
                                    {shipment
                                      .rider
                                      .user
                                      ?.name ||
                                      "Rider"}
                                  </p>

                                  <p className="mt-1 text-xs text-[#94a3b8]">
                                    {
                                      shipment
                                        .rider
                                        .phone
                                    }
                                  </p>
                                </>
                              ) : (
                                <span className="text-xs text-[#94a3b8]">
                                  Unassigned
                                </span>
                              )}
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                                  shipment.status
                                )}`}
                              >
                                {formatStatus(
                                  shipment.status
                                )}
                              </span>
                            </td>

                            {/* ACTIONS */}

                            <td
                              className="px-5 py-4 text-right"
                              onClick={(
                                event
                              ) =>
                                event.stopPropagation()
                              }
                            >
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void openShipment(
                                      shipment
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe3e8] bg-white px-3 py-2 text-xs font-semibold text-[#0b1729] transition hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                                >
                                  View

                                  <ChevronRight
                                    size={
                                      14
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    printBill(
                                      shipment
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#e23c2e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#ce3122]"
                                >
                                  <Printer
                                    size={
                                      13
                                    }
                                  />

                                  Bill
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="space-y-3 p-4 lg:hidden">
              {filteredShipments.length ===
              0 ? (
                <div className="py-14 text-center">
                  <Package
                    size={28}
                    className="mx-auto text-[#cbd5e1]"
                  />

                  <p className="mt-3 text-sm font-semibold">
                    No shipments found
                  </p>
                </div>
              ) : (
                filteredShipments.map(
                  (
                    shipment
                  ) => (
                    <div
                      key={
                        shipment.id
                      }
                      className="rounded-xl border border-[#edf0f3] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-[#0b1729]">
                            {
                              shipment.trackingNumber
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#94a3b8]">
                            {
                              shipment.receiverName
                            }
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${getStatusStyle(
                            shipment.status
                          )}`}
                        >
                          {formatStatus(
                            shipment.status
                          )}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <MobileRow
                          label="Phone"
                          value={
                            shipment.receiverPhone
                          }
                        />

                        <MobileRow
                          label="Destination"
                          value={
                            shipment
                              .locationRate
                              ?.location
                              ?.name
                          }
                        />

                        <MobileRow
                          label="Package"
                          value={`${shipment.packageType} · ${shipment.weight} kg`}
                        />

                        <MobileRow
                          label="Rider"
                          value={
                            shipment
                              .rider
                              ?.user
                              ?.name ||
                            "Unassigned"
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void openShipment(
                              shipment
                            )
                          }
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#dfe3e8] px-3 py-2.5 text-xs font-semibold"
                        >
                          View

                          <ChevronRight
                            size={
                              14
                            }
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            printBill(
                              shipment
                            )
                          }
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#e23c2e] px-3 py-2.5 text-xs font-semibold text-white"
                        >
                          <Printer
                            size={
                              13
                            }
                          />

                          Bill
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* DETAILS MODAL */}
      {/* ==================================================== */}

      {(detailsLoading ||
        detailsShipment) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1729]/55 p-3 backdrop-blur-sm sm:p-5"
          onClick={
            closeDetails
          }
        >
          <div
            className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#f8fafc] shadow-2xl"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            {/* ================================================= */}
            {/* MODAL HEADER */}
            {/* ================================================= */}

            <div className="shrink-0 border-b border-[#e6e9ee] bg-white px-5 py-4 sm:px-7">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                      Shipment Details
                    </span>

                    {detailsShipment && (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${getStatusStyle(
                          detailsShipment.status
                        )}`}
                      >
                        {formatStatus(
                          detailsShipment.status
                        )}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 truncate text-xl font-bold tracking-[-0.025em] text-[#0b1729] sm:text-2xl">
                    {detailsShipment
                      ?.trackingNumber ||
                      "Loading shipment..."}
                  </h2>

                  {detailsShipment && (
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      Created{" "}
                      {formatDate(
                        detailsShipment.createdAt
                      )}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    closeDetails
                  }
                  disabled={
                    updatingStatus ||
                    assigningRider
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e1e5ea] bg-white text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#0b1729] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>
            </div>

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {detailsLoading && (
              <ShipmentDetailsSkeleton />
            )}

            {/* ================================================= */}
            {/* DETAILS CONTENT */}
            {/* ================================================= */}

            {!detailsLoading &&
              detailsShipment && (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="space-y-5 p-4 sm:p-6">
                    {/* ======================================= */}
                    {/* TOP SUMMARY */}
                    {/* ======================================= */}

                    <div className="grid gap-3 sm:grid-cols-3">
                      <SummaryCard
                        icon={
                          <User
                            size={17}
                          />
                        }
                        label="Customer"
                        value={
                          detailsShipment.receiverName
                        }
                        secondary={
                          detailsShipment.receiverPhone
                        }
                      />

                      <SummaryCard
                        icon={
                          <MapPin
                            size={17}
                          />
                        }
                        label="Destination"
                        value={
                          detailsShipment
                            .locationRate
                            ?.location
                            ?.name ||
                          "—"
                        }
                        secondary={
                          detailsShipment
                            .locationRate
                            ?.deliveryType
                            ?.name ||
                          detailsShipment.deliveryZone ||
                          "—"
                        }
                      />

                      <SummaryCard
                        icon={
                          <Package
                            size={17}
                          />
                        }
                        label="Package"
                        value={
                          detailsShipment.packageType
                        }
                        secondary={`${detailsShipment.weight} kg`}
                      />
                    </div>

                    {/* ======================================= */}
                    {/* MAIN GRID */}
                    {/* ======================================= */}

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                      {/* ===================================== */}
                      {/* LEFT */}
                      {/* ===================================== */}

                      <div className="space-y-5">
                        {/* CUSTOMER */}

                        <SectionCard
                          title="Customer & shipment"
                          subtitle="Core delivery information"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <InfoCard
                              icon={
                                <User
                                  size={15}
                                />
                              }
                              label="Receiver name"
                              value={
                                detailsShipment.receiverName
                              }
                            />

                            <InfoCard
                              icon={
                                <Phone
                                  size={15}
                                />
                              }
                              label="Receiver phone"
                              value={
                                detailsShipment.receiverPhone
                              }
                            />

                            <InfoCard
                              icon={
                                <MapPin
                                  size={15}
                                />
                              }
                              label="Delivery address"
                              value={
                                detailsShipment.receiverAddress
                              }
                              wide
                            />

                            <InfoCard
                              icon={
                                <Truck
                                  size={15}
                                />
                              }
                              label="Sender / vendor"
                              value={
                                detailsShipment
                                  .vendor
                                  ?.companyName ||
                                "Vendor"
                              }
                            />

                            <InfoCard
                              label="Origin"
                              value={
                                detailsShipment.origin
                              }
                            />

                            <InfoCard
                              label="Destination"
                              value={
                                detailsShipment
                                  .locationRate
                                  ?.location
                                  ?.name
                              }
                            />

                            <InfoCard
                              label="Delivery type"
                              value={
                                detailsShipment
                                  .locationRate
                                  ?.deliveryType
                                  ?.name
                              }
                            />

                            <InfoCard
                              label="Zone"
                              value={
                                detailsShipment.deliveryZone ||
                                detailsShipment
                                  .locationRate
                                  ?.location
                                  ?.zone
                              }
                            />
                          </div>
                        </SectionCard>

                        {/* PACKAGE */}

                        <SectionCard
                          title="Package & payment"
                          subtitle="Shipment value and delivery charges"
                        >
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <InfoCard
                              label="Package"
                              value={
                                detailsShipment.packageType
                              }
                            />

                            <InfoCard
                              label="Weight"
                              value={`${detailsShipment.weight} kg`}
                            />

                            <InfoCard
                              label="Payment"
                              value={
                                detailsShipment.paymentType
                              }
                            />

                            <InfoCard
                              label="Shipping charge"
                              value={formatCurrency(
                                detailsShipment.shippingCharge
                              )}
                              emphasized
                            />

                            {detailsShipment.paymentType ===
                              "COD" && (
                              <InfoCard
                                label="COD amount"
                                value={formatCurrency(
                                  detailsShipment.codAmount
                                )}
                                emphasized
                              />
                            )}

                            <InfoCard
                              label="Created"
                              value={formatDate(
                                detailsShipment.createdAt
                              )}
                            />

                            <InfoCard
                              label="Updated"
                              value={formatDate(
                                detailsShipment.updatedAt
                              )}
                            />
                          </div>

                          {detailsShipment.notes && (
                            <div className="mt-3 rounded-xl border border-[#edf0f3] bg-[#fafbfc] p-4">
                              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                                Notes
                              </p>

                              <p className="mt-2 text-sm leading-6 text-[#475569]">
                                {
                                  detailsShipment.notes
                                }
                              </p>
                            </div>
                          )}
                        </SectionCard>

                        {/* TRACKING */}

                        <SectionCard
                          title="Shipment tracking"
                          subtitle="Complete delivery timeline"
                        >
                          <div className="relative">
                            {TRACKING_STEPS.map(
                              (
                                step,
                                index
                              ) => {
                                const done =
                                  completedSteps.includes(
                                    step
                                  );

                                const current =
                                  detailsShipment.status ===
                                  step;

                                const record =
                                  getTrackingRecord(
                                    detailsShipment,
                                    step
                                  );

                                return (
                                  <div
                                    key={
                                      step
                                    }
                                    className="relative flex gap-4"
                                  >
                                    {index <
                                      TRACKING_STEPS.length -
                                        1 && (
                                      <div
                                        className={`absolute left-[15px] top-8 h-[calc(100%-4px)] w-px ${
                                          done
                                            ? "bg-[#bbdec9]"
                                            : "bg-[#e6e9ee]"
                                        }`}
                                      />
                                    )}

                                    <div
                                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                                        done
                                          ? "bg-[#eaf7ef] text-[#1e8449]"
                                          : current
                                            ? "bg-[#fff1ef] text-[#e23c2e]"
                                            : "bg-[#f1f4f7] text-[#94a3b8]"
                                      }`}
                                    >
                                      {done ? (
                                        <Check
                                          size={
                                            14
                                          }
                                          strokeWidth={
                                            3
                                          }
                                        />
                                      ) : current ? (
                                        <span className="h-2 w-2 rounded-full bg-current" />
                                      ) : (
                                        <Clock3
                                          size={
                                            14
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1 pb-6">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p
                                          className={`text-sm font-bold ${
                                            done
                                              ? "text-[#0b1729]"
                                              : current
                                                ? "text-[#e23c2e]"
                                                : "text-[#94a3b8]"
                                          }`}
                                        >
                                          {formatStatus(
                                            step
                                          )}
                                        </p>

                                        {record && (
                                          <span className="text-[11px] text-[#94a3b8]">
                                            {formatDate(
                                              record.createdAt
                                            )}
                                          </span>
                                        )}
                                      </div>

                                      {record?.location && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-[#64748b]">
                                          <MapPin
                                            size={
                                              12
                                            }
                                          />

                                          {
                                            record.location
                                          }
                                        </p>
                                      )}

                                      {record?.message && (
                                        <p className="mt-1 text-xs leading-5 text-[#94a3b8]">
                                          {
                                            record.message
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </SectionCard>

                        {/* TRACKING HISTORY */}

                        {detailsShipment.trackings &&
                          detailsShipment
                            .trackings
                            .length >
                            0 && (
                            <SectionCard
                              title="Tracking history"
                              subtitle={`${detailsShipment.trackings.length} tracking updates`}
                            >
                              <div className="space-y-2">
                                {detailsShipment.trackings
                                  .slice()
                                  .reverse()
                                  .map(
                                    (
                                      tracking
                                    ) => (
                                      <div
                                        key={
                                          tracking.id
                                        }
                                        className="rounded-xl border border-[#edf0f3] bg-[#fafbfc] p-3.5"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="text-sm font-semibold text-[#334155]">
                                            {formatStatus(
                                              tracking.status
                                            )}
                                          </span>

                                          <span className="text-[11px] text-[#94a3b8]">
                                            {formatDate(
                                              tracking.createdAt
                                            )}
                                          </span>
                                        </div>

                                        {tracking.location && (
                                          <p className="mt-1 text-xs text-[#64748b]">
                                            Location:{" "}
                                            {
                                              tracking.location
                                            }
                                          </p>
                                        )}

                                        {tracking.message && (
                                          <p className="mt-1 text-xs leading-5 text-[#94a3b8]">
                                            {
                                              tracking.message
                                            }
                                          </p>
                                        )}
                                      </div>
                                    )
                                  )}
                              </div>
                            </SectionCard>
                          )}

                        {/* RETURN */}

                        <ReturnDetailsCard
                          returnRequest={
                            selectedReturn
                          }
                          loading={
                            returnsLoading
                          }
                        />
                      </div>

                      {/* ===================================== */}
                      {/* RIGHT SIDEBAR */}
                      {/* ===================================== */}

                      <div className="space-y-5">
                        {/* STATUS CONTROL */}

                        <SectionCard
                          title="Delivery status"
                          subtitle="Move this shipment to its next stage"
                        >
                          <div className="rounded-xl border border-[#edf0f3] bg-[#fafbfc] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                              Current status
                            </p>

                            <span
                              className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${getStatusStyle(
                                detailsShipment.status
                              )}`}
                            >
                              {formatStatus(
                                detailsShipment.status
                              )}
                            </span>
                          </div>

                          {nextStatus && (
                            <>
                              <div className="my-4 flex items-center gap-2 text-[#cbd5e1]">
                                <div className="h-px flex-1 bg-[#e6e9ee]" />

                                <ArrowRight
                                  size={
                                    14
                                  }
                                />

                                <div className="h-px flex-1 bg-[#e6e9ee]" />
                              </div>

                              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                                Next stage
                              </label>

                              <select
                                value={
                                  detailsShipment.status
                                }
                                onChange={(
                                  event
                                ) => {
                                  void updateShipmentStatus(
                                    event
                                      .target
                                      .value
                                  );
                                }}
                                disabled={
                                  updatingStatus ||
                                  isTerminalStatus(
                                    detailsShipment.status
                                  )
                                }
                                className="mt-2 h-11 w-full rounded-xl border border-[#dfe3e8] bg-white px-3 text-sm font-medium text-[#334155] outline-none transition focus:border-[#0b1729] disabled:cursor-not-allowed disabled:bg-[#f1f4f7]"
                              >
                                <option
                                  value={
                                    detailsShipment.status
                                  }
                                >
                                  {formatStatus(
                                    detailsShipment.status
                                  )}
                                </option>

                                <option
                                  value={
                                    nextStatus
                                  }
                                >
                                  Move to{" "}
                                  {formatStatus(
                                    nextStatus
                                  )}
                                </option>
                              </select>

                              <p className="mt-2 text-xs text-[#94a3b8]">
                                Next:{" "}
                                <span className="font-semibold text-[#475569]">
                                  {formatStatus(
                                    nextStatus
                                  )}
                                </span>
                              </p>

                              {/* ================================================= */}
                              {/* RIDER WARNING */}
                              {/* ================================================= */}

                              {nextStatus ===
                                "ASSIGNED_TO_RIDER" &&
                                !detailsShipment.riderId &&
                                !detailsShipment.rider && (
                                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                    <div className="flex items-start gap-2.5">
                                      <AlertCircle
                                        size={
                                          16
                                        }
                                        className="mt-0.5 shrink-0 text-amber-600"
                                      />

                                      <div>
                                        <p className="text-xs font-bold text-amber-800">
                                          Rider assignment required
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-amber-700">
                                          Assign a rider below before moving this shipment to Assigned To Rider.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </>
                          )}

                          {!nextStatus &&
                            detailsShipment.status ===
                              "DELIVERED" && (
                              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle2
                                    size={
                                      18
                                    }
                                    className="mt-0.5 text-[#1e8449]"
                                  />

                                  <div>
                                    <p className="text-sm font-bold text-[#166534]">
                                      Shipment delivered
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#4d7c5b]">
                                      This shipment has completed its normal delivery workflow.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          {statusMessage && (
                            <AlertMessage
                              type="success"
                              message={
                                statusMessage
                              }
                            />
                          )}

                          {statusError && (
                            <AlertMessage
                              type="error"
                              message={
                                statusError
                              }
                            />
                          )}
                        </SectionCard>

                        {/* ================================================= */}
                        {/* RIDER */}
                        {/* ================================================= */}

                        <SectionCard
                          title="Delivery rider"
                          subtitle="Assigned rider information"
                        >
                          {detailsShipment.rider ? (
                            <div className="rounded-xl border border-[#bbdec9] bg-[#f6fbf8] p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f6ee] text-[#1e8449]">
                                  <Truck
                                    size={
                                      18
                                    }
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-bold text-[#0b1729]">
                                      {detailsShipment
                                        .rider
                                        .user
                                        ?.name ||
                                        "Assigned Rider"}
                                    </p>

                                    <span className="rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[9px] font-bold uppercase text-[#1e8449]">
                                      Assigned
                                    </span>
                                  </div>

                                  <p className="mt-0.5 text-xs text-[#64748b]">
                                    {detailsShipment
                                      .rider
                                      .phone ||
                                      "Phone not available"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <SmallInfo
                                  label="Vehicle"
                                  value={
                                    detailsShipment
                                      .rider
                                      .vehicleNumber
                                  }
                                />

                                <SmallInfo
                                  label="Availability"
                                  value={
                                    detailsShipment
                                      .rider
                                      .isAvailable
                                      ? "Available"
                                      : "Busy"
                                  }
                                />
                              </div>

                              {detailsShipment
                                .rider
                                .latitude !=
                                null &&
                                detailsShipment
                                  .rider
                                  .longitude !=
                                  null && (
                                  <div className="mt-3 rounded-lg bg-white p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                                      Live location
                                    </p>

                                    <p className="mt-1 text-xs font-medium text-[#475569]">
                                      {
                                        detailsShipment
                                          .rider
                                          .latitude
                                      }
                                      ,{" "}
                                      {
                                        detailsShipment
                                          .rider
                                          .longitude
                                      }
                                    </p>
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-5 text-center">
                              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                <Truck
                                  size={
                                    22
                                  }
                                />
                              </div>

                              <p className="mt-3 text-sm font-semibold text-[#475569]">
                                No rider assigned
                              </p>

                              <p className="mx-auto mt-1 max-w-[240px] text-xs leading-5 text-[#94a3b8]">
                                Assign a rider before this shipment can move to Assigned To Rider.
                              </p>
                            </div>
                          )}

                          {/* ================================================= */}
                          {/* ASSIGN RIDER */}
                          {/* ================================================= */}

                          {canAssignRider && (
                            <div className="mt-4 border-t border-[#edf0f3] pt-4">
                              <div className="mb-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                                  Rider assignment
                                </p>

                                <p className="mt-1 text-xs text-[#64748b]">
                                  Select a rider to continue this shipment.
                                </p>
                              </div>

                              <label className="sr-only">
                                Assign rider
                              </label>

                              <select
                                value={
                                  selectedRiderId
                                }
                                onChange={(
                                  event
                                ) => {
                                  setSelectedRiderId(
                                    event
                                      .target
                                      .value
                                  );

                                  setAssignError(
                                    ""
                                  );
                                }}
                                disabled={
                                  ridersLoading ||
                                  assigningRider
                                }
                                className="h-11 w-full rounded-xl border border-[#dfe3e8] bg-white px-3 text-sm font-medium text-[#334155] outline-none transition focus:border-[#0b1729] disabled:cursor-not-allowed disabled:bg-[#f1f4f7]"
                              >
                                <option value="">
                                  {ridersLoading
                                    ? "Loading riders..."
                                    : "Select a rider"}
                                </option>

                                {availableRiders.map(
                                  (
                                    rider
                                  ) => (
                                    <option
                                      key={
                                        rider.id
                                      }
                                      value={
                                        rider.id
                                      }
                                    >
                                      {rider
                                        .user
                                        ?.name ||
                                        "Rider"}{" "}
                                      —{" "}
                                      {
                                        rider.phone
                                      }
                                      {rider.vehicleNumber
                                        ? ` (${rider.vehicleNumber})`
                                        : ""}
                                    </option>
                                  )
                                )}
                              </select>

                              <button
                                type="button"
                                onClick={
                                  assignRiderToShipment
                                }
                                disabled={
                                  !selectedRiderId ||
                                  ridersLoading ||
                                  assigningRider
                                }
                                className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#e23c2e] px-4 text-sm font-semibold text-white transition hover:bg-[#ce3122] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {assigningRider ? (
                                  <>
                                    <RefreshCw
                                      size={
                                        14
                                      }
                                      className="animate-spin"
                                    />

                                    Assigning...
                                  </>
                                ) : (
                                  <>
                                    <Truck
                                      size={
                                        14
                                      }
                                    />

                                    Assign Rider
                                  </>
                                )}
                              </button>

                              {assignMessage && (
                                <AlertMessage
                                  type="success"
                                  message={
                                    assignMessage
                                  }
                                />
                              )}

                              {assignError && (
                                <AlertMessage
                                  type="error"
                                  message={
                                    assignError
                                  }
                                />
                              )}

                              {!ridersLoading &&
                                availableRiders.length ===
                                  0 && (
                                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-xs font-semibold text-amber-800">
                                      No available riders
                                    </p>

                                    <p className="mt-1 text-[11px] leading-5 text-amber-700">
                                      There are currently no available riders to assign.
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}
                        </SectionCard>

                        {/* ================================================= */}
                        {/* QR */}
                        {/* ================================================= */}

                        <SectionCard
                          title="Customer tracking"
                          subtitle="Scan to open live shipment tracking"
                        >
                          <div className="flex justify-center rounded-xl border border-[#edf0f3] bg-[#fafbfc] p-5">
                            <div className="rounded-xl border border-[#e1e5ea] bg-white p-3">
                              <QRCode
                                value={`${APP_URL}/track/${detailsShipment.trackingNumber}`}
                                size={
                                  145
                                }
                              />
                            </div>
                          </div>

                          <p className="mt-3 text-center text-xs leading-5 text-[#94a3b8]">
                            Scan this QR code to view the latest shipment status.
                          </p>

                          <p className="mt-2 break-all text-center text-[11px] font-semibold text-[#64748b]">
                            {
                              detailsShipment.trackingNumber
                            }
                          </p>
                        </SectionCard>

                        {/* ================================================= */}
                        {/* PRINT */}
                        {/* ================================================= */}

                        <SectionCard
                          title="Print"
                          subtitle="Choose the document you need"
                        >
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() =>
                                printBill(
                                  detailsShipment
                                )
                              }
                              className="flex w-full items-center justify-between rounded-xl bg-[#e23c2e] px-4 py-3.5 text-left text-white transition hover:bg-[#ce3122]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                                  <Printer
                                    size={
                                      17
                                    }
                                  />
                                </div>

                                <div>
                                  <p className="text-sm font-bold">
                                    Print Bill
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-white/70">
                                    Full shipment receipt
                                  </p>
                                </div>
                              </div>

                              <ArrowRight
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                printCustomerDetails(
                                  detailsShipment
                                )
                              }
                              className="flex w-full items-center justify-between rounded-xl border border-[#dfe3e8] bg-white px-4 py-3.5 text-left transition hover:border-[#0b1729] hover:bg-[#fafbfc]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f4f7] text-[#0b1729]">
                                  <User
                                    size={
                                      17
                                    }
                                  />
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-[#0b1729]">
                                    Print Customer Details
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                                    Customer label + QR code
                                  </p>
                                </div>
                              </div>

                              <ArrowRight
                                size={
                                  16
                                }
                                className="text-[#94a3b8]"
                              />
                            </button>
                          </div>
                        </SectionCard>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* PRINT BILL */}
      {/* ==================================================== */}

      {printShipment &&
        printMode === "bill" && (
          <div
            id="print-bill"
            className="text-black"
          >
            <div className="border-b-2 border-black pb-3 text-center">
              <h1 className="text-[18px] font-black uppercase leading-tight">
                {
                  CARGO_COMPANY_NAME
                }
              </h1>

              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-gray-500">
                Shipment Receipt
              </p>
            </div>

            <div className="border-b py-3 text-center">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">
                Tracking Number
              </p>

              <p className="mt-1 text-[16px] font-black tracking-wide">
                {
                  printShipment.trackingNumber
                }
              </p>
            </div>

            <div className="border-b py-3">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                From / Sender
              </p>

              <p className="mt-1 text-[12px] font-bold">
                {printShipment
                  .vendor
                  ?.companyName ||
                  "Vendor"}
              </p>

              {printShipment.vendor
                ?.location && (
                <p className="mt-1 text-[9px] text-gray-500">
                  {
                    printShipment
                      .vendor
                      .location
                  }
                </p>
              )}

              <div className="my-2 text-center text-[11px] font-bold">
                ↓
              </div>

              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                To / Receiver
              </p>

              <p className="mt-1 text-[12px] font-bold">
                {
                  printShipment.receiverName
                }
              </p>

              <p className="mt-1 text-[10px]">
                {
                  printShipment.receiverPhone
                }
              </p>
            </div>

            <div className="border-b py-3">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                Delivery Address
              </p>

              <p className="mt-1 break-words text-[10px] leading-4">
                {
                  printShipment.receiverAddress
                }
              </p>
            </div>

            <div className="border-b py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[8px] font-semibold uppercase text-gray-500">
                    Destination
                  </p>

                  <p className="mt-1 text-[11px] font-bold">
                    {printShipment
                      .locationRate
                      ?.location
                      ?.name ||
                      "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[8px] font-semibold uppercase text-gray-500">
                    Delivery Type
                  </p>

                  <p className="mt-1 text-[10px] font-semibold">
                    {printShipment
                      .locationRate
                      ?.deliveryType
                      ?.name ||
                      "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b py-3">
              <div className="grid grid-cols-2 gap-y-3">
                <div>
                  <p className="text-[8px] font-semibold uppercase text-gray-500">
                    Package
                  </p>

                  <p className="mt-1 text-[10px] font-semibold">
                    {
                      printShipment.packageType
                    }
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[8px] font-semibold uppercase text-gray-500">
                    Weight
                  </p>

                  <p className="mt-1 text-[10px] font-semibold">
                    {
                      printShipment.weight
                    }{" "}
                    kg
                  </p>
                </div>

                <div>
                  <p className="text-[8px] font-semibold uppercase text-gray-500">
                    Payment
                  </p>

                  <p className="mt-1 text-[10px] font-semibold">
                    {
                      printShipment.paymentType
                    }
                  </p>
                </div>

                {printShipment.paymentType ===
                  "COD" && (
                  <div className="text-right">
                    <p className="text-[8px] font-semibold uppercase text-gray-500">
                      COD Amount
                    </p>

                    <p className="mt-1 text-[11px] font-bold">
                      {formatCurrency(
                        printShipment.codAmount
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b py-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">
                  Shipping Charge
                </span>

                <span className="text-[14px] font-black">
                  {formatCurrency(
                    printShipment.shippingCharge
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase tracking-wider">
                  Track Shipment
                </p>

                <p className="mt-1 text-[8px] leading-3 text-gray-500">
                  Scan the QR code to see the latest shipment status.
                </p>

                <p className="mt-2 break-all text-[8px] font-bold">
                  {
                    printShipment.trackingNumber
                  }
                </p>
              </div>

              <div className="shrink-0 border border-black p-1">
                <QRCode
                  value={`${APP_URL}/track/${printShipment.trackingNumber}`}
                  size={
                    82
                  }
                />
              </div>
            </div>

            <div className="border-t pt-3 text-center">
              <p className="text-[9px] font-semibold">
                Thank you for choosing{" "}
                {
                  CARGO_COMPANY_NAME
                }
                .
              </p>

              <p className="mt-1 text-[7px] text-gray-500">
                Please keep this receipt for your reference.
              </p>

              <p className="mt-2 text-[7px] text-gray-400">
                {formatDate(
                  printShipment.createdAt
                )}
              </p>
            </div>
          </div>
        )}

      {/* ==================================================== */}
      {/* PRINT CUSTOMER */}
      {/* ==================================================== */}

      {printShipment &&
        printMode ===
          "customer" && (
          <div
            id="print-customer"
            className="text-black"
          >
            <div className="border-b-2 border-black pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-[17px] font-black uppercase">
                    {
                      CARGO_COMPANY_NAME
                    }
                  </h1>

                  <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Customer Delivery Label
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[8px] font-semibold uppercase text-gray-500">
                    Tracking
                  </p>

                  <p className="mt-1 text-[12px] font-black">
                    {
                      printShipment.trackingNumber
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* CUSTOMER */}

            <div className="border-b py-4">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                Deliver To
              </p>

              <p className="mt-2 text-[17px] font-black leading-tight">
                {
                  printShipment.receiverName
                }
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Phone
                  size={
                    12
                  }
                />

                <p className="text-[11px] font-semibold">
                  {
                    printShipment.receiverPhone
                  }
                </p>
              </div>

              <div className="mt-3">
                <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                  Address
                </p>

                <p className="mt-1 text-[12px] font-semibold leading-5">
                  {
                    printShipment.receiverAddress
                  }
                </p>
              </div>
            </div>

            {/* DESTINATION */}

            <div className="border-b py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                    Destination
                  </p>

                  <p className="mt-1 text-[12px] font-bold">
                    {printShipment
                      .locationRate
                      ?.location
                      ?.name ||
                      "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                    Delivery
                  </p>

                  <p className="mt-1 text-[10px] font-semibold">
                    {printShipment
                      .locationRate
                      ?.deliveryType
                      ?.name ||
                      "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* PACKAGE */}

            <div className="border-b py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                    Package
                  </p>

                  <p className="mt-1 text-[11px] font-bold">
                    {
                      printShipment.packageType
                    }
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                    Weight
                  </p>

                  <p className="mt-1 text-[11px] font-bold">
                    {
                      printShipment.weight
                    }{" "}
                    kg
                  </p>
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                    Payment
                  </p>

                  <p className="mt-1 text-[11px] font-bold">
                    {
                      printShipment.paymentType
                    }
                  </p>
                </div>

                {printShipment.paymentType ===
                  "COD" && (
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500">
                      COD
                    </p>

                    <p className="mt-1 text-[12px] font-black">
                      {formatCurrency(
                        printShipment.codAmount
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* QR */}

            <div className="flex items-center justify-between gap-5 py-5">
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-wider">
                  Scan to track
                </p>

                <p className="mt-2 text-[8px] leading-4 text-gray-500">
                  Scan this QR code to view the current delivery status of this shipment.
                </p>

                <p className="mt-3 break-all text-[9px] font-black">
                  {
                    printShipment.trackingNumber
                  }
                </p>
              </div>

              <div className="shrink-0 border-2 border-black p-2">
                <QRCode
                  value={`${APP_URL}/track/${printShipment.trackingNumber}`}
                  size={
                    115
                  }
                />
              </div>
            </div>

            <div className="border-t-2 border-black pt-3 text-center">
              <p className="text-[8px] font-semibold uppercase tracking-wider">
                Rocket Shipping Cargo
              </p>

              <p className="mt-1 text-[7px] text-gray-500">
                Handle with care • Thank you
              </p>
            </div>
          </div>
        )}
    </>
  );
}

// ============================================================
// SECTION CARD
// ============================================================

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e5e9ee] bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-[15px] font-bold text-[#0b1729]">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-1 text-xs text-[#94a3b8]">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  icon,
  label,
  value,
  wide = false,
  emphasized = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
  wide?: boolean;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[#edf0f3] bg-[#fafbfc] p-4 ${
        wide
          ? "sm:col-span-2"
          : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-[#64748b]">
            {icon}
          </span>
        )}

        <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#94a3b8]">
          {label}
        </p>
      </div>

      <p
        className={`mt-2 break-words text-sm ${
          emphasized
            ? "font-bold text-[#0b1729]"
            : "font-medium text-[#334155]"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  icon,
  label,
  value,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  secondary?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e5e9ee] bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f4f7] text-[#0b1729]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#94a3b8]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-bold text-[#0b1729]">
          {value || "—"}
        </p>

        {secondary && (
          <p className="mt-0.5 truncate text-xs text-[#94a3b8]">
            {secondary}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SMALL INFO
// ============================================================

function SmallInfo({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border border-[#edf0f3] bg-white p-3">
      <p className="text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-[#475569]">
        {value || "—"}
      </p>
    </div>
  );
}

// ============================================================
// MOBILE ROW
// ============================================================

function MobileRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-[#475569]">
        {value || "—"}
      </span>
    </div>
  );
}

// ============================================================
// ALERT
// ============================================================

function AlertMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      className={`mt-3 rounded-xl border p-3 ${
        success
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {success ? (
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-green-600"
          />
        ) : (
          <AlertCircle
            size={15}
            className="mt-0.5 shrink-0 text-red-600"
          />
        )}

        <p
          className={`text-xs font-medium ${
            success
              ? "text-green-700"
              : "text-red-700"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// RETURN DETAILS
// ============================================================

function ReturnDetailsCard({
  returnRequest,
  loading,
}: {
  returnRequest:
    | ReturnRequest
    | null;

  loading: boolean;
}) {
  if (loading) {
    return (
      <SectionCard
        title="Return request"
        subtitle="Loading return information"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 animate-pulse rounded-xl bg-[#f1f4f7]" />

          <div className="h-16 animate-pulse rounded-xl bg-[#f1f4f7]" />
        </div>
      </SectionCard>
    );
  }

  if (!returnRequest) {
    return (
      <SectionCard
        title="Return request"
        subtitle="Customer return information"
      >
        <div className="py-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f4f7] text-[#94a3b8]">
            <RefreshCw
              size={18}
            />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#475569]">
            No return request
          </p>

          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#94a3b8]">
            This shipment does not currently have a return request.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Return request"
      subtitle="Customer return information"
    >
      {/* RETURN HEADER */}

      <div className="rounded-xl border border-[#f0d6d2] bg-[#fff8f7] p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
              Return status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getReturnStatusStyle(
                returnRequest.status
              )}`}
            >
              {formatStatus(
                returnRequest.status
              )}
            </span>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
              Requested
            </p>

            <p className="mt-1 text-sm font-semibold text-[#334155]">
              {formatDate(
                returnRequest.requestedAt ||
                  returnRequest.createdAt
              )}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILS */}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label="Reason"
          value={formatReason(
            returnRequest.reason
          )}
        />

        <InfoCard
          label="Delivery option"
          value={
            returnRequest.deliveryOption
              ? formatStatus(
                  returnRequest.deliveryOption
                )
              : "Not selected"
          }
        />

        <InfoCard
          label="Pickup rider"
          value={
            returnRequest.rider
              ?.user?.name ||
            "Not assigned"
          }
        />

        <InfoCard
          label="Return delivery rider"
          value={
            returnRequest
              .returnDeliveryRider
              ?.user?.name ||
            "Not assigned"
          }
        />

        <InfoCard
          label="Return charge"
          value={formatCurrency(
            returnRequest.returnCharge
          )}
        />

        <InfoCard
          label="Picked up"
          value={formatDate(
            returnRequest.pickedUpAt
          )}
        />

        <InfoCard
          label="Completed"
          value={formatDate(
            returnRequest.completedAt
          )}
        />

        <InfoCard
          label="Return ID"
          value={
            returnRequest.id
          }
        />
      </div>

      {/* DESCRIPTION */}

      {returnRequest.description && (
        <div className="mt-3 rounded-xl border border-[#edf0f3] bg-[#fafbfc] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
            Customer description
          </p>

          <p className="mt-2 text-sm leading-6 text-[#475569]">
            {
              returnRequest.description
            }
          </p>
        </div>
      )}

      {/* RETURN RIDERS */}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {returnRequest.rider && (
          <div className="rounded-xl border border-[#edf0f3] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f4f7] text-[#0b1729]">
                <Truck
                  size={16}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                  Pickup rider
                </p>

                <p className="mt-1 text-sm font-bold text-[#334155]">
                  {returnRequest
                    .rider
                    .user
                    ?.name ||
                    "Rider"}
                </p>

                <p className="mt-0.5 text-xs text-[#94a3b8]">
                  {
                    returnRequest
                      .rider
                      .phone
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {returnRequest.returnDeliveryRider && (
          <div className="rounded-xl border border-[#edf0f3] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf8f2] text-[#1e8449]">
                <Truck
                  size={16}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                  Return delivery rider
                </p>

                <p className="mt-1 text-sm font-bold text-[#334155]">
                  {returnRequest
                    .returnDeliveryRider
                    .user
                    ?.name ||
                    "Rider"}
                </p>

                <p className="mt-0.5 text-xs text-[#94a3b8]">
                  {
                    returnRequest
                      .returnDeliveryRider
                      .phone
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-[#dfe3e8] bg-white px-3 text-sm font-medium text-[#334155] outline-none transition focus:border-[#0b1729] focus:ring-2 focus:ring-[#0b1729]/5"
    >
      <option value="ALL">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// ============================================================
// SHIPMENT TABLE SKELETON
// ============================================================

function ShipmentTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4e8ed] bg-white">
      {/* DESKTOP */}

      <div className="hidden lg:block">
        <div className="border-b border-[#edf0f3] bg-[#fafbfc] px-5 py-4">
          <div className="grid grid-cols-8 gap-5">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={
                    index
                  }
                  className="h-3 animate-pulse rounded bg-[#e5e9ee]"
                />
              )
            )}
          </div>
        </div>

        <div>
          {Array.from({
            length: 7,
          }).map(
            (_, row) => (
              <div
                key={
                  row
                }
                className="grid grid-cols-8 gap-5 border-b border-[#edf0f3] px-5 py-5 last:border-0"
              >
                {Array.from({
                  length: 8,
                }).map(
                  (
                    _,
                    column
                  ) => (
                    <div
                      key={
                        column
                      }
                      className={`h-4 animate-pulse rounded bg-[#f0f2f4] ${
                        column ===
                        0
                          ? "w-32"
                          : "w-24"
                      }`}
                    />
                  )
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* MOBILE */}

      <div className="space-y-3 p-4 lg:hidden">
        {Array.from({
          length: 5,
        }).map(
          (_, index) => (
            <div
              key={
                index
              }
              className="rounded-xl border border-[#edf0f3] p-4"
            >
              <div className="flex justify-between gap-4">
                <div className="h-4 w-32 animate-pulse rounded bg-[#edf0f3]" />

                <div className="h-6 w-20 animate-pulse rounded-full bg-[#edf0f3]" />
              </div>

              <div className="mt-4 space-y-3">
                <div className="h-3 w-full animate-pulse rounded bg-[#f0f2f4]" />

                <div className="h-3 w-4/5 animate-pulse rounded bg-[#f0f2f4]" />

                <div className="h-3 w-3/5 animate-pulse rounded bg-[#f0f2f4]" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-10 animate-pulse rounded-lg bg-[#f0f2f4]" />

                <div className="h-10 animate-pulse rounded-lg bg-[#f0f2f4]" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ============================================================
// SHIPMENT DETAILS SKELETON
// ============================================================

function ShipmentDetailsSkeleton() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      {/* TOP */}

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({
          length: 3,
        }).map(
          (_, index) => (
            <div
              key={
                index
              }
              className="rounded-2xl border border-[#e5e9ee] bg-white p-4"
            >
              <div className="flex gap-3">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-[#edf0f3]" />

                <div className="flex-1">
                  <div className="h-2.5 w-16 animate-pulse rounded bg-[#edf0f3]" />

                  <div className="mt-2 h-4 w-28 animate-pulse rounded bg-[#e7ebef]" />

                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-[#edf0f3]" />
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={
                  index
                }
                className="rounded-2xl border border-[#e5e9ee] bg-white p-5 sm:p-6"
              >
                <div className="h-4 w-40 animate-pulse rounded bg-[#e7ebef]" />

                <div className="mt-2 h-3 w-52 animate-pulse rounded bg-[#edf0f3]" />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {Array.from({
                    length: 4,
                  }).map(
                    (
                      _,
                      cell
                    ) => (
                      <div
                        key={
                          cell
                        }
                        className="h-20 animate-pulse rounded-xl bg-[#f3f5f7]"
                      />
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>

        <div className="space-y-5">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={
                  index
                }
                className="rounded-2xl border border-[#e5e9ee] bg-white p-5"
              >
                <div className="h-4 w-32 animate-pulse rounded bg-[#e7ebef]" />

                <div className="mt-5 h-24 animate-pulse rounded-xl bg-[#f3f5f7]" />

                <div className="mt-3 h-11 animate-pulse rounded-xl bg-[#edf0f3]" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

