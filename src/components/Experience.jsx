import { Section, Reveal } from './Section';
import { experience } from '../data/content';

// 05 / Trace — career timeline. Honest labels (Now / Previously / Earlier /
// Education), no invented date ranges.
export function Experience() {
  return (
    <Section id="trace" eyebrow={experience.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {experience.heading}
      </Reveal>
      <ol className="timeline">
        {experience.roles.map((r) => (
          <Reveal as="li" key={r.role + r.org} className="tl-item">
            <span className="tl-when">{r.when}</span>
            <div className="tl-body">
              <h3 className="tl-role">
                {r.role} <span className="tl-org">· {r.org}</span>
              </h3>
              <p className="tl-detail">{r.detail}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
