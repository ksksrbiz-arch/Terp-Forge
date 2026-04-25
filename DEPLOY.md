# TerpForge Deployment

Production stack:

- **Source of truth**: `main` on `ksksrbiz-arch/Terp-Forge`
- **Build**: `next build` with `output: "export"` → static `out/` directory
- **Hosts**:
  - Cloudflare Pages — `.github/workflows/deploy-cloudflare.yml` (primary, terpforge.com)
  - GitHub Pages — `.github/workflows/deploy-pages.yml` (hot fallback)
- **Apex domain**: `terpforge.com` (CNAME flattening → `terpforge.pages.dev`)
- **Pages Functions** (Cloudflare Workers runtime, in `functions/`):
  - `POST /api/checkout` — creates Stripe Checkout sessions from cart payloads
  - `POST /api/webhook-stripe` — Stripe webhook handler that dispatches Printful orders for dropship SKUs

Both deploy workflows fire on every push to `main`.

## Cloudflare Pages — environment variables

Set these in **Pages → terpforge → Settings → Environment variables**.
Production (and Preview if you want preview deploys to take real orders).

### Required for Stripe checkout
| Variable | Example | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` / `sk_test_...` | Server-side only |
| `STRIPE_PRICE_CURRENCY` | `usd` | Optional, defaults to `usd` |
| `PUBLIC_SITE_URL` | `https://terpforge.com` | Optional, used for success/cancel URLs |

### Required for Printful dropship
| Variable | Example | Notes |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Developers → Webhooks → Add endpoint `https://terpforge.com/api/webhook-stripe`, listen for `checkout.session.completed`, copy the signing secret |
| `PRINTFUL_API_KEY` | `pf_xxx` | Printful → Settings → API |
| `PRINTFUL_STORE_ID` | `12345` | Optional — only needed if your Printful account has multiple stores |

Each apparel SKU in `src/lib/products.ts` can carry an optional `printfulVariantId: number`. If set, the webhook forwards that line to Printful for fulfillment. Self-fulfilled SKUs (hardware, wellness) just don't have the field — they pass through Stripe and you ship them.

### Optional — Cloudflare Stream
| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_CF_STREAM_SUBDOMAIN` | `customer-abc123` | Your Stream subdomain (Stream → Get a video → embed) |
| `NEXT_PUBLIC_BRAND_STREAM_ID` | `5d5bc37ffcf54c9b82e996823bffbb81` | UID of the brand video on Stream |

When both are set, `<StreamPlayer>` swaps from the static `/videos/brand-video.mp4` to the Stream iframe player. Without them, the mp4 in `public/videos/` continues to serve.

### Optional — Cloudflare Images
Image Resizing is enabled at the zone level (Cloudflare Dashboard → Images → Image Resizing → On). With it on, `<img>` tags pointing at `/cdn-cgi/image/<options>/<src>` get auto-transformed at the edge. The helper in `src/lib/cf-image.ts` (`cfImage(src, opts)`) builds those URLs. Set `NEXT_PUBLIC_CF_IMAGES_ENABLED=false` if you ever need to bypass it for debugging.

## Cloudflare Pages — first-time setup recap

The workflow uses `cloudflare/wrangler-action` to run
`wrangler pages deploy out --project-name=terpforge`.

### Required GitHub Action secrets

| Secret | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | `371afa6149061390a094cfbf8a184aff` |
| `CLOUDFLARE_API_TOKEN`  | API token with **Cloudflare Pages — Edit** account permission |

## Local deploy

```bash
npm ci
npm run build
npx wrangler@3 pages deploy out --project-name=terpforge --branch=preview
```

Functions live in `functions/` and are picked up automatically by `wrangler pages deploy`. Local dev with functions:

```bash
npx wrangler@3 pages dev out --kv KV_NAMESPACE_PLACEHOLDER --binding STRIPE_SECRET_KEY=sk_test_xxx
```

## Fallback / rollback

GitHub Pages stays armed as a hot fallback. If a Cloudflare deploy fails, GH Pages still serves the last green artifact at `https://ksksrbiz-arch.github.io/Terp-Forge/`. Repointing `terpforge.com` back is a single CNAME edit.
