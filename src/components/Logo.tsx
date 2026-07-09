export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a
      href="#home"
      className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            d="M2 17L9 4L12 10L15 4L22 17"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -bottom-0.5 -left-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className={dark ? "text-[#141414]" : "text-white"}>MVTRNS</span>
    </a>
  );
}
