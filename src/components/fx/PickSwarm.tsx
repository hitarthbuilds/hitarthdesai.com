"use client";

import { useEffect, useRef } from "react";
import { prefersReduced } from "@/lib/gsap";

/** Shapes the swarm assembles into, in order. */
const GLYPHS = ["monogram", "horns", "braces", "guitar", "vinyl"] as const;
type Glyph = (typeof GLYPHS)[number];

/** Chrome and black picks, plus two spotlit colours; each gets a row of pre-rotated sprites. */
const COLORS = ["#3a3f47", "#7d848f", "#b9c0ca", "#e9edf2", "#ff6a1a", "#ffb547"];
const HOT = 4;
const ANGLES = 36;
const SPRITE = 14;

type Pick = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; a: number; heat: number; shade: number; alpha: number };

/**
 * A swarm of about 1,200 guitar picks. Each pick points along a dipole field (one source under
 * the glyph, a stronger one at the cursor, like a pickup's magnet), springs toward a target
 * sampled from an offscreen glyph's alpha, and the swarm re-forms into the next glyph every
 * `interval` ms. Riffs (the `amp:hit` event) knock it outward.
 */
export function PickSwarm({ className = "", interval = 3600 }: { className?: string; interval?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const still = prefersReduced();
    const css = getComputedStyle(document.documentElement);
    const display = css.getPropertyValue("--ff-display").trim() || "system-ui, sans-serif";
    const blackletter = css.getPropertyValue("--ff-black").trim() || "serif";

    // Sprite atlas: one row per colour, one column per angle across [0, 2π). Tip points along +x.
    const cell = Math.ceil(SPRITE * dpr);
    const atlas = document.createElement("canvas");
    atlas.width = cell * ANGLES;
    atlas.height = cell * COLORS.length;
    const ag = atlas.getContext("2d")!;
    const pick = new Path2D("M-5.5 0C-5.5-3.6-4.3-5-2-5 1.2-5 4.6-1.8 6 0 4.6 1.8 1.2 5-2 5-4.3 5-5.5 3.6-5.5 0Z");
    COLORS.forEach((col, row) => {
      for (let i = 0; i < ANGLES; i++) {
        ag.save();
        ag.translate(i * cell + cell / 2, row * cell + cell / 2);
        ag.rotate((i / ANGLES) * Math.PI * 2);
        ag.scale((cell / 14) * 0.95, (cell / 14) * 0.95);
        ag.fillStyle = col;
        ag.fill(pick);
        ag.strokeStyle = "rgba(255,255,255,0.28)";
        ag.lineWidth = 0.8;
        ag.beginPath();
        ag.moveTo(-3.6, -2.4);
        ag.quadraticCurveTo(-1, -3.8, 1.6, -3);
        ag.stroke();
        ag.restore();
      }
    });

    let W = 0, H = 0, N = 0;
    let parts: Pick[] = [];
    let glyphIdx = 0;

    // Glyphs sit in a box biased right and slightly high, clear of the headline's left edge.
    const drawGlyph = (g: CanvasRenderingContext2D, glyph: Glyph, w: number, h: number) => {
      g.fillStyle = "#fff";
      const cx = w * 0.56, cy = h * 0.47, bw = w * 0.72, bh = h * 0.6, m = Math.min(bw, bh);
      const text = (str: string, font: string, weight = 800) => {
        let size = bh;
        g.font = `${weight} ${size}px ${font}`;
        const mw = g.measureText(str).width;
        if (mw > bw) size *= bw / mw;
        g.font = `${weight} ${size}px ${font}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(str, cx, cy + size * 0.04);
      };
      if (glyph === "monogram") text("HD", blackletter, 700);
      else if (glyph === "braces") text("{ }", display);
      else if (glyph === "horns") text("\u{1F918}", `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`, 400);
      else if (glyph === "guitar") {
        // Six-string superstrat in a 100×40 box: double-cut body, neck, pointed 6-in-line head.
        const k = Math.min(bw / 100, bh / 40) * 0.98;
        g.save();
        g.translate(cx, cy);
        g.rotate(-0.2);
        g.scale(k, k);
        g.translate(-50, -20);
        g.beginPath();
        g.ellipse(15, 20, 13, 14.5, 0, 0, Math.PI * 2);
        g.ellipse(28, 20, 10, 11.5, 0, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.moveTo(24, 11);
        g.quadraticCurveTo(33, 4, 42, 6.5);
        g.quadraticCurveTo(36, 10, 34, 17);
        g.closePath();
        g.moveTo(24, 29);
        g.quadraticCurveTo(32, 35, 39, 33);
        g.quadraticCurveTo(34, 29, 33, 23);
        g.closePath();
        g.fill();
        g.fillRect(32, 17.9, 54, 4.2);
        g.beginPath();
        g.moveTo(85, 17.4);
        g.lineTo(99, 12.5);
        g.lineTo(98, 16.5);
        g.lineTo(88, 23);
        g.lineTo(85, 22.6);
        g.closePath();
        g.fill();
        // Pickups and bridge knocked out so it reads as a guitar, not a blob.
        g.globalCompositeOperation = "destination-out";
        g.fillRect(17, 14, 3, 12);
        g.fillRect(25, 14, 3, 12);
        g.fillRect(9, 15, 2, 10);
        g.globalCompositeOperation = "source-over";
        g.restore();
      } else {
        // A record, face-on: disc, a few groove gaps, the label ring and the spindle hole.
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
        ring(R * 0.84, R * 0.87);
        ring(R * 0.66, R * 0.69);
        ring(R * 0.4, R * 0.44);
        g.beginPath();
        g.arc(cx, cy, R * 0.07, 0, Math.PI * 2);
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
      let pts = sample(GLYPHS[glyphIdx % GLYPHS.length]);
      // A platform without colour emoji yields almost nothing for 🤘: skip to the next shape.
      for (let tries = 1; pts.length < 400 && tries < GLYPHS.length; tries++) pts = sample(GLYPHS[++glyphIdx % GLYPHS.length]);
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
    const fieldAngle = (p: Pick) => {
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
          return { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: W / 2, ty: H / 2, a: Math.random() * Math.PI * 2, heat: 0, shade, alpha: 0.5 + Math.random() * 0.5 };
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
        let a = p.a % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        const col = Math.round((a / (Math.PI * 2)) * ANGLES) % ANGLES;
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
            // Swirl around the cursor, with a slight pull toward it.
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
        // Fast picks point along their flight; settled ones follow the field.
        const speed = Math.abs(p.vx) + Math.abs(p.vy);
        const target = speed > 2.2 ? Math.atan2(p.vy, p.vx) : fieldAngle(p);
        let diff = (target - p.a) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        else if (diff < -Math.PI) diff += Math.PI * 2;
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
    // A riff knocks the swarm outward from the glyph's centre, harder for louder hits.
    const onHit = (e: Event) => {
      const k = Math.min(1.5, (e as CustomEvent<number>).detail ?? 1);
      const cx = W * 0.56, cy = H * 0.47;
      for (const p of parts) {
        const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1;
        const f = (2 + Math.random() * 5) * k;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
        p.heat = Math.min(1, p.heat + 0.35 * k * Math.random());
      }
      if (!running) start();
    };

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
      window.addEventListener("amp:hit", onHit);
    }
    // The monogram needs the display face; re-sample once it has loaded.
    let alive = true;
    Promise.all([document.fonts?.load(`800 100px ${display}`), document.fonts?.load(`700 100px ${blackletter}`)]).then(() => alive && glyphIdx === 0 && resize());
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
      window.removeEventListener("amp:hit", onHit);
    };
  }, [interval]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
