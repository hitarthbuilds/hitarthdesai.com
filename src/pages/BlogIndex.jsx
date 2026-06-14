import { Head } from 'vite-react-ssg';
import { Link } from 'react-router-dom';
import { posts, formatDate } from '../content/posts';

const blogLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://hitarthdesai.com/blog/',
  name: 'Writing by Hitarth Desai AI Engineer',
  description: 'Notes on building reliable AI systems: structured outputs, LLM pipelines, MLOps, and production AI engineering.',
  url: 'https://hitarthdesai.com/blog/',
  author: { '@type': 'Person', '@id': 'https://hitarthdesai.com/#person', name: 'Hitarth Desai' },
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    url: p.canonical,
    datePublished: p.date,
    keywords: p.tags.join(', '),
  })),
};

export default function BlogIndex() {
  return (
    <main className="page">
      <Head>
        <title>Writing | Hitarth Desai AI Engineer</title>
        <meta
          name="description"
          content="Essays by Hitarth Desai AI Engineer on reliable structured outputs, production LLM pipelines, MLOps, and open-source AI systems engineering."
        />
        <link rel="canonical" href="https://hitarthdesai.com/blog/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Writing by Hitarth Desai AI Engineer" />
        <meta property="og:description" content="Notes on structured outputs, production LLM pipelines, MLOps, and reliable AI systems." />
        <meta property="og:url" content="https://hitarthdesai.com/blog/" />
        <meta property="og:image" content="https://hitarthdesai.com/og.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@hitarthbuilds" />
      </Head>

      <article className="page-inner">
        <p className="eyebrow">Writing</p>
        <h1 className="page-title">Notes on building reliable AI systems</h1>
        <p className="page-lead">
          Structured outputs, production LLM pipelines, and the MLOps plumbing in between —
          the unglamorous layer that decides whether a model ships.
        </p>

        <ul className="post-list">
          {posts.map((p) => (
            <li key={p.slug} className="post-row">
              <Link to={`/blog/${p.slug}`} className="post-link">
                <span className="post-meta">
                  {formatDate(p.date)} · {p.readingMinutes} min read
                </span>
                <h2 className="post-title">{p.title}</h2>
                <p className="post-excerpt">{p.excerpt}</p>
                <ul className="post-tags">
                  {p.tags.slice(0, 4).map((t) => (
                    <li key={t} className="post-tag">{t}</li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>

        <p className="page-back">
          <Link to="/" className="link">← Back home</Link>
        </p>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
    </main>
  );
}
