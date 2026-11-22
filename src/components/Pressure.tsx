"use client";

import { createElement, useEffect, useRef } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Display type set letter by letter. The letters rise in a stagger when the line scrolls into view
 * (through the shared word reveal), and around a fine pointer they lift and open into outlines,
 * the same answer the hero name gives. Screen readers get the plain text.
 */
export function Pressure({ text, className = "", tag = "p", id }: { text: string; className?: string; tag?: "p" | "h1" | "h2" | "span"; id?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const fine = matchMedia("(hover:hover) and (pointer:fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const letters = [...el.querySelectorAll<HTMLElement>(".pz-c")];
    const force = letters.map(() => 0);
    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      letters.forEach((l, i) => {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        const f = smooth(clamp(1 - d / Math.max(140, Math.min(r.height * 1.5, 320))));
        if (Math.abs(f - force[i]) > 0.015 || (f === 0 && force[i] !== 0)) {
          force[i] = f;
          l.style.setProperty("--f", f.toFixed(3));
        }
      });
    };
    const onMove = (e: PointerEvent) => {
      if (!fine.matches || reduced.matches || e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      force.fill(0);
      letters.forEach((l) => l.style.removeProperty("--f"));
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  let i = 0;
  return createElement(
    tag,
    { ref, id, className: `pz ${className}`.trim(), "data-reveal": "words" },
    <span className="sr-only">{text}</span>,
    <span className="pz-line" aria-hidden="true">
      {[...text].map((c, k) =>
        c === " " ? (
          <span key={k} className="pz-sp">
            {" "}
          </span>
        ) : (
          <span key={k} className="w">
            <span className="wi" style={{ "--i": i++ } as React.CSSProperties}>
              <span className="pz-c">{c}</span>
            </span>
          </span>
        ),
      )}
    </span>,
  );
}
