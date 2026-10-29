"use client";

import { useRef } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import { amp } from "@/lib/amp";

/** IPF competition plates, heaviest first: 25 red, 25 red, 20 blue, 15 yellow, 10 green. */
const PLATES = [
  { c: "#d9142b", h: 210 },
  { c: "#d9142b", h: 210 },
  { c: "#1f5fd1", h: 210 },
  { c: "#e8b923", h: 180 },
  { c: "#2f9e44", h: 150 },
];
const W = 24;

/** A barbell that loads itself as you scroll: plates slide on, then the bar lifts, whips and settles. */
export function Barbell() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const bar = root.current!.querySelector<SVGPathElement>("[data-bar]")!;
      const bend = { b: 0 };
      const draw = () => bar.setAttribute("d", `M40 ${130 + bend.b} Q500 ${130 - bend.b * 0.6} 960 ${130 + bend.b}`);
      if (prefersReduced()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 80%", end: "center 35%", scrub: 1 } });
      PLATES.forEach((_, i) => {
        tl.fromTo(q(`[data-plate="L${i}"]`), { x: -420, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, i * 0.35).fromTo(
          q(`[data-plate="R${i}"]`),
          { x: 420, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", onComplete: () => amp.pluck(55, { velocity: 0.5, mute: true }) },
          "<",
        );
      });
      tl.to(q("[data-lift]"), { y: -46, duration: 0.6, ease: "power2.out" }, ">0.1")
        .to(bend, { b: 16, duration: 0.25, ease: "power2.out", onUpdate: draw }, "<")
        .to(q("[data-ends]"), { y: 16, duration: 0.25, ease: "power2.out" }, "<")
        .to(bend, { b: 0, duration: 0.8, ease: "elastic.out(1.2,0.3)", onUpdate: draw })
        .to(q("[data-ends]"), { y: 0, duration: 0.8, ease: "elastic.out(1.2,0.3)" }, "<")
        .fromTo(q("[data-pr]"), { scale: 2, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: -8, duration: 0.3, ease: "back.out(3)" }, "<0.1");
    },
    { scope: root },
  );

  const side = (left: boolean) =>
    PLATES.map((p, i) => {
      const x = left ? 200 - 8 - (i + 1) * (W + 3) : 800 + 8 + i * (W + 3);
      return (
        <g key={`${left ? "L" : "R"}${i}`} data-plate={`${left ? "L" : "R"}${i}`}>
          <rect x={x} y={130 - p.h / 2} width={W} height={p.h} rx="5" fill={p.c} />
          <rect x={x + 3} y={130 - p.h / 2 + 6} width="3" height={p.h - 12} rx="1.5" fill="rgba(255,255,255,.25)" />
          <rect x={x} y={130 - p.h / 2} width={W} height={p.h} rx="5" fill="url(#plate-shade)" />
        </g>
      );
    });

  return (
    <div ref={root} className="relative">
      <svg viewBox="0 0 1000 300" className="w-full" role="img" aria-label="A barbell loaded with competition plates">
        <defs>
          <linearGradient id="bar-chrome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fdfdfd" />
            <stop offset=".45" stopColor="#8b929c" />
            <stop offset=".55" stopColor="#5c636d" />
            <stop offset="1" stopColor="#e9edf2" />
          </linearGradient>
          <linearGradient id="plate-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(0,0,0,.35)" />
            <stop offset=".4" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(0,0,0,.45)" />
          </linearGradient>
        </defs>
        <ellipse cx="500" cy="282" rx="430" ry="8" fill="rgba(0,0,0,.6)" />
        <g data-lift>
          <path data-bar d="M40 130 Q500 130 960 130" stroke="url(#bar-chrome)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <g data-ends>
            <rect x="40" y="121" width="160" height="18" rx="4" fill="url(#bar-chrome)" />
            <rect x="800" y="121" width="160" height="18" rx="4" fill="url(#bar-chrome)" />
            <rect x="192" y="112" width="10" height="36" rx="2" fill="#6a717c" />
            <rect x="798" y="112" width="10" height="36" rx="2" fill="#6a717c" />
            {side(true)}
            {side(false)}
          </g>
          {/* Knurling marks */}
          {[380, 620].map((x) => (
            <rect key={x} x={x - 40} y="126" width="80" height="8" fill="url(#knurl)" opacity=".5" />
          ))}
        </g>
        <pattern id="knurl" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4L4 0" stroke="#2a2e35" strokeWidth="1" />
        </pattern>
      </svg>
      <span data-pr className="seal absolute right-[6%] top-0 !text-[22px] opacity-0 sm:!text-[30px]" aria-hidden>
        Lockout ✓
      </span>
    </div>
  );
}
