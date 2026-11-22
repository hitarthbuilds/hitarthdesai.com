"use client";

import { Fragment, useEffect, useRef } from "react";

// Hitarth's own positioning line; words marked * are drawn in outline once lit.
const TEXT = "I build the layer that makes LLMs *reliable* in production. From models that demo well to systems that survive *real* *traffic.*";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * A large statement pinned to the screen. Scrolling lights its words one by one, then dives through
 * the lettering into white paper, which is where the selected-work plate begins. Without the pin
 * (reduced motion, phones that fall back) the words light as the statement passes instead.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const words = TEXT.split(" ").map((w) => ({ text: w.replace(/\*/g, ""), accent: w.startsWith("*") }));

  useEffect(() => {
    const section = ref.current!;
    const root = document.documentElement;
    const text = section.querySelector<HTMLElement>(".mf-text")!;
    const spans = [...section.querySelectorAll<HTMLElement>(".mf-word")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let lit = -1;
    let queued = false;

    // The dive aims at the gap after "reliable", so the camera passes between letters.
    const aim = () => {
      const target = spans.find((s) => s.classList.contains("mf-accent")) ?? spans[0];
      const x = target.offsetLeft + target.offsetWidth + 8;
      const y = target.offsetTop + target.offsetHeight * 0.5;
      text.style.transformOrigin = `${x}px ${y}px`;
    };

    const update = () => {
      queued = false;
      const r = section.getBoundingClientRect();
      const vh = innerHeight;
      const pinned = root.classList.contains("scrub") && !root.classList.contains("reveal-fallback") && !reduced.matches;
      let p: number;
      if (pinned) {
        const run = clamp(-r.top / Math.max(1, r.height - vh));
        p = clamp(run / 0.5);
        const d = smooth(clamp((run - 0.58) / 0.42));
        section.style.setProperty("--d", d.toFixed(4));
      } else {
        section.style.removeProperty("--d");
        p = reduced.matches ? 1 : clamp((vh * 0.78 - r.top) / (r.height * 0.82));
      }
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
    const onResize = () => {
      aim();
      request();
    };
    aim();
    update();
    document.fonts?.ready.then(onResize);
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", onResize, { passive: true });
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="manifesto" ref={ref} aria-label="What I do">
      <div className="mf-stage">
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
      </div>
    </section>
  );
}
