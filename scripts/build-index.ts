// Builds the retrieval index for "Ask the Roadie" from profile, projects, FAQ and every post.
// Run automatically before dev, build and test (see package.json); output is gitignored.
import fs from "node:fs";
import path from "node:path";
import { PROFILE } from "../src/content/profile";
import { PROJECTS } from "../src/content/projects";
import { FAQ } from "../src/content/faq";
import { parseFrontmatter } from "../src/lib/posts";
import { slugify } from "../src/lib/slug";
import { buildIndex, type Chunk } from "../src/lib/bm25";

const chunks: Chunk[] = [];
const add = (title: string, url: string, text: string) => chunks.push({ id: String(chunks.length), title, url, text: text.replace(/\s+/g, " ").trim() });

add("About Hitarth", "/#overture", `${PROFILE.name}, ${PROFILE.title}, based in ${PROFILE.location.city}, ${PROFILE.location.region}, ${PROFILE.location.country}. ${PROFILE.tagline} ${PROFILE.bio}`);
add("Availability", "/#encore", `${PROFILE.status.label}. Contact via LinkedIn: ${PROFILE.socials.find((s) => s.id === "linkedin")!.href}.`);
for (const r of PROFILE.experience) add(`${r.title}, ${r.org}`, "/#tour", `${r.when}: ${r.title} at ${r.org}. ${r.summary}`);
add("Education", "/#tour", `${PROFILE.education.degree}, ${PROFILE.education.school} (${PROFILE.education.short}), class of ${PROFILE.education.year}.`);
add("Stack", "/#rig", Object.entries(PROFILE.stack).map(([g, items]) => `${g}: ${items.join(", ")}.`).join(" "));
add("Off stage", "/#iron-and-strings", `${PROFILE.offStage} Achievements: ${PROFILE.achievements.join("; ")}. Guitar: ${PROFILE.guitar}.`);
add("Links", "/#encore", PROFILE.socials.map((s) => `${s.label}: ${s.href}`).join(". "));
for (const p of PROJECTS) add(p.name, `/projects/${p.slug}`, `${p.name} (${p.status}). ${p.blurb} Built with ${p.tech.join(", ")}. ${p.links.map((l) => `${l.label}: ${l.href}`).join(". ")}`);
for (const f of FAQ) add(f.q, "/#soundcheck", `${f.q} ${f.a}`);

// Posts: one chunk per H2 section, split further if a section runs long.
const dir = path.join(process.cwd(), "content/blog");
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const { data, body } = parseFrontmatter(fs.readFileSync(path.join(dir, file), "utf8"));
  const slug = String(data.slug), title = String(data.title);
  const sections = body.split(/^## /m);
  sections.forEach((sec, i) => {
    const [head, ...rest] = i === 0 ? ["", sec] : [sec.split("\n")[0], sec.split("\n").slice(1).join("\n")];
    const text = rest.join("\n").replace(/```[\s\S]*?```/g, " ").replace(/[#*_`>[\]()]/g, " ");
    const words = text.split(/\s+/).filter(Boolean);
    for (let w = 0; w < words.length; w += 220) {
      const url = head ? `/blog/${slug}#${slugify(head)}` : `/blog/${slug}`;
      add(head ? `${title} · ${head.trim()}` : title, url, (i === 0 && w === 0 ? `${data.description ?? ""} ` : "") + words.slice(w, w + 240).join(" "));
    }
  });
}

const out = path.join(process.cwd(), "src/data/ask-index.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(buildIndex(chunks)));
console.log(`ask index: ${chunks.length} chunks → ${path.relative(process.cwd(), out)}`);
