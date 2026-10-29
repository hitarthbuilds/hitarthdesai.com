"use client";

import { useEffect, useRef } from "react";
import { prefersReduced } from "@/lib/gsap";
import { amp, OPEN_STRINGS, useAmp } from "@/lib/amp";

const MODES = 5;
const FRETS = 15;
const INLAYS = [3, 5, 7, 9, 12, 15];
/** Top to bottom reads like tab: high e first. */
const GAUGE = [1, 1.25, 1.6, 2.1, 2.6, 3.2];
const WOUND = [false, false, false, true, true, true];

type Str = { y: number; a: Float32Array; ph: Float32Array; last: number };

/**
 * A six-string fretboard strip. The pointer plucks a string as it crosses it (a tap works on
 * touch); each string rings as a sum of damped standing-wave modes. With the AMP on, the
 * fret under the pick sets the pitch.
 */
export function Strings({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useAmp();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const still = prefersReduced();
    let W = 0, H = 0, top = 0, bottom = 0, nut = 0;
    let frets: number[] = [];
    const strings: Str[] = GAUGE.map(() => ({ y: 0, a: new Float32Array(MODES), ph: new Float32Array(MODES), last: 0 }));

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      top = 14;
      bottom = H - 14;
      nut = Math.min(56, W * 0.05);
      // Real fret spacing: the k-th fret sits at L(1 − 2^(−k/12)) from the nut.
      const L = (W - nut) / (1 - Math.pow(2, -(FRETS + 1) / 12));
      frets = Array.from({ length: FRETS + 1 }, (_, k) => nut + L * (1 - Math.pow(2, -k / 12)));
      const gap = (bottom - top) / GAUGE.length;
      strings.forEach((s, i) => (s.y = top + gap * (i + 0.5)));
    };

    const fretAt = (x: number) => {
      for (let k = 1; k < frets.length; k++) if (x < frets[k]) return k - 1;
      return FRETS;
    };

    const pluck = (i: number, x: number, strength: number) => {
      const s = strings[i];
      const now = performance.now();
      if (now - s.last < 45) return;
      s.last = now;
      const u = Math.min(0.97, Math.max(0.03, (x - nut) / (W - nut)));
      const h = Math.min(13, Math.max(3, strength));
      // Fourier coefficients of a string released from a triangle with its apex at u.
      for (let n = 1; n <= MODES; n++) {
        const c = (2 * h) / (n * n * Math.PI * Math.PI * u * (1 - u)) * Math.sin(n * Math.PI * u);
        s.a[n - 1] = Math.max(-16, Math.min(16, s.a[n - 1] * 0.3 + c * 0.25));
      }
      const open = OPEN_STRINGS[GAUGE.length - 1 - i];
      amp.pluck(open * Math.pow(2, fretAt(x) / 12), { velocity: Math.min(1, 0.45 + strength / 20) });
      if (!running) start();
    };

    const wood = () => {
      const g = ctx.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0, "#121316");
      g.addColorStop(0.5, "#0c0d0f");
      g.addColorStop(1, "#121316");
      ctx.fillStyle = g;
      ctx.fillRect(0, top, W, bottom - top);
      // Binding along both edges.
      ctx.fillStyle = "rgba(233,237,242,0.22)";
      ctx.fillRect(0, top - 1.5, W, 1.5);
      ctx.fillRect(0, bottom, W, 1.5);
      // Inlays.
      for (const k of INLAYS) {
        if (k >= frets.length) continue;
        const cx = (frets[k - 1] + frets[k]) / 2;
        const ys = k === 12 ? [top + (bottom - top) * 0.3, top + (bottom - top) * 0.7] : [(top + bottom) / 2];
        for (const cy of ys) {
          const rg = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 7);
          rg.addColorStop(0, "#f4f1ea");
          rg.addColorStop(1, "#8b929c");
          ctx.fillStyle = rg;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      // Fret wire, then the nut.
      for (let k = 1; k < frets.length; k++) {
        ctx.fillStyle = "#3a3f47";
        ctx.fillRect(frets[k] - 1.5, top, 3, bottom - top);
        ctx.fillStyle = "rgba(233,237,242,0.55)";
        ctx.fillRect(frets[k] - 0.5, top, 1, bottom - top);
      }
      ctx.fillStyle = "#d9d3c2";
      ctx.fillRect(nut - 5, top - 2, 5, bottom - top + 4);
    };

    const SEG = 96;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      wood();
      const span = W - nut;
      strings.forEach((s, i) => {
        let energy = 0;
        for (let n = 0; n < MODES; n++) energy += Math.abs(s.a[n]);
        const path = (sign: number, envelope: boolean) => {
          ctx.beginPath();
          for (let j = 0; j <= SEG; j++) {
            const u = j / SEG;
            let dy = 0;
            for (let n = 0; n < MODES; n++) {
              const m = Math.sin((n + 1) * Math.PI * u);
              dy += envelope ? Math.abs(s.a[n] * m) : s.a[n] * m * Math.cos(s.ph[n]);
            }
            const x = nut + u * span, y = s.y + dy * sign;
            if (j) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          }
        };
        // A faint envelope reads as motion blur on a ringing string.
        if (energy > 0.3) {
          ctx.strokeStyle = `rgba(255,106,26,${Math.min(0.35, energy * 0.03)})`;
          ctx.lineWidth = 1;
          path(1, true);
          ctx.stroke();
          path(-1, true);
          ctx.stroke();
        }
        const w = GAUGE[i];
        const hot = Math.min(1, energy * 0.08);
        ctx.lineCap = "round";
        ctx.strokeStyle = hot > 0.05 ? `rgb(${233 + 22 * hot},${237 - 120 * hot},${242 - 200 * hot})` : WOUND[i] ? "#8b929c" : "#d6dbe2";
        ctx.lineWidth = w;
        path(1, false);
        ctx.stroke();
        if (WOUND[i]) {
          ctx.setLineDash([1, 1.6]);
          ctx.strokeStyle = "rgba(255,255,255,0.45)";
          ctx.lineWidth = w * 0.7;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    let raf = 0, running = false, visible = true, last = 0;
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      let energy = 0;
      for (const s of strings)
        for (let n = 0; n < MODES; n++) {
          s.a[n] *= Math.exp(-dt * (1.4 + n * 0.9));
          s.ph[n] += dt * 2 * Math.PI * 9 * (n + 1) * (1 + 0.003 * (n + 1) * (n + 1));
          energy += Math.abs(s.a[n]);
        }
      draw();
      if (energy < 0.02) {
        for (const s of strings) s.a.fill(0);
        draw();
        stop();
      }
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      step(now);
    };
    function start() {
      if (running || still || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const prev = { x: 0, y: 0, ok: false };
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      const inside = p.x >= nut && p.x <= W && p.y >= -20 && p.y <= H + 20;
      if (inside && prev.ok) {
        strings.forEach((s, i) => {
          if ((prev.y - s.y) * (p.y - s.y) < 0) {
            const t = (s.y - prev.y) / (p.y - prev.y);
            pluck(i, prev.x + (p.x - prev.x) * t, Math.abs(p.y - prev.y) * 0.9 + 2);
          }
        });
      }
      prev.x = p.x;
      prev.y = p.y;
      prev.ok = inside;
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      if (p.x < nut || p.x > W || p.y < 0 || p.y > H) return;
      let best = -1, bd = 16;
      strings.forEach((s, i) => {
        const d = Math.abs(p.y - s.y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best >= 0) pluck(best, p.x, 9);
    };

    layout();
    draw();
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        layout();
        draw();
      }, 100);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) stop();
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div className={`relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
        <span>
          <span className="text-mute">Strum me</span> · E A D G B E
        </span>
        <span className="hidden sm:inline">{live ? "Amp on: fret by position" : "Flip the amp on to hear it"}</span>
      </div>
      <canvas ref={ref} aria-hidden className="block h-[132px] w-full cursor-crosshair touch-pan-y" />
    </div>
  );
}
