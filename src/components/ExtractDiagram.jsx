import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// A bespoke schematic of the actual work: unstructured text → [extract] →
// validated structured output. Real SVG, drawn on scroll-in. Decorative
// (aria-hidden) — the prose above already states this; the paths carry data-draw
// so the no-JS fallback shows them fully drawn.
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.9, delay: 0.2 + i * 0.15, ease: 'easeInOut' }, opacity: { duration: 0.2, delay: 0.2 + i * 0.15 } },
  }),
};
const pop = {
  hidden: { opacity: 0, x: 8 },
  show: (i = 0) => ({ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.7 + i * 0.12 } }),
};

const ROWS = [
  { k: 'invoice_no', v: '"INV-2207"' },
  { k: 'total', v: '4820.00' },
  { k: 'currency', v: '"USD"' },
  { k: 'valid', v: 'true' },
];

export function ExtractDiagram() {
  const reduced = usePrefersReducedMotion();
  const anim = reduced
    ? { initial: false }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-15%' } };

  return (
    <div className="extract-diagram" aria-hidden="true">
      <motion.svg viewBox="0 0 680 240" width="100%" {...anim}>
        {/* ── Source: unstructured document ── */}
        <rect x="8" y="40" width="180" height="160" rx="6" className="d-panel" />
        <text x="20" y="30" className="d-label">RAW&nbsp;TEXT</text>
        {[70, 92, 114, 136, 158, 180].map((y, i) => (
          <motion.line
            key={y}
            x1="28" y1={y} x2={i % 2 ? 150 : 168} y2={y}
            className="d-textline"
            variants={reduced ? undefined : pop}
            custom={i}
          />
        ))}
        {/* scan sweep */}
        {!reduced && (
          <motion.line
            x1="20" x2="176" y1="40" y2="40"
            className="d-scan"
            animate={{ y1: [48, 192, 48], y2: [48, 192, 48] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          />
        )}

        {/* ── extract node ── */}
        <motion.path d="M188 120 H300" className="d-wire" fill="none" variants={reduced ? undefined : draw} custom={0} data-draw />
        <circle cx="340" cy="120" r="40" className="d-core" />
        <circle cx="340" cy="120" r="40" className="d-core-ring" fill="none" />
        <text x="340" y="116" className="d-core-label" textAnchor="middle">extract</text>
        <text x="340" y="132" className="d-core-sub" textAnchor="middle">schema·msgspec</text>
        <motion.path d="M380 120 H492" className="d-wire" fill="none" variants={reduced ? undefined : draw} custom={1} data-draw />

        {/* ── Structured output ── */}
        <rect x="492" y="40" width="180" height="160" rx="6" className="d-panel d-panel-out" />
        <text x="504" y="30" className="d-label d-label-out">STRUCTURED</text>
        <text x="508" y="66" className="d-brace">{'{'}</text>
        {ROWS.map((r, i) => (
          <motion.g key={r.k} variants={reduced ? undefined : pop} custom={i + 1}>
            <text x="524" y={92 + i * 26} className="d-key">{r.k}</text>
            <text x="600" y={92 + i * 26} className="d-val">{r.v}</text>
            <path d={`M646 ${88 + i * 26} l4 4 l7 -9`} className="d-check" fill="none" />
          </motion.g>
        ))}
        <text x="508" y={92 + ROWS.length * 26} className="d-brace">{'}'}</text>
      </motion.svg>
    </div>
  );
}
