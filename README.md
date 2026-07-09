# MVTRNS — Logistics Landing Page

A Next.js 16 (App Router) + Tailwind CSS v4 recreation of the freight/logistics
landing page: floating pill navbar with a dropdown, full-bleed hero with a
vertical freight-services rail, a trusted-partners strip, and an about
section with a scroll-linked text reveal.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

```
src/
  app/
    layout.tsx      — fonts (Big Shoulders Display + Inter), metadata
    globals.css      — design tokens (colors, fonts) via Tailwind @theme
    page.tsx          — assembles the sections
  components/
    Logo.tsx           — wordmark + mark
    Navbar.tsx          — floating pill nav, dropdown, mobile menu
    Hero.tsx             — full-bleed hero, CTAs, freight link rail
    Partners.tsx          — "Trusted industry partners" strip
    About.tsx               — about copy with scroll-linked reveal + stats
    Footer.tsx                — footer links
  data/
    navigation.ts             — nav + freight link content (edit here)
```

## Customizing

- **Colors / fonts**: edit the CSS variables in `src/app/globals.css`.
- **Nav links / freight services**: edit `src/data/navigation.ts`.
- **Hero image**: swap the `src` in `src/components/Hero.tsx` (remote image
  domains are whitelisted in `next.config.ts`).
- **Copy**: headline and about paragraph live directly in `Hero.tsx` and
  `About.tsx`.

## Notes

- Requires internet access on first build/dev run to fetch Google Fonts
  (Big Shoulders Display, Inter) via `next/font/google`.
- Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4.
