"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  Check,
  Home,
  Package,
  Plane,
  Zap,
} from "lucide-react";

const services = [
  {
    id: "express-cargo",
    icon: Zap,
    number: "01",
    title: "Express Cargo",
    shortTitle: "Fast delivery for urgent shipments",
    description:
      "When time matters, our Express Cargo service provides fast and dependable transportation for urgent shipments across Nepal. We focus on quick handling, reliable movement, and clear shipment visibility from pickup to delivery.",
    features: [
      "Priority shipment handling",
      "Fast transportation",
      "Reliable delivery timelines",
      "Shipment tracking",
      "Ideal for urgent shipments",
    ],
  },
  {
    id: "bulk-cargo",
    icon: Package,
    number: "02",
    title: "Bulk Cargo",
    shortTitle: "Reliable solutions for larger shipments",
    description:
      "Our Bulk Cargo service is built for businesses moving larger quantities of goods. Whether you are supplying stores, managing inventory, or transporting commercial cargo, we provide practical and cost-effective logistics support.",
    features: [
      "Competitive bulk pricing",
      "Large-volume shipment handling",
      "Commercial cargo support",
      "Flexible pickup and delivery",
      "Dedicated logistics assistance",
    ],
  },
  {
    id: "door-to-door",
    icon: Home,
    number: "03",
    title: "Door-to-Door Delivery",
    shortTitle: "From your doorstep to the recipient",
    description:
      "Keep your shipping simple. We collect your package from your location and deliver it directly to the recipient, giving individuals and businesses a convenient end-to-end delivery experience.",
    features: [
      "Pickup from your location",
      "Direct recipient delivery",
      "Convenient scheduling",
      "Careful cargo handling",
      "Ideal for personal and business shipments",
    ],
  },
  {
    id: "international-shipping",
    icon: Plane,
    number: "04",
    title: "International Shipping",
    shortTitle: "Connecting Nepal with international destinations",
    description:
      "Send cargo beyond Nepal through dependable international logistics networks. From preparing your shipment to coordinating transportation, we help make international shipping straightforward and reliable.",
    features: [
      "International cargo transportation",
      "Major destination coverage",
      "Reliable logistics networks",
      "Professional cargo handling",
      "Shipping process support",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main className="w-full bg-white text-[#0b1729]">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative h-[520px] overflow-hidden bg-[#0b1729] pt-[76px]">

          <div className="mx-auto flex h-full max-w-[1400px] items-center px-6 sm:px-10 lg:px-16 xl:px-20">

            <div className="max-w-3xl">

              <div className="mb-5 flex items-center gap-3">

                <span className="h-[2px] w-9 bg-[#E23C2E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                  Our Services
                </span>

              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">

                Logistics that move
                <br />

                <span className="text-[#E23C2E]">
                  your business forward.
                </span>

              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                From urgent deliveries to large commercial shipments,
                Rocket Shipping provides dependable cargo and logistics
                solutions designed around the way you ship.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href="/contact"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
                >
                  Get Started

                  <ArrowRight
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                </a>

                <a
                  href="/track"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/25 bg-white px-6 text-sm font-semibold text-[#0b1729] transition-colors duration-200 hover:bg-[#E23C2E] hover:text-white"
                >
                  Track Shipment
                </a>

              </div>

            </div>

          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#E23C2E] via-[#E23C2E]/40 to-transparent" />

        </section>

        {/* =====================================================
            SERVICE QUICK NAVIGATION
        ====================================================== */}

        <section className="sticky top-[76px] z-40 border-b border-black/[0.07] bg-white/95 backdrop-blur-md">

          <div className="mx-auto max-w-[1200px] overflow-x-auto px-6 sm:px-10 lg:px-16">

            <div className="flex min-w-max items-center gap-2 py-3">

              {services.map(({ id, number, title }) => (

                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#0b1729]/60 transition-all duration-200 hover:bg-[#E23C2E]/10 hover:text-[#E23C2E]"
                >

                  <span className="font-bold text-[#E23C2E]">
                    {number}
                  </span>

                  {title}

                </a>

              ))}

            </div>

          </div>

        </section>

        {/* =====================================================
            SERVICES
        ====================================================== */}

        <section className="bg-white py-16 sm:py-20 lg:py-24">

          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">

            <div className="space-y-8">

              {services.map(
                ({
                  id,
                  icon: Icon,
                  number,
                  title,
                  shortTitle,
                  description,
                  features,
                }) => (

                  <article
                    id={id}
                    key={id}
                    className="scroll-mt-32 overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_8px_30px_rgba(11,23,41,0.05)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(11,23,41,0.08)]"
                  >

                    <div className="p-7 sm:p-9 lg:p-10">

                      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

                        <div className="flex gap-5 sm:gap-6">

                          <div className="hidden pt-1 sm:block">
                            <span className="text-xs font-bold tracking-[0.15em] text-[#E23C2E]">
                              {number}
                            </span>
                          </div>

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E23C2E]/10 text-[#E23C2E]">
                            <Icon size={21} strokeWidth={2} />
                          </div>

                          <div>

                            <div className="flex items-center gap-3 sm:hidden">
                              <span className="text-xs font-bold tracking-[0.15em] text-[#E23C2E]">
                                {number}
                              </span>
                            </div>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0b1729] sm:text-3xl">
                              {title}
                            </h2>

                            <p className="mt-1.5 text-sm font-medium text-black/45">
                              {shortTitle}
                            </p>

                          </div>

                        </div>

                        <a
                          href="/contact"
                          className="inline-flex w-fit shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#E23C2E] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
                        >
                          Get Started

                          <ArrowRight
                            size={15}
                            strokeWidth={2}
                          />
                        </a>

                      </div>

                      <div className="mt-8 border-t border-black/[0.07] pt-7 lg:ml-[72px]">

                        <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
                          {description}
                        </p>

                      </div>

                      <div className="mt-8 border-t border-black/[0.07] pt-7 lg:ml-[72px]">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                          <div className="shrink-0">

                            <h3 className="text-sm font-bold text-[#0b1729]">
                              What we provide
                            </h3>

                            <p className="mt-1 text-xs text-black/40">
                              Reliable support throughout your shipment.
                            </p>

                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-10 lg:w-[620px]">

                            {features.map((feature) => (

                              <div
                                key={feature}
                                className="flex items-start gap-2.5"
                              >

                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E23C2E]">

                                  <Check
                                    size={11}
                                    strokeWidth={3}
                                    className="text-white"
                                  />

                                </span>

                                <span className="text-xs leading-5 text-black/55 sm:text-sm">
                                  {feature}
                                </span>

                              </div>

                            ))}

                          </div>

                        </div>

                      </div>

                    </div>

                  </article>

                ),
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            CTA
        ====================================================== */}

        <section className="border-t border-black/[0.06] bg-[#f7f8fb] py-20 sm:py-24">

          <div className="mx-auto max-w-[900px] px-6 text-center sm:px-10">

            <div className="mb-4 flex items-center justify-center gap-3">

              <span className="h-[2px] w-8 bg-[#E23C2E]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                Ready to ship?
              </span>

              <span className="h-[2px] w-8 bg-[#E23C2E]" />

            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
              Let&apos;s move your cargo.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
              Tell us what you need to ship and our team will help you find
              the right logistics solution.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <a
                href="/contact"
                className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
              >
                Contact Us

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />
              </a>

              <a
                href="/track"
                className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-[#0b1729]/15 bg-white px-6 text-sm font-semibold text-[#0b1729] transition-all duration-200 hover:border-[#E23C2E] hover:text-[#E23C2E]"
              >
                Track Shipment

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />
              </a>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}