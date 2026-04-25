# TerpForge — Visual Ascension & Massive Upgrade · TODO

A staged roadmap to push TerpForge from an informational brand site into a
cinematic, motion-rich industrial experience — without breaking the
static-export deployment model or pulling in heavy dependencies.

> **Guiding principles**
> 1. Industrial cinema (molecular schematics, blueprint grids, gold foil) — never Web 2.0 polish.
> 2. Motion with restraint — every animation honors `prefers-reduced-motion`.
> 3. Zero new heavy deps — pure CSS, SVG, Canvas, tiny hooks.
> 4. System over screens — token & primitive layer first, pages benefit downstream.

---

## Phase 1 — Foundation (first pass, in progress)

- [x] Capture baseline (lint + build green)
- [x] Add `todo.md` (this file)
- [ ] **Design system v2** in `src/app/globals.css`
  - [ ] Animated noise / film-grain overlay utility
  - [ ] Scanline overlay utility
  - [ ] Holographic gold gradient text (`.holo-gold`)
  - [ ] Conic gold ring utility
  - [ ] Gradient-border + glass-panel utilities
  - [ ] Hex-mesh + blueprint-grid backgrounds
  - [ ] Motion keyframes: drift, slow-spin, scan, marquee, tilt, fade-up
  - [ ] Full `prefers-reduced-motion` guards
- [ ] **Primitives** (`src/components/ui/`)
  - [ ] `MolecularCanvas` — animated molecular network on `<canvas>`
  - [ ] `Reveal` — IntersectionObserver scroll-reveal wrapper
  - [ ] `Marquee` — pure-CSS infinite ticker
  - [ ] `CornerBrackets` — schematic corner decorators
- [ ] **Navigation v2**
  - [ ] Scroll-shrink with backdrop intensity ramp
  - [ ] Rotating hex brand mark
  - [ ] Ink-sweep gold underline on links
  - [ ] Refined cart hex with gentle pulse when items present
- [ ] **Hero v2 on `/`**
  - [ ] Kinetic stagger headline + holographic gold shimmer
  - [ ] Live `MolecularCanvas` backdrop layered behind hero
  - [ ] Vertical schematic readouts on left/right edges
  - [ ] Telemetry marquee strip below hero
- [ ] Validate `npm run lint` + `npm run build`

## Phase 2 — Section system & page showcases

- [x] Reusable `Section` component (clip-path angled dividers, corner brackets, "§ NN / NN" index)
- [x] Cathedral pillars → 3D-tilt cards, conic gold rings, animated stat count-up on reveal
- [x] Terpene Profiles → interactive **molecular orbit selector** (central hex + orbiting nodes)
- [x] Visual Showcase → bento asymmetric grid, grayscale → color hover, label slide-in
- [x] Manifesto → full-bleed parallax with kinetic typography

## Phase 3 — Shop ascension

- [x] Product cards: schematic front face with profile-tinted accents
- [x] Card hover flip-panel revealing spec sheet (SKU, profile, price, sizes/extras, notes)
- [x] Sticky filter rail (already present; preserved + dimming on profile filter)
- [x] **Profile Lens** — re-tints the page with the active terpene's accent (radial vignette)
- [x] Compare drawer — up to 4 SKUs side-by-side spec matrix with add-to-cart actions

## Phase 4 — The Lab ascension (signature page)

- [ ] **Compound Matrix** — periodic-table-style grid with structure-on-hover
- [ ] Click cell → expanded spec sheet with animated property bars
- [ ] Auto-rotating ball-and-stick **molecule viewer** (SVG/Canvas) with drag
- [ ] Schematic-style COA generator (canvas → blob, batch ID + SVG QR)
- [ ] **Synergy Builder** — pick two terpenes, animated radar chart of effect profile

## Phase 5 — Story / Foundry timeline

- [x] Horizontal scroll-driven foundry-blueprint timeline with hex milestone nodes
- [x] Engineering Values — stroke-draw icon system on reveal
- [x] Founder/origin cinematic full-bleed section with looping ambient plate

## Phase 6 — Cart & checkout ascension

- [ ] Cart drawer → "manifest sheet" styling (batch IDs, COA links, terpene badges)
- [ ] Multi-step **transmission protocol** checkout with animated step indicator
- [ ] Order success → animated forge stamp + hex-particle confetti

## Phase 7 — Site-wide cross-cutting

- [ ] **Command palette** (⌘K): jump to product, lab compound, page section
- [ ] Cursor companion — subtle hex glow follower (pointer + motion-safe only)
- [ ] Schematic boot-sequence loading state ("INITIALIZING TF-SYSTEMS…")
- [ ] Themed **404** ("OFFLINE TRANSMISSION") with animated noise
- [ ] Easter egg: type `forge` → gold-foil shimmer wash
- [ ] SEO: dynamic OG image route, sitemap.xml, robots.txt, JSON-LD product schema
- [ ] A11y pass: gold focus rings, skip-link, aria-live cart updates, full reduced-motion audit
- [ ] Perf pass: image priority audit, `next/font` migration, route-level prefetch tuning

---

## Validation gate (every phase)

- [ ] `npm run lint` — green
- [ ] `npm run build` — static export still produces all 8 routes
- [ ] Manual reduced-motion check (system preference toggle)
