import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — every page is already ○ (Static), so this produces a
  // pure HTML/CSS/JS bundle in `out/` that deploys to any static host
  // (GitHub Pages in our case, via .github/workflows/deploy-pages.yml).
  output: "export",

  // Required for static export: Next's image optimizer needs a server.
  images: { unoptimized: true },

  // Emit `/shop/index.html` style URLs so static hosts (GitHub Pages,
  // Cloudflare Pages, etc.) serve them correctly without a custom
  // rewrite layer.
  trailingSlash: true,
};

export default nextConfig;
