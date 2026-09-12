"use client";

import {
  Contact,
  Phone,
  Mail,
  Building2,
  Clock,
  MapPin,
  Navigation,
} from "lucide-react";

const OFFICE_ADDRESS =
  "Kathmandu Central Cargo Terminal, Ring Road Hub, Kathmandu, Nepal";

const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  OFFICE_ADDRESS
)}&output=embed`;

const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  OFFICE_ADDRESS
)}`;

export default function ContactInfo() {
  return (
    <aside className="w-full rounded-2xl border border-black/5 bg-white p-8 shadow-[0_20px_60px_-15px_rgba(23,28,43,0.15)] sm:p-10">
      {/* Heading */}
      <div className="mb-7 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E23C2E]/10">
          <Contact className="h-5 w-5 text-[#E23C2E]" />
        </div>
        <h2 className="text-xl font-bold text-[#0b1729]">
          Direct Contact Lines
        </h2>
      </div>

      <div className="space-y-6">
        {/* Phone */}
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E23C2E]/10">
            <Phone className="h-5 w-5 text-[#E23C2E]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.08em] text-black/40">
              CUSTOMER HELPLINE &amp; DISPATCH
            </p>
            <a
              href="tel:+97714XXXXXX"
              className="mt-1 block text-base font-bold text-[#0b1729] hover:text-[#E23C2E]"
            >
              +977 1 4XXXXXX
            </a>
            <a
              href="tel:+977980XXXXXX"
              className="mt-0.5 block text-sm text-black/45 hover:text-[#E23C2E]"
            >
              +977 980XXXXXX (Direct Dispatch Mobile)
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E23C2E]/10">
            <Mail className="h-5 w-5 text-[#E23C2E]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.08em] text-black/40">
              OFFICIAL MAILDESKS
            </p>
            <a
              href="mailto:support@rocketshipping.com.np"
              className="mt-1 block truncate text-base font-bold text-[#0b1729] hover:text-[#E23C2E]"
            >
              support@rocketshipping.com.np
            </a>
            <a
              href="mailto:cargo@rocketshipping.com.np"
              className="mt-0.5 block truncate text-sm text-black/45 hover:text-[#E23C2E]"
            >
              cargo@rocketshipping.com.np
            </a>
          </div>
        </div>

        {/* Office */}
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E23C2E]/10">
            <Building2 className="h-5 w-5 text-[#E23C2E]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.08em] text-black/40">
              CENTRAL OFFICE &amp; TERMINAL
            </p>
            <p className="mt-1 text-base font-semibold leading-6 text-[#0b1729]">
              {OFFICE_ADDRESS}
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-start gap-3 rounded-xl bg-[#f3f1fb] p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <Clock className="h-4.5 w-4.5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.08em] text-emerald-700">
              OPERATIONAL SCHEDULE
            </p>
            <p className="mt-1 text-sm text-[#0b1729]">
              <span className="font-bold">Sun – Fri:</span> 8:00 AM – 7:00 PM
            </p>
            <p className="text-sm text-[#0b1729]">
              <span className="font-bold">Saturday:</span> 10:00 AM – 4:00 PM
            </p>
            <span className="mt-2 inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Emergency Dispatch Open 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Location / map */}
      <div className="mt-8 border-t border-black/5 pt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#E23C2E]" />
            <p className="text-[11px] font-bold tracking-[0.08em] text-black/40">
              FIND US HERE
            </p>
          </div>
          <a
            href={MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#E23C2E] hover:text-[#c93427]"
          >
            <Navigation className="h-3.5 w-3.5" />
            Get Directions
          </a>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/10">
          <iframe
            title="Rocket Shipping — Kathmandu Central Cargo Terminal location"
            src={MAPS_EMBED_SRC}
            className="h-52 w-full grayscale-[15%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <p className="mt-3 text-sm font-semibold text-[#0b1729]">
          Kathmandu Central Cargo Terminal
        </p>
        <p className="text-xs text-black/45">Ring Road Hub, Kathmandu, Nepal</p>
      </div>
    </aside>
  );
}