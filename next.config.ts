import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — every page is already ○ (Static), so this produces a
  // pure HTML/CSS/JS bundle in `out/` that deploys to any static host.
  // Primary: Cloudflare Pages (deploy-cloudflare.yml) → terpforge.com
  // Fallback: GitHub Pages  (deploy-pages.yml)        → ksksrbiz-arch.github.io/Terp-Forge/
  output: "export",

  // Required for static export: Next's image optimizer needs a server.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/user-attachments/assets/**",
      },
    ],
  },

  // Emit `/shop/index.html` style URLs so static hosts (GitHub Pages,
  // Cloudflare Pages, etc.) serve them correctly without a custom
  // rewrite layer.
  trailingSlash: true,
};

export default nextConfig;
