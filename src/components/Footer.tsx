import Image from "next/image";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b1729] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 lg:px-16 xl:px-20">
        {/* ================= MAIN FOOTER ================= */}
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-4">
          {/* ================= BRAND ================= */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <a
              href="/"
              aria-label="Rocket Shipping Home"
              className="inline-flex items-center"
            >
              <Image
                src="/icon.png"
                alt="Rocket Shipping"
                width={150}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </a>

            {/* Description */}
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/45">
              Reliable cargo and logistics solutions connecting businesses
              and people across Nepal and the world.
            </p>
          </div>

          {/* ================= COMPANY ================= */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
              Company
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li>
                <a
                  href="/"
                  className="transition-colors hover:text-white"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/aboutus"
                  className="transition-colors hover:text-white"
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="/services"
                  className="transition-colors hover:text-white"
                >
                  Services
                </a>
              </li>

              <li>
                <a
                  href="/pricing"
                  className="transition-colors hover:text-white"
                >
                  Pricing
                </a>
              </li>

              <li>
                <a
                  href="/contactus"
                  className="transition-colors hover:text-white"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* ================= SERVICES ================= */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
              Services
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li>
                <a
                  href="/services"
                  className="transition-colors hover:text-white"
                >
                  Express Cargo
                </a>
              </li>

              <li>
                <a
                  href="/services"
                  className="transition-colors hover:text-white"
                >
                  Bulk Cargo
                </a>
              </li>

              <li>
                <a
                  href="/services"
                  className="transition-colors hover:text-white"
                >
                  Door-to-Door Delivery
                </a>
              </li>

              <li>
                <a
                  href="/services"
                  className="transition-colors hover:text-white"
                >
                  International Shipping
                </a>
              </li>
            </ul>
          </div>

          {/* ================= CONTACT ================= */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/35">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              {/* Location */}
              <div className="flex gap-3">
                <MapPin
                  size={16}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-[#E23C2E]"
                />

                <p className="text-sm leading-5 text-white/55">
                  Kalanki,
                  <br />
                  Kathmandu, Nepal
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone
                  size={15}
                  strokeWidth={2}
                  className="shrink-0 text-[#E23C2E]"
                />

                <a
                  href="tel:9851053926"
                  className="text-sm text-white/55 transition-colors hover:text-white"
                >
                  985-1053926
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail
                  size={15}
                  strokeWidth={2}
                  className="shrink-0 text-[#E23C2E]"
                />

                <a
                  href="mailto:support@rocketshipping.com.np"
                  className="break-all text-sm text-white/55 transition-colors hover:text-white"
                >
                  support@rocketshipping.com.np
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="flex flex-col gap-5 pt-7 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright */}
          <p>
            © {new Date().getFullYear()} Rocket Shipping. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-5">
            {/*
            <a
              href="/privacy"
              className="transition-colors hover:text-white/70"
            >
              Privacy Policy
            </a>

            <a
              href="/terms"
              className="transition-colors hover:text-white/70"
            >
              Terms of Service
            </a>
            */}

            <a
              href="/track"
              className="inline-flex items-center gap-1 transition-colors hover:text-white/70"
            >
              Track Shipment

              <ArrowUpRight
                size={11}
                strokeWidth={2}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}