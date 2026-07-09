"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const MotionImage = motion(Image);

export default function HeroSection() {
  const { scrollYProgress } = useScroll();

  // Left image animation
  const leftScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.2]);
  const leftY = useTransform(scrollYProgress, [0, 0.7], [0, 180]);

  // Right image animation
  const rightScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.2]);
  const rightY = useTransform(scrollYProgress, [0, 0.7], [0, 180]);

  return (
<section className="relative overflow-hidden">
  <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-10">
        <div className="flex w-full flex-col items-center justify-between gap-10 md:flex-row">
          {/* Left Image */}
          <div className="overflow-hidden h-[60vh] sm:h-[70vh] lg:h-[85vh] flex items-center justify-center">
            <MotionImage
              src="/hero1.png"
              alt="Hero 1"
              width={900}
              height={1200}
              priority
              style={{
                scale: leftScale,
                y: leftY,
              }}
              className="h-full w-auto object-contain"
            />
          </div>

          {/* Right Image */}
          <div className="overflow-hidden h-[60vh] sm:h-[70vh] lg:h-[85vh] flex items-center justify-center">
            <MotionImage
              src="/hero2.png"
              alt="Hero 2"
              width={900}
              height={1200}
              priority
              style={{
                scale: rightScale,
                y: rightY,
              }}
              className="h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}