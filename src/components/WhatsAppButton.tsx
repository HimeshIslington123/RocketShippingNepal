"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";

function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.35.62 4.556 1.704 6.468L2.667 29.333l7.047-1.654A13.27 13.27 0 0 0 16 29.333C23.364 29.333 29.333 23.364 29.333 16S23.364 2.667 16 2.667Z"
        fill="white"
      />
      <path
        d="M16 5.333C10.109 5.333 5.333 10.109 5.333 16c0 2.11.615 4.078 1.676 5.738l-.978 3.576 3.67-.96A10.61 10.61 0 0 0 16 26.667c5.891 0 10.667-4.776 10.667-10.667S21.891 5.333 16 5.333Z"
        fill="#25D366"
      />
      <path
        d="M21.333 18.77c-.293-.147-1.735-.856-2.003-.954-.269-.098-.464-.147-.66.147-.195.293-.757.954-.928 1.15-.17.195-.342.22-.635.073-.293-.147-1.238-.456-2.358-1.456-.872-.778-1.461-1.74-1.632-2.033-.171-.293-.018-.451.129-.597.132-.132.293-.342.44-.513.146-.171.195-.293.293-.488.098-.195.049-.366-.024-.513-.073-.146-.66-1.59-.904-2.178-.238-.572-.48-.494-.66-.503l-.562-.01c-.195 0-.513.073-.782.366-.268.293-1.025 1.002-1.025 2.446s1.05 2.837 1.196 3.032c.147.195 2.067 3.154 5.006 4.422.7.302 1.247.482 1.674.617.703.224 1.343.192 1.849.116.564-.084 1.735-.71 1.979-1.394.244-.684.244-1.27.17-1.393-.072-.122-.268-.195-.561-.342Z"
        fill="white"
      />
    </svg>
  );
}

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const phoneNumber = "9779851053926";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    "Hello RocketShipping, I would like to know more about your shipping services."
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* WhatsApp Popup */}
      {open && (
        <div className="absolute bottom-16 right-0 mb-3 w-[310px] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
          {/* Header */}
          <div className="bg-[#0b1729] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {/* RocketShipping Logo */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="/image.png"
                    alt="RocketShipping"
                    width={42}
                    height={42}
                    className="h-9 w-auto object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    RocketShipping
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#25D366]" />

                    <p className="text-[11px] text-white/65">
                      Usually replies quickly
                    </p>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-3 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/50 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                aria-label="Close WhatsApp popup"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="p-5">
            <div className="rounded-xl bg-[#f5f6f8] px-4 py-3.5">
              <p className="text-sm leading-6 text-[#0b1729]">
              Hello! How can we help you with your shipment?
              </p>
            </div>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#20bd5a] hover:shadow-[0_6px_18px_rgba(37,211,102,0.25)]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          open ? "Close WhatsApp chat" : "Open WhatsApp chat"
        }
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all duration-200 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-[0_10px_30px_rgba(37,211,102,0.45)] active:scale-95"
      >
        {open ? (
          <X
            className="h-6 w-6"
            strokeWidth={2.5}
          />
        ) : (
          <WhatsAppIcon className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}