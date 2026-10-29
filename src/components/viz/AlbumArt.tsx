"use client";

import { useRef } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import type { Project } from "@/content/projects";

/** Loops `build` while the art is on screen; reduced motion shows the timeline's end state. */
function useLoop(build: (tl: gsap.core.Timeline, q: (s: string) => Element[]) => void) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
      build(tl, q);
      if (prefersReduced()) {
        tl.progress(0.98);
        return;
      }
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
      io.observe(root.current!);
      return () => io.disconnect();
    },
    { scope: root },
  );
  return root;
}

/** confident-extract: tokens stream into a typed schema; invalid ones are struck out; the object locks. */
function ExtractArt() {
  const rows = [
    ["invoice_id", "str", '"NW-0417"', true],
    ["total", "Decimal", '"1,2O8"', false],
    ["total", "Decimal", "1208.50", true],
    ["due", "date", "2026-11-14", true],
    ["vendor", "str", '"Northwind"', true],
  ] as const;
  const root = useLoop((tl, q) => {
    tl.set(q("[data-v]"), { autoAlpha: 0, x: 40 })
      .set(q("[data-strike]"), { scaleX: 0 })
      .set(q("[data-lock]"), { autoAlpha: 0, scale: 1.8 });
    q("[data-row]").forEach((row, i) => {
      const ok = rows[i][3];
      tl.to(row.querySelector("[data-v]"), { autoAlpha: 1, x: 0, duration: 0.35, ease: "power3.out" }, i * 0.45);
      if (!ok)
        tl.to(row.querySelector("[data-strike]"), { scaleX: 1, duration: 0.2 }, ">").to(row, { autoAlpha: 0.35, duration: 0.2 }, ">0.1");
    });
    tl.to(q("[data-lock]"), { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.5)" }, ">0.2").to({}, { duration: 1.6 });
  });
  return (
    <div ref={root} className="absolute inset-0 flex flex-col justify-center gap-1 p-6 font-mono text-[12px] sm:text-[13px]">
      <p className="mb-2 text-titanium">class Invoice(Struct):</p>
      {rows.map(([k, t, v, ok], i) => (
        <p key={i} data-row className="relative flex items-center gap-2 pl-4">
          <span className="text-chrome/70">{k}:</span>
          <span className="text-dim">{t}</span>
          <span className="text-dim">=</span>
          <span data-v className={`relative ${ok ? "text-chrome" : "text-[#ff8a5c]"}`}>
            {v}
            {!ok && <span data-strike className="absolute inset-x-0 top-1/2 h-[2px] origin-left bg-rust" />}
          </span>
        </p>
      ))}
      <span data-lock className="seal absolute bottom-6 right-6 !text-[18px]">
        locked ✓
      </span>
    </div>
  );
}

/** promptcrucible: six prompt "takes" on a mixing desk; faders rise to eval scores; best take crowned. */
function EvalArt() {
  const scores = [0.42, 0.58, 0.51, 0.73, 0.88, 0.66];
  const best = scores.indexOf(Math.max(...scores));
  const root = useLoop((tl, q) => {
    tl.set(q("[data-cap]"), { y: 0 }).set(q("[data-fill]"), { scaleY: 0 }).set(q("[data-crown]"), { autoAlpha: 0, y: 10 });
    q("[data-ch]").forEach((ch, i) => {
      const h = (ch as HTMLElement).offsetHeight || 140;
      tl.to(ch.querySelector("[data-fill]"), { scaleY: scores[i], duration: 0.6, ease: "power2.out" }, i * 0.22).to(
        ch.querySelector("[data-cap]"),
        { y: -scores[i] * (h - 14), duration: 0.6, ease: "back.out(1.6)" },
        "<",
      );
    });
    tl.to(q("[data-crown]"), { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(3)" }, ">0.1").to({}, { duration: 1.6 });
  });
  return (
    <div ref={root} className="absolute inset-0 flex items-end justify-center gap-3 px-8 pb-10 pt-14 sm:gap-4">
      {scores.map((s, i) => (
        <div key={i} className="flex h-full flex-col items-center gap-2">
          <div data-ch className="relative h-full w-5 rounded-full bg-steel-3 sm:w-6">
            <div data-fill className={`absolute inset-0 origin-bottom rounded-full ${i === best ? "bg-gradient-to-t from-blood to-ember" : "bg-gradient-to-t from-steel-2 to-mute/60"}`} />
            <div data-cap className="absolute inset-x-[-5px] bottom-0 h-3.5 rounded-[3px] bg-gradient-to-b from-chrome to-mute shadow-[0_2px_4px_rgba(0,0,0,.6)]" />
            {i === best && (
              <span data-crown className="absolute -top-9 left-1/2 -translate-x-1/2 text-[22px]" aria-hidden>
                🤘
              </span>
            )}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim">take {i + 1}</span>
        </div>
      ))}
      <span className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">eval score · per take</span>
    </div>
  );
}

/** AnswerRank AI: an analog VU meter sweeping between sample sites' discoverability scores. */
function GaugeArt() {
  const sites = [
    ["docs.example.dev", 0.82],
    ["blog.example.io", 0.34],
    ["shop.example.com", 0.61],
  ] as const;
  const root = useLoop((tl, q) => {
    sites.forEach(([, v], i) => {
      tl.to(q("[data-needle]"), { rotation: -50 + v * 100, svgOrigin: "100 112", duration: 1.1, ease: "elastic.out(1.1,0.45)" }, i * 1.8).to(
        q("[data-site]"),
        { duration: 0.4, scrambleText: { text: `${sites[i][0]} · ${Math.round(v * 100)}`, chars: "abcdefghij0123456789.", speed: 0.6 } },
        "<",
      );
    });
    tl.to({}, { duration: 1 });
  });
  const tick = (a: number, r0: number, r1: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    const r2 = (n: number) => Math.round(n * 100) / 100;
    return { x1: r2(100 + Math.cos(t) * r0), y1: r2(112 + Math.sin(t) * r0), x2: r2(100 + Math.cos(t) * r1), y2: r2(112 + Math.sin(t) * r1) };
  };
  return (
    <div ref={root} className="absolute inset-0 grid place-items-center p-6">
      <div className="w-full max-w-[300px] rounded-xl border border-line-2 bg-[linear-gradient(180deg,#f3ead2,#d9cba5)] p-3 shadow-[inset_0_2px_12px_rgba(0,0,0,.35)]">
        <svg viewBox="0 0 200 130" className="w-full" aria-hidden>
          <path d="M30 80 A80 80 0 0 1 170 80" fill="none" stroke="#2a2016" strokeWidth="1.2" />
          <path d="M136 52 A80 80 0 0 1 170 80" fill="none" stroke="#c2410c" strokeWidth="5" />
          {Array.from({ length: 11 }, (_, i) => -50 + i * 10).map((a) => (
            <line key={a} {...tick(a, 70, a % 20 === 0 ? 80 : 76)} stroke="#2a2016" strokeWidth="1.2" />
          ))}
          <text x="100" y="62" textAnchor="middle" fontSize="13" fill="#2a2016" fontFamily="var(--font-mono)">
            VU
          </text>
          <line data-needle x1="100" y1="112" x2="100" y2="34" stroke="#111" strokeWidth="1.6" transform="rotate(-50 100 112)" />
          <circle cx="100" cy="112" r="6" fill="#111" />
        </svg>
        <p data-site className="mt-1 text-center font-mono text-[11px] text-[#2a2016]">
          docs.example.dev · 82
        </p>
      </div>
      <span className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">AI-answer discoverability</span>
    </div>
  );
}

/** AutoDataset Lab: a step sequencer of data rows; bad rows flash rust, get muted and pulled. */
function GridArt() {
  const bad = new Set([2, 5]);
  const root = useLoop((tl, q) => {
    const cells = q("[data-cell]");
    tl.set(q("[data-row]"), { x: 0, autoAlpha: 1 }).set(cells, { backgroundColor: "#20242b" });
    for (let step = 0; step < 8; step++)
      tl.to(
        cells.filter((c) => (c as HTMLElement).dataset.step === String(step)),
        { backgroundColor: (_, c) => ((c as HTMLElement).dataset.bad ? "#c2410c" : "#ff6a1a"), duration: 0.08, yoyo: true, repeat: 1 },
        step * 0.16,
      );
    tl.to(q("[data-row][data-bad]"), { x: 60, autoAlpha: 0, duration: 0.5, ease: "power3.in", stagger: 0.12 }, ">0.2").to({}, { duration: 1.2 });
  });
  return (
    <div ref={root} className="absolute inset-0 flex flex-col justify-center gap-2 p-6">
      {Array.from({ length: 7 }, (_, r) => (
        <div key={r} data-row data-bad={bad.has(r) ? "" : undefined} className="flex items-center gap-1.5">
          <span className={`w-14 font-mono text-[9px] uppercase tracking-[0.12em] ${bad.has(r) ? "text-[#ff8a5c]" : "text-dim"}`}>row {String(r + 1).padStart(2, "0")}</span>
          {Array.from({ length: 8 }, (_, c) => (
            <i key={c} data-cell data-step={c} data-bad={bad.has(r) ? "" : undefined} className="h-5 flex-1 rounded-[3px] bg-steel-3" />
          ))}
        </div>
      ))}
      <span className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">profile → quarantine → clean</span>
    </div>
  );
}

/** SeerFlow: the cash-flow waveform comes from the backend; an invented AI number hits the guardrail. */
function LedgerArt() {
  const bars = Array.from({ length: 34 }, (_, i) => Math.round((0.35 + 0.4 * Math.abs(Math.sin(i * 0.55)) * (i % 7 === 4 ? 0.3 : 1)) * 1000) / 1000);
  const root = useLoop((tl, q) => {
    tl.set(q("[data-bar]"), { scaleY: 0 }).set(q("[data-claim]"), { autoAlpha: 0, y: 8 }).set(q("[data-reject]"), { autoAlpha: 0 });
    tl.to(q("[data-bar]"), { scaleY: 1, duration: 0.5, stagger: 0.025, ease: "power2.out" })
      .to(q("[data-claim]"), { autoAlpha: 1, y: 0, duration: 0.35 }, ">0.1")
      .to(q("[data-reject]"), { autoAlpha: 1, duration: 0.2 }, ">0.5")
      .to(q("[data-claim]"), { keyframes: { x: [0, -6, 5, -3, 0] }, duration: 0.25 }, "<")
      .to({}, { duration: 1.6 });
  });
  return (
    <div ref={root} className="absolute inset-0 flex flex-col justify-end gap-4 p-6">
      <div data-claim className="self-start rounded-lg border border-line-2 bg-void/80 px-3 py-2 font-mono text-[11px] text-chrome/85">
        AI: “cash dips on the 14th to <span className="text-[#ff8a5c]">₹3.2L</span>”
        <span data-reject className="ml-2 rounded bg-rust/25 px-1.5 py-0.5 text-[10px] text-[#ff8a5c]">
          guardrail ✕ number not in source
        </span>
      </div>
      <div className="flex h-28 items-center gap-[3px]">
        {bars.map((b, i) => (
          <i key={i} data-bar className={`w-full origin-center rounded-full ${i % 7 === 4 ? "bg-blood" : "bg-gradient-to-b from-chrome/80 to-mute/40"}`} style={{ height: `${b * 100}%` }} />
        ))}
      </div>
      <span className="absolute left-6 top-5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">backend computes · AI explains</span>
    </div>
  );
}

export function AlbumArt({ visual }: { visual: Project["visual"] }) {
  if (visual === "extract") return <ExtractArt />;
  if (visual === "eval") return <EvalArt />;
  if (visual === "gauge") return <GaugeArt />;
  if (visual === "grid") return <GridArt />;
  return <LedgerArt />;
}
