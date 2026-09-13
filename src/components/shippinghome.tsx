"use client";

export default function HeroSection() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#0b1729]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/NEPAL.png')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071221]/95 via-[#071221]/70 to-[#071221]/20" />

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b1729] to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] items-center">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-32 sm:px-10 lg:px-16 xl:px-20">
          <div className="max-w-4xl">
            {/* Label */}
            <div className="mb-6 flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#E23C2E]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                Nepal&apos;s Cargo &amp; Logistics Partner
              </span>
            </div>

            {/* H1 */}
            <h1
              className="
                max-w-4xl
                text-4xl
                font-bold
                leading-[1.12]
                tracking-tight
                text-white
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
              "
            >
              ब्यापारको सामान देश भरि,
              <br />
              अब सस्तोमा
            </h1>

            {/* Description */}
            <p
              className="
                mt-6
                max-w-2xl
                text-sm
                leading-7
                text-white/75
                sm:text-base
              "
            >
              एक्सप्रेस, बल्क, होम डेलिभरी र अन्तर्राष्ट्रिय ढुवानी सेवाहरूका
              साथ तपाईंको सामान सुरक्षित र समयमै पुर्‍याउने प्रतिबद्धता।
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#E23C2E]
                  bg-[#E23C2E]
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  transition-colors
                  duration-200
                  hover:border-[#CE3122]
                  hover:bg-[#CE3122]
                "
              >
                Register Now
              </a>

              <a
                href="#tracking"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/40
                  bg-transparent
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  transition-colors
                  duration-200
                  hover:border-white
                  hover:bg-white
                  hover:text-[#0b1729]
                "
              >
                Track Your Shipment
              </a>
            </div>

            {/* Services */}
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
              {[
                "Express Cargo",
                "Bulk Cargo",
                "Door-to-Door",
                "International",
              ].map((service, index) => (
                <div key={service} className="flex items-center gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    {service}
                  </span>

                  {index !== 3 && (
                    <span className="text-white/20">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}