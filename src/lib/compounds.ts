export type Atom3D = { el: "C" | "O" | "N"; x: number; y: number; z: number };
export type Bond = [number, number, 1 | 2];

export interface RadarVector {
  recovery: number;       // 0-100
  focus: number;
  calm: number;
  antiInflammatory: number;
  aromaticStrength: number;
  bioavailability: number;
}

export interface PropertyBars {
  potency: number;        // 0-100, normalized aggregate signal
  volatility: number;     // higher = lower bp
  polarity: number;       // higher = more polar (lower logP)
  abundance: number;      // typical natural abundance
}

export interface TerpeneCompound {
  name: string;
  slug: string;
  formula: string;
  mw: string;
  bp: string;
  density: string;
  logP: string;
  profile: "RECOVERY" | "FOCUS" | "CALM";
  profileColor: string;
  description: string;
  applications: string[];
  naturalSources: string[];
  aroma: string;
  /** Topological 3D coordinates for the ball-and-stick viewer.
   *  Hydrogens omitted for visual clarity. */
  atoms: Atom3D[];
  bonds: Bond[];
  radar: RadarVector;
  bars: PropertyBars;
  /** Atomic-symbol style "element box" for the periodic-style matrix. */
  symbol: string;
  atomicNumber: number;
}

// Helper for chain-style coordinates
const chain = (count: number, dx = 1.4): Atom3D[] =>
  Array.from({ length: count }, (_, i) => ({
    el: "C" as const,
    x: i * dx - ((count - 1) * dx) / 2,
    y: i % 2 === 0 ? 0 : 0.6,
    z: 0,
  }));

// 6-membered ring, planar approximation
const ring6 = (cx = 0, cy = 0, r = 1.3): Atom3D[] =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return { el: "C", x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, z: 0 };
  });

// 5-membered ring
const ring5 = (cx = 0, cy = 0, r = 1.2): Atom3D[] =>
  Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { el: "C", x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, z: 0 };
  });

// Chain bond list helper
const chainBonds = (start: number, count: number): Bond[] =>
  Array.from({ length: count - 1 }, (_, i) => [start + i, start + i + 1, 1] as Bond);

// Closed-ring bond list
const ringBonds = (start: number, count: number): Bond[] => {
  const b: Bond[] = chainBonds(start, count);
  b.push([start + count - 1, start, 1]);
  return b;
};

export const terpenes: TerpeneCompound[] = [
  {
    name: "Myrcene",
    slug: "myrcene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "167°C",
    density: "0.794 g/mL",
    logP: "4.67",
    profile: "RECOVERY",
    profileColor: "#0D9488",
    aroma: "Earthy · Musky · Subtle Mango",
    description:
      "The most abundant terpene in modern cannabis cultivars. Myrcene exhibits sedative and muscle-relaxant properties. Its earthy, musky aroma with subtle fruity notes is characteristic of hops, mango, and lemongrass. Clinical research indicates synergistic interaction with CBD receptors.",
    applications: [
      "Post-exercise recovery protocols",
      "Sleep cycle support",
      "Muscle tension reduction",
    ],
    naturalSources: ["Hops (Humulus lupulus)", "Mango", "Lemongrass", "Thyme"],
    symbol: "Myr",
    atomicNumber: 1,
    atoms: [
      // Acyclic backbone with two methyl branches and a vinyl group.
      ...chain(8, 1.3),
      { el: "C", x: -3.0, y: 1.6, z: 0.4 },   // 8 - methyl branch
      { el: "C", x: 3.0, y: -0.2, z: 0.6 },   // 9 - vinyl tail
    ],
    bonds: [
      ...chainBonds(0, 8),
      [2, 8, 1],
      [7, 9, 2],
    ],
    radar: { recovery: 92, focus: 22, calm: 70, antiInflammatory: 65, aromaticStrength: 78, bioavailability: 80 },
    bars: { potency: 88, volatility: 70, polarity: 22, abundance: 95 },
  },
  {
    name: "Limonene",
    slug: "limonene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "176°C",
    density: "0.842 g/mL",
    logP: "4.57",
    profile: "FOCUS",
    profileColor: "#C9A84C",
    aroma: "Citrus · Bright · Resinous",
    description:
      "A monocyclic monoterpenoid with a distinctly citrus aroma profile. Limonene is the second-most common terpene in nature. Research supports anti-anxiety and mood-elevating properties. Demonstrates enhanced bioavailability when combined with broad-spectrum CBD.",
    applications: [
      "Cognitive focus enhancement",
      "Stress response modulation",
      "Mood stabilization",
    ],
    naturalSources: ["Citrus rinds", "Rosemary", "Juniper", "Peppermint"],
    symbol: "Lim",
    atomicNumber: 2,
    atoms: [
      ...ring6(0, 0, 1.3),
      { el: "C", x: 2.4, y: 0.6, z: 0.3 },    // 6 - isopropenyl
      { el: "C", x: 3.0, y: 1.5, z: 0.6 },    // 7
      { el: "C", x: 3.0, y: -0.4, z: -0.2 },  // 8 - methyl
      { el: "C", x: -2.0, y: -0.2, z: 0.5 },  // 9 - methyl
    ],
    bonds: [
      ...ringBonds(0, 6),
      [0, 6, 1],
      [6, 7, 2],
      [6, 8, 1],
      [3, 9, 1],
    ],
    radar: { recovery: 30, focus: 95, calm: 55, antiInflammatory: 45, aromaticStrength: 88, bioavailability: 90 },
    bars: { potency: 80, volatility: 65, polarity: 25, abundance: 88 },
  },
  {
    name: "Linalool",
    slug: "linalool",
    formula: "C₁₀H₁₈O",
    mw: "154.25 g/mol",
    bp: "198°C",
    density: "0.858 g/mL",
    logP: "2.97",
    profile: "CALM",
    profileColor: "#2563EB",
    aroma: "Floral · Lavender · Slightly Spicy",
    description:
      "A naturally occurring terpene alcohol found in over 200 plant species. Linalool's floral, slightly spicy aroma underpins lavender's reputation for relaxation. Demonstrated anxiolytic and sedative effects in controlled studies. Key compound in TerpForge's Calm Protocol formulations.",
    applications: [
      "Anxiety reduction protocols",
      "Sleep onset support",
      "Inflammation pathway modulation",
    ],
    naturalSources: ["Lavender", "Mint", "Cinnamon", "Birch bark"],
    symbol: "Lin",
    atomicNumber: 3,
    atoms: [
      ...chain(8, 1.3),
      { el: "O", x: 0.5, y: 1.4, z: 0.0 },    // 8 - hydroxyl
      { el: "C", x: -3.5, y: 1.6, z: 0.4 },   // 9 - methyl branch
    ],
    bonds: [
      ...chainBonds(0, 8),
      [3, 8, 1],
      [1, 9, 1],
    ],
    radar: { recovery: 40, focus: 35, calm: 96, antiInflammatory: 78, aromaticStrength: 70, bioavailability: 72 },
    bars: { potency: 75, volatility: 50, polarity: 78, abundance: 65 },
  },
  {
    name: "Caryophyllene",
    slug: "caryophyllene",
    formula: "C₁₅H₂₄",
    mw: "204.35 g/mol",
    bp: "130°C (5mmHg)",
    density: "0.905 g/mL",
    logP: "6.89",
    profile: "RECOVERY",
    profileColor: "#0D9488",
    aroma: "Spicy · Woody · Peppery",
    description:
      "A sesquiterpene and the only known terpene to directly activate CB2 receptors. This makes Caryophyllene unique as a dietary cannabinoid. Its spicy, woody, peppery aroma profile is dominant in black pepper, cloves, and hops.",
    applications: [
      "Anti-inflammatory pathways",
      "Pain signal modulation",
      "Gut microbiome support",
    ],
    naturalSources: ["Black pepper", "Cloves", "Hops", "Rosemary"],
    symbol: "Car",
    atomicNumber: 4,
    atoms: [
      // Bicyclic: 9-membered fused with 4-membered approximation.
      ...ring6(-1.0, 0, 1.4),
      ...ring5(1.6, 0.2, 1.1),
      { el: "C", x: 3.5, y: 1.0, z: 0.4 },   // 11 - branch
      { el: "C", x: -2.6, y: 1.4, z: 0.5 },  // 12 - methyl
    ],
    bonds: [
      ...ringBonds(0, 6),
      ...ringBonds(6, 5),
      [3, 6, 1],
      [9, 11, 1],
      [0, 12, 1],
    ],
    radar: { recovery: 88, focus: 30, calm: 60, antiInflammatory: 96, aromaticStrength: 82, bioavailability: 70 },
    bars: { potency: 90, volatility: 25, polarity: 18, abundance: 70 },
  },
  {
    name: "Pinene",
    slug: "pinene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "155°C (α) / 166°C (β)",
    density: "0.858 g/mL",
    logP: "4.44",
    profile: "FOCUS",
    profileColor: "#C9A84C",
    aroma: "Pine · Fresh · Earthy",
    description:
      "Exists in two isomeric forms (α and β). The most widely encountered terpene in nature. Fresh pine and earthy aroma. α-Pinene research indicates bronchodilatory effects and memory enhancement via acetylcholinesterase inhibition.",
    applications: [
      "Alertness and memory recall",
      "Respiratory function support",
      "Anti-microbial applications",
    ],
    naturalSources: ["Pine trees", "Rosemary", "Eucalyptus", "Dill"],
    symbol: "Pin",
    atomicNumber: 5,
    atoms: [
      // Bicyclic: 6-ring fused with 4-ring bridge.
      ...ring6(0, 0, 1.3),
      { el: "C", x: 0.0, y: 1.8, z: 0.7 },    // 6 - bridge atom
      { el: "C", x: 2.4, y: 0.9, z: 0.3 },    // 7 - methyl
      { el: "C", x: -2.0, y: -0.6, z: 0.4 },  // 8 - methyl
    ],
    bonds: [
      ...ringBonds(0, 6),
      [1, 6, 1],
      [4, 6, 1],
      [0, 7, 1],
      [3, 8, 1],
    ],
    radar: { recovery: 35, focus: 92, calm: 50, antiInflammatory: 70, aromaticStrength: 80, bioavailability: 88 },
    bars: { potency: 82, volatility: 75, polarity: 22, abundance: 92 },
  },
  {
    name: "Terpinolene",
    slug: "terpinolene",
    formula: "C₁₀H₁₆",
    mw: "136.23 g/mol",
    bp: "186°C",
    density: "0.864 g/mL",
    logP: "4.46",
    profile: "FOCUS",
    profileColor: "#C9A84C",
    aroma: "Piney · Floral · Fresh Herbal",
    description:
      "A multifaceted monoterpene with a fresh, piney, floral aroma. Terpinolene exhibits antioxidant and sedative properties despite being categorized under the Focus profile at sub-threshold doses. Commonly found in uplifting cultivar profiles.",
    applications: [
      "Antioxidant protection",
      "Low-dose stimulant properties",
      "Cultivar complexity enhancement",
    ],
    naturalSources: ["Nutmeg", "Tea tree", "Conifers", "Apples"],
    symbol: "Trp",
    atomicNumber: 6,
    atoms: [
      ...ring6(0, 0, 1.3),
      { el: "C", x: 2.4, y: 0.6, z: 0.3 },   // 6 - isopropylidene
      { el: "C", x: 3.0, y: 1.5, z: 0.0 },   // 7
      { el: "C", x: 3.0, y: -0.4, z: 0.0 },  // 8
      { el: "C", x: -2.0, y: -0.2, z: 0.5 }, // 9 - methyl
    ],
    bonds: [
      ...ringBonds(0, 6),
      [0, 6, 2],
      [6, 7, 1],
      [6, 8, 1],
      [3, 9, 1],
    ],
    radar: { recovery: 45, focus: 78, calm: 65, antiInflammatory: 60, aromaticStrength: 72, bioavailability: 75 },
    bars: { potency: 70, volatility: 60, polarity: 24, abundance: 55 },
  },
];

export const RADAR_AXES = [
  { key: "recovery", label: "Recovery" },
  { key: "focus", label: "Focus" },
  { key: "calm", label: "Calm" },
  { key: "antiInflammatory", label: "Anti-Inflam" },
  { key: "aromaticStrength", label: "Aromatic" },
  { key: "bioavailability", label: "Bioavail" },
] as const;
