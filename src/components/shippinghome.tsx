"use client";

import { useState } from "react";
import {
  MapPin,
  ArrowRight,
  Zap,
  Plane,
  Ship,
} from "lucide-react";

export default function ShipmentTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = () => {
    const tracking = trackingNumber.trim();

    if (!tracking) return;

    window.location.href = `https://www.rocketshippings.com/track/${encodeURIComponent(
      tracking
    )}`;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#f4f6fa]">
      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1715645948484-da40dd56bc93?fm=jpg&q=80&w=2400&auto=format&fit=crop')",
        }}
      />

      {/* =====================================================
          IMAGE OVERLAY
      ====================================================== */}
      <div className="absolute inset-0 -z-10 bg-white/80" />

      {/* Extra subtle left-to-right fade */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/90 via-white/75 to-white/70" />

      {/* =====================================================
          HERO CONTENT
      ====================================================== */}
      <div
        className="
          mx-auto
          flex
          min-h-[560px]
          w-full
          max-w-[1600px]
          items-center
          px-5
          pb-14
          pt-32
          sm:px-8
          sm:pb-16
          sm:pt-36
          md:min-h-[600px]
          md:px-12
          lg:px-20
          lg:pt-32
          xl:px-24
        "
      >
        <div className="w-full max-w-[760px]">

          {/* =================================================
              LABEL
          ================================================= */}
          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-gray-200
              bg-white/90
              px-3.5
              py-1.5
              text-[9px]
              font-bold
              tracking-[0.12em]
              text-gray-500
              shadow-sm
              backdrop-blur
              sm:text-[10px]
            "
          >
           

            GLOBAL CARGO & COURIER SERVICES
          </div>

          {/* =================================================
              TITLE
          ================================================= */}
          <h1
            className="
              max-w-[800px]
              text-4xl
              font-extrabold
              leading-[1.05]
              tracking-[-0.035em]
              text-[#17243b]
              sm:text-5xl
              md:text-6xl
              lg:text-[64px]
              xl:text-[70px]
            "
          >
            Track Your Shipment
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================= */}
          <p
            className="
              mt-5
              max-w-[700px]
              text-sm
              leading-6
              text-[#68758b]
              sm:text-base
              sm:leading-7
              md:text-[17px]
            "
          >
            Enter your tracking number to see the latest status,
            transit telemetry, and real-time location of your
            cargo manifest.
          </p>

          {/* =================================================
              TRACKING BOX
          ================================================= */}
          <div
            className="
              mt-7
              w-full
              max-w-[680px]
              rounded-2xl
              border
              border-white
              bg-white
              p-2.5
              shadow-[0_15px_45px_rgba(25,40,70,0.14)]
              sm:mt-8
              sm:p-3
            "
          >
            {/* INPUT + BUTTON */}
            <div className="flex flex-col gap-2.5 sm:flex-row">

              {/* INPUT */}
              <div className="relative flex-1">
                <MapPin
                  size={17}
                  strokeWidth={2}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-orange-500
                  "
                />

                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) =>
                    setTrackingNumber(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Enter tracking number (e.g. RC-1788...)"
                  className="
                    h-14
                    w-full
                    rounded-xl
                    bg-[#f0f4fc]
                    pl-11
                    pr-4
                    text-sm
                    text-gray-700
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:bg-white
                    focus:ring-2
                    focus:ring-orange-200
                  "
                />
              </div>

              {/* BUTTON */}
              <button
                type="button"
                onClick={handleTrack}
                className="
                  flex
                  h-14
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-orange-500
                  px-7
                  text-sm
                  font-bold
                  text-white
                  shadow-md
                  shadow-orange-500/20
                  transition-all
                  duration-200
                  hover:bg-orange-600
                  hover:shadow-lg
                  hover:shadow-orange-500/25
                  active:scale-[0.98]
                  sm:min-w-[185px]
                "
              >
                Track Shipment

                <ArrowRight size={17} />
              </button>
            </div>

            {/* =================================================
                EXAMPLE + WAYBILL
            ================================================= */}
            <div
              className="
                mt-3
                flex
                flex-col
                gap-2
                px-1
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p className="text-[10px] text-gray-400">
                Example:

                <span className="ml-1 font-semibold text-orange-500">
                  RC-1788192647821-759
                </span>
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[9px]
                  font-semibold
                  tracking-wide
                  text-gray-400
                "
              >
                <Zap
                  size={11}
                  className="text-orange-500"
                />

                INSTANT WAYBILL SCAN
              </div>
            </div>

            {/* =================================================
                MODES
            ================================================= */}
            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-2
                px-1
              "
            >
              <span
                className="
                  mr-1
                  text-[9px]
                  font-bold
                  tracking-wide
                  text-gray-400
                "
              >
                MODES:
              </span>

              {/* Domestic */}
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[#f1f4f9]
                  px-3
                  py-1.5
                  text-[9px]
                  font-semibold
                  text-gray-500
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />

                Domestic Freight
              </span>

              {/* Air */}
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[#f1f4f9]
                  px-3
                  py-1.5
                  text-[9px]
                  font-semibold
                  text-gray-500
                "
              >
                <Plane
                  size={10}
                  className="text-orange-500"
                />

                International Air
              </span>

              {/* Sea */}
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[#f1f4f9]
                  px-3
                  py-1.5
                  text-[9px]
                  font-semibold
                  text-gray-500
                "
              >
                <Ship
                  size={10}
                  className="text-orange-500"
                />

                Container Sea
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}