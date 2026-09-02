"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Receipt,
  UserRound,
  PlusCircle,
} from "lucide-react";

import DashboardShell, {
  type NavLink,
} from "@/components/DashboardShell";

const VENDOR_NAV: NavLink[] = [
  {
    href: "/vendor",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/vendor/pickup",
    label: "Pickup",
    icon: Truck,
  },
  {
    href: "/vendor/View",
    label: "View shipping",
    icon: Receipt,
  },
  {
    href: "/vendor/order",
    label: "New Shipment",
    icon: PlusCircle,
  },
  {
    href: "/vendor/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // No login
    if (!token) {
      router.replace("/login");
      return;
    }

    // Only VENDOR can access /vendor
    if (role?.toUpperCase() !== "VENDOR") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router]);

  // Prevent dashboard from flashing before role is checked
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  return (
    <DashboardShell
      navLinks={VENDOR_NAV}
      roleName="Enterprise Logistics"
      roleTag="GOLD VENDOR"
      userName="Everest Tradings"
      primaryAction={{
        label: "New Shipment",
        href: "/vendor/order",
      }}
    >
      {children}
    </DashboardShell>
  );
}