import Link from "next/link";

const DESCRIPTION_PREVIEW_LENGTH = 100;

const terpenes = [
  {
    name: "Myrcene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "167°C",
    density: "0.794 g/mL",
    logP: "4.67",
    profile: "RECOVERY",
    profileColor: "#0D9488",
    description:
      "The most abundant terpene in modern cannabis cultivars. Myrcene exhibits sedative and muscle-relaxant properties. Its earthy, musky aroma with subtle fruity notes is characteristic of hops, mango, and lemongrass. Clinical research indicates synergistic interaction with CBD receptors.",
    applications: [
      "Post-exercise recovery protocols",
      "Sleep cycle support",
      "Muscle tension reduction",
    ],
    naturalSources: ["Hops (Humulus lupulus)", "Mango", "Lemongrass", "Thyme"],
  },
  {
    name: "Limonene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "176°C",
    density: "0.842 g/mL",
    logP: "4.57",
    profile: "FOCUS",
    profileColor: "#C9A84C",
    description:
      "A monocyclic monoterpenoid with a distinctly citrus aroma profile. Limonene is the second-most common terpene in nature. Research supports anti-anxiety and mood-elevating properties. Demonstrates enhanced bioavailability when combined with broad-spectrum CBD.",
    applications: [
      "Cognitive focus enhancement",
      "Stress response modulation",
      "Mood stabilization",
    ],
    naturalSources: [
      "Citrus rinds",
      "Rosemary",
      "Juniper",
      "Peppermint",
    ],
  },
  {
    name: "Linalool",
    formula: "C₁₀H₁₈O",
    mw: "154.25 g/mol",
    bp: "198°C",
    density: "0.858 g/mL",
    logP: "2.97",
    profile: "CALM",
    profileColor: "#2563EB",
    description:
      "A naturally occurring terpene alcohol found in over 200 plant species. Linalool's floral, slightly spicy aroma underpins lavender's reputation for relaxation. Demonstrated anxiolytic and sedative effects in controlled studies. Key compound in TerpForge's Calm Protocol formulations.",
    applications: [
      "Anxiety reduction protocols",
      "Sleep onset support",
      "Inflammation pathway modulation",
    ],
    naturalSources: ["Lavender", "Mint", "Cinnamon", "Birch bark"],
  },
  {
    name: "Caryophyllene",
    formula: "C₁₅H₂₄",
    mw: "204.35 g/mol",
    bp: "130°C (5mmHg)",
    density: "0.905 g/mL",
    logP: "6.89",
    profile: "RECOVERY",
    profileColor: "#0D9488",
    description:
      "A sesquiterpene and the only known terpene to directly activate CB2 receptors. This makes Caryophyllene unique as a dietary cannabinoid. Its spicy, woody, peppery aroma profile is dominant in black pepper, cloves, and hops.",
    applications: [
      "Anti-inflammatory pathways",
      "Pain signal modulation",
      "Gut microbiome support",
    ],
    naturalSources: ["Black pepper", "Cloves", "Hops", "Rosemary"],
  },
  {
    name: "Pinene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "155°C (α) / 166°C (β)",
    density: "0.858 g/mL",
    logP: "4.44",
    profile: "FOCUS",
    profileColor: "#C9A84C",
    description:
      "Exists in two isomeric forms (α and β). The most widely encountered terpene in nature. Fresh pine and earthy aroma. α-Pinene research indicates bronchodilatory effects and memory enhancement via acetylcholinesterase inhibition.",
    applications: [
      "Alertness and memory recall",
      "Respiratory function support",
      "Anti-microbial applications",
    ],
    naturalSources: ["Pine trees", "Rosemary", "Eucalyptus", "Dill"],
  },
  {
    name: "Terpinolene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "186°C",
    density: "0.864 g/mL",
    logP: "4.46",
    profile: "FOCUS",
    profileColor: "#C9A84C",
    description:
      "A multifaceted monoterpene with a fresh, piney, floral aroma. Terpinolene exhibits antioxidant and sedative properties despite being categorized under the Focus profile at sub-threshold doses. Commonly found in uplifting cultivar profiles.",
    applications: [
      "Antioxidant protection",
      "Low-dose stimulant properties",
      "Cultivar complexity enhancement",
    ],
    naturalSources: ["Nutmeg", "Tea tree", "Conifers", "Apples"],
  },
];

const coaEntries = [
  {
    product: "Focus Protocol Tincture — Batch TF-2025-001",
    cbd: "1024mg",
    thc: "<0.001%",
    date: "2025-03-15",
    lab: "ProVerde Laboratories",
    status: "PASS",
  },
  {
    product: "Recovery Protocol Gummies — Batch TF-2025-002",
    cbd: "745mg",
    thc: "<0.001%",
    date: "2025-03-18",
    lab: "ProVerde Laboratories",
    status: "PASS",
  },
  {
    product: "Calm Protocol Tincture — Batch TF-2025-003",
    cbd: "1498mg",
    thc: "<0.001%",
    date: "2025-03-22",
    lab: "ACS Laboratory",
    status: "PASS",
  },
  {
    product: "Terpene Stack Trial Kit — Batch TF-2025-004",
    cbd: "3×335mg",
    thc: "<0.001%",
    date: "2025-04-01",
    lab: "ACS Laboratory",
    status: "PASS",
  },
];

export default function LabPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-[#0F1F3D] border-b border-[#C9A84C]/20 py-16 schematic-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
            {"// SCIENCE & TRANSPARENCY"}
          </p>
          <h1
            className="text-5xl sm:text-6xl font-black tracking-tight uppercase text-[#E8EDF5] mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            The Lab
          </h1>
          <p className="text-[#64748B] font-mono text-sm max-w-2xl leading-relaxed">
            Molecular science, without the mystification. Every compound in
            every TerpForge product is selected on the basis of peer-reviewed
            research, then verified by independent third-party analysis.
          </p>

          {/* Nav anchors */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { href: "#science", label: "Terpene Science" },
              { href: "#profiles", label: "Compound Library" },
              { href: "#coa", label: "COA Portal" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-4 py-2 border border-[#0D9488]/40 text-[#0D9488] text-xs font-mono tracking-widest uppercase hover:border-[#0D9488] hover:bg-[#0D9488]/10 transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* ── TERPENE SCIENCE ────────────────────── */}
        <section id="science">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
                {"// MODULE 01"}
              </p>
              <h2
                className="text-4xl font-black uppercase text-[#E8EDF5] mb-6"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                What Are Terpenes?
              </h2>
              <div className="space-y-4 text-[#64748B] font-mono text-sm leading-relaxed">
                <p>
                  Terpenes are a large and diverse class of naturally occurring
                  organic compounds produced by a variety of plants. They form
                  the primary constituents of essential oils and are responsible
                  for the distinctive aromatic profiles of most botanicals.
                </p>
                <p>
                  Structurally, terpenes are classified by the number of isoprene
                  units (C₅H₈) they contain. Monoterpenes (C₁₀) are the most
                  common, followed by sesquiterpenes (C₁₅) and diterpenes
                  (C₂₀).
                </p>
                <p>
                  The term{" "}
                  <span className="text-[#C9A84C]">&ldquo;The Entourage Effect&rdquo;</span>{" "}
                  — a mechanism by which terpenes and cannabinoids interact
                  synergistically — is the foundational science behind
                  TerpForge&apos;s formulation philosophy.
                </p>
                <p>
                  Critically: terpenes produce their effects entirely
                  independent of THC. Our products contain zero delta-9 THC.
                  Every aromatic and wellness benefit is delivered through
                  verified terpene-CBD co-formulation alone.
                </p>
              </div>
            </div>

            {/* Science schematic */}
            <div className="relative p-8 border border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid">
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
                ISOPRENE CLASSIFICATION SYSTEM
              </p>
              <div className="space-y-3">
                {[
                  { type: "Hemiterpenes", units: "C₅", example: "Isoprene" },
                  { type: "Monoterpenes", units: "C₁₀", example: "Myrcene, Limonene, Pinene" },
                  { type: "Sesquiterpenes", units: "C₁₅", example: "Caryophyllene, Humulene" },
                  { type: "Diterpenes", units: "C₂₀", example: "Phytol, Cafestol" },
                  { type: "Triterpenes", units: "C₃₀", example: "Squalene, Lanosterol" },
                ].map(({ type, units, example }) => (
                  <div
                    key={type}
                    className="flex items-center gap-4 p-3 border border-[#1E293B] hover:border-[#C9A84C]/30 transition-colors"
                  >
                    <div className="w-16 text-center">
                      <span className="text-[#C9A84C] font-mono font-bold text-sm">{units}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#E8EDF5] text-xs font-bold">{type}</p>
                      <p className="text-[#64748B] text-[10px] font-mono">{example}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 border border-[#0D9488]/30 bg-[#0D9488]/5">
                <p className="text-[#0D9488] text-[10px] font-mono">
                  TF PRODUCT SCOPE: Monoterpenes (C₁₀) and Sesquiterpenes (C₁₅) only.
                  Verified purity ≥99.7% per batch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPOUND LIBRARY ────────────────────── */}
        <section id="profiles">
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// MODULE 02"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5] mb-3"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Compound Library
            </h2>
            <p className="text-[#64748B] font-mono text-sm max-w-xl">
              Six primary terpene compounds used across TerpForge product
              systems. All data reflects verified batch specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {terpenes.map((t) => (
              <div
                key={t.name}
                className="border border-[#1E293B] hover:border-opacity-60 bg-[#0F1F3D] transition-all duration-300 overflow-hidden"
                style={{ borderColor: `${t.profileColor}20` }}
              >
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-start" style={{ borderColor: `${t.profileColor}20` }}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className="text-xl font-black text-[#E8EDF5]"
                        style={{ fontFamily: "var(--font-montserrat)" }}
                      >
                        {t.name}
                      </h3>
                      <span
                        className="px-2 py-0.5 text-[9px] font-mono tracking-widest border"
                        style={{ color: t.profileColor, borderColor: `${t.profileColor}50` }}
                      >
                        {t.profile}
                      </span>
                    </div>
                    <p className="text-[#64748B] text-xs font-mono">{t.description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...</p>
                  </div>
                  <div
                    className="text-right shrink-0 ml-4"
                    style={{ color: t.profileColor }}
                  >
                    <p className="font-mono font-bold text-sm">{t.formula}</p>
                    <p className="font-mono text-[10px] opacity-60">MW: {t.mw}</p>
                  </div>
                </div>

                {/* Specs grid */}
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b" style={{ borderColor: `${t.profileColor}20` }}>
                  {[
                    { label: "Formula", value: t.formula },
                    { label: "Boiling Pt.", value: t.bp },
                    { label: "Density", value: t.density },
                    { label: "LogP", value: t.logP },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#0A1628] p-2">
                      <p className="text-[#64748B] text-[10px] font-mono uppercase tracking-wider">{label}</p>
                      <p className="text-[#E8EDF5] text-xs font-mono font-bold mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Applications */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.3em] uppercase mb-2" style={{ color: t.profileColor }}>
                      Applications
                    </p>
                    <ul className="space-y-1">
                      {t.applications.map((a) => (
                        <li key={a} className="text-[#64748B] text-xs font-mono flex items-start gap-2">
                          <span style={{ color: t.profileColor }} className="mt-0.5">▸</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#64748B] mb-2">
                      Natural Sources
                    </p>
                    <ul className="space-y-1">
                      {t.naturalSources.map((s) => (
                        <li key={s} className="text-[#64748B] text-xs font-mono flex items-start gap-2">
                          <span className="text-[#64748B] mt-0.5">·</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COA PORTAL ──────────────────────────── */}
        <section id="coa">
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// MODULE 03"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5] mb-3"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              COA Portal
            </h2>
            <p className="text-[#64748B] font-mono text-sm max-w-xl">
              Certificate of Analysis documents for every active wellness batch.
              Third-party lab verification, batch-specific, always current.
            </p>
          </div>

          {/* Protocol notice */}
          <div className="mb-6 p-5 border border-[#0D9488]/30 bg-[#0D9488]/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Testing Standard", value: "ISO/IEC 17025" },
              { label: "THC Threshold", value: "<0.001% (Non-Detect)" },
              { label: "Update Frequency", value: "Per Batch" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[#0D9488] text-[10px] font-mono tracking-widest uppercase mb-1">{label}</p>
                <p className="text-[#E8EDF5] text-sm font-mono font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* COA table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-[#C9A84C]/20">
                  {["Product / Batch", "CBD Content", "THC", "Test Date", "Laboratory", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-[#64748B] text-[10px] tracking-[0.3em] uppercase font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coaEntries.map((entry) => (
                  <tr
                    key={entry.product}
                    className="border-b border-[#1E293B] hover:bg-[#0F1F3D] transition-colors group"
                  >
                    <td className="py-4 px-4 text-[#E8EDF5] text-xs">{entry.product}</td>
                    <td className="py-4 px-4 text-[#C9A84C] text-xs">{entry.cbd}</td>
                    <td className="py-4 px-4 text-[#0D9488] text-xs">{entry.thc}</td>
                    <td className="py-4 px-4 text-[#64748B] text-xs">{entry.date}</td>
                    <td className="py-4 px-4 text-[#64748B] text-xs">{entry.lab}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-[#0D9488]/20 text-[#0D9488] text-[10px] tracking-widest border border-[#0D9488]/30">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 px-6 py-4 border border-[#C9A84C] text-[#C9A84C] text-xs font-mono tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors text-center">
              ↓ Download All COAs (ZIP)
            </button>
            <Link
              href="/shop#wellness"
              className="flex-1 px-6 py-4 bg-[#C9A84C] text-[#0A1628] text-xs font-mono tracking-widest uppercase hover:bg-[#E2C97E] transition-colors text-center font-bold"
            >
              Shop Verified Wellness Products
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
