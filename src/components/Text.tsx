"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * "What Our Clients Say" testimonial carousel for Movetrans.
 *
 * Usage (Next.js App Router):
 *   import Testimonials from "@/components/Testimonials";
 *   export default function Page() {
 *     return <Testimonials />;
 *   }
 *
 * Relies on the theme tokens already defined in globals.css:
 *   --background, --foreground, --surface, --accent, --accent-dark,
 *   --muted, --line  (exposed via @theme inline as bg-background,
 *   text-foreground, bg-surface, text-accent, text-muted, border-line, etc.)
 *
 * Swap `avatar` values for real photos once you have them
 * (drop files in /public and point to "/your-file.jpg").
 */

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "We've worked with several logistics providers before, but Movetrans stands out for their efficiency and attention to detail. They handle our shipments with great care and always keep us informed at every stage.",
    name: "HYPATHIA ALEX",
    role: "Project Lead",
    avatar: "https://picsum.photos/seed/hypathia-alex/96/96",
  },
  {
    quote:
      "Movetrans has been a reliable partner for our logistics operations. Their team consistently ensures that our shipments arrive safely and on schedule, and their communication throughout the process has always been clear and professional.",
    name: "MICHAEL CARTER",
    role: "Logistics Manager",
    avatar: "https://picsum.photos/seed/michael-carter/96/96",
  },
  {
    quote:
      "Movetrans helped us streamline our shipping process and improve delivery timelines. Their professional approach and strong logistics network make them a partner we can truly rely on.",
    name: "EMMA RODRIGUEZ",
    role: "Procurement Director",
    avatar: "https://picsum.photos/seed/emma-rodriguez/96/96",
  },
  {
    quote:
      "We've worked with several logistics providers before, but Movetrans stands out for their efficiency and attention to detail. They handle our shipments with great care and always keep us informed at every stage.",
    name: "HYPATHIA ALEX",
    role: "Project Lead",
    avatar: "https://picsum.photos/seed/hypathia-alex/96/96",
  },
  {
    quote:
      "Movetrans has been a reliable partner for our logistics operations. Their team consistently ensures that our shipments arrive safely and on schedule, and their communication throughout the process has always been clear and professional.",
    name: "MICHAEL CARTER",
    role: "Logistics Manager",
    avatar: "https://picsum.photos/seed/michael-carter/96/96",
  },
  {
    quote:
      "Movetrans helped us streamline our shipping process and improve delivery timelines. Their professional approach and strong logistics network make them a partner we can truly rely on.",
    name: "EMMA RODRIGUEZ",
    role: "Procurement Director",
    avatar: "https://picsum.photos/seed/emma-rodriguez/96/96",
  },
];

/** 1 card at a time on mobile, 3 side-by-side from `md:` up. */
function useCardsPerView() {
  const [cardsPerView, setCardsPerView] = useState(1);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setCardsPerView(mql.matches ? 3 : 1);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return cardsPerView;
}

export default function Testimonials() {
  const cardsPerView = useCardsPerView();
  const [start, setStart] = useState(0);
  const maxStart = Math.max(testimonials.length - cardsPerView, 0);

  // clamp start if viewport change shrinks the visible window
  useEffect(() => {
    setStart((s) => Math.min(s, maxStart));
  }, [maxStart]);

  const canPrev = start > 0;
  const canNext = start < maxStart;

  const visible = testimonials
    .map((t, i) => ({ ...t, _key: i }))
    .slice(start, start + cardsPerView);

  return (
    <section className="bg-background text-foreground px-6 py-20 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        {/* Header row */}
        <div className="mb-16 flex items-start justify-between gap-6">
          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.25em] text-muted">
              TESTIMONIAL
            </p>
            <h2 className="max-w-2xl text-4xl font-medium leading-tight text-balance sm:text-5xl lg:text-[3.25rem]">
              What Our Clients Say About Our Logistics Solutions
            </h2>
          </div>

          {/* Carousel controls */}
          <div className="hidden shrink-0 gap-3 sm:flex">
            <button
              type="button"
              onClick={() => canPrev && setStart((s) => Math.max(s - 1, 0))}
              disabled={!canPrev}
              aria-label="Previous testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/5 text-foreground transition-colors enabled:hover:bg-accent enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => canNext && setStart((s) => Math.min(s + 1, maxStart))}
              disabled={!canNext}
              aria-label="Next testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/5 text-foreground transition-colors enabled:hover:bg-accent enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visible.map((t) => (
            <div
              key={t._key}
              className="flex min-h-[420px] flex-col justify-between rounded-2xl border border-line bg-white/[0.03] p-8"
            >
              <p className="text-lg leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-10 flex items-center justify-between">
                <div className="leading-tight">
                  <p className="text-sm font-semibold tracking-wide">
                    {t.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t.role}</p>
                </div>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile controls */}
        <div className="mt-8 flex justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => canPrev && setStart((s) => Math.max(s - 1, 0))}
            disabled={!canPrev}
            aria-label="Previous testimonials"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/5 text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => canNext && setStart((s) => Math.min(s + 1, maxStart))}
            disabled={!canNext}
            aria-label="Next testimonials"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/5 text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}