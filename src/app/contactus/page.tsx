"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { FormEvent, useState } from "react";

const faqs = [
  {
    question: "Why should I choose RocketShipping over other courier companies?",
    answer:
      "RocketShipping is built to help businesses save money and deliver more efficiently. Instead of charging only on a per-package basis, we offer competitive bulk pricing for businesses with regular shipment volumes. Our business model is focused on providing reliable delivery rather than depending on return packages for earnings. With RocketShipping, you can track your shipment delivery status and also live-track the vehicle carrying your shipment.",
  },
  {
    question: "How do you minimize return packages?",
    answer:
      "We focus on maximizing successful delivery attempts, especially for prepaid packages. Our delivery team makes multiple delivery attempts when required and contacts customers multiple times to remind them about their package and coordinate a convenient pickup or delivery. This proactive approach helps reduce unnecessary returns and improves successful delivery rates.",
  },
  {
    question: "How do you reduce delivery costs?",
    answer:
      "We help reduce delivery costs by offering bulk pricing instead of charging businesses a higher price for every individual package. Businesses with regular shipment volumes can benefit from better rates, making their overall logistics costs more predictable and affordable.",
  },
  {
    question: "What services does RocketShipping provide?",
    answer:
      "We provide express cargo, bulk cargo, door-to-door delivery, and international shipping solutions for individuals and businesses.",
  },
  {
    question: "Can I track my shipment?",
    answer:
      "Yes. You can use our Track Shipment page to check the current status of your shipment using your tracking number. You can also live-track the vehicle carrying your shipment when vehicle tracking is available.",
  },
  {
    question: "Do you provide door-to-door delivery?",
    answer:
      "Yes. Our door-to-door service allows us to collect your shipment from the required location and deliver it directly to the recipient.",
  },
  {
    question: "Can businesses send bulk shipments?",
    answer:
      "Yes. Our bulk cargo service is designed for businesses and customers who need to move larger quantities of goods. Businesses can also benefit from our bulk pricing model.",
  },
  {
    question: "Do you handle international shipments?",
    answer:
      "Yes. We support international cargo transportation and help customers with the shipping process and logistics coordination.",
  },
  {
    question: "How can I contact RocketShipping?",
    answer:
      "You can contact our team through the form on this page, by phone at 971-7046687, or by email at support@rocketshipping.com.np.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailSubject = encodeURIComponent(
      formData.subject || "New Contact Request",
    );

    const emailBody = encodeURIComponent(
      `Hello RocketShipping Team,

I would like to contact you regarding the following:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}

Subject:
${formData.subject}

Message:
${formData.message}

Thank you,
${formData.name}`,
    );

    const mailtoUrl = `mailto:support@rocketshipping.com.np?subject=${emailSubject}&body=${emailBody}`;

    window.location.href = mailtoUrl;

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

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
                    Contact Us
                  </span>
                </div>

                <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Let&apos;s talk about
                  <br />
                  <span className="text-[#E23C2E]">your shipment.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                  Have a question about our services, pricing, delivery, or
                  your shipment? Send us a message and our team will get back
                  to you.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-[#E23C2E] via-[#E23C2E]/40 to-transparent" />
        </section>

        {/* ============================================================
            CONTACT FORM
        ============================================================ */}

        <section className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <span className="h-[2px] w-8 bg-[#E23C2E]" />

                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                      Send a Message
                    </span>
                  </div>

                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl">
                    How can we help?
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
                    Fill out the form below and tell us what you need.
                    We&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold text-[#0b1729]"
                      >
                        Full Name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0b1729] outline-none transition placeholder:text-black/30 focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-[#0b1729]"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0b1729] outline-none transition placeholder:text-black/30 focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-semibold text-[#0b1729]"
                      >
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0b1729] outline-none transition placeholder:text-black/30 focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-semibold text-[#0b1729]"
                      >
                        Subject
                      </label>

                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0b1729] outline-none transition placeholder:text-black/30 focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-semibold text-[#0b1729]"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your shipment or question..."
                      className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm leading-6 text-[#0b1729] outline-none transition placeholder:text-black/30 focus:border-[#E23C2E] focus:ring-2 focus:ring-[#E23C2E]/10"
                    />
                  </div>

                  {submitted && (
                    <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          Message ready to send
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-600">
                          Your email application should have opened with the
                          message prepared for RocketShipping.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-7 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#CE3122] active:scale-[0.98]"
                  >
                    Send Message

                    <Send className="h-4 w-4" strokeWidth={2} />
                  </button>
                </form>
              </div>

              {/* ========================================================
                  CONTACT INFORMATION
              ======================================================== */}

              <div>
                <div className="rounded-2xl bg-[#f6f7f9] p-7 sm:p-9">
                  <div className="flex items-center gap-3">
                    <span className="h-[2px] w-8 bg-[#E23C2E]" />

                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
                      Contact Information
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#0b1729] sm:text-3xl">
                    We&apos;re here to help.
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-black/55">
                    Reach out to our team for questions about shipping,
                    deliveries, pricing, or any other logistics requirement.
                  </p>

                  <div className="mt-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E23C2E]/10 text-[#E23C2E]">
                        <MapPin className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#0b1729]">
                          Our Location
                        </p>

                        <p className="mt-1 text-sm leading-6 text-black/55">
                          Kalanki,
                          <br />
                          Kathmandu, Nepal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E23C2E]/10 text-[#E23C2E]">
                        <Phone className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#0b1729]">
                          Phone
                        </p>

                        <a
                          href="tel:9717046687"
                          className="mt-1 block text-sm text-black/55 transition-colors hover:text-[#E23C2E]"
                        >
                    985-1053926
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E23C2E]/10 text-[#E23C2E]">
                        <Mail className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0b1729]">
                          Email
                        </p>

                        <a
                          href="mailto:support@rocketshipping.com.np"
                          className="mt-1 block break-all text-sm text-black/55 transition-colors hover:text-[#E23C2E]"
                        >
                          support@rocketshipping.com.np
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 h-px bg-black/10" />

                  <div>
                    <p className="text-sm font-semibold text-[#0b1729]">
                      Looking for your shipment?
                    </p>

                    <p className="mt-2 text-sm leading-6 text-black/50">
                      Track your shipment using your tracking number.
                    </p>

                    <a
                      href="/track"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#E23C2E] transition-colors hover:text-[#CE3122]"
                    >
                      Track Shipment
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
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
                Frequently asked questions.
              </h2>

              <p className="mt-4 text-sm leading-7 text-black/55 sm:text-base">
                Find quick answers to common questions about RocketShipping,
                pricing, deliveries, returns, and our logistics services.
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
                Ready to ship?
              </span>

              <span className="h-[2px] w-8 bg-[#E23C2E]" />
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Let&apos;s move your cargo.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Get in touch with RocketShipping and let&apos;s find the right
              logistics solution for your shipment.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/services"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E23C2E] px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#CE3122]"
              >
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/track"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white px-6 text-sm font-semibold text-[#0b1729] transition-colors duration-200 hover:bg-[#E23C2E] hover:text-white"
              >
                Track Shipment
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}