// Central product catalog. All pages (shop, homepage, cart) source from here
// so that adding/removing a SKU updates the entire site.

export type ProductCategory = "apparel" | "hardware" | "wellness";
export type TerpeneProfile = "FOCUS" | "RECOVERY" | "CALM" | null;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  spec: string;
  price: number;
  badge: string | null;
  profile: TerpeneProfile;
  details: string;
  extraLabel: string;
  extraValue: string;
  icon: string;
  image: string;
  /** Optional Printful sync_variant_id for dropship apparel — leave undefined for self-fulfilled SKUs. */
  printfulVariantId?: number;
}

export const profileColors: Record<NonNullable<TerpeneProfile>, string> = {
  FOCUS: "#C9A84C",
  RECOVERY: "#0D9488",
  CALM: "#2563EB",
};

export const products: Product[] = [
  // ── APPAREL ───────────────────────────────────────────────────────────────
  {
    id: "tf-ap-001",
    name: "Myrcene Structure Hoodie",
    category: "apparel",
    categoryLabel: "APPAREL",
    spec: "GSM-420 Heavyweight Cotton Fleece · Gold Foil Molecular Schematic",
    price: 89,
    badge: "NEW DROP",
    profile: "RECOVERY",
    details:
      "400gsm premium fleece. Reinforced ribbed cuffs. Overlock seam construction. Full gold-foil Myrcene C₁₀H₁₆ molecular schematic across back panel.",
    extraLabel: "Sizes",
    extraValue: "S · M · L · XL · 2XL",
    icon: "◈",
    image: "/images/tech-life-1.jpeg",
  },
  {
    id: "tf-ap-002",
    name: "Limonene Circuit Tee",
    category: "apparel",
    categoryLabel: "APPAREL",
    spec: "240gsm Combed Cotton · Embossed Molecular Print",
    price: 49,
    badge: "BESTSELLER",
    profile: "FOCUS",
    details:
      "240gsm ring-spun combed cotton. Pre-shrunk. Chest print: Limonene C₁₀H₁₆ technical schematic with compound annotation.",
    extraLabel: "Sizes",
    extraValue: "XS · S · M · L · XL",
    icon: "◈",
    image: "/images/tech-life-2.jpeg",
  },
  {
    id: "tf-ap-003",
    name: "Linalool Stealth Hoodie",
    category: "apparel",
    categoryLabel: "APPAREL",
    spec: "GSM-420 Cotton Fleece · Tonal Navy Print · Minimal",
    price: 89,
    badge: "LIMITED",
    profile: "CALM",
    details:
      "Tonal navy-on-navy Linalool C₁₀H₁₈O schematic. Designed for those who wear the science without announcing it.",
    extraLabel: "Sizes",
    extraValue: "S · M · L · XL",
    icon: "◈",
    image: "/images/tech-life-1.jpeg",
  },
  {
    id: "tf-ap-004",
    name: "The Forge Snapback",
    category: "apparel",
    categoryLabel: "APPAREL",
    spec: "6-Panel Structured · Laser-Engraved TF Logo",
    price: 38,
    badge: null,
    profile: null,
    details:
      "Structured 6-panel cap. Laser-engraved aluminum TF badge. Adjustable snap closure. Black cotton twill.",
    extraLabel: "Sizes",
    extraValue: "OSFA",
    icon: "◈",
    image: "/images/product-showcase.jpg",
  },

  // ── HARDWARE ──────────────────────────────────────────────────────────────
  {
    id: "tf-hw-001",
    name: "Terpene Vault — UV Series",
    category: "hardware",
    categoryLabel: "HARDWARE",
    spec: "Borosilicate Glass · Airtight Silicone Seal · UV-400 Shield",
    price: 64,
    badge: "BESTSELLER",
    profile: null,
    details:
      "UV-400 borosilicate glass. Pharmaceutical-grade silicone gasket. Terpene preservation rated to 18-month shelf life. Chemical resistance grade: A.",
    extraLabel: "Capacity",
    extraValue: "60mL / 120mL",
    icon: "⬡",
    image: "/images/lab-molecular.jpg",
  },
  {
    id: "tf-hw-002",
    name: "TerpVault XL — Stainless",
    category: "hardware",
    categoryLabel: "HARDWARE",
    spec: "Grade 316L Surgical Steel · 500mL · Pressure Sealed",
    price: 128,
    badge: "PRO SERIES",
    profile: null,
    details:
      "316L surgical-grade stainless steel. PTFE-lined pressure seal. Rated to -20°C storage. Brushed satin finish with laser-etched TF molecular mark.",
    extraLabel: "Capacity",
    extraValue: "500mL",
    icon: "⬡",
    image: "/images/forge-process.jpg",
  },
  {
    id: "tf-hw-003",
    name: "Extraction Field Kit",
    category: "hardware",
    categoryLabel: "HARDWARE",
    spec: "7-Piece Set · Stainless Tools · Roll Case Included",
    price: 94,
    badge: null,
    profile: null,
    details:
      "7-piece precision extraction toolkit. 316 stainless steel implements. Includes: dab tool ×2, scraper ×2, glass jar ×2, microfiber roll case.",
    extraLabel: "Capacity",
    extraValue: "N/A",
    icon: "⬡",
    image: "/images/terpene-science.jpg",
  },
  {
    id: "tf-hw-004",
    name: "TerpTemp Monitor Pro",
    category: "hardware",
    categoryLabel: "HARDWARE",
    spec: "Digital Precision ±0.1°C · Bluetooth Sync · Waterproof",
    price: 156,
    badge: "NEW",
    profile: null,
    details:
      "Industrial-grade precision thermometer. ±0.1°C accuracy. IP67 waterproof rating. Bluetooth 5.0 for data logging. Probe range: −50°C to +300°C.",
    extraLabel: "Capacity",
    extraValue: "N/A",
    icon: "⬡",
    image: "/images/hero-extraction.jpg",
  },

  // ── CBD WELLNESS ──────────────────────────────────────────────────────────
  {
    id: "tf-wl-001",
    name: "Focus Protocol Tincture",
    category: "wellness",
    categoryLabel: "CBD WELLNESS",
    spec: "1000mg CBD · Limonene-Dominant Terpene Profile",
    price: 74,
    badge: "COA VERIFIED",
    profile: "FOCUS",
    details:
      "Broad-spectrum CBD. Limonene terpene co-formulation. MCT carrier oil. <0.001% THC. 3rd-party lab verified. COA available in The Lab.",
    extraLabel: "Contents",
    extraValue: "30mL / 33mg per serving",
    icon: "◉",
    image: "/images/product-showcase.jpg",
  },
  {
    id: "tf-wl-002",
    name: "Recovery Protocol Gummies",
    category: "wellness",
    categoryLabel: "CBD WELLNESS",
    spec: "25mg CBD/ea · Myrcene Profile · 30-Count",
    price: 59,
    badge: "COA VERIFIED",
    profile: "RECOVERY",
    details:
      "Myrcene terpene-infused broad-spectrum CBD gummies. Pectin base (vegan). Natural terpene flavoring. 750mg CBD total per bag.",
    extraLabel: "Contents",
    extraValue: "30 count / 25mg CBD per piece",
    icon: "◉",
    image: "/images/lab-molecular.jpg",
  },
  {
    id: "tf-wl-003",
    name: "Calm Protocol Tincture",
    category: "wellness",
    categoryLabel: "CBD WELLNESS",
    spec: "1500mg CBD · Linalool-Dominant Profile · Sleep Support",
    price: 94,
    badge: "COA VERIFIED",
    profile: "CALM",
    details:
      "High-potency broad-spectrum CBD with Linalool terpene profile. Formulated for evening recovery and sleep cycle support. MCT oil base.",
    extraLabel: "Contents",
    extraValue: "30mL / 50mg per serving",
    icon: "◉",
    image: "/images/terpene-science.jpg",
  },
  {
    id: "tf-wl-004",
    name: "The Terpene Stack — Trial Kit",
    category: "wellness",
    categoryLabel: "CBD WELLNESS",
    spec: "3×10mL Tinctures · All 3 Profiles · COA Included",
    price: 69,
    badge: "STARTER KIT",
    profile: null,
    details:
      "One 10mL tincture of each TerpForge profile: Focus (Limonene), Recovery (Myrcene), Calm (Linalool). Ideal for profiling your response to each terpene variant.",
    extraLabel: "Contents",
    extraValue: "3 × 10mL bottles",
    icon: "◉",
    image: "/images/product-showcase.jpg",
  },
];

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
