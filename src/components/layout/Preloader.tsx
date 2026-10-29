"use client";

import { useRef } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import { amp } from "@/lib/amp";

const STEPS = ["plugging in", "tuning down", "warming the tubes", "gain to eleven"];
/** The dial sweeps 270°, from 7 o'clock (0) to 5 o'clock (11). */
const SWEEP = 270;

export function signalPreloaderDone() {
  (window as unknown as { __plDone?: boolean }).__plDone = true;
  window.dispatchEvent(new Event("pl:done"));
}

/** Runs `cb` once the preloader has struck (immediately if it was skipped this session). */
export function onPreloaderDone(cb: () => void) {
  const w = window as unknown as { __plDone?: boolean };
  if (w.__plDone || document.documentElement.dataset.pl) {
    cb();
    return () => {};
  }
  window.addEventListener("pl:done", cb, { once: true });
  return () => window.removeEventListener("pl:done", cb);
}

/** A burst of forge sparks with gravity, drawn on its own canvas until they burn out. */
function sparks(canvas: HTMLCanvasElement, ox: number, oy: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const ps = Array.from({ length: 110 }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.7;
    const v = 4 + Math.random() * 13;
    return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 30 + Math.random() * 40 };
  });
  const frame = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const p of ps) {
      if (p.life++ > p.max) continue;
      alive++;
      const px = p.x, py = p.y;
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      const k = 1 - p.life / p.max;
      ctx.strokeStyle = k > 0.6 ? `rgba(255,240,215,${k})` : k > 0.3 ? `rgba(255,181,71,${k})` : `rgba(255,106,26,${k})`;
      ctx.lineWidth = 1.6 * k + 0.4;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  };
  requestAnimationFrame(frame);
}

/** A chicken-head amp knob with a 0–11 scale. */
function Knob() {
  return (
    <svg viewBox="0 0 120 120" className="h-[22vw] w-[22vw] max-h-[260px] max-w-[260px] sm:h-[16vw] sm:w-[16vw]" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((-SWEEP / 2 + (SWEEP / 11) * i - 90) * Math.PI) / 180;
        return (
          <g key={i}>
            <line x1={60 + Math.cos(a) * 46} y1={60 + Math.sin(a) * 46} x2={60 + Math.cos(a) * 52} y2={60 + Math.sin(a) * 52} stroke={i === 11 ? "#ff6a1a" : "#6a717c"} strokeWidth={i === 11 ? 2.4 : 1.4} />
            <text x={60 + Math.cos(a) * 58} y={60 + Math.sin(a) * 58 + 2.5} textAnchor="middle" className="font-mono" fontSize="7" fill={i === 11 ? "#ff6a1a" : "#6a717c"}>
              {i}
            </text>
          </g>
        );
      })}
      <circle cx="60" cy="60" r="38" fill="url(#knob-body)" stroke="#2a2e35" />
      <circle cx="60" cy="60" r="30" fill="url(#knob-cap)" />
      <g data-knob transform={`rotate(${-SWEEP / 2} 60 60)`}>
        <path d="M60 18 L66 58 A6 6 0 0 1 54 58 Z" fill="#e9edf2" />
        <line x1="60" y1="22" x2="60" y2="40" stroke="#ff6a1a" strokeWidth="2" strokeLinecap="round" />
      </g>
      <defs>
        <radialGradient id="knob-body" cx="40%" cy="35%">
          <stop offset="0" stopColor="#2a2e35" />
          <stop offset="1" stopColor="#0c0d10" />
        </radialGradient>
        <radialGradient id="knob-cap" cx="38%" cy="30%">
          <stop offset="0" stopColor="#9aa1ab" />
          <stop offset=".5" stopColor="#3a3f47" />
          <stop offset="1" stopColor="#14161a" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function Face() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">Volume</div>
      <div className="mt-2 flex items-end justify-between gap-6">
        <div data-count className="display tabular chrome-text text-[40vw] leading-[0.8] sm:text-[30vw]">
          00
        </div>
        <Knob />
      </div>
      <div className="mt-6 flex items-end justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
        <div className="h-[1.3em] overflow-hidden">
          <div data-line>
            {STEPS.map((s) => (
              <div key={s} className="h-[1.3em]">
                {s}…
              </div>
            ))}
          </div>
        </div>
        <span>Hitarth Desai · AI Systems Engineer</span>
      </div>
      <div className="mt-4 h-[2px] w-full bg-steel-3">
        <div data-bar className="h-full origin-left bg-gradient-to-r from-forge via-ember to-blood shadow-[0_0_12px_var(--forge)]" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}

/**
 * First visit per session: the amp's volume dial climbs 00 → 11, a power-chord hit shakes
 * the stage and strobes, the low E string across the seam rings out and snaps, and the
 * screen splits along it.
 * An inline <head> script sets html[data-pl] on repeat visits, which hides this via CSS.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (document.documentElement.dataset.pl) {
        signalPreloaderDone();
        return;
      }
      try {
        sessionStorage.setItem("pl", "1");
      } catch {}
      const el = root.current!;
      const halves = el.querySelectorAll<HTMLElement>("[data-half]");
      const counters = el.querySelectorAll<HTMLElement>("[data-count]");
      const spark = el.querySelector<HTMLCanvasElement>("canvas")!;
      const reduced = prefersReduced();
      const o = { n: 0 };
      const dur = reduced ? 0.6 : 2.3;
      const done = () => void gsap.set(el, { display: "none" });

      const tl = gsap.timeline({ onComplete: done });
      tl.to(o, { n: 11, duration: dur, ease: "power2.inOut", onUpdate: () => counters.forEach((c) => (c.textContent = String(Math.round(o.n)).padStart(2, "0"))) })
        .fromTo(el.querySelectorAll("[data-knob]"), { rotation: -SWEEP / 2, svgOrigin: "60 60" }, { rotation: SWEEP / 2, svgOrigin: "60 60", duration: dur, ease: "power2.inOut" }, 0)
        .to(el.querySelectorAll("[data-bar]"), { scaleX: 1, duration: dur, ease: "power2.inOut" }, 0)
        .to(el.querySelectorAll("[data-line]"), { yPercent: -100 * (STEPS.length - 1) / STEPS.length, duration: dur * 0.9, ease: `steps(${STEPS.length - 1})` }, 0);

      if (reduced) {
        tl.to(el, { opacity: 0, duration: 0.4, onStart: signalPreloaderDone });
        return;
      }

      // The low E across the seam rings out, then snaps at the 12th fret.
      const [left, right] = el.querySelectorAll<SVGPathElement>("[data-string] path");
      const wave = { a: 0 };
      const bend = () => {
        left.setAttribute("d", `M0 50 Q250 ${50 + wave.a} 500 ${50 + wave.a}`);
        right.setAttribute("d", `M500 ${50 + wave.a} Q750 ${50 + wave.a} 1000 50`);
      };

      // Power-chord hit: a 120ms jitter, a strobe, sparks, the string rings and snaps, the
      // plate splits.
      tl.add(() => {
        sparks(spark, innerWidth / 2, innerHeight / 2);
        amp.power(82.41, 1);
      }, "+=0.08")
        .to(halves, { keyframes: { x: [0, -12, 9, -7, 5, 0], y: [0, 7, -8, 5, -3, 0] }, duration: 0.12, ease: "none" }, "<")
        .fromTo(el.querySelector("[data-strobe]"), { opacity: 0.85 }, { opacity: 0, duration: 0.35, ease: "power2.out" }, "<")
        .to(wave, { keyframes: { a: [0, 22, -19, 15, -12, 9, -6, 4, 0] }, duration: 0.42, ease: "none", onUpdate: bend }, "<")
        .add(() => sparks(spark, innerWidth / 2, innerHeight / 2))
        .to(left.parentElement, { rotation: -9, svgOrigin: "0 50", opacity: 0, duration: 0.7, ease: "power3.out" })
        .to(right.parentElement, { rotation: 9, svgOrigin: "1000 50", opacity: 0, duration: 0.7, ease: "power3.out" }, "<")
        .to(halves[0], { yPercent: -100, xPercent: -3, duration: 1, ease: "hop" }, "<0.05")
        .to(halves[1], { yPercent: 100, xPercent: 3, duration: 1, ease: "hop" }, "<")
        .add(signalPreloaderDone, "<0.25");
    },
    { scope: root },
  );

  return (
    <div ref={root} className="preloader fixed inset-0 z-[100]" aria-hidden>
      <div data-half className="tolex absolute inset-0 grid place-items-center" style={{ clipPath: "inset(0 0 50% 0)" }}>
        <Face />
      </div>
      <div data-half className="tolex absolute inset-0 grid place-items-center" style={{ clipPath: "inset(50% 0 0 0)" }}>
        <Face />
      </div>
      <svg data-string viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 h-24 w-full -translate-y-1/2 overflow-visible drop-shadow-[0_0_6px_rgba(255,106,26,.55)]">
        {["M0 50 Q250 50 500 50", "M500 50 Q750 50 1000 50"].map((d) => (
          <g key={d}>
            <path d={d} fill="none" stroke="#b9c0ca" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <div data-strobe className="pointer-events-none absolute inset-0 bg-[#fff6ea] opacity-0" />
      <canvas className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
