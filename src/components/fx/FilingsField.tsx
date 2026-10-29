"use client";

import { useEffect, useRef } from "react";
import { prefersReduced } from "@/lib/gsap";

/** Shapes the filings assemble into, in order. */
const GLYPHS = ["monogram", "braces", "arrow", "plate"] as const;
type Glyph = (typeof GLYPHS)[number];

/** Steel shades (cold) and two heat colours; each gets a row of pre-rotated sprites. */
const COLORS = ["#4a5059", "#7d848f", "#b9c0ca", "#e9edf2", "#ff6a1a", "#ffb547"];
const HOT = 4;
const ANGLES = 32;
const SPRITE = 16;

type Filing = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; a: number; heat: number; shade: number; alpha: number };

/**
 * About 1,200 iron filings on paper. Each one aligns with a magnetic dipole field (a magnet
 * under the glyph plus a stronger one at the cursor), springs toward a target sampled from an
 * offscreen glyph's alpha, and the set re-forms into the next glyph every `interval` ms.
 */
export function FilingsField({ className = "", interval = 3600 }: { className?: string; interval?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const still = prefersReduced();
    const display = getComputedStyle(document.documentElement).getPropertyValue("--ff-display").trim() || "system-ui, sans-serif";

    // Sprite atlas: one row per colour, one column per angle across [0, π).
    const cell = Math.ceil(SPRITE * dpr);
    const atlas = document.createElement("canvas");
    atlas.width = cell * ANGLES;
    atlas.height = cell * COLORS.length;
    const ag = atlas.getContext("2d")!;
    ag.lineCap = "round";
    COLORS.forEach((col, row) => {
      for (let i = 0; i < ANGLES; i++) {
        const th = (i / ANGLES) * Math.PI;
        const cx = i * cell + cell / 2, cy = row * cell + cell / 2;
        const dx = Math.cos(th) * cell * 0.34, dy = Math.sin(th) * cell * 0.34;
        ag.strokeStyle = col;
        ag.lineWidth = 1.7 * dpr;
        ag.beginPath();
        ag.moveTo(cx - dx, cy - dy);
        ag.lineTo(cx + dx, cy + dy);
        ag.stroke();
        // Specular glint along the top edge of each filing.
        ag.strokeStyle = "rgba(255,255,255,0.35)";
        ag.lineWidth = 0.6 * dpr;
        ag.beginPath();
        ag.moveTo(cx - dx * 0.6, cy - dy * 0.6 - 0.4 * dpr);
        ag.lineTo(cx + dx * 0.2, cy + dy * 0.2 - 0.4 * dpr);
        ag.stroke();
      }
    });

    let W = 0, H = 0, N = 0;
    let parts: Filing[] = [];
    let glyphIdx = 0;

    // Glyphs sit in a box biased right and slightly high, clear of the headline's left edge.
    const drawGlyph = (g: CanvasRenderingContext2D, glyph: Glyph, w: number, h: number) => {
      g.fillStyle = "#fff";
      const cx = w * 0.56, cy = h * 0.47, bw = w * 0.72, bh = h * 0.6, m = Math.min(bw, bh);
      if (glyph === "monogram" || glyph === "braces") {
        const text = glyph === "monogram" ? "HD" : "{ }";
        let size = bh;
        g.font = `800 ${size}px ${display}`;
        const mw = g.measureText(text).width;
        if (mw > bw) size *= bw / mw;
        g.font = `800 ${size}px ${display}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(text, cx, cy + size * 0.04);
      } else if (glyph === "arrow") {
        const len = Math.min(bw, m * 1.6), th = m * 0.13, head = m * 0.36;
        const x0 = cx - len / 2, x1 = cx + len / 2;
        g.fillRect(x0, cy - th / 2, len - head * 0.7, th);
        g.beginPath();
        g.moveTo(x1, cy);
        g.lineTo(x1 - head, cy - head * 0.62);
        g.lineTo(x1 - head, cy + head * 0.62);
        g.closePath();
        g.fill();
      } else {
        // Competition plate, face-on: rim, groove, raised hub, sleeve hole.
        const R = m * 0.5;
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.fill();
        g.globalCompositeOperation = "destination-out";
        const ring = (r0: number, r1: number) => {
          g.beginPath();
          g.arc(cx, cy, r1, 0, Math.PI * 2);
          g.arc(cx, cy, r0, 0, Math.PI * 2, true);
          g.fill();
        };
        ring(R * 0.8, R * 0.86);
        ring(R * 0.34, R * 0.4);
        g.beginPath();
        g.arc(cx, cy, R * 0.15, 0, Math.PI * 2);
        g.fill();
        g.globalCompositeOperation = "source-over";
      }
    };

    const sample = (glyph: Glyph): [number, number][] => {
      const sc = 0.5;
      const w = Math.max(1, Math.round(W * sc)), h = Math.max(1, Math.round(H * sc));
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const g = off.getContext("2d", { willReadFrequently: true })!;
      drawGlyph(g, glyph, w, h);
      const data = g.getImageData(0, 0, w, h).data;
      const pts: [number, number][] = [];
      for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 128) pts.push([x / sc, y / sc]);
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }
      return pts;
    };

    const assign = (burst: boolean) => {
      const pts = sample(GLYPHS[glyphIdx % GLYPHS.length]);
      if (!pts.length) return;
      parts.forEach((p, i) => {
        const t = pts[i % pts.length];
        p.tx = t[0] + (Math.random() - 0.5) * 4;
        p.ty = t[1] + (Math.random() - 0.5) * 4;
        if (burst) {
          const ang = Math.random() * Math.PI * 2, f = 5 + Math.random() * 11;
          p.vx += Math.cos(ang) * f;
          p.vy += Math.sin(ang) * f;
        }
      });
    };

    // Dipole field B = (3(m·r̂)r̂ − m) / |r|³ with the moment pointing up the screen.
    const dipole = (dx: number, dy: number, k: number, out: { x: number; y: number }) => {
      const d = Math.max(0.18, Math.hypot(dx, dy));
      const rx = dx / d, ry = dy / d;
      const mr = -ry; // m = (0, -1)
      const s = k / (d * d * d);
      out.x += (3 * mr * rx) * s;
      out.y += (3 * mr * ry + 1) * s;
    };

    const mouse = { x: -9999, y: -9999, on: false };
    const B = { x: 0, y: 0 };
    const fieldAngle = (p: Filing) => {
      B.x = B.y = 0;
      const u = Math.min(W, H) * 0.5;
      dipole((p.x - W * 0.56) / u, (p.y - H * 0.47) / u, 1, B);
      if (mouse.on) dipole((p.x - mouse.x) / 110, (p.y - mouse.y) / 110, 0.9, B);
      return Math.atan2(B.y, B.x);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(1200, Math.max(420, (W * H) / 300)));
      if (target !== N) {
        N = target;
        parts = Array.from({ length: N }, () => {
          const shade = Math.random() < 0.18 ? 3 : Math.random() < 0.45 ? 2 : Math.random() < 0.6 ? 1 : 0;
          return { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: W / 2, ty: H / 2, a: Math.random() * Math.PI, heat: 0, shade, alpha: 0.45 + Math.random() * 0.55 };
        });
      }
      assign(false);
      if (still) {
        for (const p of parts) {
          p.x = p.tx;
          p.y = p.ty;
          p.a = fieldAngle(p);
        }
        render();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const half = SPRITE / 2;
      for (const p of parts) {
        let a = p.a % Math.PI;
        if (a < 0) a += Math.PI;
        const col = Math.round((a / Math.PI) * ANGLES) % ANGLES;
        const row = p.heat > 0.55 ? HOT + 1 : p.heat > 0.2 ? HOT : p.shade;
        ctx.globalAlpha = Math.min(1, p.alpha + p.heat * 0.5);
        ctx.drawImage(atlas, col * cell, row * cell, cell, cell, p.x - half, p.y - half, SPRITE, SPRITE);
      }
      ctx.globalAlpha = 1;
    };

    const R = 130;
    const tick = () => {
      for (const p of parts) {
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) ** 2 * 2.2;
            // Swirl around the magnet, with a slight pull: they are iron, after all.
            p.vx += (-dy / d) * f * 0.9 - (dx / d) * f * 0.35;
            p.vy += (dx / d) * f * 0.9 - (dy / d) * f * 0.35;
            p.heat = Math.min(1, p.heat + (1 - d / R) * 0.07);
          }
        }
        p.heat *= 0.965;
        p.vx = (p.vx + (p.tx - p.x) * 0.012) * 0.86;
        p.vy = (p.vy + (p.ty - p.y) * 0.012) * 0.86;
        p.x += p.vx;
        p.y += p.vy;
        // Fast filings point along their flight; settled ones follow the field (π-periodic).
        const speed = Math.abs(p.vx) + Math.abs(p.vy);
        const target = speed > 2.2 ? Math.atan2(p.vy, p.vx) : fieldAngle(p);
        let diff = (target - p.a) % Math.PI;
        if (diff > Math.PI / 2) diff -= Math.PI;
        else if (diff < -Math.PI / 2) diff += Math.PI;
        p.a += diff * 0.16;
      }
      render();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.on = mouse.x > -R && mouse.y > -R && mouse.x < W + R && mouse.y < H + R;
    };
    const onLeave = () => (mouse.on = false);

    let raf = 0, running = false, visible = true, last = 0, elapsed = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      elapsed += Math.min(100, now - last);
      last = now;
      if (elapsed > interval) {
        elapsed = 0;
        glyphIdx++;
        assign(true);
      }
      tick();
    };
    const start = () => {
      if (running || still) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => (visible && !document.hidden ? start() : stop());

    resize();
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    // The monogram needs the display face; re-sample once it has loaded.
    let alive = true;
    document.fonts?.load(`800 100px ${display}`).then(() => alive && glyphIdx === 0 && resize());
    sync();

    return () => {
      alive = false;
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [interval]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
