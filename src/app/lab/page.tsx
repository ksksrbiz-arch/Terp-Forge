"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { terpenes } from "@/lib/compounds";
import { CompoundMatrix } from "@/components/lab/CompoundMatrix";
import { MoleculeViewer } from "@/components/lab/MoleculeViewer";
import { PropertyBars } from "@/components/lab/PropertyBars";
import { SynergyBuilder } from "@/components/lab/SynergyBuilder";
import { CoaCardGenerator } from "@/components/lab/CoaCardGenerator";

const DESCRIPTION_PREVIEW_LENGTH = 100;

interface CoaEntry {
  id: string;
  product: string;
  cbd: string;
  thc: string;
  date: string;
  lab: string;
  status: "PASS";
  terpenes: { name: string; pct: string }[];
}

const coaEntries: CoaEntry[] = [
  {
    id: "TF-2025-001",
    product: "Focus Protocol Tincture",
    cbd: "1024mg",
    thc: "<0.001%",
    date: "2025-03-15",
    lab: "ProVerde Laboratories",
    status: "PASS",
    terpenes: [
      { name: "Limonene", pct: "62.4%" },
      { name: "Pinene", pct: "21.7%" },
      { name: "Terpinolene", pct: "8.9%" },
    ],
  },
  {
    id: "TF-2025-002",
    product: "Recovery Protocol Gummies",
    cbd: "745mg",
    thc: "<0.001%",
    date: "2025-03-18",
    lab: "ProVerde Laboratories",
    status: "PASS",
    terpenes: [
      { name: "Myrcene", pct: "58.1%" },
      { name: "Caryophyllene", pct: "27.6%" },
      { name: "Linalool", pct: "6.3%" },
    ],
  },
  {
    id: "TF-2025-003",
    product: "Calm Protocol Tincture",
    cbd: "1498mg",
    thc: "<0.001%",
    date: "2025-03-22",
    lab: "ACS Laboratory",
    status: "PASS",
    terpenes: [
      { name: "Linalool", pct: "64.8%" },
      { name: "Myrcene", pct: "18.2%" },
      { name: "Caryophyllene", pct: "9.4%" },
    ],
  },
  {
    id: "TF-2025-004",
    product: "Terpene Stack Trial Kit",
    cbd: "3×335mg",
    thc: "<0.001%",
    date: "2025-04-01",
    lab: "ACS Laboratory",
    status: "PASS",
    terpenes: [
      { name: "Limonene", pct: "33.1%" },
      { name: "Myrcene", pct: "32.7%" },
      { name: "Linalool", pct: "29.8%" },
    ],
  },
];

function buildCoaText(entry: CoaEntry, batchNote = ""): string {
  const lines = [
    "╔════════════════════════════════════════════════════════════╗",
    "║          TERPFORGE — CERTIFICATE OF ANALYSIS               ║",
    "║          Engineered Aromatics. Forged Wellness.            ║",
    "╚════════════════════════════════════════════════════════════╝",
    "",
    `BATCH ID         : ${entry.id}`,
    `PRODUCT          : ${entry.product}`,
    `TEST DATE        : ${entry.date}`,
    `LABORATORY       : ${entry.lab}`,
    `TESTING STANDARD : ISO/IEC 17025`,
    "",
    "── CANNABINOID PROFILE ──────────────────────────────────────",
    `CBD CONTENT      : ${entry.cbd}`,
    `Δ9-THC           : ${entry.thc}  (Non-Detect)`,
    "",
    "── TERPENE PROFILE ──────────────────────────────────────────",
    ...entry.terpenes.map(
      (t) => `${t.name.padEnd(17)}: ${t.pct.padStart(8)}`,
    ),
    "",
    "── COMPLIANCE ───────────────────────────────────────────────",
    "Heavy Metals     : PASS",
    "Pesticides       : PASS",
    "Residual Solvents: PASS",
    "Microbials       : PASS",
    "",
    `OVERALL STATUS   : ${entry.status}`,
    "",
    batchNote ? `NOTE             : ${batchNote}` : "",
    "─────────────────────────────────────────────────────────────",
    "This document is a simulated demonstration COA for the",
    "TerpForge web experience. Production batches ship with",
    "the third-party signed PDF from the issuing laboratory.",
    "─────────────────────────────────────────────────────────────",
  ];
  return lines.join("\n");
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a longer delay so Safari / Firefox have time to start the
  // download before the URL is invalidated.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function LabPage() {
  const [selectedTerpeneName, setSelectedTerpeneName] = useState<string>(
    terpenes[0].name,
  );
  const [purity, setPurity] = useState<number>(99.7);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw.startsWith("compound=")) return;
      let compound = "";
      try {
        compound = decodeURIComponent(raw.slice("compound=".length));
      } catch {
        return;
      }
      if (!/^[a-z0-9\s-]+$/i.test(compound)) return;
      const match = terpenes.find(
        (terpene) => terpene.name.toLowerCase() === compound.toLowerCase(),
      );
      if (match) {
        setSelectedTerpeneName(match.name);
        const section = document.getElementById("profiles");
        section?.focus({ preventScroll: true });
        section?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const selected = useMemo(
    () => terpenes.find((t) => t.name === selectedTerpeneName) ?? terpenes[0],
    [selectedTerpeneName],
  );

  const purityTier =
    purity >= 99.5
      ? { label: "TF SPEC", note: "Meets TerpForge minimum standard." }
      : purity >= 95
      ? { label: "PHARMA", note: "Suitable for clinical formulations." }
      : purity >= 80
      ? { label: "FOOD-GRADE", note: "Above commercial flavor industry norms." }
      : { label: "SUB-SPEC", note: "Below TerpForge engineering threshold." };

  const handleDownloadCoa = (entry: CoaEntry) => {
    const text = buildCoaText(entry);
    downloadText(`COA-${entry.id}.txt`, text);
    setDownloaded(entry.id);
    window.setTimeout(() => setDownloaded(null), 2500);
  };

  const handleDownloadAll = () => {
    const text = coaEntries
      .map((e) => buildCoaText(e))
      .join("\n\n══════════════════════════════════════════════════════════════\n\n");
    downloadText("TerpForge-COA-Bundle.txt", text);
    setDownloaded("ALL");
    window.setTimeout(() => setDownloaded(null), 2500);
  };

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="relative bg-[#0F1F3D] border-b border-[#C9A84C]/20 py-16 schematic-grid overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('https://github.com/user-attachments/assets/4d66e35f-ad80-4a16-ab88-19595a98d0a0')" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#0F1F3D]/60 via-[#0F1F3D]/30 to-[#0A1628] pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            {[
              { href: "#simulator", label: "Profile Simulator" },
              { href: "#matrix", label: "Compound Matrix" },
              { href: "#science", label: "Terpene Science" },
              { href: "#profiles", label: "Compound Library" },
              { href: "#synergy", label: "Synergy Builder" },
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
        {/* ── PROFILE SIMULATOR ───────────────────────────────────── */}
        <section id="simulator">
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// MODULE 00 · INTERACTIVE"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5] mb-3"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Profile Simulator
            </h2>
            <p className="text-[#64748B] font-mono text-sm max-w-xl">
              Select a terpene. Adjust purity. See how TerpForge specifications
              compare to commodity-grade aromatics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selector */}
            <div className="lg:col-span-1 border border-[#C9A84C]/20 bg-[#0F1F3D] p-5">
              <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase mb-4">
                COMPOUND
              </p>
              <ul className="space-y-2">
                {terpenes.map((t) => {
                  const active = t.name === selectedTerpeneName;
                  return (
                    <li key={t.name}>
                      <button
                        type="button"
                        onClick={() => setSelectedTerpeneName(t.name)}
                        className="w-full text-left p-3 border transition-all flex items-center justify-between group"
                        style={{
                          borderColor: active
                            ? t.profileColor
                            : "#1E293B",
                          backgroundColor: active
                            ? `${t.profileColor}15`
                            : "transparent",
                        }}
                      >
                        <div>
                          <p
                            className="font-bold text-sm"
                            style={{
                              color: active ? t.profileColor : "#E8EDF5",
                            }}
                          >
                            {t.name}
                          </p>
                          <p className="text-[#64748B] text-[10px] font-mono">
                            {t.formula} · {t.profile}
                          </p>
                        </div>
                        <span
                          aria-hidden
                          className="text-xs font-mono"
                          style={{
                            color: active ? t.profileColor : "#64748B",
                          }}
                        >
                          {active ? "▸" : "+"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Live readout */}
            <div
              className="lg:col-span-2 border bg-[#0A1628] p-6 transition-colors"
              style={{ borderColor: `${selected.profileColor}40` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p
                    className="text-[10px] font-mono tracking-[0.4em] uppercase mb-1"
                    style={{ color: selected.profileColor }}
                  >
                    PROFILE: {selected.profile}
                  </p>
                  <h3
                    className="text-3xl font-black uppercase text-[#E8EDF5]"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                  >
                    {selected.name}
                  </h3>
                  <p className="text-[#64748B] text-xs font-mono mt-1">
                    {selected.aroma}
                  </p>
                </div>
                <div
                  className="text-right"
                  style={{ color: selected.profileColor }}
                >
                  <p className="font-mono font-bold">{selected.formula}</p>
                  <p className="font-mono text-[10px] opacity-60">
                    MW: {selected.mw}
                  </p>
                </div>
              </div>

              {/* Purity slider */}
              <div
                className="border bg-[#0F1F3D] p-5 mb-6"
                style={{ borderColor: `${selected.profileColor}30` }}
              >
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.3em] uppercase">
                    Purity Specification
                  </p>
                  <span
                    className="px-2 py-0.5 text-[9px] font-mono tracking-widest border"
                    style={{
                      color: selected.profileColor,
                      borderColor: `${selected.profileColor}50`,
                    }}
                  >
                    {purityTier.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-3">
                  <span
                    className="text-5xl font-black font-mono"
                    style={{ color: selected.profileColor }}
                  >
                    {purity.toFixed(1)}
                  </span>
                  <span className="text-[#64748B] text-sm font-mono">%</span>
                </div>

                <input
                  type="range"
                  min={50}
                  max={99.9}
                  step={0.1}
                  value={purity}
                  onChange={(e) => setPurity(parseFloat(e.target.value))}
                  className="w-full accent-[#C9A84C] cursor-pointer"
                  aria-label={`${selected.name} purity`}
                  style={{ accentColor: selected.profileColor }}
                />

                <div className="flex justify-between text-[#64748B] text-[10px] font-mono mt-2">
                  <span>50.0%</span>
                  <span>TF MIN: 99.5%</span>
                  <span>99.9%</span>
                </div>

                <p className="text-[#64748B] text-xs font-mono mt-4 leading-relaxed">
                  {purityTier.note}
                </p>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Boiling Pt.", value: selected.bp },
                  { label: "Density", value: selected.density },
                  { label: "LogP", value: selected.logP },
                  { label: "Profile", value: selected.profile },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-[#0F1F3D] border border-[#1E293B] p-2"
                  >
                    <p className="text-[#64748B] text-[10px] font-mono uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-[#E8EDF5] text-xs font-mono font-bold mt-0.5">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TERPENE SCIENCE ─────────────────────────────────────── */}
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
                  the primary constituents of essential oils and are
                  responsible for the distinctive aromatic profiles of most
                  botanicals.
                </p>
                <p>
                  Structurally, terpenes are classified by the number of
                  isoprene units (C₅H₈) they contain. Monoterpenes (C₁₀) are
                  the most common, followed by sesquiterpenes (C₁₅) and
                  diterpenes (C₂₀).
                </p>
                <p>
                  The term{" "}
                  <span className="text-[#C9A84C]">
                    &ldquo;The Entourage Effect&rdquo;
                  </span>{" "}
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

            <div className="relative p-8 border border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid">
              <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-6">
                ISOPRENE CLASSIFICATION SYSTEM
              </p>
              <div className="space-y-3">
                {[
                  { type: "Hemiterpenes", units: "C₅", example: "Isoprene" },
                  {
                    type: "Monoterpenes",
                    units: "C₁₀",
                    example: "Myrcene, Limonene, Pinene",
                  },
                  {
                    type: "Sesquiterpenes",
                    units: "C₁₅",
                    example: "Caryophyllene, Humulene",
                  },
                  {
                    type: "Diterpenes",
                    units: "C₂₀",
                    example: "Phytol, Cafestol",
                  },
                  {
                    type: "Triterpenes",
                    units: "C₃₀",
                    example: "Squalene, Lanosterol",
                  },
                ].map(({ type, units, example }) => (
                  <div
                    key={type}
                    className="flex items-center gap-4 p-3 border border-[#1E293B] hover:border-[#C9A84C]/30 transition-colors"
                  >
                    <div className="w-16 text-center">
                      <span className="text-[#C9A84C] font-mono font-bold text-sm">
                        {units}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#E8EDF5] text-xs font-bold">
                        {type}
                      </p>
                      <p className="text-[#64748B] text-[10px] font-mono">
                        {example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 border border-[#0D9488]/30 bg-[#0D9488]/5">
                <p className="text-[#0D9488] text-[10px] font-mono">
                  TF PRODUCT SCOPE: Monoterpenes (C₁₀) and Sesquiterpenes (C₁₅)
                  only. Verified purity ≥99.7% per batch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPOUND LIBRARY ────────────────────────────────────── */}
        <section id="matrix" tabIndex={-1}>
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// MODULE 01.5 · INTERACTIVE"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5] mb-3"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Compound Matrix
            </h2>
            <p className="text-[#64748B] font-mono text-sm max-w-xl">
              Periodic-style index of TerpForge&apos;s compound library. Hover any
              cell for the structural sketch; click to load it into the
              ball-and-stick viewer with property telemetry.
            </p>
          </div>

          <div className="space-y-10">
            <CompoundMatrix
              activeSlug={selected.slug}
              onSelect={(c) => setSelectedTerpeneName(c.name)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              <div className="border border-[#1E293B] bg-[#0A1628]">
                <MoleculeViewer compound={selected} />
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.4em] uppercase mb-2"
                     style={{ color: selected.profileColor }}>
                    Active compound
                  </p>
                  <h3 className="text-3xl font-black text-[#E8EDF5]"
                      style={{ fontFamily: "var(--font-montserrat)" }}>
                    {selected.name}
                  </h3>
                  <p className="text-[#64748B] text-xs font-mono mt-1">
                    {selected.aroma}
                  </p>
                </div>

                <PropertyBars compound={selected} />

                <div className="border-t border-[#1E293B] pt-4">
                  <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#64748B] mb-2">
                    Telemetry
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-[#0F1F3D] p-2">
                      <p className="text-[#64748B] text-[9px] tracking-widest uppercase">Formula</p>
                      <p className="text-[#E8EDF5] font-bold">{selected.formula}</p>
                    </div>
                    <div className="bg-[#0F1F3D] p-2">
                      <p className="text-[#64748B] text-[9px] tracking-widest uppercase">MW</p>
                      <p className="text-[#E8EDF5] font-bold">{selected.mw}</p>
                    </div>
                    <div className="bg-[#0F1F3D] p-2">
                      <p className="text-[#64748B] text-[9px] tracking-widest uppercase">Boiling</p>
                      <p className="text-[#E8EDF5] font-bold">{selected.bp}</p>
                    </div>
                    <div className="bg-[#0F1F3D] p-2">
                      <p className="text-[#64748B] text-[9px] tracking-widest uppercase">LogP</p>
                      <p className="text-[#E8EDF5] font-bold">{selected.logP}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="profiles" tabIndex={-1}>
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
              <button
                type="button"
                key={t.name}
                onClick={() => {
                  setSelectedTerpeneName(t.name);
                  document
                    .getElementById("simulator")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="text-left border bg-[#0F1F3D] hover:border-opacity-80 transition-all duration-300 overflow-hidden"
                style={{ borderColor: `${t.profileColor}30` }}
              >
                <div
                  className="p-5 border-b flex justify-between items-start"
                  style={{ borderColor: `${t.profileColor}20` }}
                >
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
                        style={{
                          color: t.profileColor,
                          borderColor: `${t.profileColor}50`,
                        }}
                      >
                        {t.profile}
                      </span>
                    </div>
                    <p className="text-[#64748B] text-xs font-mono">
                      {t.description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...
                    </p>
                  </div>
                  <div
                    className="text-right shrink-0 ml-4"
                    style={{ color: t.profileColor }}
                  >
                    <p className="font-mono font-bold text-sm">{t.formula}</p>
                    <p className="font-mono text-[10px] opacity-60">
                      MW: {t.mw}
                    </p>
                  </div>
                </div>

                <div
                  className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b"
                  style={{ borderColor: `${t.profileColor}20` }}
                >
                  {[
                    { label: "Formula", value: t.formula },
                    { label: "Boiling Pt.", value: t.bp },
                    { label: "Density", value: t.density },
                    { label: "LogP", value: t.logP },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#0A1628] p-2">
                      <p className="text-[#64748B] text-[10px] font-mono uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="text-[#E8EDF5] text-xs font-mono font-bold mt-0.5">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-[10px] font-mono tracking-[0.3em] uppercase mb-2"
                      style={{ color: t.profileColor }}
                    >
                      Applications
                    </p>
                    <ul className="space-y-1">
                      {t.applications.map((a) => (
                        <li
                          key={a}
                          className="text-[#64748B] text-xs font-mono flex items-start gap-2"
                        >
                          <span
                            style={{ color: t.profileColor }}
                            className="mt-0.5"
                          >
                            ▸
                          </span>
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
                        <li
                          key={s}
                          className="text-[#64748B] text-xs font-mono flex items-start gap-2"
                        >
                          <span className="text-[#64748B] mt-0.5">·</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  className="px-5 py-3 border-t text-[10px] font-mono tracking-widest uppercase"
                  style={{
                    borderColor: `${t.profileColor}20`,
                    color: t.profileColor,
                  }}
                >
                  Load in Profile Simulator →
                </div>
              </button>
            ))}
          </div>
        </section>

        <section id="synergy" tabIndex={-1}>
          <div className="mb-10">
            <p className="text-[#0D9488] text-xs font-mono tracking-[0.4em] uppercase mb-4">
              {"// MODULE 02.5 · INTERACTIVE"}
            </p>
            <h2
              className="text-4xl font-black uppercase text-[#E8EDF5] mb-3"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Synergy Builder
            </h2>
            <p className="text-[#64748B] font-mono text-sm max-w-xl">
              Pick two compounds and see the combined effect profile as an
              overlapping radar — the dashed gold hull marks the synergy
              ceiling, capped at 100% per axis with a small overlap bonus
              when both contributors clear 50%.
            </p>
          </div>
          <SynergyBuilder />
        </section>

        {/* ── COA PORTAL ──────────────────────────────────────────── */}
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

          <div className="mb-6 p-5 border border-[#0D9488]/30 bg-[#0D9488]/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Testing Standard", value: "ISO/IEC 17025" },
              { label: "THC Threshold", value: "<0.001% (Non-Detect)" },
              { label: "Update Frequency", value: "Per Batch" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[#0D9488] text-[10px] font-mono tracking-widest uppercase mb-1">
                  {label}
                </p>
                <p className="text-[#E8EDF5] text-sm font-mono font-bold">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto border border-[#1E293B]">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-[#C9A84C]/20 bg-[#0F1F3D]">
                  {[
                    "Batch / Product",
                    "CBD",
                    "THC",
                    "Date",
                    "Lab",
                    "Status",
                    "Document",
                  ].map((h) => (
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
                    key={entry.id}
                    className="border-b border-[#1E293B] hover:bg-[#0F1F3D] transition-colors"
                  >
                    <td className="py-4 px-4 text-[#E8EDF5] text-xs">
                      <p className="font-bold">{entry.id}</p>
                      <p className="text-[#64748B]">{entry.product}</p>
                    </td>
                    <td className="py-4 px-4 text-[#C9A84C] text-xs">
                      {entry.cbd}
                    </td>
                    <td className="py-4 px-4 text-[#0D9488] text-xs">
                      {entry.thc}
                    </td>
                    <td className="py-4 px-4 text-[#64748B] text-xs">
                      {entry.date}
                    </td>
                    <td className="py-4 px-4 text-[#64748B] text-xs">
                      {entry.lab}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-[#0D9488]/20 text-[#0D9488] text-[10px] tracking-widest border border-[#0D9488]/30">
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleDownloadCoa(entry)}
                        className="px-3 py-1.5 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] font-mono tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors"
                      >
                        {downloaded === entry.id ? "✓ DOWNLOADED" : "↓ COA"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="flex-1 px-6 py-4 border border-[#C9A84C] text-[#C9A84C] text-xs font-mono tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors text-center"
            >
              {downloaded === "ALL"
                ? "✓ BUNDLE DOWNLOADED"
                : "↓ Download Full COA Bundle"}
            </button>
            <Link
              href="/shop?cat=wellness#wellness"
              className="flex-1 px-6 py-4 bg-[#C9A84C] text-[#0A1628] text-xs font-mono tracking-widest uppercase hover:bg-[#E2C97E] transition-colors text-center font-bold"
            >
              Shop Verified Wellness Products
            </Link>
          </div>

          <div className="mt-12 pt-12 border-t border-[#C9A84C]/20">
            <p className="text-[#0D9488] text-[10px] font-mono tracking-[0.4em] uppercase mb-3">
              {"// SCHEMATIC COA CARD"}
            </p>
            <h3 className="text-2xl font-black text-[#E8EDF5] mb-2"
                style={{ fontFamily: "var(--font-montserrat)" }}>
              Generate a printable card
            </h3>
            <p className="text-[#64748B] font-mono text-xs max-w-xl mb-6">
              Type any batch — or let the default load — and download a
              schematic-style PNG. The datamatrix stamp on the card is
              deterministic per batch ID.
            </p>
            <CoaCardGenerator />
          </div>
        </section>
      </div>
    </div>
  );
}
