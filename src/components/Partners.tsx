"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const partners = [
  {
    src: "/bh.png",
    href: "http://www.bhotahiti.com/",
    alt: "BH Partner",
  },
  {
    src: "/ev.png",
    href: "https://YOUR-EV-WEBSITE.com",
    alt: "EV Partner",
  },
  {
    src: "/nm.png",
    href: "https://narrativemachinenp.com/",
    alt: "NM Partner",
  },
  {
    src: "/ub.png",
    href: "https://udhyogbazar.com/",
    alt: "Udyog Bazar",
  },
  {
    src: "/ps.png",
    href: "https://www.prashnaa.com/",
    alt: "Prashnaa",
  },
];

// Repeat enough times to keep the slider completely filled
const duplicated = [
  ...partners,
  ...partners,
  ...partners,
  ...partners,
];

export default function Partners() {
  return (
    <section className="w-full overflow-hidden bg-white py-10 sm:py-12">
      {/* Section Heading */}
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="h-[2px] w-8 bg-[#E23C2E]" />

          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
            Institutional trust &amp; trade partners
          </span>

          <span className="h-[2px] w-8 bg-[#E23C2E]" />
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1729] sm:text-3xl">
          Trusted By Global Leaders &amp; Himalayan Exporters
        </h2>
      </div>

      {/* Continuous Logo Slider */}
      <div
        className="
          relative mt-10 w-full overflow-hidden
          [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
          [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
        "
      >
        <motion.div
          className="flex w-max items-center gap-16 px-6 sm:gap-20"
          animate={{
            x: ["0%", "-25%"],
          }}
          transition={{
            duration: 22,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          {duplicated.map((partner, index) => (
            <a
              key={`${partner.src}-${index}`}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex h-14 w-36 shrink-0
                cursor-pointer items-center justify-center
                sm:h-16 sm:w-40
              "
              aria-label={`Visit ${partner.alt}`}
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                fill
                sizes="400px"
                className="
                  object-contain
                  transition-transform duration-300
                  group-hover:scale-105
                "
                priority={index < partners.length}
              />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}