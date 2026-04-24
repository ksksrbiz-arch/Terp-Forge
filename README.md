# TerpForge

**Engineered Aromatics. Forged Wellness.**

TerpForge is a technical extraction-themed lifestyle brand at the intersection of molecular terpene science and heavy industrial manufacturing. This repository contains the full brand website built with Next.js, Tailwind CSS, and TypeScript.

## Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: TypeScript
- **Fonts**: Montserrat (headers) · Roboto Mono (specs/data) via Google Fonts CSS import

## Brand Palette

| Role       | Color    | Hex       |
|------------|----------|-----------|
| Primary    | Navy     | `#0A1628` |
| Primary    | Teal     | `#0D9488` |
| Accent     | Gold     | `#C9A84C` |
| Background | Charcoal | `#1E293B` |

## Pages

| Route      | Name              | Description                                       |
|------------|-------------------|---------------------------------------------------|
| `/`        | The Forge         | Homepage: hero, Cathedral Principle, products     |
| `/shop`    | The Inventory     | Product catalog (Apparel, Hardware, CBD Wellness) |
| `/lab`     | The Lab           | Terpene science education + COA portal            |
| `/story`   | The Foundry Story | Brand origin, timeline, engineering values        |
| `/contact` | Contact           | Transmission form + The Registry email capture    |

## Getting Started

```bash
npm install
npm run dev       # Development server at http://localhost:3000
npm run build     # Production build → static export in `out/`
npm run lint      # ESLint
```

`next build` produces a fully static site in `out/` (every route is
prerendered as static HTML; no Node runtime required at the edge).

## E-Commerce Architecture

| Concern | Implementation |
|---|---|
| Product catalog | `src/lib/products.ts` — single source of truth used by Shop, Cart, and homepage features |
| Cart state | `src/components/CartContext.tsx` — React context + `localStorage` persistence under key `terpforge.cart.v1` |
| Cart UI | `src/components/CartDrawer.tsx` — slide-in drawer, qty controls, checkout form, simulated order success |
| Shop filters | Client-side category / terpene-profile / search / sort on `/shop` |
| Lab simulator | `/lab` → interactive terpene selector + purity slider + simulated COA download (Blob → `.txt`) |
| Contact | `/contact` → simulated encrypted submission flow + Registry email signup |

The checkout flow is intentionally a **simulated handoff** — order data
never leaves the browser. Swap in Stripe / Printful / Shippo by
replacing `handlePlaceOrder` in `CartDrawer.tsx` with a real API call.

## Deployment — GitHub Pages

This repo ships with `.github/workflows/deploy-pages.yml`, which builds
the static export and publishes it to GitHub Pages on every push to
`main` (and via manual `workflow_dispatch`). The canonical domain is
**`terpforge.com`**, set via `public/CNAME` so it survives every redeploy.

### One-time setup

1. **Enable Pages** in repo Settings → Pages:
   - **Source**: *GitHub Actions*
   - That's it — the workflow handles configuration, artifact upload,
     and deployment via the official `actions/configure-pages` +
     `actions/upload-pages-artifact` + `actions/deploy-pages` pipeline.
2. **Point DNS at GitHub Pages**. In your DNS provider, set
   `terpforge.com` to one of:
   - **Apex (`terpforge.com`)** → four `A` records:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`
     *(or four `AAAA` records for IPv6 if preferred)*
   - **`www.terpforge.com`** → `CNAME` to `ksksrbiz-arch.github.io`
3. **Verify the custom domain** in Settings → Pages once DNS resolves;
   GitHub will issue a Let's Encrypt cert and auto-enable
   *Enforce HTTPS*.

### Deploying

Push to `main`:

```bash
git push origin main
```

…or trigger from the **Actions** tab → *Deploy to GitHub Pages* →
*Run workflow*. The workflow lints, builds the static export,
verifies `out/CNAME` is present, uploads the Pages artifact, and
deploys.

### Local production preview

```bash
npm run build
npx serve out          # any static server works
```
