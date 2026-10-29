// Server-only: renders a post's Markdown to HTML at build time, with Shiki-highlighted code
// and stable heading ids for the table of contents.
import { Marked, type Tokens } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

export type Heading = { id: string; text: string; depth: 2 | 3 };

const LANGS = ["python", "typescript", "javascript", "json", "bash", "yaml", "sql", "toml"];
let hl: Promise<Highlighter> | null = null;
const highlighter = () => (hl ??= createHighlighter({ themes: ["vitesse-dark"], langs: LANGS }));

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function renderMarkdown(src: string): Promise<{ html: string; headings: Heading[] }> {
  const h = await highlighter();
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const marked = new Marked({
    async: true,
    gfm: true,
    walkTokens: (token) => {
      if (token.type !== "code") return;
      const t = token as Tokens.Code;
      const lang = LANGS.includes(t.lang ?? "") ? t.lang! : "text";
      const code = lang === "text" ? `<pre class="shiki"><code>${escape(t.text)}</code></pre>` : h.codeToHtml(t.text, { lang, theme: "vitesse-dark" });
      Object.assign(token, { type: "html", block: true, pre: false, text: `<div class="code-block" data-lang="${lang}">${code}</div>` });
    },
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        let id = slugify(inner);
        const n = seen.get(id) ?? 0;
        seen.set(id, n + 1);
        if (n) id = `${id}-${n}`;
        if (depth === 2 || depth === 3) headings.push({ id, text: inner.replace(/<[^>]+>/g, ""), depth });
        return `<h${depth} id="${id}">${inner}</h${depth}>`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith("https://hitarthdesai.com");
        const local = href.replace(/^https:\/\/hitarthdesai\.com/, "").replace(/\/$/, "") || "/";
        return external
          ? `<a href="${href}"${title ? ` title="${title}"` : ""} target="_blank" rel="noopener noreferrer">${text}</a>`
          : `<a href="${local}"${title ? ` title="${title}"` : ""}>${text}</a>`;
      },
    },
  });
  const html = await marked.parse(src);
  return { html, headings };
}
