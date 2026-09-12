"use client";

import { ClipboardEdit, PackageCheck, MapPin, CheckCircle2 } from "lucide-react";

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
      "Our courier team collects your package right at your doorstep in Kathmandu/Pokhara, or hand it to our hub.",
  },
  {
    number: "03",
    icon: MapPin,
    title: "Track Your Cargo",
    description:
      "Follow your shipment live with GPS waypoint milestones as it takes off and completes customs clearance.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Delivered Safely",
    description:
      "Consignment arrives at the recipient doorstep worldwide with digital Proof of Delivery (POD) confirmation.",
  },
];

export default function ShippingProcess() {
  return (
    <section className="w-full bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 bg-[#E23C2E]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
              Simple step-by-step process
            </span>
            <span className="h-[2px] w-8 bg-[#E23C2E]" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
            Shipping Made Simple
          </h2>

          <p className="mt-5 text-sm leading-7 text-black/55 sm:text-base">
            Four transparent steps to dispatch your cargo across the globe
            with zero stress.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <article
              key={number}
              className="
                flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6
                transition-colors duration-200 hover:border-[#E23C2E]/40
              "
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl font-bold text-[#E23C2E]">
                  {number}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E23C2E]/10">
                  <Icon size={17} className="text-[#E23C2E]" />
                </span>
              </div>

              <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                {title}
              </h3>

              <p className="mt-2.5 flex-1 text-sm leading-6 text-black/55">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}