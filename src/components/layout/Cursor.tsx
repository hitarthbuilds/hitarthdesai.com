"use client";

import { useEffect, useRef } from "react";
import { gsap, isTouch, prefersReduced } from "@/lib/gsap";

/**
 * A chrome ring (difference-blended) plus a forge-orange guitar pick, with a label pill over
 * [data-cursor="…"] elements. The native cursor stays visible: this is decoration only.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const pillText = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isTouch() || prefersReduced() || !ring.current || !dot.current || !pill.current) return;
    const r = ring.current, d = dot.current, p = pill.current;
    gsap.set([r, d, p], { xPercent: -50, yPercent: -50, opacity: 0 });
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: 0.08 });
    const dy = gsap.quickTo(d, "y", { duration: 0.08 });
    const px = gsap.quickTo(p, "x", { duration: 0.35, ease: "power3" });
    const py = gsap.quickTo(p, "y", { duration: 0.35, ease: "power3" });
    let shown = false;
    let mode = "";

    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.to([r, d], { opacity: 1, duration: 0.3 });
        shown = true;
      }
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); px(e.clientX + 18); py(e.clientY + 18);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const interactive = t.closest("a,button,[role=button],summary");
      const field = t.closest("input,textarea,select");
      const next = labelled ? "label" : field ? "field" : interactive ? "link" : "";
      if (next === mode && !labelled) return;
      mode = next;
      if (labelled && pillText.current) {
        pillText.current.textContent = labelled.dataset.cursor ?? "";
        gsap.to(p, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" });
      } else gsap.to(p, { opacity: 0, scale: 0.6, duration: 0.2 });
      gsap.to(r, { scale: next === "link" || next === "label" ? 1.9 : next === "field" ? 0.55 : 1, duration: 0.45, ease: "power3.out" });
    };
    const down = () => gsap.to(r, { scale: "-=0.25", duration: 0.15 });
    const up = () => gsap.to(r, { scale: mode === "link" || mode === "label" ? 1.9 : 1, duration: 0.4, ease: "elastic.out(1,0.5)" });
    const leave = () => {
      gsap.to([r, d, p], { opacity: 0, duration: 0.25 });
      shown = false;
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] hidden md:block">
      <div ref={ring} className="fixed left-0 top-0 h-9 w-9 rounded-full border-[1.5px] border-[#e9edf2]/80 mix-blend-difference" />
      <div ref={dot} className="fixed left-0 top-0 h-3.5 w-3 drop-shadow-[0_0_6px_rgba(255,106,26,.7)]">
        {/* Guitar pick */}
        <svg viewBox="0 0 24 28" className="h-full w-full -rotate-[18deg]">
          <path d="M12 1C18.5 1 23 3.2 23 8.3 23 15 15.6 23.8 12 27 8.4 23.8 1 15 1 8.3 1 3.2 5.5 1 12 1Z" fill="#ff6a1a" />
          <path d="M6 5.5C8 4.6 10 4.3 12 4.3" stroke="#ffd2a8" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".8" />
        </svg>
      </div>
      <div ref={pill} className="fixed left-0 top-0 rounded-full bg-forge px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-void">
        <span ref={pillText} />
      </div>
    </div>
  );
}
