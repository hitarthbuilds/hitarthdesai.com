import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubHeader } from "@/components/SubHeader";
import { Words } from "@/components/Words";
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

  return (
    <div className="case-body">
      <SubHeader back={{ href: "/#work", label: "Selected work" }} />
      <main id="main" className="case-main">
        <section className="case-intro" aria-labelledby="case-title">
          <div className="case-intro-copy">
            <p className="case-meta" data-reveal="up">
              {project.category}
              <i aria-hidden="true">/</i>
              {project.field}
            </p>
            <h1 className={`case-title${project.wideTitle ? " case-title-wide" : ""}`} id="case-title" data-reveal="words">
              <Words text={project.name} />
            </h1>
            <p className="case-summary" data-reveal="up" style={{ "--delay": "220ms" } as React.CSSProperties}>{project.description}</p>
          </div>
          <figure className={`case-art${shot ? " case-art--shot" : ""}`}>
            <img width={shot ? 1280 : 1380} height={shot ? 720 : 920} src={project.image} alt={project.alt} fetchPriority="high" style={{ viewTransitionName: "case-art" }} />
          </figure>
        </section>
        <div className="case-notebook">
          <aside className="case-facts" aria-label="Project information" data-reveal="up">
            <h2>Tools &amp; methods</h2>
            <ul>
              {project.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="case-links">
              {project.links.map((l) => (
                <a key={l.href} className="case-link" href={l.href}>
                  {l.label} {l.href.startsWith("http") ? "↗" : "→"}
                </a>
              ))}
            </div>
          </aside>
          <section className="case-notes" aria-labelledby="inside-build">
            <h2 id="inside-build" data-reveal="up">
              Inside the build
            </h2>
            {project.notes.map((n) => (
              <section key={n.title} className="case-note" data-reveal="up">
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </section>
            ))}
          </section>
        </div>
      </main>
      <footer className="case-footer">
        <a className="case-foot-item" href={`/projects/${prev.slug}`} data-cursor="Prev">
          <span>← Previous project</span>
          <strong>{prev.name}</strong>
        </a>
        <a className="case-foot-item case-foot-next" href={`/projects/${next.slug}`} data-cursor="Next">
          <span>Next project →</span>
          <strong>{next.name}</strong>
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
