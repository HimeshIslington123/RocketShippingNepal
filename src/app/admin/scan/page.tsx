"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Keyboard,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  ScanLine,
  Search,
  Truck,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

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
  currentUser?: { id?: number; name?: string; role?: string };
  actions?: string[];
};

const ACTION_LABELS: Record<string, string> = {
  RECEIVE: "Receive Shipment",
  ASSIGN_RIDER: "Assign Rider",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVER: "Deliver Shipment",
};

// These actions are intentionally hidden from the scanner UI.
const HIDDEN_ACTIONS = new Set([
  "PICKUP",
  "REQUEST_RETURN",
  "RETURN_PICKUP",
  "RETURN_TO_WAREHOUSE",
  "OUT_FOR_RETURN",
  "RETURNED_TO_VENDOR",
]);

function formatStatus(status?: string | null) {
  if (!status) return "-";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  return `NPR ${Number(value || 0).toLocaleString("en-NP")}`;
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("en-NP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return date;
  }
}

function extractTrackingNumber(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  const directMatch = raw.match(/(?:^|\/)(RC-[A-Za-z0-9-]+)(?:[/?#]|$)/i);
  if (directMatch?.[1]) return directMatch[1];

  try {
    const url = new URL(raw);
    const trackingParam =
      url.searchParams.get("trackingNumber") ||
      url.searchParams.get("tracking");
    if (trackingParam) return trackingParam.trim();

    const parts = url.pathname.split("/").filter(Boolean);
    const trackIndex = parts.findIndex(
      (part) => part.toLowerCase() === "track",
    );
    if (trackIndex !== -1 && parts[trackIndex + 1]) {
      return decodeURIComponent(parts[trackIndex + 1]).trim();
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart) return decodeURIComponent(lastPart).trim();
  } catch {
    // Not a URL.
  }

  const queryMatch = raw.match(/trackingNumber=([^&]+)/i);
  if (queryMatch?.[1]) return decodeURIComponent(queryMatch[1]).trim();
  return raw;
}

export default function ShipmentScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const scanLockRef = useRef(false);
  const lastScanRef = useRef("");

  const usbBufferRef = useRef("");
  const usbLastKeyTimeRef = useRef(0);
  const usbTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [usbScannerActive, setUsbScannerActive] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [ridersLoading, setRidersLoading] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [trackingSearch, setTrackingSearch] = useState("");

  const getAuthToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken")
    );
  }, []);

  const stopScanner = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {}
    controlsRef.current = null;
    readerRef.current = null;

    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      if (stream) stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScannerOpen(false);
  }, []);

  const fetchRiders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    setRidersLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rider`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load riders.");
      }
      setRiders(Array.isArray(data.riders) ? data.riders : []);
    } catch (err) {
      console.error("FETCH RIDERS ERROR:", err);
      setRiders([]);
      setError(err instanceof Error ? err.message : "Failed to load riders.");
    } finally {
      setRidersLoading(false);
    }
  }, [getAuthToken]);

  const findShipment = useCallback(
    async (value: string) => {
      const trackingNumber = extractTrackingNumber(value);
      if (!trackingNumber) {
        setError("No tracking number found.");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await fetch(`${API_BASE}/api/shipment/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ trackingNumber }),
        });

        const result: ScanResult = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result?.message || "Unable to find shipment.");
        }
        if (!result.shipment)
          throw new Error("Shipment information was not returned.");

        setShipment(result.shipment);
        const nextActions = Array.isArray(result.actions)
          ? result.actions.filter((action) => !HIDDEN_ACTIONS.has(action))
          : [];
        setActions(nextActions);
        const firstAction = nextActions.length ? nextActions[0] : "";
        setSelectedAction(firstAction);
        setSelectedRiderId(result.shipment.rider?.id || "");
        if (firstAction === "ASSIGN_RIDER") {
          void fetchRiders();
        } else {
          setRiders([]);
        }
        setDetailsOpen(false);
        setError("");
        stopScanner();
      } catch (err) {
        console.error("FIND SHIPMENT ERROR:", err);
        setShipment(null);
        setActions([]);
        setSelectedAction("");
        setSelectedRiderId("");
        setError(
          err instanceof Error ? err.message : "Unable to find shipment.",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchRiders, getAuthToken, stopScanner],
  );

  const handleBarcode = useCallback(
    async (value: string) => {
      const trackingNumber = extractTrackingNumber(value);
      if (
        !trackingNumber ||
        scanLockRef.current ||
        lastScanRef.current === trackingNumber
      )
        return;

      scanLockRef.current = true;
      lastScanRef.current = trackingNumber;
      try {
        await findShipment(trackingNumber);
      } finally {
        setTimeout(() => {
          scanLockRef.current = false;
        }, 1200);
      }
    },
    [findShipment],
  );

  const searchByTrackingNumber = useCallback(async () => {
    const trackingNumber = trackingSearch.trim();
    if (!trackingNumber) {
      setError("Enter a tracking number first.");
      return;
    }

    lastScanRef.current = "";
    await handleBarcode(trackingNumber);
  }, [handleBarcode, trackingSearch]);

  const processUSBScan = useCallback(async () => {
    const value = usbBufferRef.current.trim();
    usbBufferRef.current = "";
    usbLastKeyTimeRef.current = 0;
    setUsbScannerActive(false);
    if (value.length >= 3) await handleBarcode(value);
  }, [handleBarcode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable
      )
        return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const now = Date.now();
      if (usbLastKeyTimeRef.current && now - usbLastKeyTimeRef.current > 100)
        usbBufferRef.current = "";
      usbLastKeyTimeRef.current = now;

      if (event.key === "Enter" || event.key === "Tab") {
        if (usbBufferRef.current.trim()) {
          event.preventDefault();
          void processUSBScan();
        }
        return;
      }

      if (event.key.length === 1) {
        usbBufferRef.current += event.key;
        setUsbScannerActive(true);
        if (usbTimeoutRef.current) clearTimeout(usbTimeoutRef.current);
        usbTimeoutRef.current = setTimeout(() => {
          if (usbBufferRef.current.trim()) void processUSBScan();
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (usbTimeoutRef.current) clearTimeout(usbTimeoutRef.current);
    };
  }, [processUSBScan]);

  const openScanner = useCallback(async () => {
    setError("");
    setSuccess("");
    try {
      if (!navigator.mediaDevices)
        throw new Error("Camera is not supported by this browser.");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      if (!videoDevices.length) throw new Error("No camera was found.");

      const preferredCamera =
        videoDevices.find((device) =>
          /back|rear|environment/i.test(device.label),
        ) || videoDevices[0];
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      setScannerOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (!videoRef.current)
        throw new Error("Camera video element is not ready.");

      controlsRef.current = await reader.decodeFromVideoDevice(
        preferredCamera.deviceId,
        videoRef.current,
        (result) => {
          if (result?.getText()) void handleBarcode(result.getText());
        },
      );
    } catch (err) {
      console.error("CAMERA ERROR:", err);
      setScannerOpen(false);
      setError(err instanceof Error ? err.message : "Unable to open camera.");
    }
  }, [handleBarcode]);

  useEffect(() => () => stopScanner(), [stopScanner]);

  const isAssignAction = selectedAction === "ASSIGN_RIDER";
  const canAssignRider =
    selectedRiderId !== "" && !ridersLoading && riders.length > 0;

  const selectAction = useCallback(
    async (action: string) => {
      setSelectedAction(action);
      setError("");
      setSuccess("");

      if (action === "ASSIGN_RIDER") {
        await fetchRiders();
      } else {
        setRiders([]);
        setSelectedRiderId(shipment?.rider?.id || "");
      }
    },
    [fetchRiders, shipment],
  );

  const assignRider = useCallback(async () => {
    if (!shipment) return setError("Please scan a shipment first.");
    if (selectedRiderId === "")
      return setError("Please select a rider before assigning the shipment.");

    const riderId = Number(selectedRiderId);
    if (!Number.isInteger(riderId)) return setError("Invalid rider selected.");

    const token = getAuthToken();
    if (!token) return setError("Authentication required. Please login again.");

    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `${API_BASE}/api/shipment/${shipment.id}/assign-rider`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ riderId }),
        },
      );
      const data = await response.json();
      if (!response.ok || data?.success === false)
        throw new Error(data?.message || "Failed to assign rider.");

      setSuccess(data?.message || "Rider assigned successfully.");
      await findShipment(shipment.trackingNumber);
    } catch (err) {
      console.error("ASSIGN RIDER ERROR:", err);
      setError(err instanceof Error ? err.message : "Failed to assign rider.");
    } finally {
      setActionLoading(false);
    }
  }, [findShipment, getAuthToken, selectedRiderId, shipment]);

  const processAction = useCallback(async () => {
    if (!shipment) return setError("Please scan a shipment first.");
    if (!selectedAction) return setError("Please select an action.");
    if (HIDDEN_ACTIONS.has(selectedAction))
      return setError("This shipment action is not available here.");
    if (selectedAction === "ASSIGN_RIDER") return assignRider();

    const token = getAuthToken();
    if (!token) return setError("Authentication required. Please login again.");

    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_BASE}/api/shipment/scan/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          trackingNumber: shipment.trackingNumber,
          action: selectedAction,
          location: location.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || data?.success === false)
        throw new Error(data?.message || "Action failed.");

      setSuccess(data?.message || "Action completed successfully.");
      setNotes("");
      await findShipment(shipment.trackingNumber);
    } catch (err) {
      console.error("PROCESS ACTION ERROR:", err);
      setError(err instanceof Error ? err.message : "Action failed.");
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

  const newScan = useCallback(() => {
    stopScanner();
    setShipment(null);
    setActions([]);
    setSelectedAction("");
    setSelectedRiderId("");
    setRiders([]);
    setDetailsOpen(false);
    setError("");
    setSuccess("");
    setNotes("");
    setLocation("");
    setTrackingSearch("");
    setLoading(false);
    setActionLoading(false);
    lastScanRef.current = "";
    scanLockRef.current = false;
    usbBufferRef.current = "";
    usbLastKeyTimeRef.current = 0;
    setUsbScannerActive(false);
    if (usbTimeoutRef.current) clearTimeout(usbTimeoutRef.current);
  }, [stopScanner]);

  const getRiderName = (rider: Rider) =>
    rider.user?.name || rider.name || `Rider #${rider.id}`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {!shipment && !loading && (
          <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <ScanLine size={14} /> Shipment scanner
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                  Scan & update shipment
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Scan a QR/barcode or search a tracking number to manage the
                  shipment.
                </p>
              </div>
              <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm sm:block">
                Fast lookup · Simple actions
              </div>
            </div>

            <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-900 p-2.5 text-white">
                    <Search size={19} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Search by tracking number
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enter the shipment tracking ID manually.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-5">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      value={trackingSearch}
                      onChange={(event) =>
                        setTrackingSearch(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter")
                          void searchByTrackingNumber();
                      }}
                      placeholder="e.g. RC-1789981579523-622"
                      autoComplete="off"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void searchByTrackingNumber()}
                    disabled={loading || !trackingSearch.trim()}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:min-w-32"
                  >
                    {loading ? (
                      <RefreshCw size={17} className="animate-spin" />
                    ) : (
                      <Search size={17} />
                    )}
                    {loading ? "Searching" : "Search"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                or scan
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div
                className={`group rounded-2xl border bg-white p-5 shadow-sm transition ${usbScannerActive ? "border-emerald-400 ring-4 ring-emerald-50" : "border-slate-200 hover:border-slate-300 hover:shadow-md"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 transition group-hover:scale-105">
                    <Keyboard size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-semibold text-slate-900">
                        USB / Bluetooth scanner
                      </h2>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${usbScannerActive ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`}
                      />
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Connect your scanner and scan directly. No input field is
                      required.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                      <span>
                        {usbScannerActive ? "Scanning…" : "Ready for scanner"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition group-hover:scale-105">
                    <Camera size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900">
                      Laptop camera
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Use your webcam to scan the shipment QR code.
                    </p>
                    <button
                      type="button"
                      onClick={openScanner}
                      disabled={scannerOpen}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Camera size={16} />{" "}
                      {scannerOpen ? "Camera active" : "Open camera"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <XCircle size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {scannerOpen && !shipment && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <h2 className="font-semibold text-slate-900">Camera scanner</h2>
                <p className="text-sm text-slate-500">
                  Point the camera at the shipment QR code.
                </p>
              </div>
              <button
                type="button"
                onClick={stopScanner}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <CameraOff size={16} /> Stop
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-52 w-72 rounded-2xl border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            </div>
          </div>
        )}

        {loading && <ShipmentSkeleton />}

        {shipment && !loading && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 md:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Package size={21} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Shipment
                      </p>
                      <h2 className="mt-0.5 truncate text-base font-bold text-slate-950 md:text-lg">
                        {shipment.trackingNumber}
                      </h2>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {shipment.receiverName || "Receiver not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(shipment.status)}`}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                    <button
                      type="button"
                      onClick={newScan}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Plus size={16} /> New scan
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 px-4 py-3 md:px-5">
                <button
                  type="button"
                  onClick={() => setDetailsOpen((value) => !value)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Shipment information
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {detailsOpen
                        ? "Hide full shipment details"
                        : "View sender, receiver, rider and tracking history"}
                    </p>
                  </div>
                  <span className="rounded-lg bg-slate-50 p-2 text-slate-500">
                    {detailsOpen ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {actions.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Next step
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      Update shipment
                    </h3>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                    {actions.length} action{actions.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedAction}
                    onChange={(event) => void selectAction(event.target.value)}
                    disabled={actionLoading}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:bg-slate-100"
                  >
                    {actions.map((action) => (
                      <option key={action} value={action}>
                        {ACTION_LABELS[action] || formatStatus(action)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {isAssignAction && (
                  <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/70 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="rounded-lg bg-violet-100 p-2 text-violet-700">
                        <UserCheck size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-950">
                          Assign rider
                        </p>
                        <p className="text-xs text-violet-700/70">
                          Riders are loaded only when this action is selected.
                        </p>
                      </div>
                    </div>

                    {ridersLoading ? (
                      <div className="h-11 animate-pulse rounded-xl bg-violet-100" />
                    ) : (
                      <>
                        <select
                          value={selectedRiderId}
                          onChange={(event) =>
                            setSelectedRiderId(
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                          disabled={actionLoading}
                          className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100"
                        >
                          <option value="">Select a rider</option>
                          {riders.map((rider) => (
                            <option key={rider.id} value={rider.id}>
                              {getRiderName(rider)}
                              {rider.phone ? ` — ${rider.phone}` : ""}
                              {rider.vehicleNumber
                                ? ` — ${rider.vehicleNumber}`
                                : ""}
                              {!rider.isAvailable ? " — Unavailable" : ""}
                            </option>
                          ))}
                        </select>
                        {!riders.length && (
                          <p className="mt-2 text-xs text-red-600">
                            No riders available.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {selectedAction !== "ASSIGN_RIDER" && selectedAction && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      disabled={actionLoading}
                      placeholder="Location (optional)"
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:bg-slate-100"
                    />
                    <input
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      disabled={actionLoading}
                      placeholder="Notes (optional)"
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:bg-slate-100"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void processAction()}
                  disabled={
                    !selectedAction ||
                    actionLoading ||
                    (isAssignAction && !canAssignRider)
                  }
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />{" "}
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />{" "}
                      {isAssignAction ? "Assign rider" : "Update shipment"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">
                  No available update actions
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  This shipment currently has no supported next action.
                </p>
              </div>
            )}

            {detailsOpen && <ShipmentDetails shipment={shipment} />}
          </div>
        )}

        {!shipment && !loading && !scannerOpen && error === "" && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="rounded-xl bg-slate-50 p-2.5 text-slate-500">
              <ScanLine size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Ready to scan
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Scan with USB/Bluetooth, use the camera, or search above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShipmentSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading shipment">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-52 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-36 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-12 w-full animate-pulse rounded-xl bg-gray-200" />
        <div className="mt-3 h-11 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

function ShipmentDetails({ shipment }: { shipment: Shipment }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <SectionTitle icon={<Package size={18} />} title="Shipment details" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <InfoCard label="Package" value={shipment.packageType || "-"} />
          <InfoCard
            label="Weight"
            value={shipment.weight != null ? `${shipment.weight} kg` : "-"}
          />
          <InfoCard label="Payment" value={shipment.paymentType || "-"} />
          <InfoCard label="COD" value={money(shipment.codAmount)} />
          <InfoCard label="Shipping" value={money(shipment.shippingCharge)} />
          <InfoCard label="Vendor" value={shipment.vendor?.name || "-"} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoPanel icon={<User size={18} />} title="Sender">
          <InfoRow label="Name" value={shipment.senderName || "-"} />
          <InfoRow label="Phone" value={shipment.senderPhone || "-"} />
          <InfoRow label="Address" value={shipment.senderAddress || "-"} />
        </InfoPanel>
        <InfoPanel icon={<User size={18} />} title="Receiver">
          <InfoRow label="Name" value={shipment.receiverName || "-"} />
          <InfoRow label="Phone" value={shipment.receiverPhone || "-"} />
          <InfoRow label="Address" value={shipment.receiverAddress || "-"} />
        </InfoPanel>
      </div>

      {shipment.rider && (
        <InfoPanel icon={<Truck size={18} />} title="Current rider">
          <InfoRow
            label="Name"
            value={
              shipment.rider.user?.name ||
              shipment.rider.name ||
              `Rider #${shipment.rider.id}`
            }
          />
          <InfoRow label="Phone" value={shipment.rider.phone || "-"} />
          <InfoRow
            label="Vehicle"
            value={shipment.rider.vehicleNumber || "-"}
          />
        </InfoPanel>
      )}

      <InfoPanel icon={<Package size={18} />} title="Notes">
        <p className="text-sm text-gray-600">
          {shipment.notes || "No shipment notes."}
        </p>
      </InfoPanel>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <SectionTitle icon={<Clock size={18} />} title="Tracking history" />
        {shipment.trackings?.length ? (
          <div className="mt-4 space-y-4">
            {shipment.trackings.map((tracking, index) => (
              <div key={tracking.id ?? index} className="relative flex gap-3">
                {index < shipment.trackings!.length - 1 && (
                  <div className="absolute left-[8px] top-5 h-full w-px bg-gray-200" />
                )}
                <div className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatStatus(tracking.status)}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatDate(tracking.createdAt)}
                    </span>
                  </div>
                  {tracking.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={13} />
                      {tracking.location}
                    </p>
                  )}
                  {tracking.message && (
                    <p className="mt-1 text-sm text-gray-600">
                      {tracking.message}
                    </p>
                  )}
                  {tracking.notes && (
                    <p className="mt-1 text-xs text-gray-500">
                      Note: {tracking.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            No tracking history available.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoPanel({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <SectionTitle icon={icon} title={title} />
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-800">
      <span className="text-gray-600">{icon}</span>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}
