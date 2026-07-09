import Logo from "./Logo";
import { freightLinks } from "@/data/navigation";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="border-t border-line bg-background py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-10">
        <div className="max-w-xs">
         <Image
                   src="/image.png"
                   alt="Rocketshi]ing logo"
                   width={140}
                   height={40}
                   priority
                   className="h-10 w-auto"
                 />
          <p className="mt-4 text-sm text-muted">
            Freight, warehousing and supply chain solutions that keep your
            business moving — anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
          {freightLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 text-xs text-muted sm:px-6 lg:px-10">
        © {new Date().getFullYear()} Rocketshipping. All rights reserved.
      </div>
    </footer>
  );
}
