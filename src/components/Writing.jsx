import { Link } from 'react-router-dom';
import { Section, Reveal } from './Section';
import { writing } from '../data/content';
import { posts, formatDate } from '../content/posts';

// 07 / Publish — the "Writing" surface on the homepage. Points to /blog and
// surfaces the latest posts straight from the content system (single source).
export function Writing() {
  const latest = posts.slice(0, 2);
  return (
    <Section id="publish" eyebrow={writing.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {writing.heading}
      </Reveal>
      <Reveal as="p" className="lead">
        {writing.lead}
      </Reveal>

      <ul className="writing-list">
        {latest.map((p) => (
          <Reveal as="li" key={p.slug} className="writing-item">
            <Link to={`/blog/${p.slug}`} className="writing-link">
              <span className="writing-meta">
                {formatDate(p.date)} · {p.readingMinutes} min read
              </span>
              <span className="writing-title">{p.title}</span>
              <span className="writing-excerpt">{p.excerpt}</span>
            </Link>
          </Reveal>
        ))}
      </ul>

      <Reveal>
        <Link to="/blog" className="link">All writing →</Link>
      </Reveal>
    </Section>
  );
}
