import { Mast } from "@/components/Mast";
import { Intro } from "@/components/Intro";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Pathways } from "@/components/Pathways";
import { Showcase } from "@/components/Showcase";
import { Practice } from "@/components/Practice";
import { Field } from "@/components/Field";
import { FieldNotes, type Note } from "@/components/FieldNotes";
import { AfterHours } from "@/components/AfterHours";
import { Contact } from "@/components/Contact";
import { FEATURED_NOTES } from "@/content/notes";
import { PROFILE } from "@/content/profile";
import { formatDate, getPost } from "@/lib/posts";
import "@/styles/home.css";
import "@/styles/lower.css";
import "@/styles/stage.css";
import "@/styles/showcase.css";
import "@/styles/practice.css";

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

        <Pathways />

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
