"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X, Truck, Package } from "lucide-react";

const mainNavLinks = [
  { label: "About us", href: "aboutus" },
  { label: "Pricing", href: "/pricing" },
  { label: "Services", href: "/services" },
  { label: "Contact Us", href: "/contactus" },
  { label: "Login", href: "/login" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] w-full">
      {/* ================= NAVBAR ================= */}
      <nav className="w-full border-b border-black/[0.06] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <div
          className="
            flex h-[76px] w-full
            items-center
            justify-between
            px-6
            sm:px-8
            lg:px-10
            xl:px-12
            2xl:px-14
          "
        >
          {/* ================= LOGO ================= */}
          <a
            href="/"
            aria-label="RocketShipping Home"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/image.png"
              alt="RocketShipping Cargo & Logistics"
              width={150}
              height={43}
              priority
              className="h-10 w-auto object-contain"
            />
          </a>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <div className="hidden flex-1 items-center justify-end md:flex">
            {/* Main Navigation */}
            <div className="flex items-center gap-7 lg:gap-8">
              {mainNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="
                    flex
                    h-[76px]
                    cursor-pointer
                    items-center
                    whitespace-nowrap
                    text-[14px]
                    font-medium
                    text-[#0b1729]/80
                    transition-colors
                    duration-200
                    hover:text-[#E23C2E]
                  "
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="mx-6 h-8 w-px bg-black/10" />

            {/* ================= TRACKING BUTTONS ================= */}
            <div className="flex shrink-0 items-center gap-2.5">
              {/* Track Vehicle */}
              <a
                href="/track"
                className="
                  flex h-11
                  shrink-0
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  whitespace-nowrap
                  rounded-full
                  border
                  border-[#E23C2E]
                  bg-white
                  px-5
                  text-[14px]
                  font-semibold
                  text-[#E23C2E]
                  transition-all
                  duration-200
                  hover:bg-[#E23C2E]
                  hover:text-white
                "
              >
                <Truck
                  className="h-[17px] w-[17px] shrink-0"
                  strokeWidth={2}
                />

                <span>Track Vehicle</span>
              </a>

              {/* Track Shipment */}
              <a
                href="/track"
                className="
                  flex h-11
                  shrink-0
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  whitespace-nowrap
                  rounded-full
                  bg-[#E23C2E]
                  px-5
                  text-[14px]
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-[#CE3122]
                "
              >
                <Package
                  className="h-[17px] w-[17px] shrink-0"
                  strokeWidth={2}
                />

                <span>Track Shipment</span>
              </a>
            </div>
          </div>

          {/* ================= MOBILE BUTTON ================= */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="
              ml-auto
              flex
              h-10
              w-10
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-[#0b1729]
              transition-colors
              duration-200
              hover:bg-[#E23C2E]/10
              hover:text-[#E23C2E]
              md:hidden
            "
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={2} />
            )}
          </button>
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div
          className="
            w-full
            border-b
            border-black/[0.06]
            bg-white
            shadow-[0_10px_30px_rgba(0,0,0,0.08)]
            md:hidden
          "
        >
          <div className="w-full px-6 py-5 sm:px-8">
            {/* Navigation Links */}
            <div className="flex flex-col">
              {mainNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="
                    flex
                    min-h-12
                    cursor-pointer
                    items-center
                    rounded-xl
                    px-4
                    text-[14px]
                    font-medium
                    text-[#0b1729]/80
                    transition-all
                    duration-200
                    hover:bg-[#E23C2E]/5
                    hover:text-[#E23C2E]
                  "
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="my-4 h-px w-full bg-black/[0.07]" />

            {/* Tracking Buttons */}
            <div className="flex flex-col gap-3">
              {/* Track Vehicle */}
              <a
                href="/track"
                onClick={() => setMobileOpen(false)}
                className="
                  flex h-12 w-full
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  border
                  border-[#E23C2E]
                  bg-white
                  text-sm
                  font-semibold
                  text-[#E23C2E]
                  transition-all
                  duration-200
                  hover:bg-[#E23C2E]
                  hover:text-white
                "
              >
                <Truck
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={2}
                />

                <span>Track Vehicle</span>
              </a>

              {/* Track Shipment */}
              <a
                href="/track"
                onClick={() => setMobileOpen(false)}
                className="
                  flex h-12 w-full
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2.5
                  rounded-xl
                  bg-[#E23C2E]
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:bg-[#CE3122]
                "
              >
                <Package
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={2}
                />

                <span>Track Shipment</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}