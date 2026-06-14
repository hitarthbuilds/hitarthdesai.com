import { motion } from 'framer-motion';
import { hero, profileLinks } from '../data/content';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useDecodeText } from '../hooks/useDecodeText';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// A thin oscilloscope trace under the eyebrow — drawn on load, with a packet
// riding it. data-draw keeps it visible with JS off.
function Waveform({ reduced }) {
  const d = 'M0 20 H40 q6 0 9 -13 t9 13 9 0 9 -7 9 7 H110 q6 0 9 11 t9 -11 9 0 H320';
  return (
    <svg className="hero-wave" viewBox="0 0 320 40" width="320" height="40" aria-hidden="true">
      {reduced ? (
        <path id="heroWavePath" d={d} className="hero-wave-path" fill="none" />
      ) : (
        <motion.path
          id="heroWavePath"
          d={d}
          className="hero-wave-path"
          data-draw
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
        />
      )}
      {!reduced && (
        <circle r="3" className="hero-wave-dot">
          <animateMotion dur="5s" begin="1.6s" repeatCount="indefinite">
            <mpath href="#heroWavePath" xlinkHref="#heroWavePath" />
          </animateMotion>
        </circle>
      )}
    </svg>
  );
}

// 01 / Source — hero. Orchestrated load sequence; H1 stays the plain name for
// entity-SEO. The thesis decodes in from scrambled glyphs (renders final text in
// SSR / no-JS). Profile links carry rel="me".
export function Hero() {
  const reduced = usePrefersReducedMotion();
  const v = reduced ? undefined : item;
  const thesis = useDecodeText(hero.thesis, { enabled: !reduced });

  return (
    <section id="source" className="section hero">
      <motion.div
        className="section-inner"
        variants={reduced ? undefined : container}
        initial={reduced ? false : 'hidden'}
        animate={reduced ? undefined : 'show'}
      >
        <motion.p className="eyebrow" data-reveal variants={v}>
          {hero.eyebrow}
        </motion.p>
        <motion.div data-reveal variants={v}>
          <Waveform reduced={reduced} />
        </motion.div>
        <motion.h1 className="hero-name" data-reveal variants={v}>
          {hero.name}
        </motion.h1>
        <motion.p className="hero-thesis" data-reveal variants={v}>
          {thesis}
        </motion.p>
        <motion.p className="hero-sub" data-reveal variants={v}>
          {hero.sub}
        </motion.p>
        <motion.nav className="links" data-reveal variants={v} aria-label="Profiles">
          {profileLinks.map((l) => (
            <a key={l.label} rel="me" href={l.href} className="link">
              {l.label}
            </a>
          ))}
        </motion.nav>
      </motion.div>
    </section>
  );
}
