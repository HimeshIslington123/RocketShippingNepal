"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

const reasons = [
  "Careful handling from pickup to delivery",
  "Clear shipment information and tracking",
  "Flexible solutions for individuals and businesses",
  "Local delivery support across Nepal",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-[#0b1729]">

        {/* ================================================================
            HERO — SAME HEIGHT AS CONTACT + SERVICES
        ================================================================ */}

        <section className="relative h-[520px] overflow-hidden bg-[#0b1729] pt-[76px]">

          <Image
            src="/NEPAL.png"
            alt="RocketShipping Cargo and Logistics Nepal"
            fill
            priority
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-[#0b1729]/65" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1729]/95 via-[#0b1729]/75 to-[#0b1729]/35" />

          <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-6 sm:px-10 lg:px-16 xl:px-20">

            <div className="max-w-[760px]">

              <div className="mb-6 flex items-center gap-3">
                <span className="h-[2px] w-9 bg-[#E23C2E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                  About RocketShipping
                </span>
              </div>

              <h1 className="text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[68px]">
                Moving your cargo
                <br />
                <span className="text-[#E23C2E]">
                  with confidence.
                </span>
              </h1>

              <p className="mt-7 max-w-[650px] text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                RocketShipping Cargo &amp; Logistics is focused on making
                cargo movement simpler, safer, and more dependable for
                customers and businesses in Nepal and beyond.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">

                <a
                  href="/services"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="/contactus"
                  className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white px-6 text-sm font-semibold text-[#0b1729] transition-colors duration-200 hover:bg-[#E23C2E] hover:text-white"
                >
                  Contact Us
                </a>

              </div>

            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#E23C2E] via-[#E23C2E]/40 to-transparent" />

        </section>

        {/* ================================================================
            WHO WE ARE
        ================================================================ */}

        <section className="py-20 sm:py-24 lg:py-28">

          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">

            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">

              <div>

                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#E23C2E]" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                    Who We Are
                  </span>
                </div>

                <h2 className="mt-5 max-w-sm text-3xl font-bold leading-tight tracking-tight text-[#0b1729] sm:text-4xl">
                  Logistics should make things easier.
                </h2>

              </div>

              <div className="max-w-2xl">

                <p className="text-base leading-8 text-black/65">
                  Sending cargo should not feel complicated. From arranging
                  pickup to getting a shipment delivered, customers need a
                  logistics partner that understands the importance of their
                  goods and keeps the process clear.
                </p>

                <p className="mt-6 text-base leading-8 text-black/65">
                  RocketShipping was built with that idea in mind. We provide
                  practical cargo and delivery solutions for individuals,
                  businesses, and growing commerce that need to move goods
                  within Nepal or to international destinations.
                </p>

                <p className="mt-6 text-base leading-8 text-black/65">
                  Our approach is straightforward: handle shipments carefully,
                  communicate clearly, and make every stage of the delivery
                  process easier for our customers.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================================
            OUR APPROACH
        ================================================================ */}

        <section className="border-y border-black/[0.06] bg-[#f6f7f9] py-20 sm:py-24 lg:py-28">

          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">

            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">

              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#0b1729]">

                <Image
                  src="/image.png"
                  alt="RocketShipping Cargo & Logistics"
                  fill
                  className="object-contain p-12 sm:p-16"
                />

                <div className="absolute inset-0 bg-[#0b1729]/10" />

                <div className="absolute bottom-5 left-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#0b1729] shadow-lg">
                    <MapPin
                      className="h-4 w-4 text-[#E23C2E]"
                      strokeWidth={2}
                    />
                    Kathmandu, Nepal
                  </div>
                </div>

              </div>

              <div>

                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#E23C2E]" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                    Our Approach
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#0b1729] sm:text-4xl">
                  Simple process.
                  <br />
                  Reliable service.
                </h2>

                <p className="mt-5 text-sm leading-7 text-black/60 sm:text-base">
                  Every shipment is different, but the things that matter to
                  customers remain the same: safe handling, clear information,
                  dependable transportation, and support when it is needed.
                </p>

                <div className="mt-8 space-y-4">

                  {reasons.map((reason) => (
                    <div
                      key={reason}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-[19px] w-[19px] shrink-0 text-[#E23C2E]"
                        strokeWidth={2}
                      />

                      <span className="text-sm leading-6 text-[#0b1729]/75">
                        {reason}
                      </span>
                    </div>
                  ))}

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================================
            WHAT MATTERS
        ================================================================ */}

        <section className="py-20 sm:py-24 lg:py-28">

          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">

            <div className="max-w-2xl">

              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#E23C2E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                  What Matters To Us
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#0b1729] sm:text-4xl">
                The basics of good logistics.
              </h2>

              <p className="mt-5 text-sm leading-7 text-black/55 sm:text-base">
                We keep our focus on the parts of shipping that make the
                biggest difference to customers.
              </p>

            </div>

            <div className="mt-14 grid border-y border-black/10 md:grid-cols-3">

              <div className="py-8 md:border-r md:border-black/10 md:pr-10">

                <ShieldCheck
                  className="h-6 w-6 text-[#E23C2E]"
                  strokeWidth={1.8}
                />

                <h3 className="mt-5 text-lg font-bold text-[#0b1729]">
                  Careful Handling
                </h3>

                <p className="mt-3 text-sm leading-6 text-black/55">
                  Shipments deserve attention at every stage, from collection
                  and transportation to final delivery.
                </p>

              </div>

              <div className="border-t border-black/10 py-8 md:border-t-0 md:border-r md:border-black/10 md:px-10">

                <Truck
                  className="h-6 w-6 text-[#E23C2E]"
                  strokeWidth={1.8}
                />

                <h3 className="mt-5 text-lg font-bold text-[#0b1729]">
                  Dependable Delivery
                </h3>

                <p className="mt-3 text-sm leading-6 text-black/55">
                  We work to make pickup, transportation, and delivery as
                  straightforward and dependable as possible.
                </p>

              </div>

              <div className="border-t border-black/10 py-8 md:border-t-0 md:pl-10">

                <Package
                  className="h-6 w-6 text-[#E23C2E]"
                  strokeWidth={1.8}
                />

                <h3 className="mt-5 text-lg font-bold text-[#0b1729]">
                  Clear Tracking
                </h3>

                <p className="mt-3 text-sm leading-6 text-black/55">
                  Shipment tracking gives customers useful information about
                  where their cargo is in the delivery process.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================================
            NEPAL & BEYOND
        ================================================================ */}

        <section className="bg-[#0b1729] py-20 sm:py-24 lg:py-28">

          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">

            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">

              <div>

                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#E23C2E]" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                    Nepal &amp; Beyond
                  </span>
                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Built for the way Nepal moves.
                </h2>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                  From local cargo and doorstep delivery to shipments heading
                  overseas, RocketShipping brings practical logistics
                  solutions together under one service.
                </p>

                <a
                  href="/services"
                  className="mt-8 inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
                >
                  View Our Services
                  <ArrowRight className="h-4 w-4" />
                </a>

              </div>

              <div className="border-l border-white/10 pl-7 sm:pl-9">

                <div className="flex items-start gap-4">

                  <MapPin
                    className="mt-1 h-5 w-5 shrink-0 text-[#E23C2E]"
                    strokeWidth={1.8}
                  />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Based in Kathmandu
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Serving customers and businesses with cargo and delivery
                      solutions from Nepal.
                    </p>
                  </div>

                </div>

                <div className="mt-8 flex items-start gap-4">

                  <Truck
                    className="mt-1 h-5 w-5 shrink-0 text-[#E23C2E]"
                    strokeWidth={1.8}
                  />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Local delivery support
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Practical pickup and delivery options for everyday
                      shipments and business cargo.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================================
            FINAL CTA
        ================================================================ */}

        <section className="py-20 sm:py-24 lg:py-28">

          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">

            <div className="border-b border-black/10 pb-12">

              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                <div className="max-w-2xl">

                  <div className="flex items-center gap-3">
                    <span className="h-[2px] w-8 bg-[#E23C2E]" />

                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                      Let&apos;s Ship
                    </span>
                  </div>

                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl">
                    Ready to move your cargo?
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
                    Talk to our team about your shipment and find the right
                    logistics solution for your needs.
                  </p>

                </div>

                <div className="flex flex-wrap gap-3">

                  <a
                    href="/contact"
                    className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
                  >
                    Contact Us
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <a
                    href="/track"
                    className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#0b1729]/15 bg-white px-6 text-sm font-semibold text-[#0b1729] transition-colors duration-200 hover:border-[#E23C2E] hover:bg-[#E23C2E] hover:text-white"
                  >
                    Track Shipment
                  </a>

                </div>

              </div>

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm text-black/50">

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#E23C2E]" />
                  <span>Customer Support</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E23C2E]" />
                  <span>Kalanki, Kathmandu</span>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#E23C2E]" />
                  <span>Cargo &amp; Logistics</span>
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}