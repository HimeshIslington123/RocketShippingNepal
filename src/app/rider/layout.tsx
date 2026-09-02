"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    href: "/rider/pickuprequest",
    label: "Pickup",
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

    // Only RIDER can access /rider
    if (role?.toUpperCase() !== "RIDER") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router]);

  // Don't show rider dashboard while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

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