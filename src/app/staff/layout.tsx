"use client";

import { LayoutDashboard, PackageSearch, ScanLine, UserRound } from "lucide-react";
import DashboardShell, { type NavLink } from "@/components/DashboardShell";

const STAFF_NAV: NavLink[] = [
  { href: "/staff", label: "Overview", icon: LayoutDashboard },
  { href: "/staff/shipping", label: " Shipments creation", icon: PackageSearch },
  { href: "/staff/scan", label: "Scan & Update", icon: ScanLine },
  { href: "/staff/pickupRequest", label: "Pickup Request", icon: UserRound },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navLinks={STAFF_NAV}
      roleName="Staff Portal"
      roleTag="STAFF"
      userName="Ramesh Shrestha"
      primaryAction={{ label: "Log Pickup", href: "/staff/assigned" }}
    >
      {children}
    </DashboardShell>
  );
}