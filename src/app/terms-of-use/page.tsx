import type { Metadata } from "next";
import Link from "next/link";

const pageTitle = "Terms of Use";
const pageDescription =
  "The terms governing access to the TerpForge website, product information, orders, acceptable use, and limitation of liability.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/terms-of-use",
  },
  openGraph: {
    title: `${pageTitle} · TerpForge`,
    description: pageDescription,
    url: "/terms-of-use",
  },
  twitter: {
    title: `${pageTitle} · TerpForge`,
    description: pageDescription,
  },
};

const sections = [
  {
    title: "Acceptance of Terms",
    body: [
      "By accessing or using the TerpForge website, you agree to be bound by these Terms of Use and any applicable laws, regulations, and posted policies. If you do not agree, you should not use the site or place orders through it.",
    ],
  },
  {
    title: "Product and Site Information",
    body: [
      "TerpForge works to present accurate product descriptions, pricing, imagery, specifications, and availability. However, site content may occasionally contain errors, updates, delays, or omissions. We reserve the right to correct information and update listings without prior notice.",
      "Displayed product imagery may include lifestyle presentation, packaging revisions, or evolving production details. Minor differences between photos, packaging, and delivered goods do not necessarily indicate defect.",
    ],
  },
  {
    title: "Orders and Availability",
    body: [
      "Submitting an order request does not guarantee acceptance. TerpForge may refuse, cancel, limit, or review orders for reasons including inventory constraints, suspected fraud, pricing issues, regulatory concerns, or fulfillment restrictions.",
      "You agree to provide accurate purchase, shipping, and contact information and to keep that information current for any order or support request.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "You may not use the site to interfere with operations, bypass security, scrape data at abusive volume, upload malicious code, impersonate others, or violate law. You may not use TerpForge branding, content, or media in a misleading, defamatory, or unauthorized commercial context.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "All trademarks, logos, site designs, copy, visual systems, photographs, schematics, and other original content on the site are owned by or licensed to TerpForge unless otherwise stated. Use of that content is limited to personal, non-commercial browsing unless written permission is provided.",
    ],
  },
  {
    title: "Health, Compliance, and Product Responsibility",
    body: [
      "Product information on the site is provided for general informational and merchandising purposes and is not medical advice. Customers are responsible for reviewing ingredient, usage, storage, and compliance information before purchasing or using products.",
      "You are responsible for ensuring that purchases, possession, and use of any product are lawful in your jurisdiction.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, TerpForge is not liable for indirect, incidental, consequential, special, or punitive damages arising out of or related to use of the site, delayed fulfillment, third-party service outages, or product misuse.",
      "Where liability cannot be excluded, it will be limited to the amount paid for the applicable order or product giving rise to the claim.",
    ],
  },
  {
    title: "Changes to Terms",
    body: [
      "TerpForge may revise these Terms of Use from time to time. Updated terms become effective when posted on this page unless a different effective date is stated. Continued use of the site after updates means you accept the revised terms.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="pt-16">
      <section className="border-b border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-mono uppercase tracking-[0.4em] text-[#0D9488]">
            {"// LEGAL // SITE ACCESS TERMS"}
          </p>
          <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-[#E8EDF5] sm:text-5xl">
            Terms of Use
          </h1>
          <p className="max-w-3xl text-sm font-mono leading-relaxed text-[#94A3B8] sm:text-base">
            These terms govern use of the TerpForge website, storefront,
            product content, ordering flows, and related services made available
            through the platform.
          </p>
          <p className="mt-4 text-xs font-mono uppercase tracking-[0.3em] text-[#C9A84C]">
            Effective Date: 2026-04-29
          </p>
        </div>
      </section>

      <section className="bg-[#0A1628] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {sections.map((section, index) => (
              <article
                key={section.title}
                className="border border-[#C9A84C]/20 bg-[#0F1F3D]/70 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center border border-[#0D9488]/40 text-[10px] font-mono text-[#0D9488]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-wide text-[#E8EDF5]">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-[#CBD5E1] sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-[#1E293B] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-xs font-mono uppercase tracking-[0.3em] text-[#64748B]">
              Review the related privacy and return policies for additional
              operating details tied to storefront use and order handling.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/privacy-policy"
                className="inline-flex items-center justify-center border border-[#0D9488]/40 px-4 py-3 text-xs font-mono uppercase tracking-[0.3em] text-[#0D9488] transition-colors hover:bg-[#0D9488]/10"
              >
                Privacy Policy
              </Link>
              <Link
                href="/return-policy"
                className="inline-flex items-center justify-center border border-[#C9A84C]/40 px-4 py-3 text-xs font-mono uppercase tracking-[0.3em] text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
              >
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
