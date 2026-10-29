// Server-only: reads content/blog at build time.
import fs from "node:fs";
import path from "node:path";

export type PostMeta = {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  excerpt?: string;
  date: string;
  tags: string[];
  readMinutes: number;
};

const DIR = path.join(process.cwd(), "content/blog");

/** Minimal YAML-frontmatter reader: `key: value` scalars (quoted or bare) and `- item` lists. */
export function parseFrontmatter(src: string): { data: Record<string, string | string[]>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data: Record<string, string | string[]> = {};
  let listKey: string | null = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) {
      (data[listKey] as string[]).push(unquote(item[1]));
      continue;
    }
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    if (kv[2] === "") {
      listKey = kv[1];
      data[listKey] = [];
    } else {
      listKey = null;
      data[kv[1]] = unquote(kv[2]);
    }
  }
  return { data, body: src.slice(m[0].length) };
}

function unquote(v: string) {
  const t = v.trim();
  return (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1).replace(/\\"/g, '"') : t;
}

function read(file: string) {
  const { data, body } = parseFrontmatter(fs.readFileSync(path.join(DIR, file), "utf8"));
  const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  const meta: PostMeta = {
    slug: String(data.slug ?? file.replace(/\.mdx?$/, "")),
    title: String(data.title ?? ""),
    seoTitle: data.seoTitle ? String(data.seoTitle) : undefined,
    description: String(data.description ?? ""),
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? data.tags : [],
    readMinutes: Math.max(1, Math.round(words / 230)),
  };
  return { meta, body };
}

/** Every post, newest first (ties broken by title so the order is stable). */
export function getPosts(): PostMeta[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => read(f).meta)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getPost(slug: string) {
  const file = fs.readdirSync(DIR).find((f) => read(f).meta.slug === slug);
  return file ? read(file) : null;
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return y ? `${months[(m || 1) - 1]} ${d}, ${y}` : "";
}
