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
 * Site-wide motion: inertia scrolling (Lenis), scroll-triggered reveals for anything marked
 * data-reveal, and a slight lean with scroll speed for anything marked data-skew. All of it stands
 * down when the visitor prefers reduced motion.
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
    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    targets.forEach((t) => {
      const parent = t.dataset.reveal === "clip" ? t.parentElement : null;
      if (!parent) return io.observe(t);
      proxied.set(parent, [...(proxied.get(parent) ?? []), t]);
      io.observe(parent);
    });
    // The last lines of a page can sit inside the bottom margin even at full scroll, so once the
    // page reaches its end, anything still waiting on screen is revealed too.
    const atEnd = () => {
      if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
      targets.forEach((t) => {
        if (!t.classList.contains("is-in") && t.getBoundingClientRect().top < innerHeight) t.classList.add("is-in");
      });
    };
    addEventListener("scroll", atEnd, { passive: true });
    requestAnimationFrame(atEnd);

    // Long lists lean a little with the speed of the scroll and straighten as it settles.
    const leaning = [...document.querySelectorAll<HTMLElement>("[data-skew]")];
    let skew = 0;
    let shown = 0;
    const lean = () => {
      if (!leaning.length) return;
      const target = Math.max(-1.8, Math.min(1.8, (lenis?.velocity ?? 0) * -0.045));
      skew += (target - skew) * 0.12;
      if (Math.abs(skew) < 0.01 && target === 0) skew = 0;
      if (Math.abs(skew - shown) < 0.004 && skew !== 0) return;
      if (skew === shown) return;
      shown = skew;
      leaning.forEach((el) => (el.style.transform = skew ? `skewY(${skew.toFixed(3)}deg)` : ""));
    };

    let lenis: Lenis | undefined;
    let frame = 0;
    const start = () => {
      if (reduced.matches || lenis) return;
      lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: 0 }, autoRaf: false });
      window.__lenis = lenis;
      const raf = (t: number) => {
        lenis?.raf(t);
        lean();
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      skew = shown = 0;
      leaning.forEach((el) => (el.style.transform = ""));
      lenis?.destroy();
      lenis = undefined;
      window.__lenis = undefined;
    };
    const onPref = () => (reduced.matches ? stop() : start());
    start();
    reduced.addEventListener("change", onPref);
    return () => {
      io.disconnect();
      removeEventListener("scroll", atEnd);
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
