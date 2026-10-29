"use client";

import { useRef } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import { amp, OPEN_STRINGS } from "@/lib/amp";

/** SVG coordinates computed with floats print differently on server and client: round them. */
const r2 = (n: number) => Math.round(n * 100) / 100;

/** y position of each string at the bridge (x=250) and nut (x=930), high e first. */
const STRINGS = Array.from({ length: 6 }, (_, i) => ({ bridge: r2(154 + i * 8.6), nut: r2(162 + i * 4.6), gauge: r2(0.9 + i * 0.35) }));

/**
 * A six-string superstrat, drawn from scratch (no brand marks). Drag across the strings to
 * strum: each string wobbles and, with the AMP on, rings through the high-gain rig.
 */
export function Guitar() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const strings = gsap.utils.toArray<SVGPathElement>("[data-gstring]", root.current);
      const last = new Map<number, number>();
      const pluck = contextSafe!((i: number) => {
        const now = performance.now();
        if (now - (last.get(i) ?? 0) < 90) return;
        last.set(i, now);
        amp.pluck(OPEN_STRINGS[5 - i] * Math.pow(2, 7 / 12), { velocity: 0.9 });
        if (prefersReduced()) return;
        const s = STRINGS[i];
        const o = { a: 0 };
        gsap.fromTo(
          o,
          { a: 0 },
          {
            keyframes: { a: [7, -6, 5, -4, 3, -2, 1, 0] },
            duration: 0.6,
            ease: "none",
            onUpdate: () => strings[i].setAttribute("d", `M250 ${s.bridge} Q590 ${(s.bridge + s.nut) / 2 + o.a} 930 ${s.nut}`),
          },
        );
        gsap.fromTo(strings[i], { stroke: "#ffb547" }, { stroke: "#d6dbe2", duration: 0.8 });
      });
      const hits = gsap.utils.toArray<SVGPathElement>("[data-ghit]", root.current);
      const handlers = hits.map((h, i) => {
        const fn = () => pluck(i);
        h.addEventListener("pointerenter", fn);
        h.addEventListener("pointerdown", fn);
        return [h, fn] as const;
      });
      return () => handlers.forEach(([h, fn]) => (h.removeEventListener("pointerenter", fn), h.removeEventListener("pointerdown", fn)));
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      <svg viewBox="0 0 1000 340" className="w-full touch-pan-y" role="img" aria-label="A black six-string electric guitar. Hover or drag across the strings to strum.">
        <defs>
          <linearGradient id="g-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2e35" />
            <stop offset=".5" stopColor="#0d0e10" />
            <stop offset="1" stopColor="#1a1c20" />
          </linearGradient>
          <linearGradient id="g-bind" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9edf2" />
            <stop offset="1" stopColor="#6a717c" />
          </linearGradient>
        </defs>
        {/* Body: double cutaway with sharp horns */}
        <path
          d="M40 190 C30 110 90 70 160 92 C200 104 225 96 250 70 C270 50 320 46 352 58 C330 80 318 108 330 138 L420 150 L420 196 L330 206 C318 238 332 262 352 284 C318 296 268 290 246 268 C222 246 196 240 160 252 C92 274 34 262 40 190 Z"
          fill="url(#g-body)"
          stroke="url(#g-bind)"
          strokeWidth="2.5"
        />
        {/* Neck and fretboard */}
        <path d="M330 152 L930 160 L930 186 L330 196 Z" fill="#0f1012" stroke="#2a2e35" />
        {Array.from({ length: 22 }, (_, k) => r2(930 - 834 * (1 - Math.pow(2, -(k + 1) / 12)))).map((x) => (
          <line key={x} x1={x} y1={r2(152 + ((x - 330) * 8) / 600)} x2={x} y2={r2(196 - ((x - 330) * 10) / 600)} stroke="#6a717c" strokeWidth="1.4" />
        ))}
        {/* Headstock: pointed six-in-line */}
        <path d="M928 156 L990 128 L996 140 L948 196 L928 190 Z" fill="url(#g-body)" stroke="url(#g-bind)" strokeWidth="2" />
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={r2(942 + i * 8.5)} cy={r2(152 - i * 3.8)} r="3" fill="#b9c0ca" />
        ))}
        {/* Pickups, bridge, knobs */}
        <rect x="262" y="148" width="26" height="52" rx="4" fill="#08090b" stroke="#3a3f47" />
        <rect x="300" y="148" width="26" height="52" rx="4" fill="#08090b" stroke="#3a3f47" />
        <rect x="222" y="150" width="16" height="50" rx="3" fill="#6a717c" />
        {[[120, 228], [150, 240], [100, 200]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="8" fill="#1a1c20" stroke="#6a717c" />
        ))}
        {/* Strings and their (wider, invisible) hit areas */}
        {STRINGS.map((s, i) => (
          <g key={i}>
            <path data-gstring d={`M250 ${s.bridge} Q590 ${(s.bridge + s.nut) / 2} 930 ${s.nut}`} stroke="#d6dbe2" strokeWidth={s.gauge} fill="none" />
            <path data-ghit d={`M250 ${s.bridge} L930 ${s.nut}`} stroke="transparent" strokeWidth="9" fill="none" className="cursor-pointer" />
          </g>
        ))}
      </svg>
    </div>
  );
}
