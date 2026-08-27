"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import {
  Package,
  Check,
  Truck,
  MapPin,
  User,
  Bike,
  Building2,
  Copy,
} from "lucide-react";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono" });

// ---------- Types ----------

interface Vendor {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
}

interface PriceLocation {
  id: number;
  location: string;
  price: number;
}

interface Rider {
  id: number;
  name?: string;
  phone?: string;
}

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  message: string;
  createdAt: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageType: string;
  weight: number;
  paymentType: string;
  codAmount: number;
  shippingCharge: number;
  notes?: string;
  qrCode?: string;
  status: string;
  riderId?: number | null;
  vendor: Vendor;
  priceLocation: PriceLocation;
  rider?: Rider | null;
  trackings: TrackingEvent[];
}

// ---------- Status config ----------

const JOURNEY: { key: string; label: string }[] = [
  { key: "RECEIVED", label: "Received" },
  { key: "PICKED_UP", label: "Picked up" },
  { key: "IN_TRANSIT", label: "In transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const TERMINAL_ALT: Record<string, { label: string; tone: string }> = {
  CANCELLED: { label: "Cancelled", tone: "cancelled" },
  RETURNED: { label: "Returned", tone: "returned" },
};

function statusTone(status: string) {
  if (status === "DELIVERED") return "delivered";
  if (TERMINAL_ALT[status]) return TERMINAL_ALT[status].tone;
  return "active";
}

function prettyLabel(status: string) {
  if (TERMINAL_ALT[status]) return TERMINAL_ALT[status].label;
  const found = JOURNEY.find((s) => s.key === status);
  if (found) return found.label;
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function formatMoney(n: number) {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------- Small building blocks ----------

function DetailRow({ label, value, mono: useMono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className={`text-right text-[14px] font-medium text-slate-900 ${useMono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function Card({
  title,
  icon: IconComp,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-1 flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F2A4A]/5 text-[#0F2A4A]">
          <IconComp className="h-4 w-4" />
        </span>
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

// ---------- Page ----------

export default function TrackingPage() {
  const { trackingNumber } = useParams();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadShipment() {
      try {
     const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/shipment/tracking/${trackingNumber}`
);
        const data = await res.json();
        setShipment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShipment();
  }, [trackingNumber]);

  const copyTrackingNumber = () => {
    if (!shipment) return;
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className={`${display.variable} ${mono.variable} flex min-h-screen items-center justify-center bg-[#F5F6F8]`}>
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0F2A4A]" />
          <p className="text-sm">Fetching shipment details…</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className={`${display.variable} ${mono.variable} flex min-h-screen items-center justify-center bg-[#F5F6F8] px-6`}>
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Package className="h-6 w-6" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900">
            Shipment not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We couldn&apos;t find a shipment for tracking number{" "}
            <span className="font-mono text-slate-700">{trackingNumber}</span>. Double-check the number and try
            again.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = JOURNEY.findIndex((s) => s.key === shipment.status);
  const isTerminalAlt = !!TERMINAL_ALT[shipment.status];
  const tone = statusTone(shipment.status);

  const sortedTrackings = [...shipment.trackings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const toneStyles: Record<string, string> = {
    active: "bg-[#0F2A4A] text-white",
    delivered: "bg-[#1F8A5C] text-white",
    cancelled: "bg-slate-700 text-white",
    returned: "bg-[#B5471B] text-white",
  };

  return (
    <div className={`${display.variable} ${mono.variable} min-h-screen bg-[#F5F6F8] pb-16`}>
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Track shipment
              </p>
              <div className="mt-1 flex items-center gap-2">
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900">
                  {shipment.trackingNumber}
                </h1>
                <button
                  onClick={copyTrackingNumber}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Copy tracking number"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied && <span className="text-xs text-[#1F8A5C]">Copied</span>}
              </div>
            </div>

            <span
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold tracking-wide ${toneStyles[tone]}`}
            >
              {prettyLabel(shipment.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6">
        {/* Journey tracker */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          {isTerminalAlt ? (
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneStyles[tone]}`}>
                {shipment.status === "RETURNED" ? (
                  <MapPin className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{prettyLabel(shipment.status)}</p>
                <p className="text-xs text-slate-500">This shipment did not complete a standard delivery route.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              {JOURNEY.map((step, i) => {
                const done = currentStepIndex >= 0 && i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
                    <div className="flex w-full items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition ${
                          done
                            ? "border-[#0F2A4A] bg-[#0F2A4A] text-white"
                            : "border-slate-200 bg-white text-slate-300"
                        } ${isCurrent ? "ring-4 ring-[#0F2A4A]/10" : ""}`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      {i < JOURNEY.length - 1 && (
                        <div
                          className={`h-[2px] flex-1 transition ${
                            currentStepIndex > i ? "bg-[#0F2A4A]" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-center text-[11px] font-medium ${
                        done ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Route strip */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Origin</p>
            <p className="mt-0.5 text-[15px] font-semibold text-slate-900">{shipment.vendor.location}</p>
            <p className="text-xs text-slate-500">{shipment.vendor.companyName}</p>
          </div>
          <div className="flex flex-1 items-center gap-2 px-2 text-slate-300">
            <div className="h-[2px] flex-1 bg-slate-200" />
            <Truck className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="h-[2px] flex-1 bg-slate-200" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Destination</p>
            <p className="mt-0.5 text-[15px] font-semibold text-slate-900">{shipment.priceLocation.location}</p>
            <p className="text-xs text-slate-500">{shipment.receiverAddress}</p>
          </div>
        </div>

        {/* Detail grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card title="Receiver" icon={User}>
            <DetailRow label="Name" value={shipment.receiverName} />
            <DetailRow label="Phone" value={shipment.receiverPhone} mono />
            <DetailRow label="Address" value={shipment.receiverAddress} />
          </Card>

          <Card title="Package" icon={Package}>
            <DetailRow label="Type" value={shipment.packageType} />
            <DetailRow label="Weight" value={`${shipment.weight} kg`} />
            <DetailRow label="Payment" value={shipment.paymentType} />
            {shipment.paymentType === "COD" && (
              <DetailRow label="COD amount" value={formatMoney(shipment.codAmount)} />
            )}
            <DetailRow label="Shipping charge" value={formatMoney(shipment.shippingCharge)} />
            {shipment.notes && <DetailRow label="Notes" value={shipment.notes} />}
          </Card>

          <Card title="Assigned rider" icon={Bike}>
            {shipment.riderId ? (
              <>
                <DetailRow label="Rider" value={shipment.rider?.name ?? `Rider #${shipment.riderId}`} />
                {shipment.rider?.phone && <DetailRow label="Phone" value={shipment.rider.phone} mono />}
              </>
            ) : (
              <p className="py-2.5 text-[14px] text-slate-400">Not yet assigned</p>
            )}
          </Card>

          <Card title="Vendor" icon={Building2}>
            <DetailRow label="Company" value={shipment.vendor.companyName} />
            <DetailRow label="Contact" value={shipment.vendor.contactId} />
            <DetailRow label="Location" value={shipment.vendor.location} />
          </Card>
        </div>

        {/* QR code */}
        {shipment.qrCode && (
          <div className="mt-6 flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5">
            <img
              src={shipment.qrCode}
              alt="Shipment QR code"
              className="h-20 w-20 rounded-lg border border-slate-100"
            />
            <div>
              <p className="text-[14px] font-semibold text-slate-900">Scan to track</p>
              <p className="text-[13px] text-slate-500">
                Show this code at any partner counter to pull up this shipment instantly.
              </p>
            </div>
          </div>
        )}

        {/* Tracking history */}
        <div className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900">
            Tracking history
          </h2>

          <div className="mt-4 space-y-0">
            {sortedTrackings.map((item, i) => (
              <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                      i === 0
                        ? "border-[#0F2A4A] bg-[#0F2A4A] text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  {i < sortedTrackings.length - 1 && (
                    <span className="w-[2px] flex-1 bg-slate-200" />
                  )}
                </div>

                <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold text-slate-900">{prettyLabel(item.status)}</p>
                    <p className="font-mono text-[12px] text-slate-400">{formatDate(item.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-[13px] text-slate-600">{item.location}</p>
                  {item.message && <p className="mt-0.5 text-[13px] text-slate-500">{item.message}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}