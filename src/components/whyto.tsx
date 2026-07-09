"use client"
import Image from "next/image";
import {motion} from "framer-motion"
/**
 * "Why Choose Us" section for Movetrans logistics site.
 *
 * Usage (Next.js App Router):
 *   import WhyChooseUs from "@/components/WhyChooseUs";
 *   export default function Page() {
 *     return <WhyChooseUs />;
 *   }
 *
 * Notes:
 * - Replace the `src` values below with your real image paths
 *   (place files in the /public folder, e.g. /public/delivery.jpg
 *   and /public/devendra.jpg), or pass them in as props.
 * - Tailwind CSS is required (this uses utility classes only).
 */

type WhyChooseUsProps = {
  heroImage?: string;
  heroImageAlt?: string;
  personPhoto?: string;
  personName?: string;
  personRole?: string;
  quote?: string;
};

const stats = [
  { value: "25+", label: "Years of Experience" },
  { value: "48+", label: "Logistics Partners" },
  { value: "72+", label: "Cities Covered" },
];

export default function WhyChooseUs({
  heroImage = "/van.png",
  heroImageAlt = "Delivery courier carrying a package outside a house",
  personPhoto = "/devendra.jpg",
  personName = "DEVENDRA JUNG",
  personRole = "Head of Rocket Shipping",
  quote = "Efficient ground transportation for regional and cross-country delivery. Movetrans ensures safe handling.",
}: WhyChooseUsProps) {
  return (
    <section className="bg-black text-white px-6 py-20 md:px-16 lg:px-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: image with overlay card */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={heroImage}
              alt={heroImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Overlay quote card */}
          <div className="absolute bottom-6 left-6 w-[calc(100%-3rem)] max-w-md rounded-xl bg-black/70 p-5 backdrop-blur-sm sm:w-auto">
            <p className="mb-6 text-sm leading-relaxed text-gray-200 sm:text-base">
              {quote}
            </p>

            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={personPhoto}
                  alt={personName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold tracking-wide text-white sm:text-sm">
                  {personName}
                </p>
                <p className="text-xs text-gray-400 sm:text-sm">{personRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: heading + stats */}
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs font-medium tracking-[0.25em] text-gray-300">
            WHY CHOOSE US
          </p>

       <motion.h2
  initial={{ opacity: 0, x: -80 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{
    duration: 0.9,
    ease: "easeOut",
  }}
  className="mb-12 font-display text-3xl font-medium leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl"
>
  The Advantage of Choosing Rocket Shipping for Reliable and Efficient Logistics
  Solutions
</motion.h2>

          <div className="flex flex-wrap gap-x-10 gap-y-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-l-1 border-orange-500 pl-4"
              >
                <p className="text-4xl font-semibold sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
