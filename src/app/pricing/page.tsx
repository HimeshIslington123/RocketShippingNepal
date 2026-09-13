"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Factory,
  Globe2,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useState } from "react";

const pricingPlans = [
  {
    icon: ShoppingBag,
    title: "Online Business",
    subtitle: "For online sellers & e-commerce businesses",
    description:
      "Reliable delivery pricing for businesses sending regular online orders to customers across Nepal.",
    price: "As low as",
    priceValue: "Rs. 99 / kg",
    features: [
      "Competitive per-package rates",
      "Shipment tracking",
      "Delivery status updates",
      "Multiple delivery attempts",
      "Customer coordination",
    ],
    popular: true,
  },
  {
    icon: Factory,
    title: "Industrial",
    subtitle: "For manufacturers & distributors",
    description:
      "Customized logistics solutions for factories, distributors, suppliers, and businesses moving larger cargo.",
    price: "As low as",
    priceValue: "Rs. 5 / kg",
    features: [
      "Customized pricing",
      "Large cargo handling",
      "Scheduled pickups",
      "Business account support",
      "Dedicated logistics coordination",
    ],
    popular: false,
  },
  {
    icon: Truck,
    title: "Wholesale Delivery",
    subtitle: "For wholesalers & large sellers",
    description:
      "Cost-effective delivery solutions for wholesalers and businesses handling frequent deliveries to multiple locations.",
    price: "As low as",
    priceValue: "Rs. 30 / kg",
    features: [
      "Wholesale delivery rates",
      "Multiple delivery locations",
      "Large shipment support",
      "Shipment tracking",
      "Flexible delivery arrangements",
    ],
    popular: false,
  },
];

const faqs = [
  {
    question: "Why does RocketShipping offer different pricing plans?",
    answer:
      "Different businesses have different shipment volumes and delivery requirements. Our pricing is designed around the type and volume of shipments so businesses can get a more suitable and cost-effective logistics solution.",
  },
  {
    question: "Can I get better rates for large shipments?",
    answer:
      "Yes. Businesses sending larger volumes can benefit from better pricing. The final rate depends on shipment volume, destination, package requirements, and delivery frequency.",
  },
  {
    question: "Do online businesses get special pricing?",
    answer:
      "Yes. Our Online Business pricing is designed for e-commerce sellers and businesses that send regular customer orders. Contact our team to discuss your shipment volume and get the appropriate rate.",
  },
  {
    question: "How is industrial pricing calculated?",
    answer:
      "Industrial pricing is customized according to cargo volume, weight, delivery locations, pickup requirements, frequency, and other logistics requirements. Contact our team for a customized quotation.",
  },
  {
    question: "Does the price include shipment tracking?",
    answer:
      "Yes. Shipment tracking is part of our service so businesses can monitor their shipments and stay updated on delivery progress. Vehicle live tracking is also available where supported.",
  },
  {
    question: "Can I get better pricing as my business grows?",
    answer:
      "Yes. As your shipment volume increases, you can discuss a more suitable pricing arrangement with our team.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      <main className="w-full bg-white text-[#0b1729]">
        {/* ============================================================
            HERO
        ============================================================ */}

        <section className="relative overflow-hidden bg-[#0b1729] pt-[76px]">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
            <div className="flex min-h-[444px] items-center py-20 sm:min-h-[444px] lg:py-24">
              <div className="max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-[2px] w-9 bg-[#E23C2E]" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                    Pricing & Packages
                  </span>
                </div>

                <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Pricing that grows
                  <br />
                  <span className="text-[#E23C2E]">
                    with your business.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                  From online businesses to industrial and wholesale
                  shipments, RocketShipping offers practical pricing designed
                  around your delivery volume and logistics needs.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#E23C2E] via-[#E23C2E]/40 to-transparent" />
        </section>

        {/* ============================================================
            INTRO + PRICING
        ============================================================ */}

        <section className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="h-[2px] w-8 bg-[#E23C2E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                  Simple & Flexible
                </span>

                <span className="h-[2px] w-8 bg-[#E23C2E]" />
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
                Choose the right plan for your shipments.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/55 sm:text-base">
                Whether you run an online business, move industrial cargo, or
                handle wholesale deliveries, our pricing is designed to help
                you control your delivery costs.
              </p>
            </div>

            {/* PRICING CARDS */}

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {pricingPlans.map((plan) => {
                const Icon = plan.icon;

                return (
                  <div
                    key={plan.title}
                    className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-200 ${
                      plan.popular
                        ? "border-[#E23C2E] shadow-[0_12px_35px_rgba(226,60,46,0.10)]"
                        : "border-black/10 hover:border-[#E23C2E]/40"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute right-5 top-5 rounded-full bg-[#E23C2E] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        Popular
                      </div>
                    )}

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E23C2E]/10 text-[#E23C2E]">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>

                    <h3 className="mt-6 text-xl font-bold tracking-tight text-[#0b1729]">
                      {plan.title}
                    </h3>

                    <p className="mt-2 text-xs font-medium text-[#E23C2E]">
                      {plan.subtitle}
                    </p>

                    <p className="mt-4 min-h-[84px] text-sm leading-6 text-black/50">
                      {plan.description}
                    </p>

                    <div className="my-6 h-px bg-black/10" />

                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">
                      {plan.price}
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-[#0b1729]">
                      {plan.priceValue}
                    </p>

                    <div className="my-6 h-px bg-black/10" />

                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-2.5"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1E8449]" />

                          <span className="text-sm leading-5 text-black/55">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <a
                      href="/contactus"
                      className={`mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                        plan.popular
                          ? "bg-[#E23C2E] text-white hover:bg-[#CE3122]"
                          : "border border-[#E23C2E] bg-white text-[#E23C2E] hover:bg-[#E23C2E] hover:text-white"
                      }`}
                    >
                      Get a Quote
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================
            WHY OUR PRICING
        ============================================================ */}

        <section className="bg-[#f5f6f8] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#E23C2E]" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                    Better Rates
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
                  Ship more.
                  <br />
                  <span className="text-[#E23C2E]">Save more.</span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
                  Your delivery cost should not hold your business back. Our
                  pricing model helps businesses get practical rates based on
                  their shipment type and volume.
                </p>

                <a
                  href="/contactus"
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
                >
                  Talk to Our Team
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-6">
                  <Package className="h-6 w-6 text-[#E23C2E]" />

                  <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                    Competitive rates
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Practical pricing designed around your shipment
                    requirements.
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-6">
                  <Truck className="h-6 w-6 text-[#E23C2E]" />

                  <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                    Reliable delivery
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Keep your customers informed with reliable shipment
                    tracking.
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-6">
                  <Globe2 className="h-6 w-6 text-[#E23C2E]" />

                  <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                    Wider reach
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Move your products across Nepal and beyond with our
                    logistics services.
                  </p>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-6">
                  <Factory className="h-6 w-6 text-[#E23C2E]" />

                  <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                    Business solutions
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Get a pricing arrangement based on your actual business
                    requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            HOW PRICING WORKS
        ============================================================ */}

        <section className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="h-[2px] w-8 bg-[#E23C2E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                  How It Works
                </span>

                <span className="h-[2px] w-8 bg-[#E23C2E]" />
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl">
                Get the right rate for your business.
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55 sm:text-base">
                Tell us about your shipments and our team can help you find
                the most suitable pricing option.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E23C2E] text-sm font-bold text-white">
                  01
                </div>

                <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                  Tell us your volume
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  Share how many packages or how much cargo you normally ship.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E23C2E] text-sm font-bold text-white">
                  02
                </div>

                <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                  We understand your needs
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  We look at your shipment type, destinations, volume, and
                  delivery requirements.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E23C2E] text-sm font-bold text-white">
                  03
                </div>

                <h3 className="mt-5 text-base font-bold text-[#0b1729]">
                  Get your pricing
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  Our team provides a suitable pricing arrangement for your
                  business.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            FAQ
        ============================================================ */}

        <section className="border-t border-black/[0.06] bg-[#f7f8fb] py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1000px] px-6 sm:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="h-[2px] w-8 bg-[#E23C2E]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                  FAQ
                </span>

                <span className="h-[2px] w-8 bg-[#E23C2E]" />
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl">
                Pricing questions?
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55 sm:text-base">
                Here are some common questions about RocketShipping pricing
                and packages.
              </p>
            </div>

            <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-semibold text-[#0b1729] sm:text-base">
                        {faq.question}
                      </span>

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                          isOpen
                            ? "bg-[#E23C2E] text-white"
                            : "bg-white text-[#0b1729]/50"
                        }`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-200 ${
                        isOpen
                          ? "grid-rows-[1fr] pb-5"
                          : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-3xl pr-12 text-sm leading-7 text-black/55">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================
            CTA
        ============================================================ */}

        <section className="bg-[#0b1729] py-20 sm:py-24">
          <div className="mx-auto max-w-[900px] px-6 text-center sm:px-10">
            <div className="flex items-center justify-center gap-3">
              <span className="h-[2px] w-8 bg-[#E23C2E]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Need a Custom Rate?
              </span>

              <span className="h-[2px] w-8 bg-[#E23C2E]" />

            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Let&apos;s find the right price.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Tell us about your shipment volume and business requirements.
              We&apos;ll help you find a pricing solution that works for you.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/contactus"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
              >
                Get a Custom Quote
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/services"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white px-6 text-sm font-semibold text-[#0b1729] transition-colors duration-200 hover:bg-[#E23C2E] hover:text-white"
              >
                Explore Services
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}