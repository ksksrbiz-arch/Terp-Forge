"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/lab", label: "The Lab" },
  { href: "/story", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#C9A84C]/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] text-xs font-bold font-mono">TF</span>
          </div>
          <span
            className="text-lg font-black tracking-widest uppercase text-[#E8EDF5] group-hover:text-[#C9A84C] transition-colors duration-300"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            TerpForge
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm font-semibold tracking-widest uppercase transition-colors duration-300 relative group ${
                  pathname === href
                    ? "text-[#C9A84C]"
                    : "text-[#E8EDF5]/70 hover:text-[#C9A84C]"
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-[#C9A84C] transition-all duration-300 ${
                    pathname === href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/shop"
            className="px-5 py-2 bg-[#C9A84C] text-[#0A1628] text-xs font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors duration-300"
          >
            The Inventory
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
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
