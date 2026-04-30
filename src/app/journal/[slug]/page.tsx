import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { editorials, getEditorialBySlug } from "@/lib/editorials";
import { siteName, siteUrl } from "@/lib/site";

type EditorialPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return editorials.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: EditorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const editorial = getEditorialBySlug(slug);

  if (!editorial) {
    return {};
  }

  return {
    title: editorial.title,
    description: editorial.excerpt,
    alternates: {
      canonical: `/journal/${editorial.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/journal/${editorial.slug}`,
      title: `${editorial.title} · ${siteName}`,
      description: editorial.excerpt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${editorial.title} · ${siteName}`,
      description: editorial.excerpt,
    },
  };
}

export default async function EditorialPage({ params }: EditorialPageProps) {
  const { slug } = await params;
  const editorial = getEditorialBySlug(slug);

  if (!editorial) {
    notFound();
  }

  const relatedEditorials = editorial.relatedSlugs
    .map((relatedSlug) => getEditorialBySlug(relatedSlug))
    .filter((related): related is NonNullable<typeof related> => Boolean(related));

  return (
    <div className="pt-16">
      <section className="border-b border-[#C9A84C]/20 bg-[#0F1F3D] schematic-grid">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.3em] text-[#64748B]">
            <Link href="/journal" className="text-[#0D9488] transition-colors hover:text-[#5EEAD4]">
              Journal
            </Link>
            <span>/</span>
            <span>{editorial.eyebrow}</span>
            <span>/</span>
            <span>{editorial.readingTime}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black uppercase tracking-tight text-[#E8EDF5] sm:text-6xl">
            {editorial.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base font-mono leading-relaxed text-[#94A3B8]">
            {editorial.lead}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {editorial.topics.map((topic) => (
              <span
                key={topic}
                className="border border-[#C9A84C]/20 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A84C]"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
        <article className="min-w-0">
          <div className="border border-[#C9A84C]/18 bg-[#091426] p-6 sm:p-8">
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#0D9488]">
              {"// ABSTRACT"}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#D8E0EA] sm:text-xl">
              {editorial.excerpt}
            </p>
          </div>

          <blockquote className="mt-8 border-l-2 border-[#C9A84C] pl-6 text-2xl font-black uppercase leading-tight tracking-[0.08em] text-[#E8EDF5]">
            “{editorial.quote}”
            <span className="mt-4 block text-xs font-mono font-normal tracking-[0.3em] text-[#64748B]">
              {editorial.quoteAttribution}
            </span>
          </blockquote>

          <div className="mt-10 space-y-10">
            {editorial.sections.map((section) => (
              <section key={section.heading} className="border-t border-[#1E293B] pt-8">
                <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-[#E8EDF5]">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-[#B7C3D4]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-6 space-y-3 border border-[#0D9488]/18 bg-[#0B1730] p-5 text-sm font-mono leading-relaxed text-[#D8E0EA]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-1 text-[#0D9488]">▣</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.aside ? (
                  <p className="mt-6 border-l border-[#C9A84C]/40 pl-4 text-sm font-mono uppercase tracking-[0.24em] text-[#C9A84C]">
                    {section.aside}
                  </p>
                ) : null}
              </section>
            ))}
          </div>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-[#C9A84C]/18 bg-[#091426] p-6">
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#0D9488]">
              {"// AT A GLANCE"}
            </p>
            <p className="mt-4 text-xs font-mono uppercase tracking-[0.3em] text-[#64748B]">
              Published
            </p>
            <p className="mt-2 text-sm font-mono text-[#E8EDF5]">
              {editorial.publishedOn}
            </p>
            <p className="mt-5 text-xs font-mono uppercase tracking-[0.3em] text-[#64748B]">
              Key takeaways
            </p>
            <ul className="mt-3 space-y-3 text-sm font-mono leading-relaxed text-[#D8E0EA]">
              {editorial.keyTakeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-3">
                  <span className="mt-1 text-[#C9A84C]">◆</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-[#0D9488]/18 bg-[#0B1730] p-6">
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#0D9488]">
              {"// RELATED READS"}
            </p>
            <div className="mt-4 space-y-4">
              {relatedEditorials.map((related) => (
                <Link
                  key={related.slug}
                  href={`/journal/${related.slug}`}
                  className="block border border-[#1E293B] p-4 transition-colors hover:border-[#C9A84C]/35"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-[#64748B]">
                    {related.eyebrow}
                  </p>
                  <h2 className="mt-2 text-lg font-black uppercase tracking-[0.08em] text-[#E8EDF5]">
                    {related.title}
                  </h2>
                  <p className="mt-3 text-sm font-mono leading-relaxed text-[#94A3B8]">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
