
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "";

type Shipment = {
  id: string;
  trackingNumber: string;
  status: string;

  senderName?: string;
  senderPhone?: string;
  senderAddress?: string;

  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;

  packageType?: string;
  weight?: number | string;

  paymentType?: string;
  codAmount?: number | string;
  shippingCharge?: number | string;

  notes?: string;

  vendor?: {
    id: number;
    companyName?: string;
    contactId?: string;
    location?: string;
  } | null;

  rider?: {
    id: number;
    name?: string;
    phone?: string;
  } | null;

  trackings?: any[];

  codCollection?: any;
};

type ScanResult = {
  success: boolean;
  shipment: Shipment;

  currentUser: {
    role: string;
    riderId: number | null;
  };

  actions: string[];
};

const ACTION_LABELS: Record<string, string> = {
  RECEIVE: "Receive in Warehouse",
  PICKUP: "Pickup Shipment",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVER: "Mark Delivered",
  REQUEST_RETURN: "Request Return",
  RETURN_PICKUP: "Pickup Return",
  RETURN_TO_WAREHOUSE: "Return to Warehouse",
  OUT_FOR_RETURN: "Out for Return",
  RETURNED_TO_VENDOR: "Returned to Vendor",
};

const ACTION_ICONS: Record<string, string> = {
  RECEIVE: "📦",
  PICKUP: "🤝",
  OUT_FOR_DELIVERY: "🚚",
  DELIVER: "✓",
  REQUEST_RETURN: "↩",
  RETURN_PICKUP: "📥",
  RETURN_TO_WAREHOUSE: "🏭",
  OUT_FOR_RETURN: "🚚",
  RETURNED_TO_VENDOR: "✓",
};

export default function ShipmentScannerPage() {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const readerRef =
    useRef<BrowserMultiFormatReader | null>(null);

  const controlsRef =
    useRef<IScannerControls | null>(null);

  const scanLockRef =
    useRef(false);

  const lastScanRef =
    useRef("");

  // =========================================================
  // STATE
  // =========================================================

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

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [manualTracking, setManualTracking] =
    useState("");

  const [shipment, setShipment] =
    useState<Shipment | null>(null);

  const [actions, setActions] =
    useState<string[]>([]);

  const [selectedAction, setSelectedAction] =
    useState("");

  const [location, setLocation] =
    useState("Main Warehouse");

  // =========================================================
  // STOP CAMERA
  // =========================================================

  const stopScanner = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {}

    controlsRef.current = null;

    setScannerOpen(false);
  }, []);

  // =========================================================
  // FIND SHIPMENT
  // =========================================================

  const findShipment = useCallback(
    async (value: string) => {
      const cleanValue =
        value.trim();

      if (!cleanValue) {
        setError(
          "Please scan or enter a tracking number."
        );

        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response =
          await fetch(
            `${API_BASE}/api/shipment/scan`,
            {
              method: "POST",

              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                trackingNumber:
                  cleanValue,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Shipment not found."
          );
        }

        const result =
          data as ScanResult;

        setShipment(
          result.shipment
        );

        setTrackingNumber(
          result.shipment.trackingNumber
        );

        setActions(
          result.actions || []
        );

        // Automatically select
        // first available action.
        setSelectedAction(
          result.actions?.[0] || ""
        );

        setManualTracking(
          result.shipment.trackingNumber
        );

        setSuccess(
          "Shipment scanned successfully."
        );
      } catch (err: any) {
        setShipment(null);
        setActions([]);
        setSelectedAction("");

        setError(
          err?.message ||
            "Failed to find shipment."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================================================
  // HANDLE BARCODE
  // =========================================================

  const handleBarcode =
    useCallback(
      async (value: string) => {
        if (!value) {
          return;
        }

        const clean =
          value.trim();

        if (!clean) {
          return;
        }

        if (scanLockRef.current) {
          return;
        }

        if (
          lastScanRef.current ===
          clean
        ) {
          return;
        }

        scanLockRef.current = true;

        lastScanRef.current =
          clean;

        await findShipment(clean);

        stopScanner();

        setTimeout(() => {
          scanLockRef.current =
            false;
        }, 1000);
      },
      [
        findShipment,
        stopScanner,
      ]
    );

  // =========================================================
  // OPEN CAMERA
  // =========================================================

  const openScanner = useCallback(
    async () => {
      setError("");
      setSuccess("");

      try {
        if (!videoRef.current) {
          throw new Error(
            "Camera is not ready."
          );
        }

        if (!readerRef.current) {
          readerRef.current =
            new BrowserMultiFormatReader();
        }

        const devices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (!devices.length) {
          throw new Error(
            "No camera was found."
          );
        }

        // Prefer back camera
        const backCamera =
          devices.find((device) =>
            /back|rear|environment/i.test(
              device.label
            )
          );

        const deviceId =
          backCamera?.deviceId ||
          devices[0].deviceId;

        const controls =
          await readerRef.current.decodeFromVideoDevice(
            deviceId,
            videoRef.current,
            (result) => {
              if (result) {
                handleBarcode(
                  result.getText()
                );
              }
            }
          );

        controlsRef.current =
          controls;

        setScannerOpen(true);
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Unable to open camera."
        );

        setScannerOpen(false);
      }
    },
    [handleBarcode]
  );

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      try {
        controlsRef.current?.stop();
      } catch {}
    };
  }, []);

  // =========================================================
  // PROCESS ACTION
  // =========================================================

  const processAction =
    async () => {
      if (!shipment) {
        setError(
          "No shipment selected."
        );

        return;
      }

      if (!selectedAction) {
        setError(
          "Please select an action."
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

              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                trackingNumber:
                  shipment.trackingNumber,

                action:
                  selectedAction,

                location,

                notes: "",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to process shipment."
          );
        }

        setSuccess(
          data?.message ||
            "Shipment updated successfully."
        );

        // Fetch updated shipment
        await findShipment(
          shipment.trackingNumber
        );
      } catch (err: any) {
        setError(
          err?.message ||
            "Failed to process action."
        );
      } finally {
        setActionLoading(false);
      }
    };

  // =========================================================
  // CLEAR
  // =========================================================

  const resetPage = () => {
    stopScanner();

    setShipment(null);
    setTrackingNumber("");
    setManualTracking("");

    setActions([]);
    setSelectedAction("");

    setError("");
    setSuccess("");

    lastScanRef.current = "";
    scanLockRef.current = false;
  };

  // =========================================================
  // MONEY
  // =========================================================

  const money = (
    value: any
  ) => {
    const amount =
      Number(value || 0);

    return `Rs. ${amount.toLocaleString(
      "en-NP"
    )}`;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Shipment Scanner
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Scan a package and select the
              shipment process.
            </p>
          </div>

          {shipment && (
            <button
              onClick={resetPage}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Scan New Package
            </button>
          )}
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[430px_1fr]">

          {/* =================================================
              SCANNER CARD
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Scan Package
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Use your camera to scan QR or
                barcode.
              </p>
            </div>

            {/* CAMERA */}

            <div className="relative overflow-hidden rounded-2xl bg-black">

              <video
                ref={videoRef}
                muted
                playsInline
                className="aspect-square w-full object-cover"
              />

              {!scannerOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white">
                  <div className="mb-4 text-5xl">
                    📷
                  </div>

                  <p className="text-sm font-medium">
                    Camera scanner is closed
                  </p>
                </div>
              )}

              {scannerOpen && (
                <div className="pointer-events-none absolute inset-0">

                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white" />

                  <div className="absolute left-1/2 top-1/2 h-0.5 w-56 -translate-x-1/2 bg-red-500" />

                </div>
              )}
            </div>

            {/* CAMERA BUTTON */}

            <div className="mt-4">

              {!scannerOpen ? (
                <button
                  onClick={openScanner}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  📷 Open Scanner
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Stop Scanner
                </button>
              )}

            </div>

            {/* DIVIDER */}

            <div className="my-5 flex items-center gap-3">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* MANUAL TRACKING */}

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tracking Number
            </label>

            <div className="flex gap-2">

              <input
                value={manualTracking}
                onChange={(e) =>
                  setManualTracking(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    findShipment(
                      manualTracking
                    );
                  }
                }}
                placeholder="RC-1789981579523-622"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <button
                onClick={() =>
                  findShipment(
                    manualTracking
                  )
                }
                disabled={
                  loading ||
                  !manualTracking.trim()
                }
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "..."
                  : "Search"}
              </button>

            </div>

            {/* LOCATION */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>

              <select
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="Main Warehouse">
                  Main Warehouse
                </option>

                <option value="Kathmandu Warehouse">
                  Kathmandu Warehouse
                </option>

                <option value="Lalitpur Warehouse">
                  Lalitpur Warehouse
                </option>

                <option value="Bhaktapur Warehouse">
                  Bhaktapur Warehouse
                </option>

                <option value="Sorting Center">
                  Sorting Center
                </option>

                <option value="Delivery Hub">
                  Delivery Hub
                </option>
              </select>

            </div>
          </div>

          {/* =================================================
              SHIPMENT INFORMATION
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            {!shipment ? (

              <div className="flex min-h-[600px] items-center justify-center">

                <div className="max-w-sm text-center">

                  <div className="mb-5 text-6xl">
                    📦
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Scan a shipment
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Once you scan a package,
                    shipment details and the
                    available process dropdown
                    will appear here.
                  </p>

                </div>

              </div>

            ) : (

              <div>

                {/* TRACKING */}

                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tracking Number
                    </p>

                    <h2 className="mt-1 break-all text-2xl font-bold text-slate-900">
                      {shipment.trackingNumber}
                    </h2>

                  </div>

                  <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-700">
                    {shipment.status.replaceAll(
                      "_",
                      " "
                    )}
                  </div>

                </div>

                {/* =================================================
                    DETAILS
                ================================================= */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                  <Info
                    label="Sender"
                    value={
                      shipment.senderName
                    }
                  />

                  <Info
                    label="Sender Phone"
                    value={
                      shipment.senderPhone
                    }
                  />

                  <Info
                    label="Receiver"
                    value={
                      shipment.receiverName
                    }
                  />

                  <Info
                    label="Receiver Phone"
                    value={
                      shipment.receiverPhone
                    }
                  />

                  <Info
                    label="Package"
                    value={
                      shipment.packageType
                    }
                  />

                  <Info
                    label="Weight"
                    value={`${shipment.weight || 0} kg`}
                  />

                  <Info
                    label="Payment"
                    value={
                      shipment.paymentType
                    }
                  />

                  <Info
                    label="COD"
                    value={money(
                      shipment.codAmount
                    )}
                  />

                  <Info
                    label="Vendor"
                    value={
                      shipment.vendor
                        ?.companyName ||
                      "Unregistered / Walk-in"
                    }
                  />

                  <Info
                    label="Rider"
                    value={
                      shipment.rider
                        ?.name ||
                      "Not Assigned"
                    }
                  />

                </div>

                {/* ADDRESS */}

                <div className="mt-4 grid gap-4 md:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Sender Address
                    </p>

                    <p className="mt-2 text-sm text-slate-700">
                      {shipment.senderAddress ||
                        "-"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Receiver Address
                    </p>

                    <p className="mt-2 text-sm text-slate-700">
                      {shipment.receiverAddress ||
                        "-"}
                    </p>

                  </div>

                </div>

                {/* =================================================
                    PROCESS DROPDOWN
                ================================================= */}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-900">
                      Shipment Process
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Select what you want to do
                      with this shipment.
                    </p>

                  </div>

                  {actions.length === 0 ? (

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <p className="text-sm font-semibold text-amber-800">
                        No action available
                      </p>

                      <p className="mt-1 text-xs text-amber-700">
                        The current shipment status
                        does not allow an action
                        for your account.
                      </p>

                    </div>

                  ) : (

                    <>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Select Process
                      </label>

                      <select
                        value={selectedAction}
                        onChange={(e) =>
                          setSelectedAction(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      >

                        <option value="">
                          Select shipment process
                        </option>

                        {actions.map(
                          (action) => (
                            <option
                              key={action}
                              value={action}
                            >
                              {ACTION_ICONS[
                                action
                              ] || ""}{" "}
                              {ACTION_LABELS[
                                action
                              ] ||
                                action.replaceAll(
                                  "_",
                                  " "
                                )}
                            </option>
                          )
                        )}

                      </select>

                      {/* SELECTED ACTION */}

                      {selectedAction && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                              {ACTION_ICONS[
                                selectedAction
                              ] || "•"}
                            </div>

                            <div>

                              <p className="text-xs font-medium text-slate-400">
                                Selected Process
                              </p>

                              <p className="text-sm font-bold text-slate-900">
                                {ACTION_LABELS[
                                  selectedAction
                                ] ||
                                  selectedAction.replaceAll(
                                    "_",
                                    " "
                                  )}
                              </p>

                            </div>

                          </div>

                        </div>
                      )}

                      {/* SUBMIT */}

                      <button
                        onClick={
                          processAction
                        }
                        disabled={
                          actionLoading ||
                          !selectedAction
                        }
                        className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        {actionLoading
                          ? "Processing..."
                          : "Confirm Process"}

                      </button>

                    </>

                  )}

                </div>

                {/* =================================================
                    TRACKING HISTORY
                ================================================= */}

                {shipment.trackings &&
                  shipment.trackings.length >
                    0 && (

                  <div className="mt-6">

                    <h3 className="mb-3 text-lg font-bold text-slate-900">
                      Tracking History
                    </h3>

                    <div className="space-y-2">

                      {shipment.trackings
                        .slice(0, 8)
                        .map(
                          (
                            tracking: any
                          ) => (

                            <div
                              key={
                                tracking.id
                              }
                              className="rounded-xl border border-slate-200 p-4"
                            >

                              <div className="flex items-start justify-between gap-4">

                                <div>

                                  <p className="text-sm font-semibold text-slate-800">
                                    {tracking.message ||
                                      "Shipment updated"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {tracking.location ||
                                      "-"}
                                  </p>

                                </div>

                                <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">
                                  {tracking.status?.replaceAll(
                                    "_",
                                    " "
                                  )}
                                </span>

                              </div>

                            </div>

                          )
                        )}

                    </div>

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  );
}

// =============================================================
// INFO COMPONENT
// =============================================================

function Info({
  label,
  value,
}: {
  label: string;
  value?: any;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>

    </div>
  );
}

