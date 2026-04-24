"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";
import {
  formatPrice,
  products,
  profileColors,
  type Product,
  type ProductCategory,
  type TerpeneProfile,
} from "@/lib/products";

type CategoryFilter = "all" | ProductCategory;
type ProfileFilter = "all" | NonNullable<TerpeneProfile>;
type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "apparel", label: "Apparel" },
  { id: "hardware", label: "Hardware" },
  { id: "wellness", label: "CBD Wellness" },
];

const PROFILE_TABS: NonNullable<TerpeneProfile>[] = [
  "FOCUS",
  "RECOVERY",
  "CALM",
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
];

export default function ShopPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [profile, setProfile] = useState<ProfileFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  // Honor legacy deep-links: /shop#apparel, /shop#hardware, /shop#wellness,
  // /shop#cbdwellness. Run once on mount + on hashchange.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "").toLowerCase();
      if (!raw) return;
      const map: Record<string, CategoryFilter> = {
        all: "all",
        apparel: "apparel",
        hardware: "hardware",
        wellness: "wellness",
        cbdwellness: "wellness",
        "cbd-wellness": "wellness",
      };
      const next = map[raw];
      if (next) setCategory(next);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (profile !== "all" && p.profile !== profile) return false;
      if (!q) return true;
      const haystack = `${p.name} ${p.spec} ${p.details} ${p.categoryLabel} ${p.profile ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      // "featured" preserves catalog order
    }
    return sorted;
  }, [category, profile, query, sort]);

  const counts = useMemo(() => {
    return products.reduce<Record<ProductCategory, number>>(
      (acc, p) => {
        acc[p.category] += 1;
        return acc;
      },
      { apparel: 0, hardware: 0, wellness: 0 },
    );
  }, []);

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-[#0F1F3D] border-b border-[#C9A84C]/20 py-16 schematic-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
            {"// PRODUCT CATALOG"}
          </p>
          <h1
            className="text-5xl sm:text-6xl font-black tracking-tight uppercase text-[#E8EDF5] mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            The Inventory
          </h1>
          <p className="text-[#64748B] font-mono text-sm max-w-xl">
            Three product verticals. One engineering standard. Every item
            specification-verified and built to last.
          </p>
        </div>
      </div>

      {/* Filters / search / sort */}
      <div className="sticky top-16 z-30 bg-[#0A1628]/95 backdrop-blur-sm border-b border-[#C9A84C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORY_TABS.map((tab) => {
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`px-4 py-2 text-xs font-mono tracking-widest uppercase border transition-colors ${
                    active
                      ? "border-[#C9A84C] bg-[#C9A84C] text-[#0A1628]"
                      : "border-[#C9A84C]/30 text-[#64748B] hover:border-[#C9A84C] hover:text-[#C9A84C]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <span className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase hidden sm:inline">
                Profile
              </span>
              <button
                type="button"
                onClick={() => setProfile("all")}
                className={`px-3 py-2 text-[10px] font-mono tracking-widest uppercase border transition-colors ${
                  profile === "all"
                    ? "border-[#E8EDF5] text-[#E8EDF5]"
                    : "border-[#1E293B] text-[#64748B] hover:text-[#E8EDF5]"
                }`}
              >
                ALL
              </button>
              {PROFILE_TABS.map((p) => {
                const active = profile === p;
                const color = profileColors[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProfile(active ? "all" : p)}
                    className="px-3 py-2 text-[10px] font-mono tracking-widest uppercase border transition-colors"
                    style={{
                      borderColor: active ? color : `${color}40`,
                      color: color,
                      backgroundColor: active ? `${color}15` : "transparent",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <label className="flex-1 relative">
              <span className="sr-only">Search products</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search inventory — try ‘myrcene’, ‘hoodie’, ‘500mL’"
                className="w-full bg-[#0F1F3D] border border-[#C9A84C]/20 px-4 py-2 pr-10 text-sm font-mono text-[#E8EDF5] placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
              <span
                aria-hidden
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-xs font-mono"
              >
                ⌕
              </span>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-[#64748B] text-[10px] font-mono tracking-widest uppercase whitespace-nowrap">
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-[#0F1F3D] border border-[#C9A84C]/20 px-3 py-2 text-xs font-mono text-[#E8EDF5] focus:outline-none focus:border-[#C9A84C] transition-colors"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results meta */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase mb-1">
              {"// RESULTS"}
            </p>
            <p className="text-[#E8EDF5] text-sm font-mono">
              <span className="text-[#C9A84C] font-black">{filtered.length}</span>
              <span className="text-[#64748B]"> of {products.length} SKUs</span>
            </p>
          </div>
          {category === "all" && (
            <p className="hidden sm:block text-[#64748B] text-[10px] font-mono">
              Apparel: {counts.apparel} · Hardware: {counts.hardware} ·
              Wellness: {counts.wellness}
            </p>
          )}
        </div>

        {/* COA notice when looking at wellness */}
        {(category === "wellness" || category === "all") && (
          <div className="mb-6 p-4 border border-[#0D9488]/30 bg-[#0D9488]/5 flex items-start gap-3">
            <span className="text-[#0D9488] text-xs font-mono mt-0.5">⬡</span>
            <div>
              <p className="text-[#0D9488] text-xs font-mono font-bold tracking-widest mb-1">
                COA TRANSPARENCY PROTOCOL
              </p>
              <p className="text-[#64748B] text-xs font-mono">
                All wellness products ship with batch-specific Certificate of
                Analysis.{" "}
                <Link
                  href="/lab#coa"
                  className="text-[#0D9488] hover:text-[#14B8A6] underline"
                >
                  View COA portal →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="border border-[#1E293B] bg-[#0F1F3D] p-12 text-center">
            <p className="text-[#C9A84C]/60 text-2xl mb-3">⬡</p>
            <p className="text-[#E8EDF5] font-bold tracking-widest uppercase text-sm mb-2">
              No matches
            </p>
            <p className="text-[#64748B] text-xs font-mono mb-6">
              Try clearing filters or searching a different compound.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory("all");
                setProfile("all");
                setQuery("");
                setSort("featured");
              }}
              className="px-5 py-2 border border-[#C9A84C] text-[#C9A84C] text-xs font-bold tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const profileColor = product.profile ? profileColors[product.profile] : null;

  const handleAdd = () => {
    addItem(product.id, 1);
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="border border-[#C9A84C]/20 bg-[#0A1628] hover:border-[#C9A84C]/50 transition-all duration-300 group flex flex-col">
      <div className="h-40 bg-[#0F1F3D] schematic-grid flex items-center justify-center border-b border-[#C9A84C]/20 relative">
        <div className="w-14 h-14 border border-[#C9A84C]/30 flex items-center justify-center group-hover:border-[#C9A84C] transition-colors">
          <span className="text-[#C9A84C]/50 text-xl group-hover:text-[#C9A84C] transition-colors">
            {product.icon}
          </span>
        </div>
        {product.badge && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-[#C9A84C] text-[#0A1628] text-[9px] font-bold tracking-widest">
            {product.badge}
          </div>
        )}
        {product.profile && profileColor && (
          <div
            className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-mono tracking-widest border"
            style={{ color: profileColor, borderColor: `${profileColor}50` }}
          >
            {product.profile}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[#0D9488] text-[9px] font-mono tracking-[0.3em] uppercase mb-1">
          {product.categoryLabel}
        </p>
        <h3 className="text-[#E8EDF5] font-bold text-sm mb-1 leading-tight">
          {product.name}
        </h3>
        <p className="text-[#C9A84C] text-[10px] font-mono leading-relaxed mb-2">
          {product.spec}
        </p>
        <p className="text-[#64748B] text-xs font-mono leading-relaxed mb-3 flex-1">
          {product.details}
        </p>
        <div className="text-[10px] font-mono text-[#64748B] mb-4">
          <span className="text-[#0D9488]">{product.extraLabel}: </span>
          {product.extraValue}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[#1E293B]">
          <span className="text-[#C9A84C] font-black font-mono text-base">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className={`px-4 py-2 text-[10px] font-bold tracking-widest transition-colors ${
              added
                ? "bg-[#0D9488] text-[#0A1628]"
                : "bg-[#C9A84C] text-[#0A1628] hover:bg-[#E2C97E]"
            }`}
          >
            {added ? "✓ ADDED" : "ADD TO FORGE"}
          </button>
        </div>
      </div>
    </div>
  );
}
