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
    <section className="w-full bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 bg-[#E23C2E]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
              Logistics solutions
            </span>
            <span className="h-[2px] w-8 bg-[#E23C2E]" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
            Shipping made simple.
          </h2>

          <p className="mt-5 text-sm leading-7 text-black/55 sm:text-base">
            Dependable logistics solutions for individuals, businesses and
            growing commerce across Nepal and beyond.
          </p>
        </div>

        {/* Services */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, description, linkText }) => (
            <article
              key={title}
              className="
                group flex h-full flex-col rounded-2xl border border-black/10
                bg-white p-6 transition-colors duration-200
                hover:border-[#E23C2E]/40
              "
            >
              {/* Icon */}
              <div
                className="
                  flex h-11 w-11 items-center justify-center rounded-lg
                  bg-[#E23C2E]/10 text-[#E23C2E]
                  transition-all duration-300
                  group-hover:bg-[#E23C2E] group-hover:text-white
                "
              >
                <Icon size={19} strokeWidth={2} />
              </div>

              {/* Content */}
              <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                {title}
              </h3>

              <p className="mt-2.5 flex-1 text-sm leading-6 text-black/55">
                {description}
              </p>

              {/* Link */}
              <a
                href="#"
                className="
                  mt-6 inline-flex items-center gap-2 text-xs font-bold
                  text-[#0b1729] transition-colors
                  group-hover:text-[#E23C2E]
                "
              >
                {linkText}
                <ArrowUpRight
                  size={14}
                  className="
                    transition-transform duration-200
                    group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                  "
                />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}