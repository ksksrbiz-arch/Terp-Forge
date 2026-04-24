import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — every page is already ○ (Static), so this produces a
  // pure HTML/CSS/JS bundle in `out/` that deploys to any static host
  // (Cloudflare Pages in our case).
  output: "export",

  // Required for static export: Next's image optimizer needs a server.
  images: { unoptimized: true },

  // Emit `/shop/index.html` style URLs so Cloudflare Pages serves them
  // correctly without a custom rewrite layer.
  trailingSlash: true,
};

export default nextConfig;
