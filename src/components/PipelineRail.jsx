import { useScroll, useSpring, useTransform, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Fixed vertical schematic in the left gutter: one curved path threading 5 nodes,
// drawn as you scroll, with tick marks, igniting nodes (ember + halo), and data
// "packets" flowing down the path (declarative SMIL — works even without JS,
// hidden under reduced motion via CSS). Visible on mobile (slimmer). Reduced
// motion / no-JS → fully drawn, all nodes lit.
const VIEW_W = 60;
const VIEW_H = 1000;
const NODES = 9;

const nodeY = (i) => ((i + 0.5) / NODES) * VIEW_H;
const nodeX = (i) => (i % 2 === 0 ? 22 : 38);

const PATH_D = (() => {
  let d = `M ${nodeX(0)} ${nodeY(0)}`;
  for (let i = 1; i < NODES; i++) {
    const x0 = nodeX(i - 1);
    const y0 = nodeY(i - 1);
    const x1 = nodeX(i);
    const y1 = nodeY(i);
    const midY = (y0 + y1) / 2;
    d += ` C ${x0} ${midY}, ${x1} ${midY}, ${x1} ${y1}`;
  }
  return d;
})();

function Node({ index, scrollYProgress, reduced }) {
  const t = (index + 0.5) / NODES;
  const x = nodeX(index);
  const y = nodeY(index);
  const fill = useTransform(scrollYProgress, [t - 0.03, t], ['#23262C', '#E8743B']);
  const scale = useTransform(scrollYProgress, [t - 0.03, t], [1, 1.35]);
  const halo = useTransform(scrollYProgress, [t - 0.03, t], [0, 0.22]);
  const origin = `${x}px ${y}px`;

  if (reduced) {
    return (
      <>
        <circle cx={x} cy={y} r="14" fill="#E8743B" opacity="0.18" />
        <circle cx={x} cy={y} r="6" fill="#E8743B" />
      </>
    );
  }
  return (
    <>
      <motion.circle cx={x} cy={y} r="14" fill="#E8743B" style={{ opacity: halo, scale, transformOrigin: origin }} />
      <motion.circle className="rail-node" cx={x} cy={y} r="6" style={{ fill, scale, transformOrigin: origin }} />
    </>
  );
}

export function PipelineRail() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const pathLength = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div className="pipeline-rail" aria-hidden="true">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" width="100%" height="100%">
        {/* faint full track (also the motion path for packets) */}
        <path id="railPath" d={PATH_D} className="rail-track" fill="none" />

        {/* tick marks at each node */}
        {Array.from({ length: NODES }, (_, i) => {
          const x = nodeX(i);
          const y = nodeY(i);
          return <line key={`t${i}`} x1={x - 11} y1={y} x2={x - 6} y2={y} className="rail-tick" />;
        })}

        {/* scroll-drawn ember path */}
        {reduced ? (
          <path d={PATH_D} className="rail-draw" fill="none" />
        ) : (
          <motion.path d={PATH_D} className="rail-draw" data-draw fill="none" style={{ pathLength }} />
        )}

        {/* data packets flowing down the pipeline (SMIL — runs without JS) */}
        {!reduced &&
          [0, 1, 2].map((k) => (
            <circle key={`p${k}`} r="2.6" className="rail-packet">
              <animateMotion dur="4s" begin={`${k * 1.33}s`} repeatCount="indefinite" rotate="auto">
                <mpath href="#railPath" xlinkHref="#railPath" />
              </animateMotion>
            </circle>
          ))}

        {Array.from({ length: NODES }, (_, i) => (
          <Node key={i} index={i} scrollYProgress={scrollYProgress} reduced={reduced} />
        ))}
      </svg>
    </div>
  );
}
