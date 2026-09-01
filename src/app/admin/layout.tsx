"use client";

import { LayoutDashboard, Building2, Users, Truck, Receipt, BarChart3 ,User2Icon,BikeIcon} from "lucide-react";
import DashboardShell, { type NavLink } from "@/components/DashboardShell";

const ADMIN_NAV: NavLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/vendorDetails", label: "Vendors", icon: Building2 },
  { href: "/admin/riderDetails", label: "Riders", icon: BikeIcon },
  { href: "/admin/allUsers", label: "All user", icon: Users },

  { href: "/admin/shippingDetails", label: "Shipping Details", icon: Receipt },
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