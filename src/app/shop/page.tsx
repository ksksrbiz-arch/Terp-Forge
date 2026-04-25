"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";
import CornerBrackets from "@/components/ui/CornerBrackets";
import Reveal from "@/components/ui/Reveal";
import FlipCard from "@/components/ui/FlipCard";
import ProfileLens from "@/components/ui/ProfileLens";
import CompareDrawer from "@/components/ui/CompareDrawer";
import {
  formatPrice,
  products,
  profileColors,
  type Product,
  type ProductCategory,
  type TerpeneProfile,
} from "@/lib/products";
import { siteName, siteUrl } from "@/lib/site";

type CategoryFilter = "all" | ProductCategory;
type ProfileFilter = "all" | NonNullable<TerpeneProfile>;
type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const COMPARE_MAX = 4;

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

const PRODUCT_ID_PATTERN = /^tf-[a-z]{2}-\d{3}$/i;

export default function ShopPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [profile, setProfile] = useState<ProfileFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const { addItem, openCart } = useCart();

  // Honor legacy deep-links: /shop#apparel, /shop#hardware, /shop#wellness,
  // /shop#cbdwellness. Run once on mount + on hashchange.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "").toLowerCase();
      const map: Record<string, CategoryFilter> = {
        all: "all",
        apparel: "apparel",
        hardware: "hardware",
        wellness: "wellness",
        cbdwellness: "wellness",
        "cbd-wellness": "wellness",
      };

      if (!raw) {
        setCategory("all");
        setQuery("");
        setProfile("all");
        return;
      }

      const next = map[raw];
      if (next) {
        setCategory(next);
        setQuery("");
        setProfile("all");
        return;
      }

      if (raw.startsWith("product=")) {
        let id = "";
        try {
          id = decodeURIComponent(raw.slice("product=".length));
        } catch {
          return;
        }
        if (!PRODUCT_ID_PATTERN.test(id)) return;
        const product = products.find(
          (entry) => PRODUCT_ID_PATTERN.test(entry.id) && entry.id === id,
        );
        if (product) {
          setCategory(product.category);
          setProfile(product.profile ?? "all");
          setQuery(product.name);
        }
      }
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

  const compareProducts = useMemo(
    () =>
      compareIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [compareIds],
  );
  const isCompared = (id: string) => compareIds.includes(id);
  const toggleCompare = (id: string) => {
    setCompareIds((curr) => {
      if (curr.includes(id)) return curr.filter((x) => x !== id);
      if (curr.length >= COMPARE_MAX) return curr;
      return [...curr, id];
    });
  };
  const removeCompare = (id: string) =>
    setCompareIds((curr) => curr.filter((x) => x !== id));
  const clearCompare = () => setCompareIds([]);
  const handleAddFromCompare = (id: string) => {
    addItem(id, 1);
    openCart();
  };

  // Active accent color for the profile lens overlay
  const lensColor = profile === "all" ? null : profileColors[profile];
  const productJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${siteName} Product Systems`,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/shop/#product=${product.id}`,
        item: {
          "@type": "Product",
          name: product.name,
          sku: product.id,
          description: product.details,
          brand: { "@type": "Brand", name: siteName },
          category: product.categoryLabel,
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: product.price.toFixed(2),
            availability: "https://schema.org/InStock",
            url: `${siteUrl}/shop/#product=${product.id}`,
          },
        },
      })),
    }),
    [],
  );

  return (
    <div className="pt-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProfileLens color={lensColor} />

      {/* Header */}
      <div className="relative bg-[#0F1F3D] border-b border-[#C9A84C]/20 py-16 schematic-grid overflow-hidden">
        <CornerBrackets size={16} color="rgba(201,168,76,0.45)" inset={12} />
        <span
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,168,76,0.55), rgba(13,148,136,0.55), rgba(201,168,76,0.55), transparent)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase">
              {"// PRODUCT CATALOG"}
            </p>
            <span className="text-[#C9A84C]/60 text-[10px] font-mono tracking-[0.3em]">
              § 03 / 07
            </span>
          </div>
          <h1
            className="text-5xl sm:text-6xl font-black tracking-tight uppercase text-[#E8EDF5] mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            The Inventory
          </h1>
          <p className="text-[#94A3B8] font-mono text-sm max-w-xl leading-relaxed">
            Three product verticals. One engineering standard. Hover any card
            for the spec-sheet schematic. Tap{" "}
            <span className="text-[#C9A84C]">+ COMPARE</span> on up to four
            SKUs to open the matrix drawer.
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
            {filtered.map((product, i) => {
              const dimmed =
                profile !== "all" && product.profile !== profile;
              return (
                <Reveal
                  key={product.id}
                  variant="up"
                  delay={Math.min(i, 8) * 60}
                  className={`transition-opacity duration-500 ${
                    dimmed ? "opacity-40 hover:opacity-100" : "opacity-100"
                  }`}
                >
                  <ProductCard
                    product={product}
                    compared={isCompared(product.id)}
                    onToggleCompare={toggleCompare}
                    compareDisabled={
                      !isCompared(product.id) &&
                      compareIds.length >= COMPARE_MAX
                    }
                  />
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom spacer so the drawer never overlaps the last row */}
      {compareProducts.length > 0 && (
        <div aria-hidden className="h-[26rem] sm:h-[22rem]" />
      )}

      <CompareDrawer
        products={compareProducts}
        onRemove={removeCompare}
        onClear={clearCompare}
        onAddToCart={handleAddFromCompare}
        max={COMPARE_MAX}
      />
    </div>
  );
}

function ProductCard({
  product,
  compared,
  onToggleCompare,
  compareDisabled,
}: {
  product: Product;
  compared: boolean;
  onToggleCompare: (id: string) => void;
  compareDisabled: boolean;
}) {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const profileColor = product.profile ? profileColors[product.profile] : null;
  const accent = profileColor ?? "#C9A84C";

  const handleAdd = () => {
    addItem(product.id, 1);
    setAdded(true);
    openCart();
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="relative group h-[26rem] flex flex-col"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Compare toggle floats above the flip card */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!compared && compareDisabled) return;
          onToggleCompare(product.id);
        }}
        aria-pressed={compared}
        aria-label={
          compared
            ? `Remove ${product.name} from comparison`
            : `Add ${product.name} to comparison`
        }
        disabled={!compared && compareDisabled}
        className={`absolute top-2 left-2 z-20 px-2 py-1 text-[9px] font-mono tracking-widest uppercase border transition-colors ${
          compared
            ? "bg-[#C9A84C] text-[#0A1628] border-[#C9A84C]"
            : compareDisabled
              ? "border-[#1E293B] text-[#1E293B] cursor-not-allowed"
              : "bg-[#0A1628]/85 backdrop-blur-sm border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/15"
        }`}
      >
        {compared ? "✓ COMPARING" : "+ COMPARE"}
      </button>

      <FlipCard
        ariaLabel={`${product.name} — flip for spec sheet`}
        front={<ProductFront product={product} />}
        back={<ProductBack product={product} />}
        className="flex-1"
      />

      {/* Bottom action bar — sits outside the flip surface so price/CTA
          remain reachable regardless of which face is showing. */}
      <div className="mt-3 flex items-center justify-between gap-3">
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
  );
}

function ProductFront({ product }: { product: Product }) {
  const profileColor = product.profile ? profileColors[product.profile] : null;
  return (
    <div className="h-full border border-[#C9A84C]/20 bg-[#0A1628] hover:border-[#C9A84C]/50 transition-colors duration-300 flex flex-col">
      <div className="h-40 bg-[#0F1F3D] schematic-grid border-b border-[#C9A84C]/20 relative overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover grayscale-[25%] saturate-[0.85] hover:grayscale-0 hover:saturate-100 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/85 via-[#0A1628]/15 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 w-9 h-9 border border-[#C9A84C]/40 bg-[#0A1628]/70 backdrop-blur-sm flex items-center justify-center">
          <span className="text-[#C9A84C] text-base">{product.icon}</span>
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
        <span
          aria-hidden
          className="absolute bottom-3 right-3 text-[#C9A84C]/40 text-[9px] font-mono tracking-widest"
        >
          ↻ FLIP
        </span>
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
        <p className="text-[#94A3B8] text-xs font-mono leading-relaxed flex-1">
          {product.details}
        </p>
        <div className="text-[10px] font-mono text-[#64748B] mt-3">
          <span className="text-[#0D9488]">{product.extraLabel}: </span>
          {product.extraValue}
        </div>
      </div>
    </div>
  );
}

function ProductBack({ product }: { product: Product }) {
  const profileColor = product.profile ? profileColors[product.profile] : null;
  const accent = profileColor ?? "#C9A84C";
  // Build a small spec table dynamically from available data
  const rows: { k: string; v: string }[] = [
    { k: "SKU", v: product.id.toUpperCase() },
    { k: "CATEGORY", v: product.categoryLabel },
    { k: "PROFILE", v: product.profile ?? "—" },
    { k: "PRICE", v: formatPrice(product.price) },
    { k: product.extraLabel.toUpperCase(), v: product.extraValue },
  ];
  return (
    <div
      className="h-full border bg-[#0A1628] flex flex-col relative overflow-hidden"
      style={{ borderColor: `${accent}80` }}
    >
      {/* Schematic backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 schematic-grid opacity-60 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -top-px left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
      <CornerBrackets size={12} color={accent} inset={6} />

      <div className="relative px-5 pt-5 pb-3 border-b border-[#1E293B]">
        <p
          className="text-[9px] font-mono tracking-[0.4em] uppercase mb-1"
          style={{ color: accent }}
        >
          {"// SPEC SHEET"}
        </p>
        <h3 className="text-[#E8EDF5] font-bold text-sm leading-tight">
          {product.name}
        </h3>
      </div>

      <dl className="relative flex-1 px-5 py-4 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2 text-[11px] font-mono content-start">
        {rows.map((r) => (
          <div key={r.k} className="contents">
            <dt className="text-[#64748B] tracking-widest">{r.k}</dt>
            <dd className="text-[#E8EDF5] truncate text-right">{r.v}</dd>
          </div>
        ))}
      </dl>

      <div className="relative px-5 py-3 border-t border-[#1E293B]">
        <p className="text-[10px] font-mono text-[#94A3B8] leading-relaxed line-clamp-3">
          {product.details}
        </p>
      </div>

      <div
        className="relative px-5 py-2 flex items-center justify-between text-[9px] font-mono tracking-widest uppercase"
        style={{ color: accent, borderTop: `1px solid ${accent}33` }}
      >
        <span>{product.spec.split("·")[0]?.trim() ?? "VERIFIED"}</span>
        <span aria-hidden>↻ FLIP BACK</span>
      </div>
    </div>
  );
}
