import Link from "next/link";

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

const values = [
  {
    title: "Made-to-Last",
    description:
      "We build for years, not seasons. Every piece of hardware is specified to outlast the trends that surround it. Every wellness formulation is validated against a consistent batch standard. No shortcuts in manufacturing or testing.",
    spec: "Durability Rating: INDUSTRIAL",
  },
  {
    title: "Specification-First",
    description:
      "Product descriptions are engineering specs, not copy. If we cannot verify a claim with data, we do not make the claim. Every compound has a verified molecular profile. Every batch has a COA. Everything is traceable.",
    spec: "Standard: ISO/IEC 17025",
  },
  {
    title: "Zero THC",
    description:
      "A non-negotiable specification. Not a marketing position — an engineering requirement. Our formulation systems are built around terpene-CBD synergy, not cannabinoid intoxication. The science does not require THC to work.",
    spec: "THC: <0.001% (Non-Detect)",
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

          <div>
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
              {"// THE PROBLEM WE SOLVED"}
            </p>
            <div className="space-y-4 text-[#64748B] font-mono text-sm leading-relaxed">
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
          </div>
        </section>

        {/* ── TIMELINE ────────────────────────────── */}
        <section>
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// BUILD LOG"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Development Timeline
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-gradient-to-b from-[#C9A84C]/50 via-[#C9A84C]/20 to-transparent hidden sm:block" />

            <div className="space-y-0">
              {timeline.map((entry, i) => (
                <div
                  key={entry.year}
                  className={`flex gap-8 items-start p-6 border-b border-[#1E293B] hover:bg-[#0F1F3D] transition-colors ${
                    i === 0 ? "border-t border-[#1E293B]" : ""
                  }`}
                >
                  {/* Year */}
                  <div className="shrink-0 w-16 text-center hidden sm:block">
                    <p className="text-[#C9A84C] font-black font-mono text-sm">
                      {entry.year}
                    </p>
                    <div className="w-3 h-3 border border-[#C9A84C] bg-[#0A1628] mx-auto mt-2 relative z-10" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#C9A84C] font-mono text-xs font-bold sm:hidden mb-1">
                      {entry.year}
                    </p>
                    <h3
                      className="text-lg font-black uppercase text-[#E8EDF5] mb-2"
                      style={{ fontFamily: "var(--font-montserrat)" }}
                    >
                      {entry.title}
                    </h3>
                    <p className="text-[#64748B] font-mono text-sm leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ──────────────────────────────── */}
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
              <div
                key={v.title}
                className="p-8 border border-[#C9A84C]/20 bg-[#0F1F3D] hover:border-[#C9A84C]/50 transition-all duration-300"
              >
                <p className="text-[#C9A84C]/30 text-5xl font-black font-mono mb-4">
                  0{i + 1}
                </p>
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
              </div>
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
