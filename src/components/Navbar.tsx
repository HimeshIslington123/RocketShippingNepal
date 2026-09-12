"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Truck,
  Package,
} from "lucide-react";
import { pagesDropdown } from "@/data/navigation";

const mainNavLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Track Shipment", href: "/track" },
];

export default function Navbar() {
  const [pagesOpen, setPagesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 20);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-transparent bg-white px-5 py-3 shadow-xl">

        {/* =====================================================
            LOGO
        ====================================================== */}

        <a href="/" className="flex items-center">
          <Image
            src="/image.png"
            alt="Rocketshipping logo"
            width={140}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </a>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <div className="hidden items-center gap-8 md:flex">

          {mainNavLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-black/80 transition-colors hover:text-black"
            >
              {link.label}
            </a>
          ))}

          {/* =================================================
              PAGES DROPDOWN
          ================================================== */}

          <div
            className="relative"
            onMouseEnter={() => setPagesOpen(true)}
            onMouseLeave={() => setPagesOpen(false)}
          >
            <button
              onClick={() =>
                setPagesOpen(!pagesOpen)
              }
              className="flex items-center gap-1 text-sm font-medium text-black/80 transition-colors hover:text-black"
            >
              Pages

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  pagesOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {pagesOpen && (
              <div className="absolute left-1/2 top-full mt-3 w-48 -translate-x-1/2 rounded-xl bg-white shadow-xl">
                {pagesDropdown.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-3 text-black/80 transition-colors hover:bg-gray-100"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            TRACK BUTTONS
        ====================================================== */}

        <div className="hidden items-center gap-3 md:flex">

          {/* Track Vehicle */}
          <a
            href="/track"
            className="flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#1e8449] bg-white px-5 py-2.5 text-sm font-semibold text-[#1e8449] transition-all duration-200 hover:bg-[#1e8449] hover:text-white"
          >
            <Truck className="h-4 w-4" />
            Track Vehicle
          </a>

          {/* Track Shipment */}
          <a
            href="/track"
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[#1e8449] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3cb878]"
          >
            <Package className="h-4 w-4" />
            Track Shipment
          </a>

        </div>

        {/* =====================================================
            MOBILE TOGGLE
        ====================================================== */}

        <button
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          className="text-black transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={26} />
          ) : (
            <Menu size={26} />
          )}
        </button>
      </nav>

      {/* =======================================================
          MOBILE MENU
      ======================================================== */}

      {mobileOpen && (
        <div className="absolute left-4 right-4 z-[9999] mt-3 rounded-2xl bg-white p-4 text-black shadow-2xl md:hidden">

          <div className="flex flex-col gap-2">

            {/* Main Links */}

            {mainNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="rounded-lg px-3 py-3 transition-colors hover:bg-gray-100"
              >
                {link.label}
              </a>
            ))}

            {/* Pages */}

            {pagesDropdown.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="rounded-lg px-3 py-3 transition-colors hover:bg-gray-100"
              >
                {item.label}
              </a>
            ))}

            {/* =================================================
                MOBILE TRACK VEHICLE
            ================================================== */}

            <a
              href="/track"
              onClick={() =>
                setMobileOpen(false)
              }
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-[#1e8449] bg-white py-3 text-sm font-semibold text-[#1e8449] transition-all duration-200 hover:bg-[#1e8449] hover:text-white"
            >
              <Truck className="h-4 w-4" />
              Track Vehicle
            </a>

            {/* =================================================
                MOBILE TRACK SHIPMENT
            ================================================== */}

            <a
              href="/track"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1e8449] py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3cb878]"
            >
              <Package className="h-4 w-4" />
              Track Shipment
            </a>

          </div>
        </div>
      )}
    </header>
  );
}