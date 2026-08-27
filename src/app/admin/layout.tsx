"use client";

import { LayoutDashboard, Building2, Users, Truck, Receipt, BarChart3 } from "lucide-react";
import DashboardShell, { type NavLink } from "@/components/DashboardShell";

const ADMIN_NAV: NavLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/vendorDetails", label: "Vendors", icon: Building2 },
  { href: "/admin/riderDetails", label: "Riders", icon: Users },
  { href: "/admin/shipments", label: "Shipments", icon: Truck },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navLinks={ADMIN_NAV}
      roleName="Admin Console"
      roleTag="SUPER ADMIN"
      userName="Admin"
      primaryAction={{ label: "Add Vendor", href: "/admin/vendors/new" }}
    >
      {children}
    </DashboardShell>
  );
}