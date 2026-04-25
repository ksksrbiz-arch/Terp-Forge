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

## Deployment

```
git push origin main
  ├─► Deploy to Cloudflare Pages  →  terpforge.pages.dev  →  terpforge.com / www.terpforge.com  [PRIMARY]
  └─► Deploy to GitHub Pages      →  ksksrbiz-arch.github.io/Terp-Forge/                        [HOT FALLBACK]
```

Both workflows fire on every push to `main`. They build the same static artifact independently and never block each other.

### Cloudflare Pages (primary)

Workflow: `.github/workflows/deploy-cloudflare.yml`

The workflow lints, builds the static export, and publishes to Cloudflare Pages via `wrangler pages deploy`. The `wrangler.toml` at the root pins the project name (`terpforge`) and build output dir (`./out`).

#### Required GitHub Actions secrets

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (see DEPLOY.md) |
| `CLOUDFLARE_API_TOKEN`  | API token with **Cloudflare Pages — Edit** account permission |

Generate the token at **Cloudflare → My Profile → API Tokens → Create Token → Custom token** with the *Cloudflare Pages — Edit* account permission. Wrangler auto-creates the project on the first run.

#### Wiring `terpforge.com` to Cloudflare Pages

1. Add `terpforge.com` to Cloudflare as a zone and delegate nameservers at your registrar.
2. Once the zone is **active**, open the `terpforge` Pages project → *Custom domains* → *Set up a custom domain* → add `terpforge.com` then `www.terpforge.com`. Cloudflare creates DNS records automatically.
3. `www.terpforge.com` is redirected to the apex via `public/_redirects` (Netlify-syntax redirect file respected by Cloudflare Pages).
4. Optional: enable *Always Use HTTPS* and configure an *Edge Cache TTL* on the zone.

#### Local deploy

```bash
npm ci
npm run build

# Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in env
npx wrangler@3 pages deploy out --project-name=terpforge --branch=preview
```

---

### GitHub Pages (hot fallback)

Workflow: `.github/workflows/deploy-pages.yml`

Every push to `main` also deploys to GitHub Pages. The site is always live at `https://ksksrbiz-arch.github.io/Terp-Forge/` and is pre-configured with `public/CNAME` (`terpforge.com`) so that a single DNS change at the registrar (A records pointing to GitHub's IPs) is all that's needed to fail over.

**GitHub Pages DNS (fallback):**
- Apex (`terpforge.com`) → four `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `www.terpforge.com` → `CNAME` to `ksksrbiz-arch.github.io`

Enable *GitHub Pages* in repo Settings → Pages → **Source: GitHub Actions** once (one-time setup). The workflow handles the rest automatically.
