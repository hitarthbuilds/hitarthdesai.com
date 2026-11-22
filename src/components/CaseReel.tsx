"use client";

import { useEffect, useRef } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The project's picture, opened up by scrolling: it starts as an inset card under the title and
 * widens to fill the screen before the notes begin. Phones and reduced motion get a plain figure.
 */
export function CaseReel({ src, alt, shot }: { src: string; alt: string; shot: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current!;
    const root = document.documentElement;
    const wide = matchMedia("(min-width:761px) and (min-height:560px)");
    let queued = false;
    const update = () => {
      queued = false;
      const pinned = root.classList.contains("scrub") && !root.classList.contains("reveal-fallback") && wide.matches;
      if (!pinned) {
        section.style.removeProperty("--e");
        return;
      }
      const r = section.getBoundingClientRect();
      const t = clamp(-r.top / Math.max(1, (r.height - innerHeight) * 0.8));
      section.style.setProperty("--e", (t * t * (3 - 2 * t)).toFixed(4));
    };
    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request, { passive: true });
    wide.addEventListener("change", request);
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      wide.removeEventListener("change", request);
    };
  }, []);

  return (
    <section className={`case-reel${shot ? " case-reel--shot" : ""}`} ref={ref} aria-label="Project image">
      <div className="case-reel-stage">
        <figure className="case-frame">
          <img src={src} alt={alt} width={shot ? 2000 : 1380} height={shot ? 1250 : 920} fetchPriority="high" />
        </figure>
      </div>
    </section>
  );
}
