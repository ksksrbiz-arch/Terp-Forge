"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { openCommandPalette } from "./SiteShellEnhancements";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/lab", label: "The Lab" },
  { href: "/story", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, openCart, hydrated } = useCart();

  // Avoid showing a stale "0" badge before localStorage hydrates.
  const showBadge = hydrated && itemCount > 0;
  const cartLabel = `Open cart${showBadge ? ` (${itemCount} items)` : ""}`;
  const badgeText = itemCount > 99 ? "99+" : String(itemCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm border-b ${
        scrolled
          ? "bg-[#0A1628]/95 border-[#C9A84C]/30 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
          : "bg-[#0A1628]/70 border-[#C9A84C]/15"
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative inline-flex w-9 h-9 items-center justify-center">
            <svg
              viewBox="0 0 36 36"
              className="absolute inset-0 w-full h-full hex-rotate text-[#C9A84C]/60 group-hover:text-[#C9A84C] transition-colors"
              aria-hidden="true"
            >
              <polygon
                points="18,2 33,10.5 33,25.5 18,34 3,25.5 3,10.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <polygon
                points="18,6 29.5,12.5 29.5,23.5 18,30 6.5,23.5 6.5,12.5"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="0.6"
              />
            </svg>
            <span className="relative text-[#C9A84C] text-[10px] font-bold font-mono tracking-widest">
              TF
            </span>
          </span>
          <span
            className="text-lg font-black tracking-widest uppercase text-[#E8EDF5] group-hover:text-[#C9A84C] transition-colors duration-300"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            TerpForge
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  data-active={active}
                  className={`ink-sweep text-sm font-semibold tracking-widest uppercase transition-colors duration-300 ${
                    active ? "text-[#C9A84C]" : "text-[#E8EDF5]/70 hover:text-[#C9A84C]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA + Cart */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={openCommandPalette}
            className="inline-flex items-center gap-2 border border-[#0D9488]/35 px-3 py-2 text-[10px] font-mono tracking-[0.3em] uppercase text-[#0D9488] hover:border-[#0D9488] hover:bg-[#0D9488]/10"
            aria-label="Open command palette"
          >
            <span>Jump</span>
            <span className="border border-current px-1.5 py-0.5 text-[9px] leading-none">⌘K</span>
          </button>
          <Link
            href="/shop"
            className="px-5 py-2 bg-[#C9A84C] text-[#0A1628] text-xs font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors duration-300"
          >
            The Inventory
          </Link>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
            aria-label={cartLabel}
            className="relative inline-flex items-center justify-center w-10 h-10 border border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
          >
            <span aria-hidden className="text-base leading-none">⬡</span>
            {showBadge && (
              <>
                <span
                  aria-hidden
                  className="absolute inset-0 border border-[#C9A84C]/60 pulse-soft pointer-events-none"
                />
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#C9A84C] text-[#0A1628] text-[10px] font-black font-mono rounded-full flex items-center justify-center border border-[#0A1628]"
                >
                  {badgeText}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Mobile: cart + menu */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            className="inline-flex h-10 w-10 items-center justify-center border border-[#0D9488]/35 text-[#0D9488] hover:border-[#0D9488] hover:bg-[#0D9488]/10 transition-colors"
          >
            ⌕
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
            aria-label={cartLabel}
            className="relative inline-flex items-center justify-center w-10 h-10 border border-[#C9A84C]/40 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
          >
            <span aria-hidden className="text-base leading-none">⬡</span>
            {showBadge && (
              <span
                aria-hidden
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#C9A84C] text-[#0A1628] text-[10px] font-black font-mono rounded-full flex items-center justify-center border border-[#0A1628]"
              >
                {badgeText}
              </span>
            )}
          </button>
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`w-6 h-0.5 bg-[#C9A84C] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`w-6 h-0.5 bg-[#C9A84C] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`w-6 h-0.5 bg-[#C9A84C] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#C9A84C]/20 bg-[#0A1628]">
          <ul className="flex flex-col">
            {navLinks.map(({ href, label }) => (
              <li key={href} className="border-b border-[#1E293B]">
                <Link
                  href={href}
                  className={`block px-6 py-4 text-sm font-semibold tracking-widest uppercase transition-colors duration-300 ${
                    pathname === href
                      ? "text-[#C9A84C] bg-[#0F1F3D]"
                      : "text-[#E8EDF5]/70 hover:text-[#C9A84C] hover:bg-[#0F1F3D]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="p-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openCommandPalette();
                }}
                className="mb-3 block w-full border border-[#0D9488]/35 px-5 py-3 text-center text-xs font-mono tracking-[0.3em] uppercase text-[#0D9488] hover:border-[#0D9488] hover:bg-[#0D9488]/10 transition-colors"
              >
                Open Command Palette
              </button>
              <Link
                href="/shop"
                className="block text-center px-5 py-3 bg-[#C9A84C] text-[#0A1628] text-xs font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors duration-300"
                onClick={() => setMenuOpen(false)}
              >
                The Inventory
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
