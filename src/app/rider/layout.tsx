"use client";

import { LayoutDashboard, Package, User } from "lucide-react";
import DashboardShell, {
  type NavLink,
} from "@/components/DashboardShell";
import RiderTracker from "@/components/RiderTracker";

const RIDER_NAV: NavLink[] = [
  {
    href: "/rider",
    label: "My Deliveries",
    icon: LayoutDashboard,
  },
  {
    href: "/rider/history",
    label: "Delivery History",
    icon: Package,
  },
  {
    href: "/rider/profile",
    label: "Profile",
    icon: User,
  },
];

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      navLinks={RIDER_NAV}
      roleName="Rider Console"
      roleTag="RIDER"
      userName="Rider"
      primaryAction={undefined}
    >
      <RiderTracker />

      {children}
    </DashboardShell>
  );
}