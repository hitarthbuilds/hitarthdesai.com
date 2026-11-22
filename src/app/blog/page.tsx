import type { Metadata } from "next";
import { SubHeader } from "@/components/SubHeader";
import { Words } from "@/components/Words";
import { formatDate, getPosts } from "@/lib/posts";
import "@/styles/case.css";
import "@/styles/blog.css";

export const metadata: Metadata = {
  title: "Field notes",
  description: "Field notes on making LLMs reliable in production: structured outputs, pipeline infrastructure, and the unglamorous layer in between.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <div className="case-body">
      <SubHeader back={{ href: "/#writing", label: "Home" }} />
      <main id="main" className="blog-main">
        <section className="blog-intro" aria-labelledby="blog-title">
          <h1 id="blog-title" data-reveal="words">
            <Words text="Field notes" tail={<span className="dot">.</span>} />
          </h1>
          <p data-reveal="up" style={{ "--delay": "200ms" } as React.CSSProperties}>Making LLMs reliable in production: structured outputs, pipeline infrastructure, and the unglamorous layer in between.</p>
        </section>
        <ol className="blog-list" data-skew="">
          {posts.map((p, i) => (
            <li key={p.slug} data-reveal="up" style={{ "--delay": `${Math.min(i, 6) * 70}ms` } as React.CSSProperties}>
              <a className="blog-row" href={`/blog/${p.slug}`} data-cursor="Read">
                <span className="note-meta">
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                  <span>{p.readMinutes} min read</span>
                </span>
                <span>
                  <span className="blog-row-title">{p.title}</span>
                  <span className="blog-row-excerpt">{p.excerpt ?? p.description}</span>
                </span>
                <span className="blog-row-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
