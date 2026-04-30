import { products } from "@/lib/products";
import { terpenes } from "@/lib/compounds";
import { editorials, editorialRoutes } from "@/lib/editorials";

export const siteName = "TerpForge";
export const siteUrl = "https://terpforge.com";
export const siteDescription =
  "Engineered aromatics and forged wellness built on terpene science, industrial aesthetics, and batch-level transparency.";

export const siteRoutes = [
  "/",
  "/shop",
  "/lab",
  "/journal",
  "/story",
  "/contact",
  ...editorialRoutes,
];

export type CommandEntry = {
  id: string;
  kind: "Page" | "Section" | "Product" | "Compound" | "Action" | "Editorial";
  title: string;
  description: string;
  /** For "Action" kind, this is a `tf:action/<id>` URI dispatched as an
   *  event instead of a router push. Otherwise a route href. */
  href: string;
  keywords: string[];
};

/** Action ids dispatched via the tf:action CustomEvent. */
export const ACTION_PREFIX = "tf:action/";

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
    id: "page-journal",
    kind: "Page",
    title: "Journal",
    description: "Editorial archive",
    href: "/journal",
    keywords: ["journal", "blog", "editorials", "hemp"],
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

const actionEntries: CommandEntry[] = [
  ...terpenes.map(
    (compound): CommandEntry => ({
      id: `action-pin-${compound.slug}`,
      kind: "Action",
      title: `Pin ${compound.name} to tray`,
      description: `${compound.profile} · adds to compound tray`,
      href: `${ACTION_PREFIX}pin/${compound.slug}`,
      keywords: ["pin", "tray", compound.slug, compound.profile, compound.name],
    }),
  ),
  {
    id: "action-open-synergy",
    kind: "Action",
    title: "Open Synergy Mixer with current tray",
    description: "Jumps to /lab#synergy",
    href: `${ACTION_PREFIX}open-synergy`,
    keywords: ["synergy", "mixer", "tray", "blend"],
  },
];

export const commandEntries: CommandEntry[] = [
  ...sectionEntries,
  ...editorials.map((editorial) => ({
    id: `editorial-${editorial.slug}`,
    kind: "Editorial" as const,
    title: editorial.title,
    description: editorial.excerpt,
    href: `/journal/${editorial.slug}`,
    keywords: [editorial.eyebrow, editorial.readingTime, ...editorial.topics],
  })),
  ...products.map(
    (product): CommandEntry => ({
      id: `product-${product.id}`,
      kind: "Product",
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
    }),
  ),
  ...terpenes.map(
    (compound): CommandEntry => ({
      id: `compound-${compound.name.toLowerCase()}`,
      kind: "Compound",
      title: compound.name,
      description: `${compound.profile} · ${compound.formula}`,
      href: `/lab#compound=${compound.name.toLowerCase()}`,
      keywords: [compound.formula, compound.profile, compound.aroma],
    }),
  ),
  ...actionEntries,
];
