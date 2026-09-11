"use client";

export default function HeroSection() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#0b1729]">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
       style={{
  backgroundImage: "url('/NEPAL.png')",
}}
      />

     

      {/* Left dark gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071221]/95 via-[#071221]/70 to-transparent" />

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b1729] to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] items-center">

        <div className="mx-auto w-full max-w-[1400px] px-6 py-32 sm:px-10 lg:px-16 xl:px-20">

          <div className="max-w-4xl">

            {/* Eyebrow */}
            <div className="mb-7 flex items-center gap-3">

              <span className="h-[2px] w-9 bg-[#E23C2E]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                Nepal&apos;s Cargo &amp; Logistics Partner
              </span>

            </div>

            {/* Heading */}
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
                lg:text-[70px]
                xl:text-[76px]
              "
            >
             ब्यापारको सामान देश भरि , अब सस्तोमा
              <br />
          
            </h1>

            {/* Description */}
            <p
              className="
                mt-7
                max-w-2xl
                text-sm
                leading-7
                text-white/70
                sm:text-base
                md:text-lg
              "
            >
              एक्सप्रेस, बल्क, होम डेलिभरी र अन्तर्राष्ट्रिय ढुवानी सेवाहरूका
              साथ तपाईंको सामान सुरक्षित र समयमै पुर्‍याउने प्रतिबद्धता।
            </p>

            {/* ================= BUTTONS ================= */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              {/* Register Now */}
              <a
                href="/register"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
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
                  hover:bg-[#C92F22]
                  hover:border-[#C92F22]
                "
              >
                Register Now
              </a>

              {/* Track Shipment */}
              <a
                href="#tracking"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
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
                  hover:bg-white
                  hover:border-white
                  hover:text-[#0b1729]
                "
              >
                Track Your Shipment
              </a>

            </div>

            {/* Services */}
            <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2">

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                Express Cargo
              </span>

              <span className="text-white/20">
                •
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                Bulk Cargo
              </span>

              <span className="text-white/20">
                •
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                Door-to-Door
              </span>

              <span className="text-white/20">
                •
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                International
              </span>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}