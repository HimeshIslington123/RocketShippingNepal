"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  BikeIcon,
  ArrowLeft,MapIcon
} from "lucide-react";

import DashboardShell, {
  type NavLink,
} from "@/components/DashboardShell";

const ADMIN_NAV: NavLink[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/vendorDetails",
    label: "Vendors",
    icon: Building2,
  },
  {
    href: "/admin/riderDetails",
    label: "Riders",
    icon: BikeIcon,
  },
  {
    href: "/admin/allUsers",
    label: "All user",
    icon: Users,
  },
  {
    href: "/admin/shippingDetails",
    label: "Shipping Details",
    icon: Receipt,
  },
  {
    href: "/admin/return",
    label: "Return details",
    icon: ArrowLeft,
  },
   {
    href: "/admin/location",
    label: "Rates & Location",
    icon: MapIcon,
  },
  
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role?.toUpperCase() !== "ADMIN") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  return (
    <DashboardShell
      navLinks={ADMIN_NAV}
      roleName="Admin Console"
      roleTag="SUPER ADMIN"
      userName="Admin"
      primaryAction={{
        label: "Create shipping",
        href: "/admin/shipping",
      }}
    >
      {children}
    </DashboardShell>
  );
}