import { Head } from 'vite-react-ssg';
import { Link, useParams } from 'react-router-dom';
import { getPost, formatDate } from '../content/posts';
import { author } from '../data/content';

function postingLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.canonical,
    mainEntityOfPage: post.canonical,
    datePublished: post.date,
    dateModified: post.date,
    image: post.ogImage,
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Person',
      '@id': 'https://hitarthdesai.com/#person',
      name: 'Hitarth Desai',
      url: 'https://hitarthdesai.com/',
      jobTitle: 'AI Engineer',
    },
    publisher: {
      '@type': 'Person',
      '@id': 'https://hitarthdesai.com/#person',
      name: 'Hitarth Desai',
      jobTitle: 'AI Engineer',
    },
  };
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  if (!post) {
    return (
      <main className="page">
        <Head>
          <title>Post not found | Hitarth Desai</title>
          <meta name="robots" content="noindex" />
        </Head>
        <article className="page-inner">
          <h1 className="page-title">Post not found</h1>
          <p className="page-lead">
            That post doesn’t exist. <Link to="/blog" className="link">Back to writing →</Link>
          </p>
        </article>
      </main>
    );
  }

  return (
    <main className="page">
      <Head>
        <title>{post.seoTitle}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={post.canonical} />
        <meta name="author" content="Hitarth Desai" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={post.canonical} />
        <meta property="og:image" content={post.ogImage} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content="Hitarth Desai" />
        {post.tags.map((t) => (
          <meta key={t} property="article:tag" content={t} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@hitarthbuilds" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={post.ogImage} />
      </Head>

      <article className="post">
        <p className="post-back">
          <Link to="/blog" className="link">← Writing</Link>
        </p>
        <header className="post-header">
          <p className="eyebrow">
            {formatDate(post.date)} · {post.readingMinutes} min read
          </p>
          <h1 className="post-h1">{post.title}</h1>
          <ul className="post-tags">
            {post.tags.map((t) => (
              <li key={t} className="post-tag">{t}</li>
            ))}
          </ul>
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        <footer className="post-footer">
          <p>
            Written by Hitarth Desai, AI Engineer at InfraDock AI.{' '}
            <Link to="/#ship" className="link">Get in touch →</Link>
          </p>
          {author.building && <p className="post-building">{author.building}</p>}
          <p>
            <Link to="/blog" className="link">← All writing</Link>
          </p>
        </footer>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postingLd(post)) }} />
    </main>
  );
}
