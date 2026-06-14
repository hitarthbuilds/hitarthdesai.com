import { useEffect } from 'react';
import Lenis from 'lenis';

// Smooth scroll via Lenis, driven by a requestAnimationFrame loop. Disabled
// entirely when the user prefers reduced motion (native scroll instead).
// The active instance is tracked module-side so route changes can reset scroll.
let active = null;

export function useLenis(enabled) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    active = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (active === lenis) active = null;
    };
  }, [enabled]);
}

// Reset scroll to top — used on client-side route changes.
export function scrollToTop() {
  if (active) active.scrollTo(0, { immediate: true });
  else if (typeof window !== 'undefined') window.scrollTo(0, 0);
}
