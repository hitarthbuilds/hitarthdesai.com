import { useEffect } from 'react';
import Lenis from 'lenis';

// Smooth scroll via Lenis, driven by a requestAnimationFrame loop.
// Disabled entirely when the user prefers reduced motion (native scroll instead).
export function useLenis(enabled) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [enabled]);
}
