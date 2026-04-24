import Link from "next/link";

const apparelProducts = [
  {
    name: "Myrcene Structure Hoodie",
    spec: "GSM-420 Heavyweight Cotton Fleece · Gold Foil Molecular Schematic",
    price: "$89.00",
    badge: "NEW DROP",
    profile: "RECOVERY",
    sizes: ["S", "M", "L", "XL", "2XL"],
    details: "400gsm premium fleece. Reinforced ribbed cuffs. Overlock seam construction. Full gold-foil Myrcene C₁₀H₁₆ molecular schematic across back panel.",
  },
  {
    name: "Limonene Circuit Tee",
    spec: "240gsm Combed Cotton · Embossed Molecular Print",
    price: "$49.00",
    badge: "BESTSELLER",
    profile: "FOCUS",
    sizes: ["XS", "S", "M", "L", "XL"],
    details: "240gsm ring-spun combed cotton. Pre-shrunk. Chest print: Limonene C₁₀H₁₆ technical schematic with compound annotation.",
  },
  {
    name: "Linalool Stealth Hoodie",
    spec: "GSM-420 Cotton Fleece · Tonal Navy Print · Minimal",
    price: "$89.00",
    badge: "LIMITED",
    profile: "CALM",
    sizes: ["S", "M", "L", "XL"],
    details: "Tonal navy-on-navy Linalool C₁₀H₁₈O schematic. Designed for those who wear the science without announcing it.",
  },
  {
    name: "The Forge Snapback",
    spec: "6-Panel Structured · Laser-Engraved TF Logo",
    price: "$38.00",
    badge: null,
    profile: null,
    sizes: ["OSFA"],
    details: "Structured 6-panel cap. Laser-engraved aluminum TF badge. Adjustable snap closure. Black cotton twill.",
  },
];

const hardwareProducts = [
  {
    name: "Terpene Vault — UV Series",
    spec: "Borosilicate Glass · Airtight Silicone Seal · UV-400 Shield",
    price: "$64.00",
    badge: "BESTSELLER",
    capacity: "60mL / 120mL",
    details: "UV-400 borosilicate glass. Pharmaceutical-grade silicone gasket. Terpene preservation rated to 18-month shelf life. Chemical resistance grade: A.",
  },
  {
    name: "TerpVault XL — Stainless",
    spec: "Grade 316L Surgical Steel · 500mL · Pressure Sealed",
    price: "$128.00",
    badge: "PRO SERIES",
    capacity: "500mL",
    details: "316L surgical-grade stainless steel. PTFE-lined pressure seal. Rated to -20°C storage. Brushed satin finish with laser-etched TF molecular mark.",
  },
  {
    name: "Extraction Field Kit",
    spec: "7-Piece Set · Stainless Tools · Roll Case Included",
    price: "$94.00",
    badge: null,
    capacity: "N/A",
    details: "7-piece precision extraction toolkit. 316 stainless steel implements. Includes: dab tool ×2, scraper ×2, glass jar ×2, microfiber roll case.",
  },
  {
    name: "TerpTemp Monitor Pro",
    spec: "Digital Precision ±0.1°C · Bluetooth Sync · Waterproof",
    price: "$156.00",
    badge: "NEW",
    capacity: "N/A",
    details: "Industrial-grade precision thermometer. ±0.1°C accuracy. IP67 waterproof rating. Bluetooth 5.0 for data logging. Probe range: −50°C to +300°C.",
  },
];

const wellnessProducts = [
  {
    name: "Focus Protocol Tincture",
    spec: "1000mg CBD · Limonene-Dominant Terpene Profile",
    price: "$74.00",
    badge: "COA VERIFIED",
    profile: "FOCUS",
    contents: "30mL / 33mg per serving",
    details: "Broad-spectrum CBD. Limonene terpene co-formulation. MCT carrier oil. <0.001% THC. 3rd-party lab verified. COA available in The Lab.",
  },
  {
    name: "Recovery Protocol Gummies",
    spec: "25mg CBD/ea · Myrcene Profile · 30-Count",
    price: "$59.00",
    badge: "COA VERIFIED",
    profile: "RECOVERY",
    contents: "30 count / 25mg CBD per piece",
    details: "Myrcene terpene-infused broad-spectrum CBD gummies. Pectin base (vegan). Natural terpene flavoring. 750mg CBD total per bag.",
  },
  {
    name: "Calm Protocol Tincture",
    spec: "1500mg CBD · Linalool-Dominant Profile · Sleep Support",
    price: "$94.00",
    badge: "COA VERIFIED",
    profile: "CALM",
    contents: "30mL / 50mg per serving",
    details: "High-potency broad-spectrum CBD with Linalool terpene profile. Formulated for evening recovery and sleep cycle support. MCT oil base.",
  },
  {
    name: "The Terpene Stack — Trial Kit",
    spec: "3×10mL Tinctures · All 3 Profiles · COA Included",
    price: "$69.00",
    badge: "STARTER KIT",
    profile: null,
    contents: "3 × 10mL bottles",
    details: "One 10mL tincture of each TerpForge profile: Focus (Limonene), Recovery (Myrcene), Calm (Linalool). Ideal for profiling your response to each terpene variant.",
  },
];

const profileColors: Record<string, string> = {
  FOCUS: "#C9A84C",
  RECOVERY: "#0D9488",
  CALM: "#2563EB",
};

function ProductCard({
  name,
  spec,
  price,
  badge,
  details,
  extraLabel,
  extraValue,
  profile,
}: {
  name: string;
  spec: string;
  price: string;
  badge: string | null;
  details: string;
  extraLabel: string;
  extraValue: string;
  profile: string | null;
}) {
  const profileColor = profile ? profileColors[profile] : "#64748B";
  return (
    <div className="border border-[#C9A84C]/20 bg-[#0A1628] hover:border-[#C9A84C]/50 transition-all duration-300 group flex flex-col">
      {/* Visual area */}
      <div className="h-40 bg-[#0F1F3D] schematic-grid flex items-center justify-center border-b border-[#C9A84C]/20 relative">
        <div className="w-14 h-14 border border-[#C9A84C]/30 flex items-center justify-center group-hover:border-[#C9A84C] transition-colors">
          <span className="text-[#C9A84C]/50 text-xl group-hover:text-[#C9A84C] transition-colors">◈</span>
        </div>
        {badge && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-[#C9A84C] text-[#0A1628] text-[9px] font-bold tracking-widest">
            {badge}
          </div>
        )}
        {profile && (
          <div
            className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-mono tracking-widest border"
            style={{ color: profileColor, borderColor: `${profileColor}50` }}
          >
            {profile}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-[#E8EDF5] font-bold text-sm mb-1">{name}</h3>
        <p className="text-[#C9A84C] text-[10px] font-mono leading-relaxed mb-2">{spec}</p>
        <p className="text-[#64748B] text-xs font-mono leading-relaxed mb-3 flex-1">{details}</p>
        <div className="text-[10px] font-mono text-[#64748B] mb-4">
          <span className="text-[#0D9488]">{extraLabel}: </span>{extraValue}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[#1E293B]">
          <span className="text-[#C9A84C] font-black font-mono text-base">{price}</span>
          <button className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold tracking-widest hover:bg-[#E2C97E] transition-colors">
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
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

          {/* Filter nav */}
          <div className="mt-8 flex flex-wrap gap-3">
            {["All", "Apparel", "Hardware", "CBD Wellness"].map((f) => (
              <a
                key={f}
                href={f === "All" ? "#" : `#${f.toLowerCase().replace(" ", "")}`}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase border transition-colors ${
                  f === "All"
                    ? "border-[#C9A84C] bg-[#C9A84C] text-[#0A1628]"
                    : "border-[#C9A84C]/30 text-[#64748B] hover:border-[#C9A84C] hover:text-[#C9A84C]"
                }`}
              >
                {f}
              </a>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[#64748B] text-xs font-mono">Filter by profile:</span>
              {["FOCUS", "RECOVERY", "CALM"].map((p) => (
                <span
                  key={p}
                  className="px-3 py-2 text-[10px] font-mono tracking-widest uppercase border cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: `${profileColors[p]}40`,
                    color: profileColors[p],
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* ── APPAREL ──────────────────────────────── */}
        <section id="apparel">
          <div className="flex justify-between items-end mb-8 pb-4 border-b border-[#C9A84C]/20">
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-2">
                {"// VERTICAL 01"}
              </p>
              <h2
                className="text-3xl font-black uppercase text-[#E8EDF5]"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Apparel
              </h2>
              <p className="text-[#64748B] font-mono text-xs mt-1">
                Heavy-Duty Streetwear · Gold-Foil Molecular Schematics
              </p>
            </div>
            <span className="text-[#C9A84C]/40 text-xs font-mono">
              {apparelProducts.length} SKUs
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {apparelProducts.map((p) => (
              <ProductCard
                key={p.name}
                name={p.name}
                spec={p.spec}
                price={p.price}
                badge={p.badge}
                details={p.details}
                extraLabel="Sizes"
                extraValue={p.sizes.join(" · ")}
                profile={p.profile}
              />
            ))}
          </div>
        </section>

        {/* ── HARDWARE ─────────────────────────────── */}
        <section id="hardware">
          <div className="flex justify-between items-end mb-8 pb-4 border-b border-[#C9A84C]/20">
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-2">
                {"// VERTICAL 02"}
              </p>
              <h2
                className="text-3xl font-black uppercase text-[#E8EDF5]"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Hardware
              </h2>
              <p className="text-[#64748B] font-mono text-xs mt-1">
                Extraction Gear & Storage · Terpene Preservation Systems
              </p>
            </div>
            <span className="text-[#C9A84C]/40 text-xs font-mono">
              {hardwareProducts.length} SKUs
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardwareProducts.map((p) => (
              <ProductCard
                key={p.name}
                name={p.name}
                spec={p.spec}
                price={p.price}
                badge={p.badge}
                details={p.details}
                extraLabel="Capacity"
                extraValue={p.capacity}
                profile={null}
              />
            ))}
          </div>
        </section>

        {/* ── CBD WELLNESS ─────────────────────────── */}
        <section id="cbdwellness">
          <div className="flex justify-between items-end mb-8 pb-4 border-b border-[#C9A84C]/20">
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-2">
                {"// VERTICAL 03"}
              </p>
              <h2
                className="text-3xl font-black uppercase text-[#E8EDF5]"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                CBD Wellness
              </h2>
              <p className="text-[#64748B] font-mono text-xs mt-1">
                Refined Elements · Lab-Certified · Terpene-Specific Protocols
              </p>
            </div>
            <span className="text-[#C9A84C]/40 text-xs font-mono">
              {wellnessProducts.length} SKUs
            </span>
          </div>

          {/* COA notice */}
          <div className="mb-6 p-4 border border-[#0D9488]/30 bg-[#0D9488]/5 flex items-start gap-3">
            <span className="text-[#0D9488] text-xs font-mono mt-0.5">⬡</span>
            <div>
              <p className="text-[#0D9488] text-xs font-mono font-bold tracking-widest mb-1">
                COA TRANSPARENCY PROTOCOL
              </p>
              <p className="text-[#64748B] text-xs font-mono">
                All wellness products ship with batch-specific Certificate of
                Analysis.{" "}
                <Link href="/lab#coa" className="text-[#0D9488] hover:text-[#14B8A6] underline">
                  View COA portal →
                </Link>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wellnessProducts.map((p) => (
              <ProductCard
                key={p.name}
                name={p.name}
                spec={p.spec}
                price={p.price}
                badge={p.badge}
                details={p.details}
                extraLabel="Contents"
                extraValue={p.contents}
                profile={p.profile}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
