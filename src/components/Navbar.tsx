"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { mainNavLinks, pagesDropdown } from "@/data/navigation";

export default function Navbar() {
  const [pagesOpen, setPagesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-xl">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image
            src="/image.png"
            alt="Rocketshi]ing logo"
            width={140}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </a>
        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {mainNavLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-black/80 hover:text-black"
            >
              {link.label}
            </a>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setPagesOpen(true)}
            onMouseLeave={() => setPagesOpen(false)}
          >
            <button
              onClick={() => setPagesOpen(!pagesOpen)}
              className="flex items-center gap-1 text-sm font-medium text-black/80 hover:text-black"
            >
              Pages
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  pagesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {pagesOpen && (
              <div className="absolute top-full left-1/2 mt-3 w-48 -translate-x-1/2 rounded-xl bg-white shadow-xl">
                {pagesDropdown.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-3 hover:bg-gray-100"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Button */}
        <motion.a
          whileHover={{ color: "#ffffff", backgroundColor: "#000000" }}
          transition={{
            duration: 0.3,
          }}
          href="#quote"
          className="hidden items-center text-black gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold md:flex"
        >
          Contact us
          <ArrowRight size={16} />
        </motion.a>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-black"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute left-4 right-4 mt-3 rounded-2xl bg-white text-black p-4 shadow-2xl md:hidden z-[9999]">
          <div className="flex flex-col gap-2">
            {mainNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-gray-100"
              >
                {link.label}
              </a>
            ))}

            {pagesDropdown.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-gray-100"
              >
                {item.label}
              </a>
            ))}

            <a
              href="#quote"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-black py-3 text-white"
            >
              Contact us
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
