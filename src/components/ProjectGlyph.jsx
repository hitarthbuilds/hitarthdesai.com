// Small bespoke geometric glyphs per project — drawn SVG, not icons/emoji.
// Stroked in the current color; the ember accent appears on hover (see CSS).
const G = {
  'confident-extract': (
    // funnel converging to a validated check — schema-constrained extraction
    <>
      <path d="M6 8 H34 L24 20 V32 L16 28 V20 Z" />
      <path d="M27 27 l3.5 3.5 L37 24" className="glyph-accent" />
    </>
  ),
  promptcrucible: (
    // multi-agent graph — nodes optimizing toward one
    <>
      <circle cx="9" cy="11" r="3" />
      <circle cx="9" cy="29" r="3" />
      <circle cx="31" cy="20" r="3.4" className="glyph-accent" />
      <path d="M12 12 L28 19 M12 28 L28 21" />
    </>
  ),
  'AnswerRank AI': (
    // ranked bars under a query lens
    <>
      <rect x="7" y="22" width="5" height="11" />
      <rect x="15" y="15" width="5" height="18" />
      <rect x="23" y="9" width="5" height="24" className="glyph-accent" />
      <circle cx="31" cy="10" r="4" />
      <path d="M34 13 L37 16" />
    </>
  ),
  'AutoDataset Lab': (
    // dataset grid with one cell profiled
    <>
      <rect x="7" y="7" width="26" height="26" rx="2" />
      <path d="M7 16 H33 M7 24 H33 M16 7 V33 M24 7 V33" />
      <rect x="16" y="16" width="8" height="8" className="glyph-accent glyph-fill" />
    </>
  ),
};

export function ProjectGlyph({ name }) {
  return (
    <svg className="project-glyph" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      {G[name] || null}
    </svg>
  );
}
