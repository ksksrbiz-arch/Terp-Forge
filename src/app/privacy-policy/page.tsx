import type { Metadata } from "next";
import Link from "next/link";

const pageTitle = "Privacy Policy";
const pageDescription =
  "How TerpForge collects, uses, stores, and protects customer information across the site, checkout flows, and support channels.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `${pageTitle} · TerpForge`,
    description: pageDescription,
    url: "/privacy-policy",
  },
  twitter: {
    title: `${pageTitle} · TerpForge`,
    description: pageDescription,
  },
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "We collect the information you provide directly when you place an order, join The Registry, request support, or contact TerpForge. This may include your name, email address, shipping and billing details, phone number, and any information you include in messages to our team.",
      "We also collect limited technical data automatically when you browse the site, such as device type, browser information, referring pages, and basic interaction data used to improve performance, security, and usability.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use customer information to process orders, provide support, send transactional updates, respond to inquiries, improve the site experience, detect fraud or abuse, and maintain legal or tax records required for operating the business.",
      "If you voluntarily subscribe to brand communications, we may use your contact information to send product updates, launches, educational content, and promotional messages. You can opt out of marketing communications at any time.",
    ],
  },
  {
    title: "Payments and Third-Party Services",
    body: [
      "Checkout and payment workflows may be processed by third-party providers such as payment processors, fulfillment platforms, analytics services, or infrastructure vendors. Those providers only receive the information required to perform their services on our behalf.",
      "TerpForge does not sell personal information to data brokers. We may share information only when necessary to complete transactions, prevent fraud, comply with law, or operate the storefront and order pipeline.",
    ],
  },
  {
    title: "Cookies and Analytics",
    body: [
      "We may use cookies, local storage, and similar technologies to preserve cart state, remember site preferences, measure product interest, and improve the reliability of the storefront. Some features may not function correctly if those technologies are disabled.",
      "Analytics data is used in aggregate to understand traffic, product demand, and performance trends rather than to build profiles for resale.",
    ],
  },
  {
    title: "Data Retention and Security",
    body: [
      "We retain information only for as long as it is reasonably needed for fulfillment, support, compliance, recordkeeping, dispute resolution, and legitimate business operations. Retention periods can vary depending on the type of information and applicable law.",
      "We use reasonable administrative, technical, and operational safeguards to protect customer data. However, no system can guarantee absolute security, so you should also protect your credentials and devices when using the site.",
    ],
  },
  {
    title: "Your Choices and Rights",
    body: [
      "You may request access, correction, or deletion of certain personal information, subject to legal and operational exceptions. You may also opt out of marketing emails by using the unsubscribe link in those messages.",
      "To make a privacy request, contact TerpForge through the site contact page and include enough detail for us to verify and respond to your request.",
    ],
  },
  {
    title: "Policy Updates",
    body: [
      "We may update this Privacy Policy to reflect changes in our business, platform integrations, legal obligations, or site functionality. When material updates are made, the revised version will be posted on this page with the latest effective date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-16">
      <section className="border-b border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-mono uppercase tracking-[0.4em] text-[#0D9488]">
            {"// LEGAL // DATA HANDLING"}
          </p>
          <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-[#E8EDF5] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="max-w-3xl text-sm font-mono leading-relaxed text-[#94A3B8] sm:text-base">
            TerpForge is committed to transparent handling of customer data. This
            page explains what we collect, why we collect it, and how we use it
            to operate the storefront, support customers, and protect the
            platform.
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
              Questions about privacy handling or data requests can be submitted
              through the TerpForge contact channel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-[#0D9488]/40 px-4 py-3 text-xs font-mono uppercase tracking-[0.3em] text-[#0D9488] transition-colors hover:bg-[#0D9488]/10"
              >
                Contact Support
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
