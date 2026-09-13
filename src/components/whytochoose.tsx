"use client";

import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Bulk Pricing",
    description:
      "Competitive discounted rates for high-volume and recurring bulk shipments.",
  },
  {
    title: "Guaranteed Delivery",
    description:
      "Committed delivery timelines for bulk orders, backed by our service guarantee.",
  },
  {
    title: "Small Business Friendly",
    description:
      "Flexible plans and dedicated support designed for growing local businesses and startups.",
  },
  {
    title: "Save on Delivery Costs",
    description:
      "Cut your delivery expenses significantly compared to individual courier rates.",
  },
  {
    title: "All Nepal Network",
    description:
      "Reliable coverage connecting Kathmandu, Pokhara, and major districts across Nepal.",
  },
  {
    title: "Safety Packaging",
    description:
      "Careful handling and protective packaging standards to keep your goods safe in transit.",
  },
];

export default function WhyChooseRocketShipping() {
  return (
    <section className="w-full bg-[#f5f6f8] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="relative h-[380px] w-full overflow-hidden rounded-2xl sm:h-[440px]">
              <Image
                src="/van.png"
                alt="Rocket Shipping logistics operations"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-6 left-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                  Infrastructure
                </span>

                <p className="mt-1 text-lg font-bold text-white">
                  Bonded Gateway Operations
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            {/* Label */}
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#E23C2E]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                Nepal&apos;s Freight Benchmark
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
              Why Choose Rocket Shipping?
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
              We combine local expertise, reliable transportation and careful
              cargo handling to make shipping easier for businesses across
              Nepal.
            </p>

            {/* Features */}
            <div className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E23C2E]">
                    <Check
                      size={13}
                      className="text-white"
                      strokeWidth={3}
                    />
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-[#0b1729]">
                      {feature.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-black/50">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Button */}
            <a
              href="/aboutus"
              className="
                mt-9
                inline-flex
                h-12
                items-center
                gap-2
                rounded-full
                bg-[#0b1729]
                px-6
                text-sm
                font-semibold
                text-white
                transition-colors
                duration-200
                hover:bg-[#132339]
              "
            >
              Learn About Us
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}