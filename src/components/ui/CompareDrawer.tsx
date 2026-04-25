"use client";

import { useEffect } from "react";
import {
  formatPrice,
  profileColors,
  type Product,
} from "@/lib/products";

interface CompareDrawerProps {
  products: Product[];
  /** Remove a single SKU from the comparison set. */
  onRemove: (id: string) => void;
  /** Clear the entire comparison set. */
  onClear: () => void;
  /** Add to cart from inside the drawer (calls back to parent). */
  onAddToCart: (id: string) => void;
  /** Maximum supported. Cards beyond this are not shown by parent. */
  max?: number;
}

const ROW_DEFS: {
  key: string;
  label: string;
  get: (p: Product) => string;
}[] = [
  { key: "cat", label: "Category", get: (p) => p.categoryLabel },
  { key: "profile", label: "Profile", get: (p) => p.profile ?? "—" },
  { key: "price", label: "Price", get: (p) => formatPrice(p.price) },
  { key: "spec", label: "Spec", get: (p) => p.spec },
  { key: "extra", label: "Detail", get: (p) => `${p.extraLabel}: ${p.extraValue}` },
  { key: "details", label: "Notes", get: (p) => p.details },
];

/**
 * Bottom-anchored compare drawer.
 *
 * Slides up from the bottom of the viewport when the parent's compare set is
 * non-empty. Renders a full spec matrix: one column per SKU (up to `max`),
 * one row per attribute. Body scrolling is preserved (drawer is a separate
 * fixed layer; the page itself remains scrollable behind it on desktop).
 *
 * Entirely keyboard-operable: Escape clears, each remove button is focusable.
 */
export default function CompareDrawer({
  products,
  onRemove,
  onClear,
  onAddToCart,
  max = 4,
}: CompareDrawerProps) {
  const open = products.length > 0;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClear();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClear]);

  return (
    <div
      role="dialog"
      aria-label="Product comparison drawer"
      aria-hidden={!open}
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-500 ease-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
        <div className="relative bg-[#0A1628]/95 backdrop-blur-md border border-[#C9A84C]/40 shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.6)]">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"
          />

          {/* Header bar */}
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-[#C9A84C]/20">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[#C9A84C] text-xs font-mono tracking-[0.4em]">
                ▣ COMPARE
              </span>
              <span className="text-[#94A3B8] text-[10px] font-mono tracking-widest uppercase truncate">
                {products.length} of {max} slots active · ESC to clear
              </span>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Matrix — horizontal scroll on small screens */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-[1] bg-[#0A1628]/95 backdrop-blur-md w-32 sm:w-40 px-4 py-3 text-left text-[10px] font-mono tracking-[0.3em] uppercase text-[#0D9488] border-b border-[#1E293B]"
                  >
                    {"// SPEC"}
                  </th>
                  {products.map((p) => {
                    const accent = p.profile ? profileColors[p.profile] : "#C9A84C";
                    return (
                      <th
                        key={p.id}
                        scope="col"
                        className="px-4 py-3 align-top border-b border-[#1E293B] min-w-[180px]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className="text-[9px] font-mono tracking-widest uppercase mb-1"
                              style={{ color: accent }}
                            >
                              {p.profile ?? p.categoryLabel}
                            </p>
                            <p className="text-[#E8EDF5] text-sm font-bold leading-tight truncate">
                              {p.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(p.id)}
                            aria-label={`Remove ${p.name} from comparison`}
                            className="shrink-0 w-6 h-6 inline-flex items-center justify-center text-[#64748B] hover:text-[#C9A84C] border border-[#1E293B] hover:border-[#C9A84C]/50 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ROW_DEFS.map((row) => (
                  <tr key={row.key} className="border-b border-[#1E293B]/60">
                    <th
                      scope="row"
                      className="sticky left-0 z-[1] bg-[#0A1628]/95 backdrop-blur-md px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-[#64748B] align-top"
                    >
                      {row.label}
                    </th>
                    {products.map((p) => {
                      const value = row.get(p);
                      const isPrice = row.key === "price";
                      const isProfile = row.key === "profile";
                      const accent = p.profile
                        ? profileColors[p.profile]
                        : "#C9A84C";
                      return (
                        <td
                          key={`${p.id}-${row.key}`}
                          className={`px-4 py-2 align-top text-xs font-mono leading-relaxed ${
                            isPrice
                              ? "text-[#C9A84C] font-black text-base"
                              : "text-[#E8EDF5]"
                          }`}
                          style={isProfile ? { color: accent } : undefined}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Add-to-cart action row */}
                <tr>
                  <th
                    scope="row"
                    className="sticky left-0 z-[1] bg-[#0A1628]/95 backdrop-blur-md px-4 py-3 text-[10px] font-mono tracking-widest uppercase text-[#0D9488] align-top"
                  >
                    Action
                  </th>
                  {products.map((p) => (
                    <td key={`${p.id}-action`} className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => onAddToCart(p.id)}
                        className="w-full px-3 py-2 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors"
                      >
                        Add To Forge
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
