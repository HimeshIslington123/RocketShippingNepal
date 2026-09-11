export default function CtaBanner() {
  return (
    <section className="bg-[#0b1729] px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[1400px]">

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#101e32]
            px-7
            py-12
            sm:px-12
            lg:px-16
          "
        >

          {/* Decorative red line */}
          <div className="absolute left-0 top-0 h-full w-1 bg-[#E23C2E]" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div className="max-w-2xl">

              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F0553F]">
                Let&apos;s move your cargo
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to ship with Rocket Shipping?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                From local deliveries to international cargo, we make every
                shipment simple, secure and trackable.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <a
                href="/register"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-md
                  bg-[#E23C2E]
                  px-7
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-[#C92F22]
                "
              >
                Register Now
                <span className="ml-2">→</span>
              </a>

              <a
                href="#tracking"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-white/20
                  px-7
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  hover:border-white/40
                  hover:bg-white/10
                "
              >
                Track Shipment
              </a>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}