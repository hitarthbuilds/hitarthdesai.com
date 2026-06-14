import yaml from 'js-yaml';
import { marked } from 'marked';

// Blog content system. Posts are Markdown files with YAML frontmatter under
// ./blog/*.md — adding a file is all it takes to publish. Frontmatter is parsed
// to typed metadata; the body is rendered to HTML at build time (prerendered into
// static HTML by vite-react-ssg) and re-rendered identically on hydration.
const SITE = 'https://hitarthdesai.com';
const DEFAULT_OG = `${SITE}/og.svg`;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parse(raw) {
  const m = raw.match(FRONTMATTER);
  if (!m) return { data: {}, body: raw };
  return { data: yaml.load(m[1]) || {}, body: m[2] };
}

function normalizeDate(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}

function readingMinutes(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const files = import.meta.glob('./blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const posts = Object.entries(files)
  .map(([path, raw]) => {
    const { data, body } = parse(raw);
    const slug = data.slug || path.split('/').pop().replace(/\.md$/, '');
    return {
      slug,
      title: data.title,
      seoTitle: data.seoTitle || `${data.title} | Hitarth Desai`,
      description: data.description || data.excerpt || '',
      excerpt: data.excerpt || data.description || '',
      date: normalizeDate(data.date),
      tags: data.tags || [],
      canonical: data.canonical || `${SITE}/blog/${slug}/`,
      ogImage: data.ogImage || DEFAULT_OG,
      readingMinutes: readingMinutes(body),
      html: marked.parse(body),
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const getPost = (slug) => posts.find((p) => p.slug === slug);

export const latestPost = posts[0];

export function formatDate(iso) {
  if (!iso) return '';
  // Stable, locale-independent (avoids SSR/CSR hydration drift).
  const [y, m, d] = String(iso).split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[(m || 1) - 1]} ${d}, ${y}`;
}
