# Victor Augusto — Portfólio "Odisseia"

Portfólio single-page em que o scroll é uma viagem pelo Sistema Solar. Cada capítulo acontece diante de um planeta real (texturas Solar System Scope / NASA), com câmera em trilho, pós-processamento cinematográfico e UI pensada para quem recruta: nome, cargo, projetos e contato alcançáveis em segundos.

Spec: `docs/superpowers/specs/2026-10-08-space-portfolio-redesign-design.md` · Plano: `docs/superpowers/plans/2026-10-08-space-portfolio-redesign.md`

## Stack

- Next.js 14 (App Router, `output: 'export'` para GitHub Pages) + TypeScript + Tailwind
- React Three Fiber + drei + three · @react-three/postprocessing (SMAA, Bloom, God rays, ACES, grain, vignette)
- GSAP ScrollTrigger + Lenis (scroll → `progress` 0–1 → câmera, planetas, PostFX)
- zustand (estado da jornada) · next-intl (pt-BR padrão, en)
- Vitest (unit) · Playwright (E2E + screenshots por capítulo)

## Rodar

```bash
npm install
npm run assets     # baixa texturas (CC BY 4.0) e gera tiers em public/textures/
npm run dev
```

## Validar

```bash
npm run test       # unit: timeline, cameraPath, manifest
npm run build      # export estático em ./out
npm run build:e2e  # export estático em .next-e2e (não interfere no `npm run dev`); o e2e serve essa pasta
npm run e2e        # Playwright na porta 3100 (desktop + mobile), screenshots em e2e/screenshots/
npm run posters    # (opcional) posters por capítulo para fallback sem WebGL + OG image
```

## Estrutura

- `content/` — `planets.ts` (posições, inclinação, acento), `projects.ts` (5 projetos ↔ planetas), `skills.ts`
- `lib/journey/` — `timeline.ts` (capítulos → faixas de progress), `store.ts`, `cameraPath.ts`, `useScrollDriver.ts`
- `lib/assets/` — manifest de texturas por tier, loader
- `components/scene/` — `SpaceScene`, `CameraRig`, `Skybox`, `Sun`, `planets/*` (Earth com shader próprio, Rings com sombra), `Constellation`, `effects/PostFX`
- `components/journey/` — `Preloader`, `Header`, `MenuOverlay`, `ChapterIndicator`, `ProgressRail`, `CustomCursor`, `Marquee`, `SoundToggle`, `Chapter`
- `components/sections/` — `Hero`, `ProjectChapter`, `About`, `Skills`, `Contact`, `Footer`
- `messages/*.json` — todo o texto (pt-BR / en)

## Conteúdo

- Currículo: coloque o PDF em `public/cv/Victor-Augusto-Ferreira-dos-Santos.pdf`.
- Links pendentes marcados `TODO-VICTOR` em `content/projects.ts` ficam ocultos até serem preenchidos (LinkedIn, lojas do OppyConnect, Marketplace das extensões).

## Créditos

Texturas: [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0) · NASA.
