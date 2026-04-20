# Victor — Intergalactic FullStack Portfolio

A cinematic, monochrome, single-page immersive portfolio for a FullStack Developer. Built as a scroll journey through deep space, with a fixed WebGL atmosphere (stars, nebula, orbital rings, a sculptural monolith), scroll-linked reveals, cursor micro-parallax, and bilingual support (PT-BR default, EN).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (custom monochrome palette + display typography)
- **Framer Motion** (reveals, cursor/scroll parallax)
- **React Three Fiber** + **Drei** + **Three.js** (fixed atmospheric 3D scene)
- **Lenis** (smooth scrolling, reduced-motion aware)
- **next-intl** (pt-BR default, en)

## Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Structure

- `app/[locale]/layout.tsx` — HTML shell, fonts, Lenis, R3F canvas mount, grain, locale switch
- `app/[locale]/page.tsx` — Single-page scroll journey
- `components/scene/*` — `SpaceScene`, `Starfield`, `Nebula`, `Orbits`, `Monolith`, cursor + scroll parallax
- `components/sections/*` — Hero, Projects, About, Expertise, Contact, Footer
- `components/ui/*` — `SmoothScroll`, `Reveal`, `LocaleSwitch`
- `messages/*.json` — i18n content (PT-BR default, EN)
- `content/projects.ts` — project metadata

## Art direction

- Palette strictly monochrome (black, graphite, silver, off-white) with a subtle cold white glow
- SVG film grain overlay + radial vignette for cinematic depth
- Slow, breathable motion — all transforms GPU-accelerated (`transform`/`opacity` only)
- Device-tiered 3D: star count, DPR, and nebula shader adapt to mobile/low-end
- Respects `prefers-reduced-motion` (disables Lenis smooth scroll and Framer animations)

## Replacing placeholders

- Identity, projects, socials, copy: `messages/pt-BR.json` and `messages/en.json`
- Project metadata (stack, links): `content/projects.ts`
