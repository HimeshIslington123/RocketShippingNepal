
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";

import {
  Camera,
  CameraOff,
  CheckCircle2,
  ChevronDown,
  Clock,
  Keyboard,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Truck,
  User,
  UserCheck,
  XCircle,
  Warehouse,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/* =========================================================
   TYPES
========================================================= */

type Tracking = {
  id?: number;
  status?: string;
  location?: string | null;
  notes?: string | null;
  message?: string | null;
  createdAt?: string;
};

type Vendor = {
  id?: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type RiderUser = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
};

type Rider = {
  id: number;

  phone?: string | null;

  vehicleType?: string | null;

  vehicleNumber?: string | null;

  isAvailable?: boolean;

  latitude?: number | null;

  longitude?: number | null;

  name?: string | null;

  user?: RiderUser | null;
};

type CodCollection = {
  id?: number;
  amount?: number;
  status?: string;
  collectedAt?: string;
};

type Shipment = {
  id: string;

  trackingNumber: string;

  status: string;

  senderName?: string | null;

  senderPhone?: string | null;

  senderAddress?: string | null;

  receiverName?: string | null;

  receiverPhone?: string | null;

  receiverAddress?: string | null;

  packageType?: string | null;

  weight?: number | null;

  paymentType?: string | null;

  codAmount?: number | null;

  shippingCharge?: number | null;

  notes?: string | null;

  vendor?: Vendor | null;

  rider?: Rider | null;

  riderId?: number | null;

  trackings?: Tracking[];

  codCollection?: CodCollection | null;
};

type ScanResult = {
  success: boolean;

  message?: string;

  shipment?: Shipment;

  currentUser?: {
    id?: number;
    name?: string;
    role?: string;
  };

  actions?: string[];
};

/* =========================================================
   ACTIONS
========================================================= */

const ACTION_LABELS: Record<string, string> = {
  RECEIVE: "Receive Shipment",
  PICKUP: "Pickup Shipment",
  ASSIGN_RIDER: "Assign Rider",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVER: "Deliver Shipment",
  REQUEST_RETURN: "Request Return",
  RETURN_PICKUP: "Pickup Return",
  RETURN_TO_WAREHOUSE: "Return to Warehouse",
  OUT_FOR_RETURN: "Out for Return",
  RETURNED_TO_VENDOR: "Returned to Vendor",
};

const ACTION_DESCRIPTIONS: Record<string, string> = {
  RECEIVE:
    "Receive this shipment into the warehouse.",

  PICKUP:
    "Mark this shipment as picked up.",

  ASSIGN_RIDER:
    "Assign this shipment to a rider.",

  OUT_FOR_DELIVERY:
    "Mark this shipment as out for delivery.",

  DELIVER:
    "Mark this shipment as delivered.",

  REQUEST_RETURN:
    "Request a return for this shipment.",

  RETURN_PICKUP:
    "Pick up the return from the customer.",

  RETURN_TO_WAREHOUSE:
    "Bring the return back to the warehouse.",

  OUT_FOR_RETURN:
    "Send the return shipment to the vendor.",

  RETURNED_TO_VENDOR:
    "Complete the return to the vendor.",
};

const ACTION_ICONS: Record<
  string,
  React.ComponentType<{
    size?: number;
    className?: string;
  }>
> = {
  RECEIVE: Warehouse,
  PICKUP: Package,
  ASSIGN_RIDER: UserCheck,
  OUT_FOR_DELIVERY: Truck,
  DELIVER: CheckCircle2,
  REQUEST_RETURN: RotateCcw,
  RETURN_PICKUP: RotateCcw,
  RETURN_TO_WAREHOUSE: Warehouse,
  OUT_FOR_RETURN: Truck,
  RETURNED_TO_VENDOR: CheckCircle2,
};

/* =========================================================
   HELPERS
========================================================= */

function formatStatus(status?: string | null) {
  if (!status) return "-";

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function statusClass(status?: string | null) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700";

    case "OUT_FOR_DELIVERY":
      return "bg-blue-100 text-blue-700";

    case "ASSIGNED_TO_RIDER":
      return "bg-purple-100 text-purple-700";

    case "IN_WAREHOUSE":
      return "bg-yellow-100 text-yellow-700";

    case "RETURNED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function money(value?: number | null) {
  if (value === null || value === undefined) {
    return "NPR 0";
  }

  return `NPR ${Number(value).toLocaleString(
    "en-NP"
  )}`;
}

function formatDate(date?: string | null) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleString(
      "en-NP",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  } catch {
    return date;
  }
}

/* =========================================================
   EXTRACT TRACKING NUMBER
========================================================= */

function extractTrackingNumber(value: string) {
  const raw = value.trim();

  if (!raw) {
    return "";
  }

  /*
   * Direct tracking number
   *
   * RC-1789981579523-622
   */
  const directMatch = raw.match(
    /(?:^|\/)(RC-[A-Za-z0-9-]+)(?:[/?#]|$)/i
  );

  if (directMatch?.[1]) {
    return directMatch[1];
  }

  /*
   * URL
   *
   * https://example.com/track/RC-123
   */
  try {
    const url = new URL(raw);

    const trackingParam =
      url.searchParams.get("trackingNumber") ||
      url.searchParams.get("tracking");

    if (trackingParam) {
      return trackingParam.trim();
    }

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    const trackIndex = parts.findIndex(
      (part) =>
        part.toLowerCase() === "track"
    );

    if (
      trackIndex !== -1 &&
      parts[trackIndex + 1]
    ) {
      return decodeURIComponent(
        parts[trackIndex + 1]
      ).trim();
    }

    const lastPart =
      parts[parts.length - 1];

    if (lastPart) {
      return decodeURIComponent(
        lastPart
      ).trim();
    }
  } catch {
    // Not a URL.
  }

  /*
   * Query string directly
   */
  const queryMatch = raw.match(
    /trackingNumber=([^&]+)/i
  );

  if (queryMatch?.[1]) {
    return decodeURIComponent(
      queryMatch[1]
    ).trim();
  }

  /*
   * Fallback
   */
  return raw;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ShipmentScannerPage() {
  /* =======================================================
     CAMERA
  ======================================================= */

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const readerRef =
    useRef<BrowserMultiFormatReader | null>(
      null
    );

  const controlsRef =
    useRef<IScannerControls | null>(null);

  const scanLockRef =
    useRef(false);

  const lastScanRef =
    useRef<string>("");

  /* =======================================================
     USB / KEYBOARD SCANNER
  ======================================================= */

  /*
   * Most USB barcode/QR scanners behave like keyboards.
   *
   * Example:
   *
   * Scanner:
   * RC-1789981579523-622 + ENTER
   *
   * Browser receives:
   * R
   * C
   * -
   * 1
   * 7
   * ...
   * ENTER
   *
   * We collect those characters here.
   */

  const usbBufferRef =
    useRef<string>("");

  const usbLastKeyTimeRef =
    useRef<number>(0);

  const usbTimeoutRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const usbScanningRef =
    useRef(false);

  /* =======================================================
     SHIPMENT STATE
  ======================================================= */

  const [scannerOpen, setScannerOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [shipment, setShipment] =
    useState<Shipment | null>(null);

  const [actions, setActions] =
    useState<string[]>([]);

  const [selectedAction, setSelectedAction] =
    useState("");

  /* =======================================================
     USB STATUS
  ======================================================= */

  const [usbScannerActive, setUsbScannerActive] =
    useState(false);

  /* =======================================================
     RIDER STATE
  ======================================================= */

  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [ridersLoading, setRidersLoading] =
    useState(false);

  const [selectedRiderId, setSelectedRiderId] =
    useState<number | "">("");

  /* =======================================================
     OTHER FORM STATE
  ======================================================= */

  const [location, setLocation] =
    useState("");

  const [notes, setNotes] =
    useState("");

  /* =======================================================
     AUTH TOKEN
  ======================================================= */

  const getAuthToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken")
    );
  }, []);

  /* =======================================================
     STOP CAMERA SCANNER
  ======================================================= */

  const stopScanner = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {
      // Ignore cleanup errors.
    }

    controlsRef.current = null;

    readerRef.current = null;

    if (videoRef.current) {
      const stream =
        videoRef.current.srcObject as
          | MediaStream
          | null;

      if (stream) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        videoRef.current.srcObject = null;
      }
    }

    setScannerOpen(false);
  }, []);

  /* =======================================================
     GET ALL RIDERS
  ======================================================= */

  const fetchRiders = useCallback(
    async () => {
      const token = getAuthToken();

      if (!token) {
        setError(
          "Authentication required. Please login again."
        );

        return;
      }

      setRidersLoading(true);

      try {
        const response = await fetch(
          `${API_BASE}/api/rider`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },

            credentials: "include",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load riders."
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Failed to load riders."
          );
        }

        const riderList: Rider[] =
          Array.isArray(data.riders)
            ? data.riders
            : [];

        setRiders(riderList);
      } catch (err) {
        console.error(
          "FETCH RIDERS ERROR:",
          err
        );

        setRiders([]);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load riders."
        );
      } finally {
        setRidersLoading(false);
      }
    },
    [getAuthToken]
  );

  /* =======================================================
     FETCH RIDERS ON PAGE LOAD
  ======================================================= */

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  /* =======================================================
     FIND SHIPMENT
  ======================================================= */

  const findShipment = useCallback(
    async (value: string) => {
      const trackingNumber =
        extractTrackingNumber(value);

      if (!trackingNumber) {
        setError(
          "No tracking number found."
        );

        return;
      }

      const token = getAuthToken();

      if (!token) {
        setError(
          "Authentication required. Please login again."
        );

        return;
      }

      /*
       * Prevent duplicate requests while
       * another scan is being processed.
       */
      if (loading) {
        return;
      }

      setLoading(true);

      setError("");

      setSuccess("");

      try {
        const response = await fetch(
          `${API_BASE}/api/shipment/scan`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            credentials: "include",

            body: JSON.stringify({
              trackingNumber,
            }),
          }
        );

        const result: ScanResult =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Shipment not found."
          );
        }

        if (!result.success) {
          throw new Error(
            result?.message ||
              "Unable to find shipment."
          );
        }

        if (!result.shipment) {
          throw new Error(
            "Shipment information was not returned."
          );
        }

        setShipment(result.shipment);

        setActions(
          Array.isArray(result.actions)
            ? result.actions
            : []
        );

        setSelectedAction(
          Array.isArray(result.actions) &&
            result.actions.length > 0
            ? result.actions[0]
            : ""
        );

        if (result.shipment.rider?.id) {
          setSelectedRiderId(
            result.shipment.rider.id
          );
        } else {
          setSelectedRiderId("");
        }

        setError("");

        /*
         * Refresh rider list.
         */
        fetchRiders();
      } catch (err) {
        console.error(
          "FIND SHIPMENT ERROR:",
          err
        );

        setShipment(null);

        setActions([]);

        setSelectedAction("");

        setSelectedRiderId("");

        setError(
          err instanceof Error
            ? err.message
            : "Unable to find shipment."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      fetchRiders,
      getAuthToken,
      loading,
    ]
  );

  /* =======================================================
     BARCODE HANDLER
  ======================================================= */

  const handleBarcode = useCallback(
    async (value: string) => {
      const trackingNumber =
        extractTrackingNumber(value);

      if (!trackingNumber) {
        return;
      }

      /*
       * Prevent duplicate scanner reads.
       */
      if (scanLockRef.current) {
        return;
      }

      if (
        lastScanRef.current ===
        trackingNumber
      ) {
        return;
      }

      scanLockRef.current = true;

      lastScanRef.current =
        trackingNumber;

      try {
        await findShipment(
          trackingNumber
        );

        stopScanner();
      } finally {
        setTimeout(() => {
          scanLockRef.current = false;
        }, 1200);
      }
    },
    [findShipment, stopScanner]
  );

  /* =======================================================
     USB SCANNER PROCESS
  ======================================================= */

  const processUSBScan = useCallback(
    async () => {
      const value =
        usbBufferRef.current.trim();

      usbBufferRef.current = "";

      usbLastKeyTimeRef.current = 0;

      usbScanningRef.current = false;

      setUsbScannerActive(false);

      if (!value) {
        return;
      }

      const trackingNumber =
        extractTrackingNumber(value);

      /*
       * Basic protection against ordinary
       * keyboard input being treated as scan.
       */
      if (
        trackingNumber.length < 3
      ) {
        return;
      }

      await handleBarcode(
        trackingNumber
      );
    },
    [handleBarcode]
  );

  /* =======================================================
     USB SCANNER KEYBOARD LISTENER
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      /*
       * Do not interfere with normal typing
       * inside inputs, textarea or select.
       *
       * This is important because this page
       * contains Notes and Location fields.
       */
      const target =
        event.target as HTMLElement | null;

      const tagName =
        target?.tagName?.toLowerCase();

      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable
      ) {
        return;
      }

      /*
       * Ignore modifier combinations.
       */
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      const now = Date.now();

      /*
       * Most USB scanners send characters
       * extremely quickly.
       *
       * If there is a large delay between
       * keys, assume this is normal typing
       * and start a new buffer.
       */
      if (
        usbLastKeyTimeRef.current &&
        now -
          usbLastKeyTimeRef.current >
          100
      ) {
        usbBufferRef.current = "";
      }

      usbLastKeyTimeRef.current = now;

      /*
       * Scanner normally sends ENTER at the end.
       */
      if (
        event.key === "Enter" ||
        event.key === "Tab"
      ) {
        if (
          usbBufferRef.current
            .trim()
            .length > 0
        ) {
          event.preventDefault();

          processUSBScan();
        }

        return;
      }

      /*
       * Only collect printable characters.
       */
      if (
        event.key.length === 1
      ) {
        usbBufferRef.current +=
          event.key;

        usbScanningRef.current =
          true;

        setUsbScannerActive(true);

        /*
         * Some scanners don't send ENTER.
         *
         * Process automatically after a
         * short quiet period.
         */
        if (usbTimeoutRef.current) {
          clearTimeout(
            usbTimeoutRef.current
          );
        }

        usbTimeoutRef.current =
          setTimeout(() => {
            if (
              usbBufferRef.current
                .trim()
                .length > 0
            ) {
              processUSBScan();
            }
          }, 100);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      if (usbTimeoutRef.current) {
        clearTimeout(
          usbTimeoutRef.current
        );
      }
    };
  }, [processUSBScan]);

  /* =======================================================
     OPEN CAMERA SCANNER
  ======================================================= */

  const openScanner = useCallback(
    async () => {
      setError("");

      setSuccess("");

      try {
        if (
          !navigator.mediaDevices
        ) {
          throw new Error(
            "Camera is not supported by this browser."
          );
        }

        const devices =
          await navigator.mediaDevices.enumerateDevices();

        const videoDevices =
          devices.filter(
            (device) =>
              device.kind ===
              "videoinput"
          );

        if (
          videoDevices.length === 0
        ) {
          throw new Error(
            "No camera was found."
          );
        }

        /*
         * Prefer rear camera.
         */
        const preferredCamera =
          videoDevices.find(
            (device) =>
              /back|rear|environment/i.test(
                device.label
              )
          ) || videoDevices[0];

        const reader =
          new BrowserMultiFormatReader();

        readerRef.current = reader;

        setScannerOpen(true);

        /*
         * Give React time to render
         * video element.
         */
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 150)
        );

        if (!videoRef.current) {
          throw new Error(
            "Camera video element is not ready."
          );
        }

        const controls =
          await reader.decodeFromVideoDevice(
            preferredCamera.deviceId,
            videoRef.current,
            (result) => {
              if (result) {
                const text =
                  result.getText();

                if (text) {
                  handleBarcode(text);
                }
              }
            }
          );

        controlsRef.current =
          controls;
      } catch (err) {
        console.error(
          "CAMERA ERROR:",
          err
        );

        setScannerOpen(false);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to open camera."
        );
      }
    },
    [handleBarcode]
  );

  /* =======================================================
     CAMERA CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  /* =======================================================
     ASSIGN RIDER
  ======================================================= */

  const isAssignAction =
    selectedAction ===
    "ASSIGN_RIDER";

  const canAssignRider =
    selectedRiderId !== "" &&
    !ridersLoading &&
    riders.length > 0;

  const assignRider =
    useCallback(async () => {
      if (!shipment) {
        setError(
          "Please scan a shipment first."
        );

        return;
      }

      if (
        selectedRiderId === ""
      ) {
        setError(
          "Please select a rider before assigning the shipment."
        );

        return;
      }

      const riderId =
        Number(selectedRiderId);

      if (
        !Number.isInteger(riderId)
      ) {
        setError(
          "Invalid rider selected."
        );

        return;
      }

      const token =
        getAuthToken();

      if (!token) {
        setError(
          "Authentication required. Please login again."
        );

        return;
      }

      setActionLoading(true);

      setError("");

      setSuccess("");

      try {
        /*
         * IMPORTANT:
         *
         * Rider assignment uses:
         *
         * PATCH /api/shipment/:id/assign-rider
         *
         * NOT:
         *
         * POST /api/shipment/scan/action
         */
        const response =
          await fetch(
            `${API_BASE}/api/shipment/${shipment.id}/assign-rider`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              credentials: "include",

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
              "Failed to assign rider."
          );
        }

        if (
          data?.success === false
        ) {
          throw new Error(
            data?.message ||
              "Failed to assign rider."
          );
        }

        setSuccess(
          data?.message ||
            "Rider assigned successfully."
        );

        setNotes("");

        /*
         * Reload shipment data.
         */
        await findShipment(
          shipment.trackingNumber
        );
      } catch (err) {
        console.error(
          "ASSIGN RIDER ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to assign rider."
        );
      } finally {
        setActionLoading(false);
      }
    }, [
      findShipment,
      getAuthToken,
      selectedRiderId,
      shipment,
    ]);

  /* =======================================================
     NORMAL ACTION
  ======================================================= */

  const processAction =
    useCallback(async () => {
      if (!shipment) {
        setError(
          "Please scan a shipment first."
        );

        return;
      }

      if (!selectedAction) {
        setError(
          "Please select an action."
        );

        return;
      }

      /*
       * ASSIGN_RIDER has a dedicated API.
       */
      if (
        selectedAction ===
        "ASSIGN_RIDER"
      ) {
        await assignRider();

        return;
      }

      const token =
        getAuthToken();

      if (!token) {
        setError(
          "Authentication required. Please login again."
        );

        return;
      }

      setActionLoading(true);

      setError("");

      setSuccess("");

      try {
        const response =
          await fetch(
            `${API_BASE}/api/shipment/scan/action`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              credentials: "include",

              body: JSON.stringify({
                trackingNumber:
                  shipment.trackingNumber,

                action:
                  selectedAction,

                location:
                  location.trim(),

                notes:
                  notes.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Action failed."
          );
        }

        if (
          data?.success === false
        ) {
          throw new Error(
            data?.message ||
              "Action failed."
          );
        }

        setSuccess(
          data?.message ||
            "Action completed successfully."
        );

        setNotes("");

        /*
         * Refresh shipment.
         */
        await findShipment(
          shipment.trackingNumber
        );
      } catch (err) {
        console.error(
          "PROCESS ACTION ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Action failed."
        );
      } finally {
        setActionLoading(false);
      }
    }, [
      assignRider,
      findShipment,
      getAuthToken,
      location,
      notes,
      selectedAction,
      shipment,
    ]);

  /* =======================================================
     RESET
  ======================================================= */

  const resetPage =
    useCallback(() => {
      stopScanner();

      setShipment(null);

      setActions([]);

      setSelectedAction("");

      setSelectedRiderId("");

      setError("");

      setSuccess("");

      setNotes("");

      setLocation("");

      setLoading(false);

      setActionLoading(false);

      lastScanRef.current = "";

      scanLockRef.current = false;

      usbBufferRef.current = "";

      usbLastKeyTimeRef.current = 0;

      usbScanningRef.current = false;

      setUsbScannerActive(false);

      if (usbTimeoutRef.current) {
        clearTimeout(
          usbTimeoutRef.current
        );

        usbTimeoutRef.current =
          null;
      }
    }, [stopScanner]);

  /* =======================================================
     RIDER NAME
  ======================================================= */

  const getRiderName = (
    rider: Rider
  ) => {
    return (
      rider.user?.name ||
      rider.name ||
      `Rider #${rider.id}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Shipment Scanner
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Scan a shipment QR code using
              your camera or USB scanner.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchRiders}
              disabled={ridersLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  ridersLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Riders
            </button>

            <button
              type="button"
              onClick={resetPage}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw size={16} />

              Reset
            </button>
          </div>
        </div>

        {/* =================================================
            SCANNER METHODS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* USB SCANNER */}

          <div
            className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
              usbScannerActive
                ? "border-green-400 ring-2 ring-green-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <Keyboard size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900">
                  USB / Bluetooth Scanner
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Connect your scanner and scan
                  the shipment barcode or QR code.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      usbScannerActive
                        ? "animate-pulse bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />

                  <span className="text-xs font-medium text-gray-500">
                    {usbScannerActive
                      ? "Scanning..."
                      : "Ready for scanner"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 p-3">
              <p className="text-xs leading-5 text-gray-500">
                Most USB scanners work like a
                keyboard. Simply scan the code.
                No input field is required.
              </p>
            </div>
          </div>

          {/* CAMERA */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Camera size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900">
                  Laptop Camera
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Use your laptop webcam to scan
                  the shipment QR code.
                </p>

                <button
                  type="button"
                  onClick={openScanner}
                  disabled={
                    scannerOpen ||
                    loading
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera size={17} />

                  {scannerOpen
                    ? "Camera Active"
                    : "Open Camera"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="text-sm font-medium">
              {error}
            </div>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="text-sm font-medium">
              {success}
            </div>
          </div>
        )}

        {/* =================================================
            CAMERA SCANNER
        ================================================= */}

        {scannerOpen && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Camera Scanner
                </h2>

                <p className="text-sm text-gray-500">
                  Point the camera at the QR code.
                </p>
              </div>

              <button
                type="button"
                onClick={stopScanner}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <CameraOff size={17} />

                Stop Scanner
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl bg-black">
              <div className="relative aspect-video w-full">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-56 w-72 rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
                  Point the camera at the QR code
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mb-6 flex items-center justify-center rounded-xl border border-gray-200 bg-white p-6">
            <RefreshCw
              size={22}
              className="mr-3 animate-spin text-blue-600"
            />

            <span className="text-sm font-medium text-gray-600">
              Loading shipment...
            </span>
          </div>
        )}

        {/* =================================================
            SHIPMENT
        ================================================= */}

        {shipment && !loading && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* =============================================
                LEFT
            ============================================= */}

            <div className="space-y-6 xl:col-span-2">

              {/* Shipment header */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Tracking Number
                    </p>

                    <h2 className="mt-1 break-all text-2xl font-bold tracking-tight text-gray-900">
                      {shipment.trackingNumber}
                    </h2>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-sm font-semibold ${statusClass(
                      shipment.status
                    )}`}
                  >
                    {formatStatus(
                      shipment.status
                    )}
                  </span>
                </div>
              </div>

              {/* Shipment information */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<Package size={19} />}
                  title="Shipment Details"
                />

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoCard
                    label="Package Type"
                    value={
                      shipment.packageType ||
                      "-"
                    }
                  />

                  <InfoCard
                    label="Weight"
                    value={
                      shipment.weight !==
                        null &&
                      shipment.weight !==
                        undefined
                        ? `${shipment.weight} kg`
                        : "-"
                    }
                  />

                  <InfoCard
                    label="Payment Type"
                    value={
                      shipment.paymentType ||
                      "-"
                    }
                  />

                  <InfoCard
                    label="COD Amount"
                    value={money(
                      shipment.codAmount
                    )}
                  />

                  <InfoCard
                    label="Shipping Charge"
                    value={money(
                      shipment.shippingCharge
                    )}
                  />

                  <InfoCard
                    label="Vendor"
                    value={
                      shipment.vendor?.name ||
                      "-"
                    }
                  />
                </div>
              </div>

              {/* Sender / Receiver */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Sender */}

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <SectionTitle
                    icon={<User size={19} />}
                    title="Sender"
                  />

                  <div className="mt-5 space-y-4">
                    <InfoRow
                      label="Name"
                      value={
                        shipment.senderName ||
                        "-"
                      }
                    />

                    <InfoRow
                      label="Phone"
                      value={
                        shipment.senderPhone ||
                        "-"
                      }
                    />

                    <InfoRow
                      label="Address"
                      value={
                        shipment.senderAddress ||
                        "-"
                      }
                    />
                  </div>
                </div>

                {/* Receiver */}

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <SectionTitle
                    icon={<User size={19} />}
                    title="Receiver"
                  />

                  <div className="mt-5 space-y-4">
                    <InfoRow
                      label="Name"
                      value={
                        shipment.receiverName ||
                        "-"
                      }
                    />

                    <InfoRow
                      label="Phone"
                      value={
                        shipment.receiverPhone ||
                        "-"
                      }
                    />

                    <InfoRow
                      label="Address"
                      value={
                        shipment.receiverAddress ||
                        "-"
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ===========================================
                  RIDER ASSIGNMENT
              =========================================== */}

              <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <SectionTitle
                    icon={
                      <UserCheck size={19} />
                    }
                    title="Assign Rider"
                  />

                  <span className="text-xs font-medium text-gray-500">
                    Rider selection is required
                  </span>
                </div>

                {/* Current rider */}

                {shipment.rider && (
                  <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                        <Truck size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-purple-500">
                          Currently Assigned
                        </p>

                        <p className="mt-1 font-semibold text-purple-900">
                          {getRiderName(
                            shipment.rider
                          )}
                        </p>

                        {shipment.rider
                          .phone && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-purple-700">
                            <Phone size={14} />

                            {
                              shipment.rider
                                .phone
                            }
                          </p>
                        )}

                        {shipment.rider
                          .vehicleNumber && (
                          <p className="mt-1 text-sm text-purple-700">
                            Vehicle:{" "}
                            {
                              shipment.rider
                                .vehicleNumber
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rider dropdown */}

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Select Rider
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <select
                      value={
                        selectedRiderId
                      }
                      onChange={(event) => {
                        const value =
                          event.target
                            .value;

                        setSelectedRiderId(
                          value === ""
                            ? ""
                            : Number(value)
                        );

                        setError("");
                      }}
                      disabled={
                        ridersLoading ||
                        actionLoading
                      }
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="">
                        {ridersLoading
                          ? "Loading riders..."
                          : riders.length ===
                            0
                          ? "No riders available"
                          : "Select a rider"}
                      </option>

                      {riders.map(
                        (rider) => (
                          <option
                            key={
                              rider.id
                            }
                            value={
                              rider.id
                            }
                          >
                            {getRiderName(
                              rider
                            )}
                            {" — "}
                            {rider.phone ||
                              "No phone"}
                            {rider
                              .vehicleNumber
                              ? ` — ${rider.vehicleNumber}`
                              : ""}
                            {!rider
                              .isAvailable
                              ? " — Unavailable"
                              : ""}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  {riders.length ===
                    0 &&
                    !ridersLoading && (
                      <p className="mt-2 text-sm text-red-600">
                        No riders were found.
                        Please create/activate a
                        rider first.
                      </p>
                    )}

                  {selectedRiderId !==
                    "" && (
                    <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                      ✓ Rider selected
                    </div>
                  )}
                </div>

                {/* Assign button */}

                <button
                  type="button"
                  onClick={assignRider}
                  disabled={
                    !canAssignRider ||
                    actionLoading
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      Assigning Rider...
                    </>
                  ) : (
                    <>
                      <UserCheck
                        size={18}
                      />

                      Assign Selected Rider
                    </>
                  )}
                </button>

                {selectedRiderId ===
                  "" && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Select a rider above before
                    assigning this shipment.
                  </p>
                )}
              </div>

              {/* Notes */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<Phone size={19} />}
                  title="Shipment Notes"
                />

                <p className="mt-2 text-sm text-gray-500">
                  Existing notes:
                </p>

                <div className="mt-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                  {shipment.notes ||
                    "No shipment notes."}
                </div>
              </div>

              {/* Tracking history */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<Clock size={19} />}
                  title="Tracking History"
                />

                {shipment.trackings &&
                shipment.trackings.length >
                  0 ? (
                  <div className="mt-5 space-y-4">
                    {shipment.trackings.map(
                      (
                        tracking,
                        index
                      ) => (
                        <div
                          key={
                            tracking.id ??
                            index
                          }
                          className="relative flex gap-4"
                        >
                          {index <
                            shipment.trackings!
                              .length -
                              1 && (
                            <div className="absolute left-[9px] top-6 h-full w-px bg-gray-200" />
                          )}

                          <div className="relative z-10 mt-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-sm" />

                          <div className="min-w-0 flex-1 pb-4">
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <p className="font-semibold text-gray-900">
                                {formatStatus(
                                  tracking.status
                                )}
                              </p>

                              <span className="text-xs text-gray-400">
                                {formatDate(
                                  tracking.createdAt
                                )}
                              </span>
                            </div>

                            {tracking.location && (
                              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                <MapPin
                                  size={14}
                                />

                                {
                                  tracking.location
                                }
                              </p>
                            )}

                            {tracking.message && (
                              <p className="mt-1 text-sm text-gray-600">
                                {
                                  tracking.message
                                }
                              </p>
                            )}

                            {tracking.notes && (
                              <p className="mt-1 text-sm text-gray-500">
                                Note:{" "}
                                {
                                  tracking.notes
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No tracking history available.
                  </div>
                )}
              </div>
            </div>

            {/* =============================================
                RIGHT SIDE
            ============================================= */}

            <div className="space-y-6">

              {/* Action card */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<Truck size={19} />}
                  title="Shipment Actions"
                />

                {actions.length ===
                0 ? (
                  <div className="mt-5 rounded-xl bg-gray-50 p-5 text-center">
                    <XCircle
                      size={28}
                      className="mx-auto mb-2 text-gray-400"
                    />

                    <p className="text-sm font-medium text-gray-600">
                      No actions available
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    {actions.map(
                      (action) => {
                        const Icon =
                          ACTION_ICONS[
                            action
                          ] ||
                          Package;

                        const selected =
                          selectedAction ===
                          action;

                        return (
                          <button
                            key={action}
                            type="button"
                            onClick={() => {
                              setSelectedAction(
                                action
                              );

                              setError("");

                              setSuccess("");

                              if (
                                action ===
                                "ASSIGN_RIDER"
                              ) {
                                fetchRiders();
                              }
                            }}
                            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 rounded-lg p-2 ${
                                selected
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Icon
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`text-sm font-semibold ${
                                  selected
                                    ? "text-blue-800"
                                    : "text-gray-800"
                                }`}
                              >
                                {ACTION_LABELS[
                                  action
                                ] ||
                                  formatStatus(
                                    action
                                  )}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                {ACTION_DESCRIPTIONS[
                                  action
                                ] ||
                                  "Perform this shipment action."}
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

                {selectedAction && (
                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                      Selected Action
                    </p>

                    <p className="mt-1 font-semibold text-blue-900">
                      {ACTION_LABELS[
                        selectedAction
                      ] ||
                        formatStatus(
                          selectedAction
                        )}
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                      {
                        ACTION_DESCRIPTIONS[
                          selectedAction
                        ]
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Action Details */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  icon={<MapPin size={19} />}
                  title="Action Details"
                />

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Kathmandu Warehouse"
                    disabled={
                      actionLoading
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Used by the normal shipment
                    action endpoint.
                  </p>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Notes
                  </label>

                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Add notes..."
                    disabled={
                      actionLoading
                    }
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Main action */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <button
                  type="button"
                  onClick={
                    processAction
                  }
                  disabled={
                    !selectedAction ||
                    actionLoading ||
                    (isAssignAction &&
                      selectedRiderId ===
                        "")
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 ${
                    isAssignAction
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={18}
                      />

                      {isAssignAction
                        ? "Assign Rider"
                        : "Confirm Action"}
                    </>
                  )}
                </button>

                {isAssignAction &&
                  selectedRiderId ===
                    "" && (
                    <p className="mt-3 text-center text-xs font-medium text-red-500">
                      Select a rider before
                      assigning.
                    </p>
                  )}
              </div>

              {/* Rider count */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-green-50 p-3 text-green-600">
                      <UserCheck
                        size={20}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Available Riders
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {
                          riders.filter(
                            (rider) =>
                              rider.isAvailable
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  <span className="text-sm text-gray-400">
                    / {riders.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!shipment &&
          !loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ScanLine size={30} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-gray-900">
                No Shipment Selected
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Scan a shipment QR code using
                your laptop camera or connect a
                USB scanner and scan directly.
              </p>

              <div className="mx-auto mt-6 max-w-md rounded-xl border border-green-100 bg-green-50 p-4 text-left">
                <div className="flex gap-3">
                  <Keyboard
                    size={20}
                    className="mt-0.5 shrink-0 text-green-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      USB scanner ready
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-700">
                      Connect your barcode/QR
                      scanner and scan. You do not
                      need to click an input box.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-700">
        {icon}
      </div>

      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}
