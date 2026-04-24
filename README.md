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

## Deployment — Cloudflare Pages

This repo ships with `.github/workflows/deploy-cloudflare.yml`, which
builds the static export and deploys to Cloudflare Pages on every push
to `main` (and via manual `workflow_dispatch`).

### One-time setup

1. **Create a Cloudflare Pages project** named `terpforge` (the workflow
   passes `--project-name=terpforge`). You can do this in the
   Cloudflare dashboard or with `wrangler pages project create terpforge`.
   Direct-upload mode is fine — the workflow uploads the prebuilt `out/`
   directory.
2. **Add two GitHub repository secrets** (Settings → Secrets and
   variables → Actions):
   - `CLOUDFLARE_API_TOKEN` — a token with the **"Cloudflare Pages →
     Edit"** permission for the account that owns the project.
   - `CLOUDFLARE_ACCOUNT_ID` — found in the Cloudflare dashboard sidebar.
3. **Custom domain (optional)** — in the Pages project settings, attach
   your TerpForge domain. Cloudflare already manages your DNS, so it
   will provision an automatic A/AAAA/CNAME and a TLS certificate.

### Deploying

Push to `main`:

```bash
git push origin main
```

…or trigger manually from the **Actions** tab → *Deploy to Cloudflare
Pages* → *Run workflow*. The workflow lints, builds, verifies the
static export exists, and uploads `out/` to Pages. Each push gets a
unique preview URL; the production alias updates after the deploy
completes.

### Local production preview

```bash
npm run build
npx serve out          # any static server works
```
