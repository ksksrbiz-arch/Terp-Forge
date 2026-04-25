# TerpForge Deployment

Production stack:

- **Source of truth**: `main` on `ksksrbiz-arch/Terp-Forge`
- **Build**: `next build` with `output: "export"` → static `out/` directory
- **Hosts**:
  - GitHub Pages (`.github/workflows/deploy-pages.yml`) — fallback
  - Cloudflare Pages (`.github/workflows/deploy-cloudflare.yml`) — primary
- **Apex domain**: `terpforge.com`

Both workflows fire on every push to `main`. They build the same artifact,
publish to two hosts in parallel, and never block each other.

## Cloudflare Pages — first-time setup

The workflow uses `cloudflare/wrangler-action` to run
`wrangler pages deploy out --project-name=terpforge`. Wrangler
auto-creates the project on the first run.

### Required GitHub Action secrets

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | `371afa6149061390a094cfbf8a184aff` |
| `CLOUDFLARE_API_TOKEN`  | API token with **Cloudflare Pages — Edit** account permission |

> **Token scope matters.** A token without Pages permissions will return
> `Authentication error (10000)` from `pages/projects` calls. Generate a
> token at Cloudflare → My Profile → API Tokens → Create Token →
> Custom token, with the **Cloudflare Pages — Edit** permission for the
> `Skdev@1commercesolutions.com` account, and store it as
> `CLOUDFLARE_API_TOKEN`. The workflow re-reads the secret on each run,
> so rotating it is a one-line update.

### Wiring `terpforge.com` to Cloudflare Pages

1. Add `terpforge.com` to Cloudflare as a zone (Cloudflare → Add a Site).
   Cloudflare assigns nameservers.
2. At the registrar, replace nameservers with the two Cloudflare ones.
3. Once the zone is **active**, open the `terpforge` Pages project →
   *Custom domains* → *Set up a custom domain* → enter `terpforge.com`
   then `www.terpforge.com`. Cloudflare creates the records inside the
   zone automatically.
4. Optional: enable *Always Use HTTPS* and set an *Edge Cache TTL* on
   the zone.

While DNS is still pointing at GitHub Pages, the Cloudflare Pages build
continues to serve the same content at `https://terpforge.pages.dev`.
The cutover is just the DNS swap — no code change needed.

## Local deploy

```bash
npm ci
npm run build

# Wrangler 3+ with the env vars above exported
npx wrangler@3 pages deploy out --project-name=terpforge --branch=preview
```

## Fallback / rollback

GitHub Pages stays armed as a hot fallback. If a Cloudflare Pages deploy
fails, GH Pages still has the last green artifact at
`https://ksksrbiz-arch.github.io/Terp-Forge/`. Repointing
`terpforge.com` back is a single CNAME change.
