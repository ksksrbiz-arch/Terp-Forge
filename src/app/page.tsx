import Image from "next/image";
import { StreamPlayer } from "@/components/StreamPlayer";
import Link from "next/link";
import MolecularCanvas from "@/components/ui/MolecularCanvas";
import Marquee from "@/components/ui/Marquee";
import CornerBrackets from "@/components/ui/CornerBrackets";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import TiltCard from "@/components/ui/TiltCard";
import CountUp from "@/components/ui/CountUp";
import OrbitSelector from "@/components/ui/OrbitSelector";

const pillars = [
  {
    id: "01",
    title: "Foundation",
    subtitle: "Pure Ingredients",
    description:
      "Every compound sourced, verified, and batch-tested. Zero synthetic fillers. Full-spectrum terpene isolates, traceable from biomass to final product.",
    statTo: 99.7,
    statDecimals: 1,
    statSuffix: "%",
    statLabel: "Purity Rating",
    accent: "#0D9488",
  },
  {
    id: "02",
    title: "Systems",
    subtitle: "Precision Extraction",
    description:
      "Industrial-grade closed-loop hydrocarbon and CO₂ extraction systems. Temperature-controlled at ±0.1°C. Every variable engineered, not estimated.",
    statTo: 0.1,
    statDecimals: 1,
    statPrefix: "±",
    statSuffix: "°C",
    statLabel: "Thermal Tolerance",
    accent: "#C9A84C",
  },
  {
    id: "03",
    title: "Scale",
    subtitle: "Lifestyle Impact",
    description:
      "From molecular to macro. Terpene science applied to apparel, wellness, and hardware — a complete lifestyle system built on verified chemistry.",
    statTo: 3,
    statDecimals: 0,
    statSuffix: " VERTICALS",
    statLabel: "Product Systems",
    accent: "#0D9488",
  },
];

const terpeneProfiles = [
  {
    name: "Myrcene",
    formula: "C₁₀H₁₆",
    profile: "RECOVERY",
    effect:
      "Muscle relaxation and sedative properties. Found in hops and mango. Synergistic with CBD receptors.",
    accent: "#0D9488",
    symbol: "M",
  },
  {
    name: "Limonene",
    formula: "C₁₀H₁₆",
    profile: "FOCUS",
    effect:
      "Elevated mood, stress relief, anti-anxiety. Bright citrus profile, abundant in citrus rinds and rosemary.",
    accent: "#C9A84C",
    symbol: "L",
  },
  {
    name: "Linalool",
    formula: "C₁₀H₁₈O",
    profile: "CALM",
    effect:
      "Anti-anxiety and sedative. Floral lavender notes. Found in over 200 plant species.",
    accent: "#2563EB",
    symbol: "Ln",
  },
];

// Bento layout cells for the visual showcase. Spans are tuned for lg breakpoint.
const showcaseCells = [
  {
    src: "/images/forge-process.jpg",
    alt: "TerpForge extraction and forging process",
    label: "FORGE // EXTRACTION PROCESS",
    span: "lg:col-span-2 lg:row-span-2",
    height: "h-[26rem]",
  },
  {
    src: "/images/lab-molecular.jpg",
    alt: "Molecular analysis in the TerpForge laboratory",
    label: "LAB // MOLECULAR ANALYSIS",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/terpene-science-aromatic.jpg",
    alt: "Terpene science and compound isolation",
    label: "SCIENCE // ISOLATION",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/tech-life-1.jpeg",
    alt: "TerpForge Tech Life",
    label: "LIFESTYLE // TECH LIFE",
    span: "lg:col-span-2",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/product-showcase.jpg",
    alt: "TerpForge product showcase",
    label: "PRODUCT // FINAL OUTPUT",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/tech-life-2.jpeg",
    alt: "TerpForge Tech Life collection",
    label: "LIFESTYLE // ENGINEERED",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/terpene-science.jpg",
    alt: "Terpene science and compound isolation",
    label: "CHEMISTRY // AROMATIC COMPOUNDS",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/lab-molecular-phenol.jpg",
    alt: "Molecular analysis in the TerpForge laboratory",
    label: "SCIENCE // PHENOL ISOLATION",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/forge-process-cbda.jpg",
    alt: "CBDA to CBD decarboxylation molecular conversion diagram",
    label: "PROCESS // CBDA → CBD",
    span: "lg:col-span-2",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/hero-extraction.jpg",
    alt: "Cannabinoid molecular structure forged in fire",
    label: "COMPOUNDS // MOLECULAR FORGE",
    span: "lg:col-span-2",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/product-showcase.jpg",
    alt: "Glowing molecular model resting on dark velvet with terpene compound structures",
    label: "COMPOUND // MOLECULAR MODEL",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/tech-life-1.jpeg",
    alt: "Molecular model on forge anvil with industrial sparks flying",
    label: "FORGE // COMPOUND STRUCTURE",
    span: "lg:col-span-1",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/tech-life-iridescent.jpeg",
    alt: "Iridescent metallic molecular model in front of forge fire and sparks",
    label: "SCIENCE // IRIDESCENT STRUCTURE",
    span: "lg:col-span-2",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/forge-process-organic.jpg",
    alt: "TerpForge extraction and forging process",
    label: "FOUNDRY // ORGANIC COMPOUND",
    span: "lg:col-span-4",
    height: "h-56 sm:h-64",
  },
  {
    src: "/images/lab-molecular-benzene.jpg",
    alt: "Molecular analysis in the TerpForge laboratory",
    label: "SCIENCE // MOLECULAR MODEL",
    span: "lg:col-span-2",
    height: "h-48 sm:h-56",
  },
  {
    src: "/images/terpene-science-compound-structure.jpg",
    alt: "Terpene science and compound isolation",
    label: "LAB // COMPOUND STRUCTURE",
    span: "lg:col-span-2",
    height: "h-48 sm:h-56",
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
      <section className="relative min-h-screen flex items-center overflow-hidden hex-mesh molecular-bg pt-16 noise-overlay scanlines">
        {/* Animated molecular network backdrop */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-70">
          <MolecularCanvas density={42} linkDistance={150} />
        </div>

        {/* Vignette to keep typography legible over the network */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,22,40,0.55)_60%,_rgba(10,22,40,0.92)_100%)]" />

        {/* Decorative concentric gold rings (drifting) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 border border-[#C9A84C]/10 rounded-full drift-slow" />
          <div className="absolute top-1/4 right-1/4 w-52 h-52 border border-[#C9A84C]/15 rounded-full drift-slow" style={{ transform: 'translate(32px, 32px)', animationDelay: '-3s' }} />
          <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-[#C9A84C]/20 rounded-full drift-slow" style={{ transform: 'translate(64px, 64px)', animationDelay: '-6s' }} />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0D9488]/40 to-transparent" />
        </div>

        {/* Vertical schematic readouts — desktop only */}
        <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 pointer-events-none">
          <span className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] [writing-mode:vertical-rl] rotate-180">
            FOUNDRY // OPERATIONAL
          </span>
          <span className="w-px h-24 bg-gradient-to-b from-transparent via-[#0D9488]/50 to-transparent" />
          <span className="text-[#C9A84C] text-[10px] font-mono tracking-[0.4em] [writing-mode:vertical-rl] rotate-180 pulse-soft">
            BATCH 0247-A
          </span>
        </div>
        <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 pointer-events-none">
          <span className="text-[#C9A84C] text-[10px] font-mono tracking-[0.4em] [writing-mode:vertical-rl]">
            TF-SYSTEMS // v2.6
          </span>
          <span className="w-px h-24 bg-gradient-to-b from-transparent via-[#C9A84C]/50 to-transparent" />
          <span className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] [writing-mode:vertical-rl] pulse-soft">
            EXTRACTION // LIVE
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <p
                className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6 line-rise"
                style={{ animationDelay: "0ms" }}
              >
                {"// TERPFORGE SYSTEMS ONLINE"}
              </p>
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-none mb-6"
                style={{ fontFamily: 'var(--font-montserrat)' }}
              >
                <span className="block text-[#E8EDF5] line-rise" style={{ animationDelay: "120ms" }}>ENGINEERED</span>
                <span className="block text-[#E8EDF5] line-rise" style={{ animationDelay: "220ms" }}>AROMATICS.</span>
                <span className="block holo-gold line-rise" style={{ animationDelay: "340ms" }}>FORGED</span>
                <span className="block text-[#E8EDF5] line-rise" style={{ animationDelay: "460ms" }}>WELLNESS.</span>
              </h1>
              <p
                className="text-[#94A3B8] text-base sm:text-lg leading-relaxed max-w-md mb-8 font-light line-rise"
                style={{ animationDelay: "640ms" }}
              >
                The intersection of molecular terpene precision and industrial-grade craftsmanship.
                Built for those who demand specification-level purity.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 line-rise"
                style={{ animationDelay: "780ms" }}
              >
                <Link href="/shop" className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#C9A84C] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors overflow-hidden">
                  <span className="relative z-10">Enter The Inventory →</span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </Link>
                <Link href="/lab" className="inline-flex items-center justify-center px-8 py-4 border border-[#0D9488] text-[#0D9488] text-sm font-bold tracking-widest uppercase hover:bg-[#0D9488]/10 hover:text-[#14B8A6] transition-colors">
                  View The Lab
                </Link>
              </div>

              <div
                className="mt-10 pt-8 border-t border-[#1E293B] grid grid-cols-3 gap-4 line-rise"
                style={{ animationDelay: "920ms" }}
              >
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

            {/* Right — Hero image */}
            <div className="flex items-center justify-center order-first lg:order-none">
              <Reveal variant="right" delay={300}>
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
                  <CornerBrackets size={18} color="#C9A84C" inset={-9} />
                  <div className="absolute -inset-4 border border-[#C9A84C]/20 pointer-events-none" />
                  <div className="absolute -inset-1 border border-[#0D9488]/10 pointer-events-none" />
                  <Image
                    src="/images/hero-extraction.jpg"
                    alt="TerpForge industrial extraction facility with glowing molecular structures"
                    width={600}
                    height={400}
                    sizes="(min-width: 1024px) 32rem, 100vw"
                    className="w-full h-auto object-cover"
                    priority
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#0A1628]/80 backdrop-blur-sm border border-[#0D9488]/40">
                    <p className="text-[#0D9488] text-[10px] font-mono">EXTRACTION // LIVE</p>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-[#0A1628]/80 backdrop-blur-sm border border-[#C9A84C]/40">
                    <p className="text-[#C9A84C] text-[10px] font-mono">TF-SYSTEMS</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <p className="text-[#64748B] text-[10px] font-mono tracking-widest">SCROLL</p>
          <div className="w-px h-8 bg-gradient-to-b from-[#C9A84C]/50 to-transparent" />
        </div>
      </section>

      {/* TELEMETRY TICKER */}
      <section
        aria-label="Foundry telemetry"
        className="border-y border-[#C9A84C]/20 bg-[#070F1E] py-3"
      >
        <Marquee durationSeconds={48}>
          {[
            { k: "BATCH", v: "0247-A" },
            { k: "PURITY", v: "99.7%" },
            { k: "EXTRACTION", v: "−40°C → +35°C" },
            { k: "PROFILE", v: "MYRCENE-DOMINANT" },
            { k: "COA", v: "VERIFIED" },
            { k: "FOUNDRY", v: "OPERATIONAL" },
            { k: "PRESSURE", v: "1.2 MPa" },
            { k: "FLOW", v: "0.84 L/min" },
            { k: "RH", v: "32%" },
            { k: "INDEX", v: "TF-SYSTEMS v2.6" },
          ].map(({ k, v }, i) => (
            <span
              key={`${k}-${i}`}
              className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase whitespace-nowrap"
            >
              <span className="text-[#0D9488]">{`// ${k}`}</span>
              <span className="text-[#E8EDF5]">{v}</span>
              <span aria-hidden className="text-[#C9A84C]/50 px-2">◆</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* THE CATHEDRAL PRINCIPLE */}
      <Section
        id="cathedral"
        eyebrow="OPERATING PRINCIPLE"
        title="The Cathedral Principle"
        intro="Three load-bearing pillars. Every TerpForge product is engineered against these specifications — no exceptions."
        index={{ current: 1, total: 7 }}
        variant="navy-light"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.id} variant="up" delay={i * 120}>
              <TiltCard
                className="conic-ring relative h-full p-8 border border-[#C9A84C]/20 bg-[#0A1628] hover:border-[#C9A84C]/50 transition-colors duration-300 group overflow-hidden"
                glowColor={`${pillar.accent}26`}
              >
                <CornerBrackets size={12} color="rgba(201,168,76,0.5)" inset={4} />
                <div
                  aria-hidden
                  className="text-[#C9A84C]/15 text-8xl font-black font-mono absolute top-4 right-6 leading-none select-none group-hover:text-[#C9A84C]/25 transition-colors"
                >
                  {pillar.id}
                </div>
                <div className="relative">
                  <div
                    className="w-12 h-px mb-6"
                    style={{
                      background: `linear-gradient(90deg, ${pillar.accent}, transparent)`,
                    }}
                  />
                  <p className="text-[#0D9488] text-xs font-mono tracking-[0.3em] uppercase mb-1">
                    Pillar {i + 1}
                  </p>
                  <h3
                    className="text-2xl font-black uppercase text-[#E8EDF5] mb-1"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-[#C9A84C] text-sm font-mono tracking-wider mb-4">
                    {pillar.subtitle}
                  </p>
                  <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 font-light">
                    {pillar.description}
                  </p>
                  <div className="pt-4 border-t border-[#1E293B] flex items-end justify-between gap-3">
                    <div>
                      <CountUp
                        to={pillar.statTo}
                        decimals={pillar.statDecimals}
                        prefix={pillar.statPrefix}
                        suffix={pillar.statSuffix}
                        className="text-[#C9A84C] text-2xl font-black font-mono"
                      />
                      <p className="text-[#64748B] text-xs font-mono tracking-wider uppercase mt-1">
                        {pillar.statLabel}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="text-[10px] font-mono tracking-[0.3em] text-[#0D9488]/70"
                    >
                      {"// SPEC"}
                    </span>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* TERPENE PROFILES — ORBIT SELECTOR */}
      <Section
        eyebrow="COMPOUND LIBRARY"
        title="Active Profiles"
        intro="Three signature compounds, three protocols. Tap a node to inspect — the central panel renders live spec data."
        index={{ current: 2, total: 7 }}
        variant="blueprint"
        align="left"
        headerEnd={
          <Link
            href="/lab"
            className="text-sm font-mono text-[#0D9488] hover:text-[#14B8A6] transition-colors tracking-wider border-b border-[#0D9488]/50 pb-1"
          >
            View Full Compound Library →
          </Link>
        }
      >
        <Reveal variant="scale">
          <OrbitSelector terpenes={terpeneProfiles} />
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {terpeneProfiles.map((t) => (
            <li
              key={t.name}
              className="px-4 py-3 border bg-[#0A1628]/60 backdrop-blur-sm flex items-center gap-3"
              style={{ borderColor: `${t.accent}30` }}
            >
              <span
                className="inline-flex w-7 h-7 items-center justify-center text-[10px] font-black font-mono rounded-sm"
                style={{ background: `${t.accent}22`, color: t.accent }}
              >
                {t.symbol}
              </span>
              <span className="flex-1">
                <p
                  className="text-[10px] font-mono tracking-[0.3em] uppercase"
                  style={{ color: t.accent }}
                >
                  {t.profile}
                </p>
                <p className="text-[#E8EDF5] text-sm font-bold">{t.name}</p>
              </span>
              <span
                className="text-[10px] font-mono"
                style={{ color: t.accent }}
              >
                {t.formula}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* VISUAL SHOWCASE — BENTO */}
      <Section
        eyebrow="VISUAL DOCUMENTATION"
        title="The Forge In Action"
        index={{ current: 3, total: 7 }}
        variant="navy-light"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[12rem] gap-4">
          {showcaseCells.map((img, i) => (
            <Reveal
              key={img.src}
              variant={i % 2 === 0 ? "left" : "right"}
              delay={i * 80}
              className={`group relative overflow-hidden border border-[#C9A84C]/20 hover:border-[#C9A84C]/60 transition-all duration-300 ${img.span}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={1200}
                height={800}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className={`w-full ${img.height} object-cover grayscale-[35%] saturate-50 contrast-110 group-hover:grayscale-0 group-hover:saturate-100 group-hover:scale-[1.04] transition-all duration-700`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/85 via-[#0A1628]/10 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0D9488]/40 to-transparent" />
              <CornerBrackets size={10} color="rgba(201,168,76,0.55)" inset={6} />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                <span className="px-2 py-1 bg-[#0A1628]/85 backdrop-blur-sm border border-[#0D9488]/40">
                  <p className="text-[#0D9488] text-[10px] font-mono tracking-wider whitespace-nowrap">
                    {img.label}
                  </p>
                </span>
                <span
                  aria-hidden
                  className="hidden group-hover:block flex-1 h-px bg-gradient-to-r from-[#0D9488]/40 to-transparent"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PRODUCT VERTICALS — image-led entry to each shop category */}
      <Section
        eyebrow="PRODUCT VERTICALS"
        title="Three Systems, One Foundry"
        intro="Apparel, hardware, and CBD wellness — every line built on the same molecular precision."
        index={{ current: 4, total: 7 }}
        variant="navy-light"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              src: "/images/tech-life-1.jpeg",
              alt: "TerpForge Tech Life",
              eyebrow: "// VERTICAL 01",
              title: "Apparel",
              tagline: "Heavy-duty streetwear with gold-foil molecular schematics.",
              href: "/shop?cat=apparel#apparel",
            },
            {
              src: "/images/lab-molecular.jpg",
              alt: "Molecular analysis in the TerpForge laboratory",
              eyebrow: "// VERTICAL 02",
              title: "Hardware",
              tagline: "Terpene preservation systems engineered for the long haul.",
              href: "/shop?cat=hardware#hardware",
            },
            {
              src: "/images/product-showcase.jpg",
              alt: "TerpForge product showcase",
              eyebrow: "// VERTICAL 03",
              title: "CBD Wellness",
              tagline: "Lab-certified tinctures and gummies tuned to specific terpene profiles.",
              href: "/shop?cat=wellness#wellness",
            },
          ].map((v, i) => (
            <Reveal key={v.href} variant={i % 2 === 0 ? "left" : "right"} delay={i * 90}>
              <Link
                href={v.href}
                className="group relative block overflow-hidden border border-[#C9A84C]/25 hover:border-[#C9A84C]/70 transition-colors duration-300 bg-[#0A1628]"
              >
                <div className="aspect-[4/5] relative">
                  <Image
                    src={v.src}
                    alt={v.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover grayscale-[20%] saturate-[0.95] group-hover:grayscale-0 group-hover:saturate-100 group-hover:scale-[1.03] transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/35 to-transparent pointer-events-none" />
                  <CornerBrackets size={14} color="rgba(201,168,76,0.7)" inset={8} />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#0A1628]/80 backdrop-blur-sm border border-[#0D9488]/40">
                    <p className="text-[#0D9488] text-[10px] font-mono tracking-wider">{v.eyebrow}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-black uppercase text-[#E8EDF5] mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>
                    {v.title}
                  </h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed font-light mb-3">
                    {v.tagline}
                  </p>
                  <p className="text-[#C9A84C] text-xs font-mono tracking-[0.3em] uppercase group-hover:translate-x-1 transition-transform duration-300">
                    Enter →
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

            {/* BRAND VIDEO */}
      <Section
        eyebrow="TRANSMISSION"
        title="From The Foundry Floor"
        intro="An inside look at how precision chemistry meets industrial craftsmanship."
        index={{ current: 5, total: 7 }}
        variant="navy"
        className="!border-t-0"
      >
        <div className="max-w-5xl mx-auto">
          <Reveal variant="up">
            <div className="relative border border-[#C9A84C]/30 bg-[#0A1628] conic-ring">
              <CornerBrackets size={14} color="#C9A84C" inset={-7} />
              <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-[#0A1628]/80 backdrop-blur-sm border border-[#0D9488]/40">
                <p className="text-[#0D9488] text-[10px] font-mono tracking-wider">FOUNDRY // BROADCAST</p>
              </div>
              <StreamPlayer
                className="w-full relative z-[1]"
                fallbackSrc="/videos/brand-video.mp4"
                videoId={process.env.NEXT_PUBLIC_BRAND_STREAM_ID}
                poster="/images/hero-extraction.jpg"
                ariaLabel="TerpForge foundry and extraction process brand video"
                controls
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* FEATURED PRODUCTS */}
      <Section
        eyebrow="PRODUCT SYSTEMS"
        title="Current Inventory"
        index={{ current: 5, total: 7 }}
        variant="navy-light"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {featuredProducts.map((product, i) => (
            <Reveal key={product.name} variant="up" delay={i * 100}>
              <Link
                href={product.href}
                prefetch={false}
                className="group relative block border border-[#C9A84C]/20 hover:border-[#C9A84C]/60 bg-[#0A1628] transition-all duration-300 overflow-hidden h-full"
              >
                <div className="h-48 bg-[#0F1F3D] schematic-grid flex items-center justify-center border-b border-[#C9A84C]/20 relative overflow-hidden">
                  <div className="text-center">
                    <div className="w-16 h-16 border border-[#C9A84C]/40 mx-auto flex items-center justify-center mb-2 group-hover:border-[#C9A84C] group-hover:rotate-12 transition-all duration-500">
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
                  <p className="text-[#94A3B8] text-xs font-mono leading-relaxed mb-4">{product.spec}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#C9A84C] font-black font-mono">{product.price}</span>
                    <span className="text-[#0D9488] text-xs font-mono tracking-wider group-hover:text-[#14B8A6] transition-colors">Spec Sheet →</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <Link href="/shop" className="inline-flex items-center gap-3 px-10 py-4 border border-[#C9A84C] text-[#C9A84C] text-sm font-bold tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0A1628] transition-all duration-300">
            Access Full Inventory →
          </Link>
        </div>
      </Section>

      {/* MANIFESTO — full-bleed parallax */}
      <section
        id="manifesto"
        className="relative overflow-hidden border-t border-[#C9A84C]/20 hex-mesh molecular-bg noise-overlay scanlines py-32 sm:py-40"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] aspect-square max-w-[1100px] border border-[#C9A84C]/8 rounded-full drift-slow" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] aspect-square max-w-[800px] border border-[#0D9488]/12 rounded-full drift-slow" style={{ animationDelay: "-4s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(13,148,136,0.10)_0%,_transparent_55%)]" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0D9488]/50 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
            {"// FOUNDRY DIRECTIVE"}
          </p>
          <span
            aria-hidden
            className="block holo-gold text-[10rem] sm:text-[14rem] font-black leading-none -mb-12 sm:-mb-20 select-none"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            &ldquo;
          </span>
          <Reveal variant="up">
            <blockquote
              className="relative text-3xl sm:text-5xl font-black tracking-tight uppercase text-[#E8EDF5] leading-[1.05] mb-10"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              We don&apos;t sell{" "}
              <span className="text-[#94A3B8] line-through decoration-[#0D9488]/60">
                lifestyle
              </span>
              .{" "}
              <span className="holo-gold">We engineer it.</span>{" "}
              Every molecule chosen for a reason. Every product built to outlast the trend.
            </blockquote>
          </Reveal>
          <Reveal variant="up" delay={150}>
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-px bg-[#C9A84C]/50" />
                <p className="text-[#C9A84C] font-mono text-xs sm:text-sm tracking-[0.4em] uppercase">
                  The TerpForge Manifesto
                </p>
                <span className="w-12 h-px bg-[#C9A84C]/50" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/story"
                  className="px-8 py-4 border border-[#C9A84C]/40 text-[#C9A84C] text-sm font-bold tracking-widest uppercase hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all"
                >
                  Read The Foundry Story
                </Link>
                <Link
                  href="/lab"
                  className="px-8 py-4 bg-[#0D9488] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#14B8A6] transition-colors"
                >
                  Enter The Lab
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
