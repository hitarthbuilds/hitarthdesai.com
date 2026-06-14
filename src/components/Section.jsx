import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// A scroll section: mono eyebrow + a whileInView fade-up stagger over its children.
// Every animated element carries data-reveal so the no-JS CSS fallback keeps it
// visible when JavaScript never runs. Reduced motion renders fully shown, no animation.
export function Section({ id, eyebrow, children }) {
  const reduced = usePrefersReducedMotion();

  return (
    <section id={id} className="section">
      <motion.div
        className="section-inner"
        variants={reduced ? undefined : container}
        initial={reduced ? false : 'hidden'}
        whileInView={reduced ? undefined : 'show'}
        viewport={{ once: true, margin: '-12%' }}
      >
        <motion.p
          className="eyebrow"
          data-reveal
          variants={reduced ? undefined : item}
        >
          {eyebrow}
        </motion.p>
        {children}
      </motion.div>
    </section>
  );
}

// A single fade-up child for use inside <Section>.
export function Reveal({ as = 'div', className, children, ...rest }) {
  const reduced = usePrefersReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      data-reveal
      variants={reduced ? undefined : item}
      {...rest}
    >
      {children}
    </Comp>
  );
}
