import { PROFILE } from "@/content/profile";
import { getPosts } from "@/lib/posts";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of every post (the "Liner notes"). */
export function GET() {
  const posts = getPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${PROFILE.url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${PROFILE.url}/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.excerpt ?? p.description)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Liner notes · ${esc(PROFILE.name)}</title>
    <link>${PROFILE.url}/blog</link>
    <description>Field notes on making LLMs reliable in production, by ${esc(PROFILE.name)}, ${esc(PROFILE.title)}.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${posts[0]?.date ?? "2026-01-01"}T00:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${PROFILE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
