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

const duplicated = [
  ...partners,
  ...partners,
  ...partners,
  ...partners,
];

export default function Partners() {
  return (
    <section className="w-full overflow-hidden bg-[#f5f6f8] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 bg-[#E23C2E]" />

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
              Institutional Trust &amp; Trade Partners
            </span>

            <span className="h-[2px] w-8 bg-[#E23C2E]" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
            Trusted By
          </h2>
        </div>
      </div>

      {/* Slider */}
      <div
        className="
          relative mt-12 w-full overflow-hidden
          [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
          [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
        "
      >
        <motion.div
          className="flex w-max items-center gap-8 px-6 sm:gap-10"
          animate={{
            x: ["0%", "-25%"],
          }}
          transition={{
            duration: 22,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicated.map((partner, index) => (
            <a
              key={`${partner.src}-${index}`}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${partner.alt}`}
              className="
                group relative flex
                h-16 w-36
                shrink-0
                cursor-pointer
                items-center
                justify-center
                sm:h-18 sm:w-40
              "
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                fill
                sizes="160px"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority={index < partners.length}
              />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}