import type { Metadata } from "next";
import Link from "next/link";

const pageTitle = "Return Policy";
const pageDescription =
  "TerpForge return eligibility, damaged shipment handling, exchange rules, and refund processing guidance.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/return-policy",
  },
  openGraph: {
    title: `${pageTitle} · TerpForge`,
    description: pageDescription,
    url: "/return-policy",
  },
  twitter: {
    title: `${pageTitle} · TerpForge`,
    description: pageDescription,
  },
};

const sections = [
  {
    title: "Return Window",
    body: [
      "Eligible items may be returned within 30 days of confirmed delivery unless the product is marked final sale, consumable, opened, or otherwise ineligible under applicable health and safety standards.",
      "To begin a return, contact TerpForge with your order number, the item you want to return, and the reason for the request. Return requests must be approved before items are shipped back.",
    ],
  },
  {
    title: "Eligible Condition",
    body: [
      "Returned merchandise must be unused, unworn, unwashed, and in original packaging with any included components, inserts, documentation, or accessories. TerpForge may decline returns that arrive damaged, incomplete, or altered after delivery.",
      "Apparel must be free from wear, odors, laundering, or staining. Hardware must be unused and returned with all included parts. Wellness products that have been opened, consumed, or tampered with are not eligible for return unless required by law.",
    ],
  },
  {
    title: "Damaged, Incorrect, or Defective Orders",
    body: [
      "If an order arrives damaged, defective, or incorrect, contact TerpForge within 7 days of delivery and include clear photos of the packaging, shipping label, and affected item. We will review the issue and, when appropriate, replace the item, issue store credit, or provide a refund.",
      "Do not discard damaged packaging until the claim has been reviewed, as we may need supporting documentation for carrier or fulfillment investigations.",
    ],
  },
  {
    title: "Refund Processing",
    body: [
      "Approved refunds are generally issued back to the original payment method. Processing times depend on the payment provider and financial institution, but most refunds appear within several business days after the return is received and inspected.",
      "Original shipping charges may be non-refundable unless the return results from TerpForge error, damaged delivery, or a verified defect.",
    ],
  },
  {
    title: "Exchanges",
    body: [
      "If inventory is available, TerpForge may offer exchanges for apparel sizing issues or verified defects. Exchange approval depends on product availability and condition. In some cases, we may recommend processing a return and placing a new order instead.",
    ],
  },
  {
    title: "Non-Returnable Items",
    body: [
      "For safety, compliance, and product integrity reasons, the following may be non-returnable: opened ingestibles, used wellness products, clearance items, gift cards, and any item marked final sale. Additional restrictions may apply based on local law or platform-specific fulfillment rules.",
    ],
  },
];

export default function ReturnPolicyPage() {
  return (
    <div className="pt-16">
      <section className="border-b border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-mono uppercase tracking-[0.4em] text-[#0D9488]">
            {"// LEGAL // RETURNS & REFUNDS"}
          </p>
          <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-[#E8EDF5] sm:text-5xl">
            Return Policy
          </h1>
          <p className="max-w-3xl text-sm font-mono leading-relaxed text-[#94A3B8] sm:text-base">
            This page outlines how TerpForge handles return eligibility,
            damaged shipments, exchanges, and refund processing for merchandise
            purchased through the storefront.
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
              Include your order number, item name, and issue summary when
              requesting return or damage support.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-[#0D9488]/40 px-4 py-3 text-xs font-mono uppercase tracking-[0.3em] text-[#0D9488] transition-colors hover:bg-[#0D9488]/10"
              >
                Request Return Support
              </Link>
              <Link
                href="/terms-of-use"
                className="inline-flex items-center justify-center border border-[#C9A84C]/40 px-4 py-3 text-xs font-mono uppercase tracking-[0.3em] text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
