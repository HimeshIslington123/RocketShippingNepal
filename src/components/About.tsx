"use client";

import { useEffect, useRef, useState } from "react";

const paragraph =
"Rocket Shipping Nepal delivers fast, secure, and dependable cargo solutions for businesses of every size. With a strong global network and experienced logistics professionals, we ensure every shipment reaches its destination safely, on time, and without compromise.";

const stats = [
  { value: "18+", label: "Years in operation" },
  { value: "42", label: "Countries served" },
  { value: "99.2%", label: "On-time delivery rate" },
] as const;

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Start revealing once the section enters the lower part of the
      // viewport, finish once it has scrolled two-thirds past the top.
      const start = viewportH * 0.85;
      const end = viewportH * -0.35;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const words = paragraph.split(" ");

  return (
    <section id="about" className="bg-background py-24 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            About Rocket Shipping
            <br />
            Logistics Solutions
          </p>

          <div ref={sectionRef}>
            <p className="font-display text-3xl font-medium leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              {words.map((word, i) => {
                const threshold = (i + 1) / words.length;
                const lit = progress >= threshold - 1 / words.length / 2;
                return (
                  <span
                    key={i}
                    className="transition-colors duration-300"
                    style={{ color: lit ? "var(--color-foreground)" : "#4a4a4c" }}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>

            <div className="mt-16 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-4xl font-semibold text-accent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
