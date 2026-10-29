"use client";

import { useRef } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";

const STEPS = ["heating crucible", "pouring", "quenching", "tempering"];

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

function Face() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <div className="flex items-end justify-between gap-6">
        <div data-count className="display tabular chrome-text text-[38vw] leading-[0.8] sm:text-[28vw]">
          000
        </div>
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
        <span>Hitarth Desai · forged not demoed</span>
      </div>
      <div className="mt-4 h-[2px] w-full bg-steel-3">
        <div data-bar className="h-full origin-left bg-gradient-to-r from-forge to-ember shadow-[0_0_12px_var(--forge)]" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}

/**
 * First visit per session: a mechanical counter races 000 → 100 through the forging steps,
 * a hammer strike shakes the plate and throws sparks, then a guillotine shear splits it.
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
      tl.to(o, { n: 100, duration: dur, ease: "power2.inOut", onUpdate: () => counters.forEach((c) => (c.textContent = String(Math.round(o.n)).padStart(3, "0"))) })
        .to(el.querySelectorAll("[data-bar]"), { scaleX: 1, duration: dur, ease: "power2.inOut" }, 0)
        .to(el.querySelectorAll("[data-line]"), { yPercent: -100 * (STEPS.length - 1) / STEPS.length, duration: dur * 0.9, ease: `steps(${STEPS.length - 1})` }, 0);

      if (reduced) {
        tl.to(el, { opacity: 0, duration: 0.4, onStart: signalPreloaderDone });
        return;
      }

      // Hammer strike: a 120ms jitter, sparks off the counter, then the shear.
      tl.add(() => {
        const r = counters[0].getBoundingClientRect();
        sparks(spark, r.left + r.width * 0.92, r.top + r.height * 0.55);
      }, "+=0.08")
        .to(halves, { keyframes: { x: [0, -9, 7, -5, 4, 0], y: [0, 5, -6, 4, -2, 0] }, duration: 0.12, ease: "none" }, "<")
        .fromTo(el.querySelector("[data-blade]"), { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.22, ease: "power4.out" }, "+=0.08")
        .to(halves[0], { yPercent: -100, xPercent: -3, duration: 1, ease: "hop" }, "+=0.04")
        .to(halves[1], { yPercent: 100, xPercent: 3, duration: 1, ease: "hop" }, "<")
        .to(el.querySelector("[data-blade]"), { opacity: 0, duration: 0.3 }, "<0.1")
        .add(signalPreloaderDone, "<0.25");
    },
    { scope: root },
  );

  return (
    <div ref={root} className="preloader fixed inset-0 z-[100]" aria-hidden>
      <div data-half className="brushed absolute inset-0 grid place-items-center !rounded-none !border-0" style={{ clipPath: "inset(0 0 50% 0)" }}>
        <Face />
      </div>
      <div data-half className="brushed absolute inset-0 grid place-items-center !rounded-none !border-0" style={{ clipPath: "inset(50% 0 0 0)" }}>
        <Face />
      </div>
      <div data-blade className="absolute inset-x-0 top-1/2 h-[2px] origin-left -translate-y-1/2 bg-ember shadow-[0_0_18px_4px_rgba(255,106,26,.7)]" style={{ transform: "scaleX(0)" }} />
      <canvas className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
