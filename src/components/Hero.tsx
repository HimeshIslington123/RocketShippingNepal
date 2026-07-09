"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { freightLinks } from "@/data/navigation";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-[100vh] min-h-[640px] w-full overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1715645948484-da40dd56bc93?fm=jpg&q=80&w=2400&auto=format&fit=crop"
        alt="Courier loading fragile cardboard boxes into a delivery van"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/55" />

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-10 sm:px-6 lg:px-10 lg:pb-14">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-12">
          {/* Left Content */}
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
              }}
              className="font-display text-[13vw] font-semibold leading-[0.95] tracking-tight text-white text-balance sm:text-6xl lg:text-[5rem]"
            >
              Powering Seamless Global Transportation
            </motion.h1>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Explore Service Button */}
              <a
                href="#service"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#141414] transition-all duration-300 hover:-translate-y-1"
              >
                Explore Service
                <ArrowRight
                  className="h-4 w-4 text-red-600 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.5}
                />
              </a>

              {/* Learn More Button */}
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/20"
              >
                Learn More
                <ArrowRight
                  className="h-4 w-4 text-red-500"
                  strokeWidth={2.5}
                />
              </a>
            </div>
          </div>

          {/* Right Navigation */}
          <nav className="hidden flex-col items-end gap-4 lg:flex">
            {freightLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
              >
                {link.label}

                <ArrowRight
                  className="h-4 w-4 text-red-500 opacity-0 -translate-x-1 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  strokeWidth={2.5}
                />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
