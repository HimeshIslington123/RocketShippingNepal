import {
  Clock,
  ShieldCheck,
  Home,
  Globe2,
  Headset,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const STANDARDS = [
  {
    icon: Clock,
    title: "Reliable Delivery",
    description:
      "Scheduled dispatch runs and dependable delivery times help you plan your business with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Cargo Handling",
    description:
      "Careful handling procedures and trained logistics professionals help keep every shipment secure.",
  },
  {
    icon: Home,
    title: "Door-to-Door Service",
    description:
      "Convenient pickup from your location with delivery directly to the recipient's doorstep.",
  },
  {
    icon: Globe2,
    title: "Local & Global Reach",
    description:
      "Connecting major cities across Nepal with international shipping networks and global destinations.",
  },
];

export default function WhyRocketShipping() {
  return (
    <section className="bg-white px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[1400px]">

        {/* ================= HEADER ================= */}
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E23C2E]">
            Why Rocket Shipping
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl">
            Built around reliability.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            From the moment your shipment leaves your hands to the moment it
            reaches its destination, we focus on reliable service, safe
            handling and clear communication.
          </p>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">

          {/* ================= NEPAL MAP ================= */}
          <div className="relative min-h-[420px] overflow-hidden rounded-2xl bg-white">

            {/* Map image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/Nepal.png"
                alt="Rocket Shipping Nepal logistics network"
                className="
                  h-full
                  w-full
                  object-contain
                  object-center
                "
              />
            </div>

            {/* Dark bottom gradient */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-[#071221]/90
                via-[#071221]/10
                to-transparent
              "
            />

            {/* Image information */}
            <div className="absolute bottom-0 left-0 right-0 p-6">

              <div className="flex items-center gap-2 text-white">
                <MapPin
                  size={15}
                  strokeWidth={2}
                  className="text-[#E23C2E]"
                />

                <span className="text-xs font-semibold">
                  Kathmandu • Nepal
                </span>
              </div>

              <p className="mt-2 max-w-sm text-xs leading-5 text-white/60">
                Connecting people and businesses through dependable cargo
                transportation and delivery services.
              </p>

            </div>
          </div>

          {/* ================= FEATURES ================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {STANDARDS.map(
              ({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="
                    group
                    rounded-xl
                    border
                    border-gray-200
                    bg-[#f7f8fa]
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#E23C2E]/30
                    hover:bg-white
                    hover:shadow-[0_14px_35px_rgba(11,23,41,0.07)]
                  "
                >

                  {/* Icon */}
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#E23C2E]/10
                      text-[#E23C2E]
                      transition-all
                      duration-300
                      group-hover:bg-[#E23C2E]
                      group-hover:text-white
                    "
                  >
                    <Icon
                      size={18}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 text-sm font-bold text-[#0b1729]">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {description}
                  </p>

                </div>
              )
            )}

            {/* ================= CUSTOMER SUPPORT ================= */}
            <div
              className="
                group
                rounded-xl
                border
                border-gray-200
                bg-[#0b1729]
                p-6
                transition-all
                duration-300
                hover:border-[#0b1729]
                hover:shadow-[0_14px_35px_rgba(11,23,41,0.12)]
                sm:col-span-2
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                {/* Left content */}
                <div className="flex items-start gap-4">

                  {/* Headset icon */}
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#E23C2E]
                      text-white
                    "
                  >
                    <Headset
                      size={18}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Professional customer support
                    </h3>

                    <p className="mt-2 max-w-xl text-xs leading-5 text-white/50">
                      Our support team is available to help with shipment
                      updates, delivery questions, waybill verification and
                      logistics documentation.
                    </p>
                  </div>

                </div>

                {/* Contact button */}
                <a
                  href="#"
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-white
                    transition-colors
                    duration-200
                    hover:text-[#E23C2E]
                  "
                >
                  Contact us

                  <ArrowUpRight
                    size={14}
                    strokeWidth={2}
                  />
                </a>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}