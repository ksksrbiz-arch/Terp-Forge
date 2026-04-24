import Link from "next/link";

const pillars = [
  {
    id: "01",
    title: "Foundation",
    subtitle: "Pure Ingredients",
    description:
      "Every compound sourced, verified, and batch-tested. Zero synthetic fillers. Full-spectrum terpene isolates, traceable from biomass to final product.",
    stat: "99.7%",
    statLabel: "Purity Rating",
  },
  {
    id: "02",
    title: "Systems",
    subtitle: "Precision Extraction",
    description:
      "Industrial-grade closed-loop hydrocarbon and CO₂ extraction systems. Temperature-controlled at ±0.1°C. Every variable engineered, not estimated.",
    stat: "−40°C → +35°C",
    statLabel: "Extraction Range",
  },
  {
    id: "03",
    title: "Scale",
    subtitle: "Lifestyle Impact",
    description:
      "From molecular to macro. Terpene science applied to apparel, wellness, and hardware — a complete lifestyle system built on verified chemistry.",
    stat: "3 Verticals",
    statLabel: "Product Systems",
  },
];

const terpeneProfiles = [
  {
    name: "Myrcene",
    formula: "C₁₀H₁₆",
    profile: "RECOVERY",
    effect: "Muscle relaxation, sedative properties. Found in hops and mango.",
    accent: "#0D9488",
  },
  {
    name: "Limonene",
    formula: "C₁₀H₁₆",
    profile: "FOCUS",
    effect: "Elevated mood, stress relief, anti-anxiety properties.",
    accent: "#C9A84C",
  },
  {
    name: "Linalool",
    formula: "C₁₀H₁₈O",
    profile: "CALM",
    effect: "Anti-anxiety, sedative. Found in lavender and over 200 species.",
    accent: "#2563EB",
  },
];

const featuredProducts = [
  {
    category: "APPAREL",
    name: "Myrcene Structure Hoodie",
    spec: "GSM-420 Cotton Fleece · Gold Foil Molecular Print",
    price: "$89.00",
    badge: "NEW DROP",
    href: "/shop#apparel",
    icon: "◈",
  },
  {
    category: "HARDWARE",
    name: "Terpene Vault — UV Series",
    spec: "Borosilicate Glass · Airtight Seal System · UV-400 Shield",
    price: "$64.00",
    badge: "BESTSELLER",
    href: "/shop#hardware",
    icon: "⬡",
  },
  {
    category: "CBD WELLNESS",
    name: "Focus Protocol — Limonene Tincture",
    spec: "1000mg CBD · Limonene-Dominant · COA Verified",
    price: "$74.00",
    badge: "COA VERIFIED",
    href: "/shop#wellness",
    icon: "◉",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden schematic-grid molecular-bg pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-[#C9A84C]/10 rounded-full" />
          <div className="absolute top-1/4 right-1/4 w-48 h-48 border border-[#C9A84C]/15 rounded-full" style={{ transform: 'translate(32px, 32px)' }} />
          <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-[#C9A84C]/20 rounded-full" style={{ transform: 'translate(64px, 64px)' }} />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0D9488]/30 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
                {"// TERPFORGE SYSTEMS ONLINE"}
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-none mb-6" style={{ fontFamily: 'var(--font-montserrat)' }}>
                <span className="block text-[#E8EDF5]">ENGINEERED</span>
                <span className="block text-[#E8EDF5]">AROMATICS.</span>
                <span className="block gold-shimmer">FORGED</span>
                <span className="block text-[#E8EDF5]">WELLNESS.</span>
              </h1>
              <p className="text-[#64748B] text-base sm:text-lg leading-relaxed max-w-md mb-8 font-light">
                The intersection of molecular terpene precision and industrial-grade craftsmanship.
                Built for those who demand specification-level purity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-[#C9A84C] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors">
                  Enter The Inventory →
                </Link>
                <Link href="/lab" className="inline-flex items-center justify-center px-8 py-4 border border-[#0D9488] text-[#0D9488] text-sm font-bold tracking-widest uppercase hover:bg-[#0D9488]/10 transition-colors">
                  View The Lab
                </Link>
              </div>

              <div className="mt-10 pt-8 border-t border-[#1E293B] grid grid-cols-3 gap-4">
                {[
                  { value: "100%", label: "Batch Verified" },
                  { value: "3rd Party", label: "COA Tested" },
                  { value: "0 THC", label: "Compliant" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-[#C9A84C] text-xl font-black font-mono">{value}</p>
                    <p className="text-[#64748B] text-xs font-mono tracking-wider uppercase">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Molecular schematic */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 border border-[#C9A84C]/20 rounded-full" />
                <div className="absolute inset-6 border border-[#0D9488]/15 rounded-full" />
                <div className="absolute inset-12 border border-[#C9A84C]/10 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 border-2 border-[#C9A84C] flex items-center justify-center bg-[#0A1628]">
                    <div className="text-center">
                      <p className="text-[#C9A84C] text-sm font-mono font-bold">C₁₀H₁₆</p>
                      <p className="text-[#E8EDF5] text-xs font-mono mt-1">Myrcene</p>
                      <p className="text-[#0D9488] text-[10px] font-mono mt-1">MW: 136.23</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 left-4 text-[#0D9488]/50 text-[10px] font-mono">BP: 167°C</div>
                <div className="absolute top-4 right-4 text-[#C9A84C]/50 text-[10px] font-mono">TF-001</div>
                <div className="absolute bottom-4 left-4 text-[#0D9488]/50 text-[10px] font-mono">VERIFIED</div>
                <div className="absolute bottom-4 right-4 text-[#C9A84C]/50 text-[10px] font-mono">BATCH-01</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <p className="text-[#64748B] text-[10px] font-mono tracking-widest">SCROLL</p>
          <div className="w-px h-8 bg-gradient-to-b from-[#C9A84C]/50 to-transparent" />
        </div>
      </section>

      {/* THE CATHEDRAL PRINCIPLE */}
      <section id="cathedral" className="py-24 bg-[#0F1F3D] border-t border-[#C9A84C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// OPERATING PRINCIPLE"}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase text-[#E8EDF5] mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
              The Cathedral Principle
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto font-mono text-sm leading-relaxed">
              Three load-bearing pillars. Every TerpForge product is engineered against these specifications — no exceptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <div key={pillar.id} className="relative p-8 border border-[#C9A84C]/20 bg-[#0A1628] hover:border-[#C9A84C]/50 transition-all duration-300 group">
                <div className="text-[#C9A84C]/15 text-8xl font-black font-mono absolute top-4 right-6 leading-none select-none group-hover:text-[#C9A84C]/25 transition-colors">
                  {pillar.id}
                </div>
                <div className="relative">
                  <div className="w-12 h-px bg-[#0D9488] mb-6" />
                  <p className="text-[#0D9488] text-xs font-mono tracking-[0.3em] uppercase mb-1">Pillar {i + 1}</p>
                  <h3 className="text-2xl font-black uppercase text-[#E8EDF5] mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>{pillar.title}</h3>
                  <p className="text-[#C9A84C] text-sm font-mono tracking-wider mb-4">{pillar.subtitle}</p>
                  <p className="text-[#64748B] text-sm leading-relaxed mb-6 font-light">{pillar.description}</p>
                  <div className="pt-4 border-t border-[#1E293B]">
                    <p className="text-[#C9A84C] text-2xl font-black font-mono">{pillar.stat}</p>
                    <p className="text-[#64748B] text-xs font-mono tracking-wider uppercase">{pillar.statLabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TERPENE PROFILES */}
      <section className="py-24 schematic-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-3">{"// COMPOUND LIBRARY"}</p>
              <h2 className="text-4xl font-black tracking-tight uppercase text-[#E8EDF5]" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Active Profiles
              </h2>
            </div>
            <Link href="/lab" className="text-sm font-mono text-[#0D9488] hover:text-[#14B8A6] transition-colors tracking-wider border-b border-[#0D9488]/50">
              View Full Compound Library →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {terpeneProfiles.map((t) => (
              <div key={t.name} className="relative p-6 bg-[#0F1F3D] border hover:border-opacity-60 transition-all duration-300 group" style={{ borderColor: `${t.accent}30` }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-mono tracking-[0.3em] uppercase mb-1" style={{ color: t.accent }}>
                      PROFILE: {t.profile}
                    </p>
                    <h3 className="text-xl font-black text-[#E8EDF5]">{t.name}</h3>
                  </div>
                  <div className="px-2 py-1 border text-xs font-mono" style={{ borderColor: `${t.accent}50`, color: t.accent }}>
                    {t.formula}
                  </div>
                </div>
                <p className="text-[#64748B] text-sm font-mono leading-relaxed">{t.effect}</p>
                <div className="mt-4 pt-4 border-t border-[#1E293B]">
                  <Link href="/lab" className="text-xs font-mono tracking-wider transition-colors" style={{ color: t.accent }}>
                    View Molecular Data →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-[#0F1F3D] border-t border-[#C9A84C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">{"// PRODUCT SYSTEMS"}</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase text-[#E8EDF5]" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Current Inventory
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {featuredProducts.map((product) => (
              <Link key={product.name} href={product.href} className="group relative border border-[#C9A84C]/20 hover:border-[#C9A84C]/60 bg-[#0A1628] transition-all duration-300 overflow-hidden">
                <div className="h-48 bg-[#0F1F3D] schematic-grid flex items-center justify-center border-b border-[#C9A84C]/20 relative overflow-hidden">
                  <div className="text-center">
                    <div className="w-16 h-16 border border-[#C9A84C]/40 mx-auto flex items-center justify-center mb-2 group-hover:border-[#C9A84C] transition-colors">
                      <span className="text-[#C9A84C]/60 text-2xl group-hover:text-[#C9A84C] transition-colors">{product.icon}</span>
                    </div>
                    <p className="text-[#C9A84C]/50 text-xs font-mono">{product.category}</p>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold tracking-widest">
                    {product.badge}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.3em] uppercase mb-1">{product.category}</p>
                  <h3 className="text-[#E8EDF5] font-bold mb-2 text-sm leading-tight">{product.name}</h3>
                  <p className="text-[#64748B] text-xs font-mono leading-relaxed mb-4">{product.spec}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#C9A84C] font-black font-mono">{product.price}</span>
                    <span className="text-[#0D9488] text-xs font-mono tracking-wider group-hover:text-[#14B8A6] transition-colors">Spec Sheet →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/shop" className="inline-flex items-center gap-3 px-10 py-4 border border-[#C9A84C] text-[#C9A84C] text-sm font-bold tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0A1628] transition-all duration-300">
              Access Full Inventory →
            </Link>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="py-24 bg-[#0A1628] border-t border-[#C9A84C]/20 molecular-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-8">{"// FOUNDRY DIRECTIVE"}</p>
          <blockquote className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-[#E8EDF5] leading-tight mb-8" style={{ fontFamily: 'var(--font-montserrat)' }}>
            <span className="text-[#C9A84C]">&ldquo;</span>We don&apos;t sell lifestyle.
            We engineer it. Every molecule chosen for a reason, every product built to outlast the trend.<span className="text-[#C9A84C]">&rdquo;</span>
          </blockquote>
          <p className="text-[#64748B] font-mono text-sm tracking-wider">— THE TERPFORGE MANIFESTO</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/story" className="px-8 py-4 border border-[#C9A84C]/40 text-[#C9A84C] text-sm font-bold tracking-widest uppercase hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
              Read The Foundry Story
            </Link>
            <Link href="/lab" className="px-8 py-4 bg-[#0D9488] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#14B8A6] transition-colors">
              Enter The Lab
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
