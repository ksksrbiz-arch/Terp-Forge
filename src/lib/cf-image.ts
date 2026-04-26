/** Cloudflare Image Resizing helper.
 *
 * Returns a `/cdn-cgi/image/<options>/<src>` URL that hits the zone's
 * built-in image resizer (auto-enabled by Cloudflare when "Image
 * Resizing" is turned on for the zone). The returned URL is an
 * absolute path on the same origin, so it works with `<Image>`,
 * `<img>`, CSS `background-image`, and Open Graph meta tags.
 *
 * Falls back to the raw src untouched in dev / when Image Resizing
 * isn't available.
 *
 * Reference: https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */
export type CfImageOpts = {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "scale-down" | "crop" | "pad";
  quality?: number;          // 1-100
  format?: "auto" | "webp" | "avif" | "json";
  sharpen?: number;          // 0-10
  metadata?: "keep" | "copyright" | "none";
};

const isEnabled = process.env.NEXT_PUBLIC_CF_IMAGES_ENABLED !== "false";

export function cfImage(src: string, opts: CfImageOpts = {}): string {
  if (!isEnabled || !src.startsWith("/")) return src; // pass-through for absolute URLs / disabled state
  const parts: string[] = [];
  if (opts.width)   parts.push(`width=${opts.width}`);
  if (opts.height)  parts.push(`height=${opts.height}`);
  if (opts.fit)     parts.push(`fit=${opts.fit}`);
  if (opts.quality) parts.push(`quality=${opts.quality}`);
  if (opts.format)  parts.push(`format=${opts.format}`);
  if (opts.sharpen) parts.push(`sharpen=${opts.sharpen}`);
  if (opts.metadata) parts.push(`metadata=${opts.metadata}`);
  if (parts.length === 0) parts.push("format=auto", "quality=85");
  return `/cdn-cgi/image/${parts.join(",")}${src}`;
}

/** Convenience for srcSet generation across common breakpoints. */
export function cfImageSrcSet(src: string, widths: number[] = [400, 800, 1200, 1600], extra: Omit<CfImageOpts, "width"> = { format: "auto", quality: 85 }): string {
  return widths.map((w) => `${cfImage(src, { ...extra, width: w })} ${w}w`).join(", ");
}
