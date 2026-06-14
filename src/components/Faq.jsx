import { Section, Reveal } from './Section';
import { faq } from '../data/content';

// 06 / Query — FAQ. Native <details> (works without JS, accessible) so answer
// text is always in the DOM for crawlers / answer engines. Emits FAQPage JSON-LD
// from the SAME data (single source) — prerendered into static HTML by SSG.
const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.items.map((it) => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
};

export function Faq() {
  return (
    <Section id="query" eyebrow={faq.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {faq.heading}
      </Reveal>
      <div className="faq-list">
        {faq.items.map((it, i) => (
          <Reveal key={it.q} className="faq-item">
            <details open={i === 0}>
              <summary className="faq-q">
                <span className="faq-marker" aria-hidden="true">?</span>
                {it.q}
              </summary>
              <p className="faq-a">{it.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </Section>
  );
}
