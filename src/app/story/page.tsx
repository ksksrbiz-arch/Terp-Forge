import Image from "next/image";
import { StreamPlayer } from "@/components/StreamPlayer";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

type ValueIconKind = "durability" | "spec" | "shield";

const timeline = [
  {
    year: "2018",
    title: "The Origin",
    description:
      "Founded by extraction engineers frustrated with the gap between industrial terpene science and lifestyle products that actually worked. The question was simple: why did everything claiming to use terpenes smell like marketing and nothing like chemistry?",
  },
  {
    year: "2020",
    title: "The Lab",
    description:
      "Secured access to closed-loop extraction equipment and ISO-certified testing partnerships. First batches of single-origin terpene isolates produced. Purity standard established at 99.7% minimum — a specification most competitors still cannot meet.",
  },
  {
    year: "2022",
    title: "The Forge",
    description:
      "Expanded into apparel with the first Molecular Schematic collection. Gold-foil printing on heavyweight cotton fleece — designed to function as wearable documentation of the science. The apparel vertical was born as education, not fashion.",
  },
  {
    year: "2024",
    title: "The System",
    description:
      "Three verticals fully operational: Apparel, Hardware, and CBD Wellness. All interconnected by the same terpene profile system. Every product in every category links to a common compound library with verifiable COA documentation.",
  },
  {
    year: "2025",
    title: "The Standard",
    description:
      "TerpForge introduces The Registry — a loyalty protocol for verified customers who demand batch-level transparency. Full COA portal launched. The benchmark for terpene-first product development is formalized and public.",
  },
];

const values: {
  title: string;
  description: string;
  spec: string;
  icon: ValueIconKind;
}[] = [
  {
    title: "Made-to-Last",
    description:
      "We build for years, not seasons. Every piece of hardware is specified to outlast the trends that surround it. Every wellness formulation is validated against a consistent batch standard. No shortcuts in manufacturing or testing.",
    spec: "Durability Rating: INDUSTRIAL",
    icon: "durability",
  },
  {
    title: "Specification-First",
    description:
      "Product descriptions are engineering specs, not copy. If we cannot verify a claim with data, we do not make the claim. Every compound has a verified molecular profile. Every batch has a COA. Everything is traceable.",
    spec: "Standard: ISO/IEC 17025",
    icon: "spec",
  },
  {
    title: "Zero THC",
    description:
      "A non-negotiable specification. Not a marketing position — an engineering requirement. Our formulation systems are built around terpene-CBD synergy, not cannabinoid intoxication. The science does not require THC to work.",
    spec: "THC: <0.001% (Non-Detect)",
    icon: "shield",
  },
];

const team = [
  {
    name: "J. Mercer",
    role: "Chief Extraction Engineer",
    spec: "12yr industrial chemistry · CO₂/Hydrocarbon systems",
  },
  {
    name: "A. Vasquez",
    role: "Formulation Chemist",
    spec: "PhD Organic Chemistry · Terpene isolation specialist",
  },
  {
    name: "T. Nakamura",
    role: "Product Systems Lead",
    spec: "Industrial design · Material specification",
  },
  {
    name: "S. Oduya",
    role: "QA & Compliance Director",
    spec: "ISO 17025 · Third-party lab coordination",
  },
];

function ValueIcon({ kind }: { kind: ValueIconKind }) {
  if (kind === "durability") {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <circle cx="24" cy="24" r="16" className="value-icon-stroke" />
        <path d="M16 24h16M24 16v16" className="value-icon-stroke" />
      </svg>
    );
  }
  if (kind === "spec") {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <rect x="11" y="9" width="26" height="30" rx="1.5" className="value-icon-stroke" />
        <path d="M17 19h14M17 25h14M17 31h9" className="value-icon-stroke" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10">
      <path d="M24 8l12 5v10c0 8-5 13-12 17-7-4-12-9-12-17V13l12-5z" className="value-icon-stroke" />
      <path d="M18.5 24l4 4 7-8" className="value-icon-stroke" />
    </svg>
  );
}

export default function StoryPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-[#0F1F3D] border-b border-[#C9A84C]/20 py-16 schematic-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
            {"// ORIGIN DOCUMENTATION"}
          </p>
          <h1
            className="text-5xl sm:text-6xl font-black tracking-tight uppercase text-[#E8EDF5] mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            The Foundry Story
          </h1>
          <p className="text-[#64748B] font-mono text-sm max-w-2xl leading-relaxed">
            TerpForge was not built as a brand. It was built as a response to
            an industry-wide failure of honesty. Here is what happened, and why
            it matters.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* ── MANIFESTO BLOCK ─────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative p-8 border border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid">
            <div className="text-[#C9A84C]/10 text-[120px] font-black leading-none absolute top-0 right-4 select-none">
              TF
            </div>
            <div className="relative">
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
                {"// CORE DIRECTIVE"}
              </p>
              <blockquote
                className="text-2xl font-black uppercase text-[#E8EDF5] leading-tight mb-6"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                <span className="text-[#C9A84C]">&ldquo;</span>
                We don&apos;t sell lifestyle. We engineer it. Every molecule
                chosen for a reason, every product built to outlast the trend.
                <span className="text-[#C9A84C]">&rdquo;</span>
              </blockquote>
              <p className="text-[#64748B] font-mono text-xs tracking-wider">
                — THE TERPFORGE MANIFESTO · EST. 2018
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden border border-[#C9A84C]/20">
            <Image
              src="/images/forge-process.jpg"
              alt="The TerpForge extraction and forging process"
              width={600}
              height={400}
              sizes="(min-width: 1024px) 32rem, 100vw"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A1628]/70 backdrop-blur-sm border border-[#0D9488]/30">
              <p className="text-[#0D9488] text-[10px] font-mono tracking-wider">ORIGIN // THE FORGE</p>
            </div>
          </div>
        </section>

        {/* ── STORY IMAGES ─────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden border border-[#C9A84C]/20 group">
            <Image
              src="/images/lab-molecular.jpg"
              alt="Molecular analysis at TerpForge"
              width={600}
              height={400}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A1628]/70 backdrop-blur-sm border border-[#0D9488]/30">
              <p className="text-[#0D9488] text-[10px] font-mono tracking-wider">LAB // MOLECULAR PRECISION</p>
            </div>
          </div>
          <div className="relative overflow-hidden border border-[#C9A84C]/20 group">
            <Image
              src="/images/terpene-science.jpg"
              alt="Terpene compound science"
              width={600}
              height={400}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A1628]/70 backdrop-blur-sm border border-[#C9A84C]/30">
              <p className="text-[#C9A84C] text-[10px] font-mono tracking-wider">SCIENCE // COMPOUND ISOLATION</p>
            </div>
          </div>
        </section>

        {/* ── MOLECULAR SCIENCE IMAGES ─────────────────────── */}
        <section>
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
            {"// MOLECULAR SCIENCE DOCUMENTATION"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden border border-[#C9A84C]/20 group">
              <Image
                src="/images/terpene-science.jpg"
                alt="Aromatic terpene ring structures emerging from fire"
                width={600}
                height={400}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A1628]/70 backdrop-blur-sm border border-[#0D9488]/30">
                <p className="text-[#0D9488] text-[10px] font-mono tracking-wider">CHEMISTRY // AROMATIC COMPOUNDS</p>
              </div>
            </div>
            <div className="relative overflow-hidden border border-[#C9A84C]/20 group">
              <Image
                src="/images/lab-molecular.jpg"
                alt="Phenol molecular model before and after extraction with fire"
                width={600}
                height={400}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A1628]/70 backdrop-blur-sm border border-[#C9A84C]/30">
                <p className="text-[#C9A84C] text-[10px] font-mono tracking-wider">SCIENCE // PHENOL ISOLATION</p>
              </div>
            </div>
            <div className="relative overflow-hidden border border-[#C9A84C]/20 group md:col-span-2">
              <Image
                src="/images/forge-process.jpg"
                alt="CBDA to CBD decarboxylation molecular conversion diagram"
                width={1200}
                height={600}
                sizes="100vw"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A1628]/70 backdrop-blur-sm border border-[#0D9488]/30">
                <p className="text-[#0D9488] text-[10px] font-mono tracking-wider">PROCESS // CBDA → CBD DECARBOXYLATION</p>
              </div>
            </div>
            <div className="relative overflow-hidden border border-[#C9A84C]/20 group md:col-span-2">
              <Image
                src="/images/hero-extraction.jpg"
                alt="Cannabinoid molecular structure forged in fire"
                width={1200}
                height={600}
                sizes="100vw"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0A1628]/70 backdrop-blur-sm border border-[#C9A84C]/30">
                <p className="text-[#C9A84C] text-[10px] font-mono tracking-wider">COMPOUNDS // MOLECULAR FORGE</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM SECTION ─────────────────────── */}
        <section>
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
            {"// THE PROBLEM WE SOLVED"}
          </p>
          <div className="space-y-4 text-[#64748B] font-mono text-sm leading-relaxed max-w-3xl">
            <p>
              The terpene market in 2018 was saturated with products that
              referenced molecular science without understanding it.
              &ldquo;Terpene-enhanced&rdquo; labels were applied to products with
              trace, unverified compound concentrations. The marketing was
              ahead of the chemistry by years.
            </p>
            <p>
              TerpForge was built to close that gap. Not by creating better
              marketing — by creating better products, then letting the
              specifications speak for themselves.
            </p>
            <p>
              Every product in our inventory starts with a molecular brief, not
              a brand brief. The compound comes first. The application follows
              the chemistry. The design reflects the function.
            </p>
          </div>
        </section>

        {/* ── FOUNDERS CINEMATIC PLATE ───────────────────────────── */}
        <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 min-h-[24rem] border-y border-[#C9A84C]/25 overflow-hidden">
          <StreamPlayer
            className="w-full"
            fallbackSrc="/videos/brand-video.mp4"
            videoId={process.env.NEXT_PUBLIC_BRAND_STREAM_ID}
            ariaLabel="TerpForge foundry origin video"
            controls
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/88 via-[#0A1628]/70 to-[#0A1628]/88" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/90 via-transparent to-[#0A1628]/45" />
          <Reveal
            as="section"
            variant="up"
            className="relative h-full max-w-7xl mx-auto px-6 py-14 flex items-end"
          >
            <div className="max-w-2xl">
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-3">
                {"// FOUNDER ORIGIN PLATE"}
              </p>
              <h2
                className="text-3xl sm:text-4xl font-black uppercase text-[#E8EDF5] leading-tight mb-4"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Born In A Lab, Tempered In The Foundry
              </h2>
              <p className="text-[#94A3B8] font-mono text-sm leading-relaxed">
                Our origin was not a campaign launch. It was a systems response
                led by extraction operators, formulation chemists, and QA
                engineers who decided every claim had to map to a measurable
                specification.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ── TIMELINE (HORIZONTAL BLUEPRINT) ───────────────────── */}
        <section>
          <div className="mb-8">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// BUILD LOG"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Foundry Timeline
            </h2>
          </div>
          <div className="relative border border-[#C9A84C]/20 bg-[#0F1F3D] blueprint-grid p-4 sm:p-6">
            <div className="absolute left-0 right-0 top-[4.5rem] h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
            <div className="overflow-x-auto pb-3">
              <div className="flex gap-4 sm:gap-6 min-w-max snap-x snap-mandatory">
                {timeline.map((entry, i) => (
                  <Reveal key={entry.year} variant="up" delay={Math.min(i, 6) * 70}>
                    <article className="snap-start w-[18rem] sm:w-[19rem] shrink-0 border border-[#1E293B] bg-[#0A1628]/95 p-5 hover:border-[#C9A84C]/45 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-5 h-5 shrink-0">
                          <span
                            aria-hidden
                            className="absolute inset-0 border border-[#C9A84C] rotate-45 bg-[#0A1628]"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-1 bg-[#C9A84C]/70 rotate-45 pulse-soft"
                          />
                        </div>
                        <p className="text-[#C9A84C] font-black font-mono text-sm tracking-widest">
                          {entry.year}
                        </p>
                      </div>
                      <h3
                        className="text-lg font-black uppercase text-[#E8EDF5] mb-2"
                        style={{ fontFamily: "var(--font-montserrat)" }}
                      >
                        {entry.title}
                      </h3>
                      <p className="text-[#94A3B8] font-mono text-sm leading-relaxed">
                        {entry.description}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES (STROKE-DRAW ICON SYSTEM) ─────────────────── */}
        <section>
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// OPERATIONAL STANDARDS"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Engineering Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} variant="up" delay={i * 90}>
                <article className="p-8 border border-[#C9A84C]/20 bg-[#0F1F3D] hover:border-[#C9A84C]/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[#C9A84C]">
                      <ValueIcon kind={v.icon} />
                    </div>
                    <p className="text-[#C9A84C]/30 text-4xl font-black font-mono">
                      0{i + 1}
                    </p>
                  </div>
                  <h3
                    className="text-xl font-black uppercase text-[#E8EDF5] mb-3"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-[#64748B] font-mono text-sm leading-relaxed mb-4">
                    {v.description}
                  </p>
                  <div className="pt-4 border-t border-[#1E293B]">
                    <p className="text-[#0D9488] text-[10px] font-mono tracking-widest">
                      {v.spec}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── TEAM ────────────────────────────────── */}
        <section>
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// PERSONNEL"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              The Extraction Team
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="p-6 border border-[#1E293B] bg-[#0F1F3D] hover:border-[#C9A84C]/30 transition-all duration-300"
              >
                {/* Avatar placeholder */}
                <div className="w-12 h-12 border border-[#C9A84C]/30 flex items-center justify-center mb-4">
                  <span className="text-[#C9A84C] font-mono font-bold text-sm">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="text-[#E8EDF5] font-bold text-sm mb-1">
                  {member.name}
                </h3>
                <p className="text-[#C9A84C] text-[10px] font-mono tracking-wider uppercase mb-3">
                  {member.role}
                </p>
                <p className="text-[#64748B] text-xs font-mono leading-relaxed">
                  {member.spec}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── LIFESTYLE ──────────────────────────── */}
        <section>
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// LIFESTYLE DOCUMENTATION"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Tech Life
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden border border-[#C9A84C]/20 group">
              <Image
                src="/images/tech-life-1.jpeg"
                alt="TerpForge Tech Life"
                width={600}
                height={400}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-[#C9A84C] text-[10px] font-mono tracking-[0.3em] uppercase mb-1">LIFESTYLE // 001</p>
                <p className="text-[#E8EDF5] text-sm font-bold uppercase" style={{ fontFamily: "var(--font-montserrat)" }}>Tech Life Collection</p>
              </div>
            </div>
            <div className="relative overflow-hidden border border-[#C9A84C]/20 group">
              <Image
                src="/images/tech-life-2.jpeg"
                alt="TerpForge Tech Life collection"
                width={600}
                height={400}
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-[#C9A84C] text-[10px] font-mono tracking-[0.3em] uppercase mb-1">LIFESTYLE // 002</p>
                <p className="text-[#E8EDF5] text-sm font-bold uppercase" style={{ fontFamily: "var(--font-montserrat)" }}>Engineered For Living</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────── */}
        <section className="border border-[#C9A84C]/20 p-10 bg-[#0F1F3D] schematic-grid text-center">
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
            {"// NEXT STEP"}
          </p>
          <h2
            className="text-3xl font-black uppercase text-[#E8EDF5] mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Ready to Enter the Inventory?
          </h2>
          <p className="text-[#64748B] font-mono text-sm mb-8 max-w-md mx-auto">
            Every product in The Inventory carries the same engineering standard
            you just read about. No exceptions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-[#C9A84C] text-[#0A1628] text-sm font-bold tracking-widest uppercase hover:bg-[#E2C97E] transition-colors"
            >
              Enter The Inventory
            </Link>
            <Link
              href="/lab"
              className="px-8 py-4 border border-[#0D9488] text-[#0D9488] text-sm font-bold tracking-widest uppercase hover:bg-[#0D9488]/10 transition-colors"
            >
              View The Lab
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
