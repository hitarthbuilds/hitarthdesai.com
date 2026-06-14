import { Section, Reveal } from './Section';
import { ProjectGlyph } from './ProjectGlyph';
import { structure } from '../data/content';
import stats from '../../data/stats.json';
import { useMagnetic } from '../hooks/useMagnetic';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Live metrics stay fetched into data/stats.json (scripts/fetch-stats.mjs) but are
// hidden from the cards for now — flip SHOW_METRICS to re-enable once they grow.
const SHOW_METRICS = false;

function Metrics({ name }) {
  const s = stats.projects?.[name];
  if (!s) return null;
  return (
    <span className="work-metrics">
      {s.downloadsLabel && <span className="work-stat">↓ {s.downloadsLabel}</span>}
      {s.version && <span className="work-stat">{s.version}</span>}
      {s.stars != null && <span className="work-stat">★ {s.stars}</span>}
    </span>
  );
}

function WorkCard({ project }) {
  const reduced = usePrefersReducedMotion();
  const ref = useMagnetic(!reduced, 0.12);
  const inner = (
    <>
      <span className="work-index">{project.idx}</span>
      <ProjectGlyph name={project.name} />
      <span className="work-name">{project.name}</span>
      <p className="work-blurb">{project.blurb}</p>
      {SHOW_METRICS && <Metrics name={project.name} />}
      {project.href && <span className="work-cta">pypi ↗</span>}
    </>
  );
  return (
    <Reveal className="work-card-wrap">
      {project.href ? (
        <a ref={ref} className="work-card" href={project.href}>
          {inner}
        </a>
      ) : (
        <div ref={ref} className="work-card">
          {inner}
        </div>
      )}
    </Reveal>
  );
}

// 03 / Structure — selected work. Honest one-liners, no invented metrics.
export function Structure() {
  return (
    <Section id="structure" eyebrow={structure.eyebrow}>
      <Reveal as="h2" className="section-heading">
        {structure.heading}
      </Reveal>
      <div className="work-grid">
        {structure.projects.map((p, i) => (
          <WorkCard key={p.name} project={{ ...p, idx: String(i + 1).padStart(2, '0') }} />
        ))}
      </div>
    </Section>
  );
}
