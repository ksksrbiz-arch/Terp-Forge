import { products } from "@/lib/products";
import { terpenes } from "@/lib/compounds";

export const siteName = "TerpForge";
export const siteUrl = "https://terpforge.com";
export const siteDescription =
  "Engineered aromatics and forged wellness built on terpene science, industrial aesthetics, and batch-level transparency.";

export const siteRoutes = [
  "/",
  "/shop",
  "/lab",
  "/story",
  "/contact",
  "/privacy-policy",
  "/return-policy",
  "/terms-of-use",
] as const;

export type CommandEntry = {
  id: string;
  kind: "Page" | "Section" | "Product" | "Compound";
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

const sectionEntries: CommandEntry[] = [
  {
    id: "page-home",
    kind: "Page",
    title: "The Forge",
    description: "Homepage overview",
    href: "/",
    keywords: ["home", "forge", "landing"],
  },
  {
    id: "page-shop",
    kind: "Page",
    title: "The Inventory",
    description: "Product catalog",
    href: "/shop",
    keywords: ["shop", "inventory", "catalog"],
  },
  {
    id: "page-lab",
    kind: "Page",
    title: "The Lab",
    description: "Compound library and COA portal",
    href: "/lab",
    keywords: ["lab", "science", "coa"],
  },
  {
    id: "page-story",
    kind: "Page",
    title: "The Foundry Story",
    description: "Brand origin and values",
    href: "/story",
    keywords: ["story", "foundry", "timeline"],
  },
  {
    id: "page-contact",
    kind: "Page",
    title: "Contact",
    description: "Transmission form",
    href: "/contact",
    keywords: ["contact", "support", "message"],
  },
  {
    id: "page-privacy-policy",
    kind: "Page",
    title: "Privacy Policy",
    description: "How TerpForge handles customer data",
    href: "/privacy-policy",
    keywords: ["privacy", "policy", "data", "legal"],
  },
  {
    id: "page-return-policy",
    kind: "Page",
    title: "Return Policy",
    description: "Returns, refunds, and exchanges",
    href: "/return-policy",
    keywords: ["returns", "refunds", "exchanges", "legal"],
  },
  {
    id: "page-terms-of-use",
    kind: "Page",
    title: "Terms of Use",
    description: "Website and storefront usage terms",
    href: "/terms-of-use",
    keywords: ["terms", "legal", "usage", "policy"],
  },
  {
    id: "section-cathedral",
    kind: "Section",
    title: "Cathedral Principle",
    description: "Homepage operating pillars",
    href: "/#cathedral",
    keywords: ["cathedral", "pillars", "principle"],
  },
  {
    id: "section-manifesto",
    kind: "Section",
    title: "Manifesto",
    description: "Homepage foundry directive",
    href: "/#manifesto",
    keywords: ["manifesto", "directive"],
  },
  {
    id: "section-simulator",
    kind: "Section",
    title: "Profile Simulator",
    description: "Interactive purity simulator",
    href: "/lab#simulator",
    keywords: ["simulator", "purity", "interactive"],
  },
  {
    id: "section-science",
    kind: "Section",
    title: "Terpene Science",
    description: "What are terpenes?",
    href: "/lab#science",
    keywords: ["science", "terpenes", "education"],
  },
  {
    id: "section-profiles",
    kind: "Section",
    title: "Compound Library",
    description: "Expanded terpene profiles",
    href: "/lab#profiles",
    keywords: ["profiles", "compound", "library"],
  },
  {
    id: "section-coa",
    kind: "Section",
    title: "COA Portal",
    description: "Batch analysis reports",
    href: "/lab#coa",
    keywords: ["coa", "reports", "batch"],
  },
];

export const commandEntries: CommandEntry[] = [
  ...sectionEntries,
  ...products.map((product) => ({
    id: `product-${product.id}`,
    kind: "Product" as const,
    title: product.name,
    description: `${product.categoryLabel} · ${product.spec}`,
    href: `/shop#product=${product.id}`,
    keywords: [
      product.id,
      product.category,
      product.categoryLabel,
      product.profile ?? "",
      product.spec,
    ],
  })),
  ...terpenes.map((compound) => ({
    id: `compound-${compound.name.toLowerCase()}`,
    kind: "Compound" as const,
    title: compound.name,
    description: `${compound.profile} · ${compound.formula}`,
    href: `/lab#compound=${compound.name.toLowerCase()}`,
    keywords: [compound.formula, compound.profile, compound.aroma],
  })),
];
