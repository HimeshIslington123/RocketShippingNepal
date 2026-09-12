"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

const SERVICE_OPTIONS = [
  "Nationwide Cargo Delivery",
  "Same-Day Dispatch",
  "Bulk Freight",
  "Fragile / Special Handling",
  "International Shipment",
];

const CONTACT_EMAIL = "info@rocketshipping.com.np";

type FormState = {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  phone: "",
  email: "",
  service: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);

  const update =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = `Shipment Inquiry from ${form.name || "Website Visitor"}`;

    const body = [
      `Name: ${form.name}`,
      `Phone Number: ${form.phone}`,
      `Email: ${form.email}`,
      `Service: ${form.service || "Not specified"}`,
      "",
      "Message:",
      form.message,
    ].join("\n");

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  };

  return (
    <main className="min-h-screen bg-[#f3f1fb]">
      <Navbar />

      {/* Top padding accounts for the fixed navbar */}
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-32 sm:px-10 sm:pt-40">
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-[0_20px_60px_-15px_rgba(23,28,43,0.25)] sm:p-10">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-bold tracking-[0.1em] text-[#E23C2E]">
              DIRECT DISPATCH BOOKING
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#0b1729] sm:text-[28px]">
            Send us your shipment details
          </h2>
          <p className="mt-2 text-sm leading-6 text-black/55">
            Fill out the consignment inquiry below. A logistics supervisor
            will review and verify your route.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-semibold text-[#0b1729]"
              >
                Name <span className="text-[#E23C2E]">*</span>
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={update("name")}
                placeholder="Your Full Name"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#0b1729] placeholder:text-black/35 outline-none transition-colors focus:border-[#E23C2E]"
              />
            </div>

            {/* Phone + Email */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-semibold text-[#0b1729]"
                >
                  Phone Number <span className="text-[#E23C2E]">*</span>
                </label>
                <input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="e.g. 98XXXXXXXX"
                  className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#0b1729] placeholder:text-black/35 outline-none transition-colors focus:border-[#E23C2E]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-[#0b1729]"
                >
                  Email <span className="text-[#E23C2E]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#0b1729] placeholder:text-black/35 outline-none transition-colors focus:border-[#E23C2E]"
                />
              </div>
            </div>

            {/* Service */}
            <div>
              <label
                htmlFor="service"
                className="mb-1.5 block text-sm font-semibold text-[#0b1729]"
              >
                Service <span className="text-[#E23C2E]">*</span>
              </label>
              <div className="relative">
                <select
                  id="service"
                  required
                  value={form.service}
                  onChange={update("service")}
                  className="w-full appearance-none rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#0b1729] outline-none transition-colors focus:border-[#E23C2E]"
                >
                  <option value="" disabled>
                    Select Cargo Service Category
                  </option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-1.5 block text-sm font-semibold text-[#0b1729]"
              >
                Message <span className="text-[#E23C2E]">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={form.message}
                onChange={update("message")}
                placeholder="Tell us about your cargo requirements, pickup location, destination, and package details..."
                className="w-full resize-y rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#0b1729] placeholder:text-black/35 outline-none transition-colors focus:border-[#E23C2E]"
              />
            </div>

            {/* Notice */}
            <div className="flex items-center gap-2.5 rounded-lg bg-black/[0.03] px-4 py-3">
              <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-xs text-black/60">
                Our customer support team typically responds to inquiries
                within 1 business hour.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E23C2E] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#c93427]"
            >
              Send Inquiry
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}