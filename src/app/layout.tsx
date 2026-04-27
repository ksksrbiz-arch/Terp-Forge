import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import PageTransition from "@/components/PageTransition";
import SiteShellEnhancements from "@/components/SiteShellEnhancements";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

// Brand typefaces — bundled, served from the same origin, no Google Fonts call.
const tfSans = localFont({
  src: [
    {
      path: "./fonts/TerpForgeSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/TerpForgeSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-tf-sans",
  display: "swap",
});

const tfMono = localFont({
  src: [
    {
      path: "./fonts/TerpForgeMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/TerpForgeMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-tf-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Engineered Aromatics. Forged Wellness.`,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "terpenes",
    "CBD",
    "extraction",
    "molecular",
    "wellness",
    "terpforge",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${siteName} — Engineered Aromatics. Forged Wellness.`,
    description: siteDescription,
    siteName,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteName} open graph image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Engineered Aromatics. Forged Wellness.`,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${tfSans.variable} ${tfMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A1628] text-[#E8EDF5]">
        <a
          href="#main-content"
          className="skip-link fixed left-4 top-4 z-[95] -translate-y-24 px-4 py-2 bg-[#C9A84C] text-[#0A1628] text-xs font-bold tracking-[0.3em] uppercase transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <CartProvider>
          <SiteShellEnhancements />
          <Navigation />
          <main id="main-content" className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        {/* Site-wide atmospheric overlays — film grain + radial vignette.
            Mounted last so they layer over every page surface but stay
            below the navigation, drawers, and command palette (z 70+). */}
        <div aria-hidden="true" className="atmosphere-vignette" />
        <div aria-hidden="true" className="atmosphere-grain" />
      </body>
    </html>
  );
}
