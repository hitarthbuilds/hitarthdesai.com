import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROFILE } from "@/content/profile";
import { formatDate, getPost, getPosts } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { PostChrome } from "./PostChrome";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const m = post.meta;
  return {
    title: { absolute: m.seoTitle ?? `${m.title} · ${PROFILE.name}` },
    description: m.description,
    alternates: { canonical: `/blog/${m.slug}` },
    openGraph: { type: "article", title: m.title, description: m.description, publishedTime: m.date, authors: [PROFILE.name], tags: m.tags },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const { meta } = post;
  const { html, headings } = await renderMarkdown(post.body);
  const all = getPosts();
  const i = all.findIndex((p) => p.slug === slug);
  const next = all[(i + 1) % all.length];

  return (
    <article className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 sm:px-8 lg:px-12">
      <PostChrome headings={headings} />
      <Link href="/blog" className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-chrome">
        ← Liner notes
      </Link>
      <header className="mt-8 max-w-5xl">
        <p className="eyebrow flex flex-wrap gap-3">
          <time dateTime={meta.date} className="text-forge">
            {formatDate(meta.date)}
          </time>
          <span>{meta.readMinutes} min read</span>
          <span>By {PROFILE.name}, {PROFILE.title}</span>
        </p>
        <h1 className="display mt-5 text-[clamp(2.4rem,5.6vw,5.4rem)] leading-[0.95] text-chrome">{meta.title}</h1>
        {meta.excerpt && <p className="mt-6 max-w-3xl text-[19px] leading-relaxed text-chrome/75">{meta.excerpt}</p>}
      </header>
      <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="prose-liner" dangerouslySetInnerHTML={{ __html: html }} />
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-28" data-toc>
            <p className="eyebrow text-forge">Setlist</p>
            <ol className="mt-4 space-y-2 border-l border-line text-[13px]">
              {headings.map((h) => (
                <li key={h.id} className={h.depth === 3 ? "pl-7" : "pl-4"}>
                  <a href={`#${h.id}`} data-toc-link={h.id} className="-ml-px block border-l border-transparent pl-0 leading-snug text-mute transition-colors hover:text-chrome">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
      {meta.tags.length > 0 && (
        <ul className="mt-14 flex flex-wrap gap-2">
          {meta.tags.map((t) => (
            <li key={t} className="rounded-full border border-line-2 px-3 py-1 font-mono text-[11px] text-mute">
              {t}
            </li>
          ))}
        </ul>
      )}
      <Link href={`/blog/${next.slug}`} className="group mt-20 block border-t border-line pt-10">
        <span className="eyebrow">Next track</span>
        <span className="mt-3 block max-w-4xl font-display text-[clamp(1.8rem,4vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-chrome/45 transition-colors group-hover:text-chrome">
          {next.title} →
        </span>
      </Link>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: meta.title,
            description: meta.description,
            datePublished: meta.date,
            author: { "@type": "Person", name: PROFILE.name, url: PROFILE.url, jobTitle: PROFILE.title },
            mainEntityOfPage: `${PROFILE.url}/blog/${meta.slug}`,
            keywords: meta.tags.join(", "),
          }),
        }}
      />
    </article>
  );
}
