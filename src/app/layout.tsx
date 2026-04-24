import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "TerpForge — Engineered Aromatics. Forged Wellness.",
  description:
    "The intersection of molecular terpene precision and industrial-grade craftsmanship. Premium terpene-infused apparel, hardware, and CBD wellness products.",
  keywords: [
    "terpenes",
    "CBD",
    "extraction",
    "molecular",
    "wellness",
    "terpforge",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0A1628] text-[#E8EDF5]">
        <CartProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
