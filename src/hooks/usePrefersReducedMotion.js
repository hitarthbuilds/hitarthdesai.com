import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// SSR-safe: defaults to false (full motion) during prerender, then syncs to the
// real media query on the client. Used to gate Lenis and the pipeline animation.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
