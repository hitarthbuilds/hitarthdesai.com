import { Mast } from "@/components/Mast";
import { Intro } from "@/components/Intro";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Showcase } from "@/components/Showcase";
import { Practice } from "@/components/Practice";
import { Field } from "@/components/Field";
import { FieldNotes, type Note } from "@/components/FieldNotes";
import { AfterHours } from "@/components/AfterHours";
import { Contact } from "@/components/Contact";
import { Words } from "@/components/Words";
import { FEATURED_NOTES } from "@/content/notes";
import { PROFILE } from "@/content/profile";
import { formatDate, getPost } from "@/lib/posts";
import "@/styles/home.css";
import "@/styles/lower.css";
import "@/styles/stage.css";
import "@/styles/showcase.css";
import "@/styles/practice.css";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default function Home() {
  const notes: Note[] = FEATURED_NOTES.flatMap((n) => {
    const post = getPost(n.slug);
    if (!post) return [];
    const { meta } = post;
    return [{ slug: n.slug, title: n.label, date: meta.date, dateLabel: formatDate(meta.date), readMinutes: meta.readMinutes, art: n.art, excerpt: meta.excerpt ?? meta.description }];
  });

  return (
    <>
      <Intro />
      <Mast />
      <main>
        <Hero />

        <nav id="paths" aria-label="Explore Hitarth's portfolio" className="pathways">
          <a className="path-card path-work" href="#work" data-cursor="Dive in">
            <img src="/media/split/machine.webp" alt="" width={1440} height={960} loading="lazy" />
            <span className="path-meta" aria-hidden="true">
              <b>01</b>
              <span>6 live sites · 10 projects</span>
            </span>
            <div className="path-text">
              <span data-reveal="up">Systems, products &amp; client work</span>
              <strong data-reveal="words">
                <Words text={"In the\nstudio."} />
              </strong>
            </div>
            <span className="path-go" aria-hidden="true">
              <span>↓</span>
            </span>
          </a>
          <a className="path-card path-life" href="#personal" data-cursor="Dive in">
            <img src="/media/portraits/stairwell.webp" alt="" width={1024} height={1280} loading="lazy" />
            <span className="path-meta" aria-hidden="true">
              <b>02</b>
              <span>Guitar · Powerlifting</span>
            </span>
            <div className="path-text">
              <span data-reveal="up">Guitar &amp; powerlifting</span>
              <strong data-reveal="words" style={delay(120)}>
                <Words text={"After\nhours."} />
              </strong>
            </div>
            <span className="path-go" aria-hidden="true">
              <span>↓</span>
            </span>
          </a>
        </nav>

        <Manifesto />
        <Showcase />

        <Practice />

        <Field />
        <FieldNotes notes={notes} />
        <AfterHours />
        <Contact />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: PROFILE.name,
            url: PROFILE.url,
            jobTitle: PROFILE.title,
            image: `${PROFILE.url}/media/hero-portrait.webp`,
            worksFor: { "@type": "Organization", name: "InfraDock AI" },
            alumniOf: { "@type": "CollegeOrUniversity", name: "Gujarat Technological University" },
            address: { "@type": "PostalAddress", addressLocality: PROFILE.location.city, addressRegion: PROFILE.location.region, addressCountry: PROFILE.location.countryCode },
            sameAs: PROFILE.sameAs,
            knowsAbout: ["AI systems engineering", "LLM structured outputs", "Document processing", "Data infrastructure", "Evaluation harnesses"],
          }),
        }}
      />
    </>
  );
}
