"use client";

import { LayoutDashboard, Truck, Receipt, UserRound } from "lucide-react";
import DashboardShell, { type NavLink } from "@/components/DashboardShell";

const VENDOR_NAV: NavLink[] = [
  { href: "/vendor", label: "Overview", icon: LayoutDashboard },
  { href: "/vendor/pickup", label: "Pickup", icon: Truck },
  { href: "/vendor/invoices", label: "Invoices", icon: Receipt },
  { href: "/vendor/profile", label: "Profile", icon: UserRound },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navLinks={VENDOR_NAV}
      roleName="Enterprise Logistics"
      roleTag="GOLD VENDOR"
      userName="Everest Tradings"
      primaryAction={{ label: "New Shipment", href: "/vendor/shipments/new" }}
    >
      {children}
    </DashboardShell>
  );
}