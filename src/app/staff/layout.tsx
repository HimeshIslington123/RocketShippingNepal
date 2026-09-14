"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  UserRound,
  LocateIcon,
  ArrowLeft,
} from "lucide-react";

import DashboardShell, {
  type NavLink,
} from "@/components/DashboardShell";

const STAFF_NAV: NavLink[] = [
  {
    href: "/staff",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/staff/shipping",
    label: "Shipments creation",
    icon: PackageSearch,
  },
  {
    href: "/staff/shippingdetails",
    label: "Shipments Details",
    icon: PackageSearch,
  },
  {
    href: "/staff/returns",
    label: "Return request",
    icon: ArrowLeft,
  },
 
  {
    href: "/staff/pickupRequest",
    label: "Pickup Request",
    icon: UserRound,
  },
];

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Not logged in
    if (!token) {
      router.replace("/login");
      return;
    }

    // Only STAFF can access /staff
    if (role?.toUpperCase() !== "STAFF") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router]);

  // Prevent dashboard from showing before access check
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  return (
    <DashboardShell
      navLinks={STAFF_NAV}
      roleName="Staff Portal"
      roleTag="STAFF"
      userName="Ramesh Shrestha"
      primaryAction={{
        label: "Log Pickup",
        href: "/staff/shipping",
      }}
    >
      {children}
    </DashboardShell>
  );
}