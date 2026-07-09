"use client";

import { motion } from "framer-motion";

const partners = [
  "DHL",
  "FedEx",
  "UPS",
  "Maersk",
  "MSC",
  "CMA CGM",
  "COSCO Shipping",
  "Emirates SkyCargo",
];

const duplicated = [...partners, ...partners];

export default function Partners() {
  return (
    <section className="bg-background  py-16 sm:py-20">
      <div className="mx-auto max-w-3xl  overflow-hidden px-4 sm:px-6 lg:px-10">
        <p className="text-center text-xs font-semibold tracking-[0.25em] text-muted">
          TRUSTED INDUSTRY PARTNERS
        </p>

        {/* Fade */}
        <div
          className="
            mt-10
            overflow-hidden
            [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
            [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
          "
        >
          <motion.div
            className="flex w-max gap-12 opacity-70 grayscale"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {duplicated.map((name, index) => (
              <span
                key={index}
                className="shrink-0 whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-white/70"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}