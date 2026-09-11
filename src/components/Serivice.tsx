"use client";

import {
  ArrowUpRight,
  Home,
  Package,
  Plane,
  Zap,
} from "lucide-react";

const SERVICES = [
  {
    icon: Zap,
    title: "Express Cargo",
    description:
      "Fast and reliable delivery for urgent shipments across major cities and hubs in Nepal.",
    linkText: "Explore service",
  },
  {
    icon: Package,
    title: "Bulk Cargo",
    description:
      "Reliable transportation and freight solutions for commercial, industrial, and retail shipments.",
    linkText: "View service",
  },
  {
    icon: Home,
    title: "Door-to-Door Delivery",
    description:
      "Convenient pickup from your location and safe delivery directly to the recipient's doorstep.",
    linkText: "Schedule pickup",
  },
  {
    icon: Plane,
    title: "International Shipping",
    description:
      "Cargo solutions connecting Nepal with major international destinations through trusted logistics networks.",
    linkText: "Explore shipping",
  },
];

export default function Services() {
  return (
    <section className="bg-[#f5f6f8] px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[1400px]">

        {/* Header */}
        <div className="max-w-2xl">

          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E23C2E]">
            Logistics solutions
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl">
            Shipping made simple.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Dependable logistics solutions for individuals, businesses and
            growing commerce across Nepal and beyond.
          </p>

        </div>

        {/* Services */}
        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">

          {SERVICES.map(
            ({ icon: Icon, title, description, linkText }) => (
              <div
                key={title}
                className="
                  group
                  flex
                  min-h-[300px]
                  flex-col
                  bg-white
                  p-7
                  transition-colors
                  duration-300
                  hover:bg-[#fafafa]
                "
              >

                {/* Icon */}
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#E23C2E]/10
                    text-[#E23C2E]
                    transition-all
                    duration-300
                    group-hover:bg-[#E23C2E]
                    group-hover:text-white
                  "
                >
                  <Icon size={19} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="mt-6">

                  <h3 className="text-base font-bold text-[#0b1729]">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {description}
                  </p>

                </div>

                {/* Link */}
                <div className="mt-auto pt-7">

                  <a
                    href="#"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      text-[#0b1729]
                      transition-colors
                      group-hover:text-[#E23C2E]
                    "
                  >
                    {linkText}

                    <ArrowUpRight
                      size={14}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </a>

                </div>
              </div>
            )
          )}

        </div>
      </div>
    </section>
  );
}