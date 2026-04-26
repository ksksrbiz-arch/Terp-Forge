/**
 * forge3d/compounds — single source of truth for the cannabinoid /
 * terpene catalog used across every Forge 3D experience. Extracted from
 * `PlantForge3D` so receptor docking, entourage mixer, decarb furnace,
 * etc. can all read the same data.
 */

export type CompoundCategory = "acid" | "cannabinoid" | "terpene";

export interface ForgeCompound {
  name: string;
  formula: string;
  category: CompoundCategory;
  /** 0xRRGGBB integer for Three.js. */
  color: number;
  /** Atom count for the procedural molecule mesh (6 ring + N branches). */
  atoms: number;
  description: string;
}

/**
 * Eight signature compounds the Plant Forge animates in.
 * Order is meaningful: it is the scripted sequence in `PlantForge3D`.
 */
export const COMPOUNDS: ForgeCompound[] = [
  {
    name: "CBGA",
    formula: "C22H32O4",
    category: "acid",
    color: 0xc9a84c, // gold — "the mother cannabinoid"
    atoms: 11,
    description: "Cannabigerolic acid · biosynthetic precursor",
  },
  {
    name: "THCA",
    formula: "C22H30O4",
    category: "acid",
    color: 0xe9b949,
    atoms: 11,
    description: "Tetrahydrocannabinolic acid · raw flower form",
  },
  {
    name: "THC",
    formula: "C21H30O2",
    category: "cannabinoid",
    color: 0x8b5cf6, // violet
    atoms: 10,
    description: "Δ9-Tetrahydrocannabinol · psychoactive",
  },
  {
    name: "CBDA",
    formula: "C22H30O4",
    category: "acid",
    color: 0xeab308,
    atoms: 11,
    description: "Cannabidiolic acid · raw CBD precursor",
  },
  {
    name: "CBD",
    formula: "C21H30O2",
    category: "cannabinoid",
    color: 0x0d9488, // teal
    atoms: 10,
    description: "Cannabidiol · non-intoxicating",
  },
  {
    name: "Myrcene",
    formula: "C10H16",
    category: "terpene",
    color: 0x10b981, // emerald
    atoms: 7,
    description: "Earthy · mango · sedating",
  },
  {
    name: "Limonene",
    formula: "C10H16",
    category: "terpene",
    color: 0xfbbf24, // citrus
    atoms: 7,
    description: "Citrus · uplifting",
  },
  {
    name: "Pinene",
    formula: "C10H16",
    category: "terpene",
    color: 0x22c55e, // pine
    atoms: 7,
    description: "Pine · alertness",
  },
];

// ── Receptor binding data (used by Receptor Docking Simulator) ──────────

export type ReceptorId = "CB1" | "CB2";

export interface Receptor {
  id: ReceptorId;
  name: string;
  /** Plain-language tissue / location summary. */
  location: string;
  /** 0xRRGGBB themed color (CB1 = teal, CB2 = gold). */
  color: number;
  /** Short description shown in the HUD info card. */
  blurb: string;
}

export const RECEPTORS: Receptor[] = [
  {
    id: "CB1",
    name: "CB1 Receptor",
    location: "central nervous system · brain",
    color: 0x0d9488,
    blurb:
      "Densest in cortex, hippocampus, and basal ganglia. Drives the psychoactive and motor effects of cannabinoid binding.",
  },
  {
    id: "CB2",
    name: "CB2 Receptor",
    location: "peripheral · immune cells",
    color: 0xc9a84c,
    blurb:
      "Concentrated in spleen, tonsils, and immune tissue. Modulates inflammation and immune response without psychoactivity.",
  },
];

/**
 * Binding affinity table, 0..1.
 *
 * 1.0 = very strong fit (full agonist)
 * 0.6 = moderate (partial agonist)
 * 0.25 = weak / indirect modulator
 * 0.05 = effectively no fit (rejection animation)
 *
 * Values are illustrative — they match published *qualitative* affinities
 * (THC binds both, slight CB1 preference; CBD is a low-affinity negative
 * allosteric modulator at CB1 and a partial agonist at CB2; etc.) but are
 * tuned for visual storytelling rather than for use in any actual model.
 */
export const AFFINITY: Record<string, Record<ReceptorId, number>> = {
  THC: { CB1: 0.95, CB2: 0.7 },
  CBD: { CB1: 0.15, CB2: 0.55 },
  CBGA: { CB1: 0.3, CB2: 0.4 },
  THCA: { CB1: 0.2, CB2: 0.25 },
  CBDA: { CB1: 0.1, CB2: 0.35 },
  Myrcene: { CB1: 0.4, CB2: 0.3 }, // allosteric / synergistic
  Limonene: { CB1: 0.2, CB2: 0.45 },
  Pinene: { CB1: 0.25, CB2: 0.35 },
};

/**
 * Effect description shown after a successful dock. Used for the
 * pop-up in the Receptor Docking Simulator.
 */
export const BINDING_EFFECTS: Record<string, Partial<Record<ReceptorId, string>>> = {
  THC: {
    CB1: "Euphoria · altered time perception · appetite stimulation.",
    CB2: "Mild peripheral immunomodulation · contributes to relief.",
  },
  CBD: {
    CB1: "Negative allosteric modulator — dampens THC's CB1 effects.",
    CB2: "Partial agonist · anti-inflammatory · immune tone modulation.",
  },
  CBGA: {
    CB1: "Weak direct binding · upstream of every other phytocannabinoid.",
    CB2: "Weak direct binding · primarily a biosynthetic precursor.",
  },
  THCA: {
    CB1: "Non-psychoactive raw form · poor direct binding.",
    CB2: "Anti-inflammatory signaling without intoxication.",
  },
  CBDA: {
    CB1: "Negligible CB1 activity in raw acid form.",
    CB2: "Anti-nausea signaling · 5-HT1A pathway crossover.",
  },
  Myrcene: {
    CB1: "Allosteric · enhances cannabinoid uptake (entourage).",
    CB2: "Indirect immune modulation via terpene signaling.",
  },
  Limonene: {
    CB1: "Mood lift via serotonin/A2A pathways · indirect at CB1.",
    CB2: "Anti-anxiety, anti-inflammatory peripheral signaling.",
  },
  Pinene: {
    CB1: "Memory-protective · counterbalances THC short-term effects.",
    CB2: "Bronchodilation · anti-inflammatory.",
  },
};
