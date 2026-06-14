import { Section, Reveal } from './Section';
import { ExtractDiagram } from './ExtractDiagram';
import { extract } from '../data/content';

// 02 / Extract — the "what I work on" thesis, with a schematic of the work.
export function Extract() {
  return (
    <Section id="extract" eyebrow={extract.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {extract.heading}
      </Reveal>
      <Reveal as="p" className="lead">
        {extract.lead}
      </Reveal>
      <Reveal>
        <ExtractDiagram />
      </Reveal>
      <ul className="point-list">
        {extract.points.map((p) => (
          <Reveal as="li" key={p.term} className="point">
            <span className="point-term">{p.term}</span>
            <span className="point-body"> — {p.body}</span>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
