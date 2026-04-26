# Brand image upgrade map

Every page now points at the existing `public/images/*.jpg` files so the
site renders complete imagery today. When you upload the higher-quality
brand images Keith generated, swap the references in the table below.

## Drop in (or rename) for a visual upgrade

| Save to this filename | Replaces fallback | Used in |
|-----------------------|-------------------|---------|
| `hero-foundry-molecular.jpg` | `hero-extraction.jpg` | Homepage hero (right column), brand video poster |
| `apparel-hooded-figure.jpg`  | `tech-life-1.jpeg`    | Homepage Verticals → Apparel card |
| `lab-extraction-rig.jpg`     | `lab-molecular.jpg`   | Homepage Verticals → Hardware card, Lab page header backdrop |
| `wellness-terp7-elixir.jpg`  | `product-showcase.jpg`| Homepage Verticals → Wellness card |
| `foundry-halls.jpg`          | `forge-process.jpg`   | Story page foundry origin section |

To swap in: save the new file to `public/images/` with the upgraded filename,
then run a quick search-and-replace on the codebase (e.g. swap
`/images/hero-extraction.jpg` → `/images/hero-foundry-molecular.jpg` only in
`src/app/page.tsx` for the hero spot).

## Per-product images

Every SKU in `src/lib/products.ts` now carries an `image` field — the shop
cards render that image full-bleed. To upgrade a product, save a new file
to `public/images/` and update the SKU's `image` field. Filename suggestion:
`product-{sku-slug}.jpg`, e.g. `public/images/product-myrcene-hoodie.jpg`.

## Variant naming convention

When one base photo is intentionally reused in multiple visual slots, create
slot-specific copies so references stay explicit in code:

- `{base}-{context}.jpg` (or `.jpeg`) for showcase variants
- Examples: `forge-process-cbda.jpg`, `forge-process-organic.jpg`,
  `lab-molecular-phenol.jpg`, `terpene-science-aromatic.jpg`

This keeps `src` paths readable and avoids ambiguous "same file, different
meaning" references in UI arrays.

## Cloudflare Images / Stream

- All static images can be transformed at the edge via the helper in
  `src/lib/cf-image.ts` — wrap any `/images/*.jpg` path with
  `cfImage(path, { width: 800, format: "auto" })`. Cloudflare Image
  Resizing must be on for the zone (it is — verified).
- The brand video uses `<StreamPlayer>` from `src/components/StreamPlayer.tsx`.
  Set `NEXT_PUBLIC_CF_STREAM_SUBDOMAIN` and `NEXT_PUBLIC_BRAND_STREAM_ID`
  in Pages env to swap from the local mp4 to Stream's adaptive bitrate player.
