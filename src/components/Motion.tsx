"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
    __hdReady?: boolean;
  }
}

/**
 * Site-wide motion: inertia scrolling (Lenis) and scroll-triggered reveals for anything marked
 * data-reveal. Both stand down when the visitor prefers reduced motion.
 */
export function Motion() {
  useEffect(() => {
    window.__hdReady = true;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    // Reveals: mark elements once they enter the viewport. A clip reveal starts fully clipped, which
    // the observer counts as invisible, so those are watched through their parent instead.
    const proxied = new Map<Element, HTMLElement[]>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const group = proxied.get(e.target);
          if (group) group.forEach((t) => t.classList.add("is-in"));
          else e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((t) => {
      const parent = t.dataset.reveal === "clip" ? t.parentElement : null;
      if (!parent) return io.observe(t);
      proxied.set(parent, [...(proxied.get(parent) ?? []), t]);
      io.observe(parent);
    });

    let lenis: Lenis | undefined;
    let frame = 0;
    const start = () => {
      if (reduced.matches || lenis) return;
      lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: 0 }, autoRaf: false });
      window.__lenis = lenis;
      const raf = (t: number) => {
        lenis?.raf(t);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = undefined;
      window.__lenis = undefined;
    };
    const onPref = () => (reduced.matches ? stop() : start());
    start();
    reduced.addEventListener("change", onPref);
    return () => {
      io.disconnect();
      reduced.removeEventListener("change", onPref);
      stop();
    };
  }, []);
  return null;
}

/** Scrolls to an element through Lenis when it is running, otherwise natively. */
export function scrollToTarget(target: HTMLElement, immediate = false) {
  if (window.__lenis) window.__lenis.scrollTo(target, { immediate, duration: 1.2 });
  else target.scrollIntoView({ behavior: "auto" });
}
