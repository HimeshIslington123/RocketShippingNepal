"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Truck,
  Wallet,
  PackageCheck,
  Clock,
  XCircle,
  Bike,
  LucideIcon,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalShippingCharges: number;
  codCollected: number;
  totalRevenue: number;
  activeRiders: number;
  totalVendors: number;
  totalCustomers: number;
}

interface StatCard {
  label: string;
  value: string | number;
  tag: string;
  tagColor: string;
  icon: LucideIcon;
}

interface StatusCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

const PENDING_APPROVALS = [
  { name: "Himalayan Freight Co.", type: "Vendor application", submitted: "2 hours ago" },
  { name: "Sagar Thapa", type: "Staff onboarding", submitted: "5 hours ago" },
  { name: "Annapurna Traders", type: "Vendor document update", submitted: "Yesterday" },
];

function formatNPR(amount: number | null | undefined): string {
  if (amount == null) return "NPR 0";
  return `NPR ${Number(amount).toLocaleString("en-IN")}`;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        setLoading(true);
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`
);
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(`Request failed: ${res.status} ${body}`);
        }
        const json: DashboardStats = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const STATS: StatCard[] = data
    ? [
        {
          label: "Total Vendors",
          value: data.totalVendors,
          tag: "Active",
          tagColor: "text-green-600 bg-green-50",
          icon: Building2,
        },
        {
          label: "Total Customers",
          value: data.totalCustomers,
          tag: "Registered",
          tagColor: "text-blue-600 bg-blue-50",
          icon: Users,
        },
        {
          label: "Active Riders",
          value: data.activeRiders,
          tag: "Available",
          tagColor: "text-blue-600 bg-blue-50",
          icon: Bike,
        },
        {
          label: "Total Orders",
          value: data.totalOrders,
          tag: "All time",
          tagColor: "text-blue-600 bg-blue-50",
          icon: Truck,
        },
        {
          label: "Platform Revenue",
          value: formatNPR(data.totalRevenue),
          tag: "Shipping charges",
          tagColor: "text-green-600 bg-green-50",
          icon: Wallet,
        },
        {
          label: "COD Collected",
          value: formatNPR(data.codCollected),
          tag: "Delivered COD",
          tagColor: "text-green-600 bg-green-50",
          icon: Wallet,
        },
      ]
    : [];

  const ORDER_STATUS: StatusCard[] = data
    ? [
        {
          label: "Pending",
          value: data.pendingOrders,
          icon: Clock,
          color: "text-amber-600 bg-amber-50",
        },
        {
          label: "In Transit",
          value: data.inTransitOrders,
          icon: Truck,
          color: "text-blue-600 bg-blue-50",
        },
        {
          label: "Delivered",
          value: data.deliveredOrders,
          icon: PackageCheck,
          color: "text-green-600 bg-green-50",
        },
        {
          label: "Cancelled",
          value: data.cancelledOrders,
          icon: XCircle,
          color: "text-red-600 bg-red-50",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl text-black">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            Platform-wide activity across vendors, staff, and shipments.
          </p>
        </div>
        <button className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-black/[0.03]">
          ⬇️ Export Report
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load dashboard stats: {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[124px] animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stat.tagColor}`}
                  >
                    {stat.tag}
                  </span>
                </div>
                <p className="mt-4 text-sm text-ink/50">{stat.label}</p>
                <p className="font-display text-2xl font-extrabold text-ink">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && data && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold text-ink">
            Order Status Breakdown
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ORDER_STATUS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-black/5 p-4">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <p className="mt-3 text-xs text-ink/50">{s.label}</p>
                  <p className="font-display text-lg font-extrabold text-ink">
                    {s.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="font-display text-lg font-bold text-ink">Pending Approvals</h2>
        <ul className="mt-4 divide-y divide-black/5">
          {PENDING_APPROVALS.map((item) => (
            <li key={item.name} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-semibold text-ink">{item.name}</p>
                <p className="text-[12px] text-ink/45">{item.type}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-ink/40">{item.submitted}</span>
                <button className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-accent-dark">
                  Review
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}