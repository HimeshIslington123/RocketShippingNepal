"use client";

import Image from "next/image";

type Testimonial = {
quote: string;
name: string;
role: string;
company: string;
avatar: string;
};

const testimonials: Testimonial[] = [
{
quote:
"Rocket Shipping has made our regular cargo deliveries much easier. The process is simple, reliable, and our packages arrive safely.",
name: "Anish Budathoki",
role: "Operations Manager",
company: "bhotahiti.com",
avatar: "https://picsum.photos/seed/anish-budathoki/96/96",
},
{
quote:
"We regularly send products through Rocket Shipping and have had a very smooth experience. Their service and communication are excellent.",
name: "Om Malla",
role: "Business Manager",
company: "udhyogbazar.com",
avatar: "https://picsum.photos/seed/om-malla/96/96",
},
{
quote:
"Rocket Shipping has been a dependable logistics partner for our business. Their team handles our shipments professionally and on time.",
name: "Ankit Shrestha",
role: "Founder",
company: "Narrative Machine",
avatar: "https://picsum.photos/seed/ankit-shrestha/96/96",
},
{
quote:
"From pickup to delivery, the whole process is convenient and well managed. We feel confident sending our products with Rocket Shipping.",
name: "Khushi Maharjan",
role: "Business Owner",
company: "Aachar Ghar",
avatar: "https://picsum.photos/seed/khushi-maharjan/96/96",
},
{
quote:
"Their delivery service has helped us manage customer orders more efficiently. The team is responsive and the service is dependable.",
name: "Sujan Shakya",
role: "Operations Lead",
company: "BrandKTM",
avatar: "https://picsum.photos/seed/sujan-shakya/96/96",
},
{
quote:
"We appreciate the professional service and reliable delivery. Rocket Shipping has made shipping products to our customers much easier.",
name: "Pratiksha Joshi",
role: "Founder",
company: "Streetside",
avatar: "https://picsum.photos/seed/pratiksha-joshi/96/96",
},
];

export default function Testimonials() {
return ( <section className="w-full bg-white py-12 sm:py-16"> <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">


    {/* Header */}
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="h-[2px] w-8 bg-[#E23C2E]" />

        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E23C2E]">
          Client Stories
        </span>

        <span className="h-[2px] w-8 bg-[#E23C2E]" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-[#0b1729] sm:text-4xl lg:text-5xl">
        Trusted by businesses
      </h2>

    
    </div>

    {/* Testimonials */}
    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <article
          key={testimonial.company}
          className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 transition-colors duration-200 hover:border-[#E23C2E]/40"
        >
          {/* Quote */}
          <div className="text-4xl font-serif leading-none text-[#E23C2E]">
            “
          </div>

          <p className="mt-3 flex-1 text-sm leading-7 text-black/65">
            {testimonial.quote}
          </p>

          {/* Person */}
          <div className="mt-6 flex items-center gap-3 border-t border-black/10 pt-5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[#0b1729]">
                {testimonial.name}
              </h3>

              <p className="mt-0.5 text-xs text-black/50">
                {testimonial.role}
              </p>

              <p className="mt-0.5 text-xs font-semibold text-[#E23C2E]">
                {testimonial.company}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>


);
}
