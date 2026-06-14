import { Section, Reveal } from './Section';
import { stack } from '../data/content';

// 04 / Stack — the tools, grouped. Real stack from the GitHub README.
export function Stack() {
  return (
    <Section id="stack" eyebrow={stack.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {stack.heading}
      </Reveal>
      <dl className="stack-list">
        {stack.groups.map((g) => (
          <Reveal key={g.label} className="stack-row">
            <dt className="stack-label">{g.label}</dt>
            <dd className="stack-items">
              {g.items.map((it) => (
                <span key={it} className="stack-chip">
                  {it}
                </span>
              ))}
            </dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
