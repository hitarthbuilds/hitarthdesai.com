import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubHeader } from "@/components/SubHeader";
import { Words } from "@/components/Words";
import { CaseReel } from "@/components/CaseReel";
import { PROJECTS, getProject } from "@/content/projects";
import { PROFILE } from "@/content/profile";
import "@/styles/case.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { type: "article", title: `${p.name} — ${PROFILE.name}`, description: p.description, url: `/projects/${p.slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const i = PROJECTS.indexOf(project);
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const shot = project.imageKind === "screenshot";

  const pad = (n: number) => String(n).padStart(2, "0");
  const len = (name: string) => Math.max(...name.split(" ").map((w) => w.length));

  return (
    <div className="case-body">
      <SubHeader back={{ href: "/#work", label: "Selected work" }} />
      <main id="main" className="case-main">
        <section className="case-intro" aria-labelledby="case-title">
          <p className="case-meta" data-reveal="up">
            <b>
              {pad(i + 1)} / {pad(PROJECTS.length)}
            </b>
            {project.category}
            <i aria-hidden="true">/</i>
            {project.field}
          </p>
          <h1 className="case-title" id="case-title" data-reveal="words" style={{ "--len": len(project.name) } as React.CSSProperties}>
            <Words text={project.name} />
          </h1>
          <div className="case-lede">
            <p className="case-summary" data-reveal="up" style={{ "--delay": "220ms" } as React.CSSProperties}>
              {project.description}
            </p>
            {project.links.length > 0 && (
              <div className="case-links" data-reveal="up" style={{ "--delay": "320ms" } as React.CSSProperties}>
                {project.links.map((l) => (
                  <a key={l.href} className="case-link" href={l.href} data-magnetic="">
                    <span className="roll">
                      <span>{l.label}</span>
                      <span aria-hidden="true">{l.label}</span>
                    </span>
                    <i aria-hidden="true">{l.href.startsWith("http") ? "↗" : "→"}</i>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
        <CaseReel src={project.image} alt={project.alt} shot={shot} />
        <div className="case-notebook">
          <aside className="case-facts" aria-label="Project information">
            <h2 data-reveal="up">Tools &amp; methods</h2>
            <ul data-reveal="up">
              {project.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
          <section className="case-notes" aria-labelledby="inside-build">
            <h2 id="inside-build" data-reveal="words">
              <Words text="Inside the build" />
            </h2>
            <ol>
              {project.notes.map((n, k) => (
                <li key={n.title} className="case-note" data-reveal="up">
                  <span className="case-note-n" aria-hidden="true">
                    {pad(k + 1)}
                  </span>
                  <h3>{n.title}</h3>
                  <p>{n.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
      <footer className="case-footer">
        <a className="case-next" href={`/projects/${next.slug}`} data-cursor="Next">
          <span className="case-next-kicker">
            Next project <b>{pad(PROJECTS.indexOf(next) + 1)} / {pad(PROJECTS.length)}</b>
          </span>
          <strong className="case-next-name" style={{ "--len": len(next.name) } as React.CSSProperties}>
            {next.name}
          </strong>
          <span className={`case-next-art${next.imageKind === "screenshot" ? " is-shot" : ""}`} aria-hidden="true">
            <img src={next.image} alt="" width={640} height={400} loading="lazy" decoding="async" />
          </span>
        </a>
        <a className="case-prev" href={`/projects/${prev.slug}`} data-cursor="Prev">
          ← {prev.name}
        </a>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.name,
            description: project.description,
            url: `${PROFILE.url}/projects/${project.slug}`,
            image: `${PROFILE.url}${project.image}`,
            creator: { "@type": "Person", name: PROFILE.name, url: PROFILE.url },
            keywords: project.tools.join(", "),
          }),
        }}
      />
    </div>
  );
}
