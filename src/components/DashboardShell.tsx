"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Grid3x3,
  HelpCircle,
  Settings,
  Plus,
  Menu,
  LogOutIcon,
  X,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export default function DashboardShell({
  navLinks,
  roleName,
  roleTag,
  userName,
  primaryAction,
  children,
}: {
  navLinks: NavLink[];
  roleName: string;
  roleTag: string;
  userName: string;
  primaryAction?: { label: string; href: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f3ef]">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#1c1410] px-4 py-6 text-white transition-transform duration-200 ease-out md:relative md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <Image
                src="/image.png"
                alt="Rocket Shipping"
                width={140}
                height={40}
                priority
                className="h-10 w-auto object-contain"
              />
            </span>

            <div>
              <p className="font-display text-base font-bold leading-tight">
                Rocket Shipping
              </p>
              <p className="text-[11px] text-white/40">{roleName}</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-accent text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {link.label}
              </Link>
            );
          })}

          {primaryAction && (
            <Link
              href={primaryAction.href}
              onClick={() => setMobileOpen(false)}
              className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              <Plus className="h-4 w-4" />
              {primaryAction.label}
            </Link>
          )}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-4">
          <Link
            href="/support"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/45 hover:text-white"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
            Support
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/45 hover:text-white"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>

           <Link
            href="/logout"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/45 hover:text-white"
          >
            <LogOutIcon className="h-[18px] w-[18px]" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Right Side */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex shrink-0 items-center gap-2 border-b border-black/5 bg-black px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <button
            className="rounded-lg p-2 hover:bg-black/5 md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="hidden flex-1 items-center gap-2 rounded-lg bg-black/5 px-3 py-2 sm:flex">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search Tracking ID, Invoices..."
              className="w-full bg-transparent outline-none"
            />
          </div>

          <button className="ml-auto rounded-lg p-2 hover:bg-black/5 sm:hidden">
            <Search className="h-[18px] w-[18px]" />
          </button>

          <button className="relative rounded-lg p-2 hover:bg-black/5">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className="hidden rounded-lg p-2 hover:bg-black/5 sm:block">
            <Grid3x3 className="h-[18px] w-[18px]" />
          </button>

          <div className="flex items-center gap-3 border-l border-black/10 pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs font-semibold text-accent">
                {roleTag}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}