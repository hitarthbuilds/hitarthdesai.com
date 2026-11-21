"use client";

import { Fragment, useEffect, useRef } from "react";

// Hitarth's own positioning line; words marked * are drawn in outline once lit.
const TEXT = "I build the layer that makes LLMs *reliable* in production. From models that demo well to systems that survive *real* *traffic.*";

/** A large statement whose words light up one by one as it scrolls through the viewport. */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const words = TEXT.split(" ").map((w) => ({ text: w.replace(/\*/g, ""), accent: w.startsWith("*") }));

  useEffect(() => {
    const section = ref.current!;
    const spans = [...section.querySelectorAll<HTMLElement>(".mf-word")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let lit = -1;
    let queued = false;
    const update = () => {
      queued = false;
      const r = section.getBoundingClientRect();
      const vh = innerHeight;
      const p = reduced.matches ? 1 : Math.min(1, Math.max(0, (vh * 0.78 - r.top) / (r.height * 0.82)));
      const n = Math.round(p * spans.length);
      if (n === lit) return;
      lit = n;
      spans.forEach((s, i) => s.classList.toggle("on", i < n));
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
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
    };
  }, []);

  return (
    <section className="manifesto" ref={ref} aria-label="What I do">
      <p className="mf-kicker">
        <span>Hitarth Desai</span>
        <span>AI Systems Engineer</span>
      </p>
      <p className="mf-text">
        {words.map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className={`mf-word${w.accent ? " mf-accent" : ""}`}>{w.text}</span>
          </Fragment>
        ))}
      </p>
      <p className="mf-foot">
        <img src="/media/maker-mark.svg" width={40} height={40} alt="" />
        <span>InfraDock AI · Surat, India</span>
      </p>
    </section>
  );
}
