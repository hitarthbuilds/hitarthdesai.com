import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/content/projects";
import { formatDate, getPosts } from "@/lib/posts";
import { AlbumArt } from "@/components/viz/AlbumArt";
import { ArrowRight } from "@/components/ui/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  return p ? { title: p.name, description: p.blurb, alternates: { canonical: `/projects/${p.slug}` } } : {};
}

/** Liner notes for one release: what it is, what it's built with, and the writing behind it. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = PROJECTS.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = PROJECTS[i];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const related = getPosts().filter((post) => post.tags.some((t) => t.toLowerCase() === p.name.toLowerCase()));
  const metrics = p.metrics.filter((m) => m.value !== null);

  return (
    <article className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 sm:px-8 lg:px-12">
      <Link href="/#discography" className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-chrome">
        ← Discography
      </Link>
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div>
          <p className="eyebrow flex flex-wrap items-center gap-3">
            <span className="text-forge">
              Side {p.side} · {p.track}
            </span>
            <span>{p.format}</span>
            <span>{p.status}</span>
          </p>
          <h1 className="display mt-5 text-[clamp(3rem,8vw,7.5rem)] text-chrome">{p.name}</h1>
          <p className="mt-6 max-w-xl text-[19px] leading-relaxed text-chrome/80">{p.blurb}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {p.tech.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[12px] text-mute">
                {t}
              </li>
            ))}
          </ul>
          {p.links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-forge">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
          {metrics.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label}>
                  <dt className="eyebrow">{m.label}</dt>
                  <dd className="display mt-2 text-4xl text-chrome">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="sleeve relative aspect-square">
          <span className="sleeve-art">
            <AlbumArt visual={p.visual} />
          </span>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related-title">
          <h2 id="related-title" className="eyebrow text-forge">
            Liner notes · the writing behind it
          </h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {related.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group flex items-baseline gap-6 py-6">
                  <span className="hidden w-28 shrink-0 font-mono text-[12px] text-dim sm:block">{formatDate(post.date)}</span>
                  <span className="font-display text-[clamp(1.2rem,2.2vw,1.7rem)] font-bold leading-snug tracking-[-0.02em] text-chrome">{post.title}</span>
                  <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-mute transition-transform group-hover:translate-x-1 group-hover:text-forge" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href={`/projects/${next.slug}`} className="group mt-24 block border-t border-line pt-10">
        <span className="eyebrow">Next track · {next.track}</span>
        <span className="display mt-3 flex items-center gap-4 text-[clamp(2.4rem,6vw,5rem)] text-chrome/40 transition-colors group-hover:text-chrome">
          {next.name}
          <ArrowRight className="h-10 w-10 transition-transform group-hover:translate-x-2" />
        </span>
      </Link>
    </article>
  );
}
