import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubHeader } from "@/components/SubHeader";
import { Words } from "@/components/Words";
import { PROFILE } from "@/content/profile";
import { formatDate, getPost, getPosts } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import "@/styles/case.css";
import "@/styles/blog.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const m = post.meta;
  return {
    title: { absolute: m.seoTitle ?? `${m.title} — ${PROFILE.name}` },
    description: m.description,
    alternates: { canonical: `/blog/${m.slug}` },
    openGraph: { type: "article", title: m.title, description: m.description, publishedTime: m.date, authors: [PROFILE.name], tags: m.tags, url: `/blog/${m.slug}` },
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
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];

  return (
    <div className="case-body">
      <SubHeader back={{ href: "/blog", label: "Field notes" }} />
      <main id="main" className="blog-main">
        <article>
          <header className="post-head">
            <p className="case-meta" data-reveal="up">
              <time dateTime={meta.date}>{formatDate(meta.date)}</time>
              <i aria-hidden="true">/</i>
              {meta.readMinutes} min read
              <i aria-hidden="true">/</i>
              {PROFILE.name}
            </p>
            <h1 className="post-title" data-reveal="words">
              <Words text={meta.title} />
            </h1>
            {meta.excerpt && (
              <p className="post-excerpt" data-reveal="up" style={{ "--delay": "260ms" } as React.CSSProperties}>
                {meta.excerpt}
              </p>
            )}
          </header>
          <div className="post-body">
            {headings.length > 2 && (
              <nav className="post-toc" aria-label="On this page">
                <h2>On this page</h2>
                <ol>
                  {headings.map((h) => (
                    <li key={h.id} className={h.depth === 3 ? "sub" : undefined}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div>
              <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
              {meta.tags.length > 0 && (
                <ul className="post-tags" aria-label="Topics">
                  {meta.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </article>
      </main>
      <footer className="case-footer case-footer--posts">
        <a className="case-foot-item" href={`/blog/${prev.slug}`} data-cursor="Read">
          <span>← Newer note</span>
          <strong>{prev.title}</strong>
        </a>
        <a className="case-foot-item case-foot-next" href={`/blog/${next.slug}`} data-cursor="Read">
          <span>Older note →</span>
          <strong>{next.title}</strong>
        </a>
      </footer>
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
    </div>
  );
}
