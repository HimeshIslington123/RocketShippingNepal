"use client";

import Image from "next/image";
import { Check, Gauge, ArrowRight } from "lucide-react";

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
      "Reliable coverage connecting Kathmandu, Pokhara, and every major district across Nepal.",
  },
  {
    title: "Safety Packaging",
    description:
      "Careful handling and protective packaging standards to keep your goods safe in transit.",
  },
];

export default function WhyChooseRocketShipping() {
  return (
    <section className="w-full bg-gradient-to-b from-[#eef1f7] to-[#f7f8fb] py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Image + floating stat card */}
          <div className="relative">
            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl sm:h-[460px]">
             <Image
  src="/van.png"
  alt="Bonded gateway operations at the container port"
  fill
  sizes="(min-width: 1024px) 640px, 100vw"
  className="object-cover"
/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-6 left-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                  Infrastructure
                </span>
                <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                  Bonded Gateway Operations
                </p>
              </div>
            </div>

          
          </div>

          {/* Copy + checklist */}
          <div className="mt-6 lg:mt-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
              Nepal&apos;s freight benchmark
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
              Why Choose Rocket Shipping?
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
              We eliminate international freight bottlenecks with automated
              cargo handoffs, local customs expertise, and reliable carrier
              space allocations.
            </p>

            <div className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E23C2E]">
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0b1729] sm:text-[15px]">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs leading-6 text-black/50 sm:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#"
              className="
                mt-10 inline-flex items-center gap-2 rounded-md bg-[#0b1729]
                px-6 py-3 text-sm font-semibold text-white
                transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#132339]
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