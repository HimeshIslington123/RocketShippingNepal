"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Rocket Shipping has made our regular cargo deliveries much easier. The process is simple, reliable, and our packages arrive safely.",
    name: "Anish Budathoki",
    role: "Operations Manager",
    company: "bhotahiti.com",
    avatar: "https://picsum.photos/seed/anish-budathoki/96/96",
  },
  {
    quote:
      "We regularly send products through Rocket Shipping and have had a very smooth experience. Their service and communication are excellent.",
    name: "Om Malla",
    role: "Business Manager",
    company: "udhyogbazar.com",
    avatar: "https://picsum.photos/seed/om-malla/96/96",
  },
  {
    quote:
      "Rocket Shipping has been a dependable logistics partner for our business. Their team handles our shipments professionally and on time.",
    name: "Ankit Shrestha",
    role: "Founder",
    company: "Narrative Machine",
    avatar: "https://picsum.photos/seed/ankit-shrestha/96/96",
  },
  {
    quote:
      "From pickup to delivery, the whole process is convenient and well managed. We feel confident sending our products with Rocket Shipping.",
    name: "Khushi Maharjan",
    role: "Business Owner",
    company: "Aachar Ghar",
    avatar: "https://picsum.photos/seed/khushi-maharjan/96/96",
  },
  {
    quote:
      "Their delivery service has helped us manage customer orders more efficiently. The team is responsive and the service is dependable.",
    name: "Sujan Shakya",
    role: "Operations Lead",
    company: "BrandKTM",
    avatar: "https://picsum.photos/seed/sujan-shakya/96/96",
  },
  {
    quote:
      "We appreciate the professional service and reliable delivery. Rocket Shipping has made shipping products to our customers much easier.",
    name: "Pratiksha Joshi",
    role: "Founder",
    company: "Streetside",
    avatar: "https://picsum.photos/seed/pratiksha-joshi/96/96",
  },
];

// How many cards are visible at once per breakpoint.
// Keep in sync with the basis-*/md:basis-*/lg:basis-* classes below.
function useVisibleCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const mdQuery = window.matchMedia("(min-width: 768px)");
    const lgQuery = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      if (lgQuery.matches) setCount(3);
      else if (mdQuery.matches) setCount(2);
      else setCount(1);
    };

    update();
    mdQuery.addEventListener("change", update);
    lgQuery.addEventListener("change", update);
    return () => {
      mdQuery.removeEventListener("change", update);
      lgQuery.removeEventListener("change", update);
    };
  }, []);

  return count;
}

export default function Testimonials() {
  const visibleCount = useVisibleCount();
  const maxIndex = Math.max(testimonials.length - visibleCount, 0);

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Clamp index whenever the number of visible cards changes (e.g. resize)
  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay every 5 seconds, paused while hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, isHovered]);

  const slidePercent = 100 / visibleCount;

  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 bg-[#E23C2E]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
              Client Stories
            </span>
            <span className="h-[2px] w-8 bg-[#E23C2E]" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
        What Our Clients Say
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative mt-10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${index * slidePercent}%)`,
              }}
            >
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.company}
                  className="box-border shrink-0 basis-full px-2.5 md:basis-1/2 lg:basis-1/3"
                >
                  <div className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 transition-colors duration-200 hover:border-[#E23C2E]/40">
                    {/* Quote */}
                    <div className="text-4xl font-serif leading-none text-[#E23C2E]">
                      &ldquo;
                    </div>

                    <p className="mt-3 flex-1 text-sm leading-7 text-black/65">
                      {testimonial.quote}
                    </p>

                    {/* Person */}
                    <div className="mt-6 flex items-center gap-3 border-t border-black/10 pt-5">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#0b1729]">
                          {testimonial.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-black/50">
                          {testimonial.role}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-[#E23C2E]">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Prev button */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous testimonials"
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#0b1729] shadow-md transition-colors duration-200 hover:border-[#E23C2E]/40 hover:text-[#E23C2E]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={goNext}
            aria-label="Next testimonials"
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#0b1729] shadow-md transition-colors duration-200 hover:border-[#E23C2E]/40 hover:text-[#E23C2E]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIndex === index ? "w-6 bg-[#E23C2E]" : "w-2 bg-black/15"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}