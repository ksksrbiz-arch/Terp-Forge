import type { Metadata } from "next";
import Link from "next/link";
import { editorials } from "@/lib/editorials";
import { siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Ten long-form TerpForge editorials on terpene extraction, living soil, organic hemp growth, regenerative farming, and post-harvest quality.",
  alternates: {
    canonical: "/journal",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/journal`,
    title: `Journal · ${siteName}`,
    description:
      "Ten long-form TerpForge editorials on terpene extraction, living soil, organic hemp growth, regenerative farming, and post-harvest quality.",
  },
};

export default function JournalPage() {
  return (
    <div className="pt-16">
      <section className="relative overflow-hidden border-b border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(201,168,76,0.16),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(13,148,136,0.18),_transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-mono uppercase tracking-[0.45em] text-[#0D9488]">
            {"// TERPFORGE JOURNAL"}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase tracking-tight text-[#E8EDF5] sm:text-6xl">
            Ten Editorials on Better Hemp, Better Resin, and Better Extraction
          </h1>
          <p className="mt-6 max-w-3xl text-sm font-mono leading-relaxed text-[#94A3B8] sm:text-base">
            A new long-form editorial series covering terpene preservation,
            organic hemp growth, living soil systems, regenerative field design,
            and the post-harvest choices that shape extraction quality.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 border-b border-[#C9A84C]/15 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#C9A84C]">
              {"// FIELD NOTES"}
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-[#E8EDF5]">
              Editorial Index
            </h2>
          </div>
          <p className="max-w-2xl text-sm font-mono leading-relaxed text-[#64748B]">
            Each piece is built as a stand-alone page and written in the
            TerpForge voice: technical, agricultural, and focused on what helps
            premium extraction inputs stay expressive from field to shelf.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {editorials.map((editorial, index) => (
            <article
              key={editorial.slug}
              className="group relative overflow-hidden border border-[#C9A84C]/20 bg-[#0B1730] p-6 transition-colors hover:border-[#C9A84C]/45"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.3em] text-[#64748B]">
                <span className="text-[#0D9488]">{String(index + 1).padStart(2, "0")}</span>
                <span>{editorial.eyebrow}</span>
                <span>{editorial.readingTime}</span>
              </div>
              <h3 className="mt-5 text-2xl font-black uppercase tracking-[0.08em] text-[#E8EDF5]">
                <Link href={`/journal/${editorial.slug}`} className="hover:text-[#C9A84C]">
                  {editorial.title}
                </Link>
              </h3>
              <p className="mt-4 text-sm font-mono leading-relaxed text-[#94A3B8]">
                {editorial.excerpt}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {editorial.topics.map((topic) => (
                  <span
                    key={topic}
                    className="border border-[#0D9488]/25 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.3em] text-[#0D9488]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#C9A84C]/10 pt-5">
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#64748B]">
                  {editorial.publishedOn}
                </span>
                <Link
                  href={`/journal/${editorial.slug}`}
                  className="text-xs font-bold uppercase tracking-[0.35em] text-[#C9A84C] transition-colors hover:text-[#E2C97E]"
                >
                  Open Editorial ↗
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
