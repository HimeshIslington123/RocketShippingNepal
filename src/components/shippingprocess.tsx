"use client";

import {
  CheckCircle2,
  ClipboardEdit,
  MapPin,
  PackageCheck,
} from "lucide-react";

type Step = {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "01",
    icon: ClipboardEdit,
    title: "Book Your Shipment",
    description:
      "Choose the delivery mode, enter destination details, weight, and get an instant transparent quote.",
  },
  {
    number: "02",
    icon: PackageCheck,
    title: "We Pick Up",
    description:
      "Our courier team collects your package from your doorstep or you can hand it to our hub.",
  },
  {
    number: "03",
    icon: MapPin,
    title: "Track Your Cargo",
    description:
      "Follow your shipment through each milestone from pickup to final delivery.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Delivered Safely",
    description:
      "Your shipment arrives safely with delivery confirmation for complete peace of mind.",
  },
];

export default function ShippingProcess() {
  return (
    <section className="w-full bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 bg-[#E23C2E]" />

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
              Simple Step-by-Step Process
            </span>

            <span className="h-[2px] w-8 bg-[#E23C2E]" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
            Shipping Made Simple
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/55 sm:text-base">
            Four simple steps to move your cargo across Nepal and beyond with
            confidence.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <article
              key={number}
              className="
                flex h-full flex-col
                rounded-2xl
                border border-black/10
                bg-white
                p-6
                transition-colors
                duration-200
                hover:border-[#E23C2E]/40
              "
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl font-bold text-[#E23C2E]">
                  {number}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E23C2E]/10">
                  <Icon
                    size={17}
                    className="text-[#E23C2E]"
                    strokeWidth={2}
                  />
                </span>
              </div>

              <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                {title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-black/55">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}