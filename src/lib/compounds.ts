export interface TerpeneCompound {
  name: string;
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
}

export const terpenes: TerpeneCompound[] = [
  {
    name: "Myrcene",
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
    aroma: "Citrus · Bright · Resinous",
    description:
      "A monocyclic monoterpenoid with a distinctly citrus aroma profile. Limonene is the second-most common terpene in nature. Research supports anti-anxiety and mood-elevating properties. Demonstrates enhanced bioavailability when combined with broad-spectrum CBD.",
    applications: [
      "Cognitive focus enhancement",
      "Stress response modulation",
      "Mood stabilization",
    ],
    naturalSources: ["Citrus rinds", "Rosemary", "Juniper", "Peppermint"],
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
    aroma: "Floral · Lavender · Slightly Spicy",
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
    aroma: "Spicy · Woody · Peppery",
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
    aroma: "Pine · Fresh · Earthy",
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
    aroma: "Piney · Floral · Fresh Herbal",
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
