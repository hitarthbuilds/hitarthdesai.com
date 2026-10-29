"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import { amp } from "@/lib/amp";
import { extract, SAMPLE, type Mode, type Stage } from "@/lib/mock-extract";

const PEDALS: { id: Stage; name: string; sub: string; color: string }[] = [
  { id: "tokenize", name: "Tokenize", sub: "split", color: "#9aa1ab" },
  { id: "constrain", name: "Constrain", sub: "mask", color: "#7fb6ff" },
  { id: "validate", name: "Validate", sub: "schema", color: "#ff6a1a" },
  { id: "repair", name: "Repair", sub: "fix", color: "#d9142b" },
];

const TYPES: Record<string, string> = { invoice_id: "str", total: "Decimal", currency: "Literal", due: "date", vendor: "str", po_ref: "str | None" };

/** The scripted run: post-hoc validation over the sample, so one field visibly fails and is repaired. */
const RUN = extract(SAMPLE, "posthoc");

const show = (key: string, v: string | null) => (v === null ? "null" : key === "total" ? v : `"${v}"`);

/** SAMPLE split into plain text and the spans each field was extracted from. */
function segments() {
  const marks = RUN.fields
    .filter((f) => f.raw)
    .map((f) => ({ key: f.key, at: SAMPLE.indexOf(f.raw!), len: f.raw!.length }))
    .filter((m) => m.at >= 0)
    .sort((a, b) => a.at - b.at);
  const out: { text: string; key?: string }[] = [];
  let i = 0;
  for (const m of marks) {
    if (m.at < i) continue;
    out.push({ text: SAMPLE.slice(i, m.at) }, { text: SAMPLE.slice(m.at, m.at + m.len), key: m.key });
    i = m.at + m.len;
  }
  out.push({ text: SAMPLE.slice(i) });
  return out;
}

function Pedal({ id, name, sub, color, lit }: (typeof PEDALS)[number] & { lit?: "on" | "error" }) {
  return (
    <div data-pedal={id} className="pedal" style={{ "--pc": color } as React.CSSProperties}>
      <span data-led={id} className="pedal-led" data-lit={lit ?? "off"} />
      <span className="flex gap-3" aria-hidden>
        <i className="pedal-knob" />
        <i className="pedal-knob" />
      </span>
      <span className="text-center">
        <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-chrome">{name}</span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-chrome/50">{sub}</span>
      </span>
      <i className="pedal-switch" aria-hidden />
    </div>
  );
}

/**
 * Track 02's signal chain. A messy invoice is the DI input, four pedals process it, and the amp
 * outputs schema-valid JSON. Desktop: pinned and scrubbed by scroll. After that (or on any
 * device), visitors can plug in their own text and flip between constrained decoding and
 * post-hoc validation; the regex mock extractor re-runs live.
 */
export function ExtractionDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("posthoc");
  const [live, setLive] = useState("");
  const result = useMemo(() => extract(text, mode), [text, mode]);
  const segs = useMemo(segments, []);

  const lit = (id: Stage): "on" | "error" | undefined => {
    if (!editing) return undefined;
    const hits = result.trace.filter((t) => t.stage === id);
    if (!hits.length) return undefined;
    return id === "validate" && !result.valid ? "error" : "on";
  };

  useGSAP(
    () => {
      const el = root.current!;
      const stage = el.querySelector<HTMLElement>("[data-stage]")!;
      const layer = el.querySelector<HTMLElement>("[data-fly]")!;
      const pedals = el.querySelectorAll<HTMLElement>("[data-pedal]");
      const leds = el.querySelectorAll<HTMLElement>("[data-led]");
      const pulse = el.querySelector<SVGPathElement>("[data-pulse]");
      const seal = el.querySelector<HTMLElement>("[data-seal]");
      const rel = (n: Element) => {
        const s = stage.getBoundingClientRect(), r = n.getBoundingClientRect();
        return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
      };
      const clones: HTMLElement[] = [];

      const build = (tl: gsap.core.Timeline) => {
        for (const f of RUN.fields) {
          const span = el.querySelector(`[data-raw="${f.key}"]`);
          const slot = el.querySelector<HTMLElement>(`[data-slot="${f.key}"]`);
          if (!span || !slot) continue;
          const clone = document.createElement("span");
          clone.className = "fly-chip";
          clone.textContent = f.raw;
          layer.appendChild(clone);
          clones.push(clone);
          const first = pedals[0], last = pedals[pedals.length - 1];
          const bad = f.caughtBy === "repair";
          tl.addLabel(f.key)
            .to(span, { color: "#ffb547", textShadow: "0 0 14px rgba(255,106,26,.9)", duration: 0.25 })
            .fromTo(clone, { x: () => rel(span).x, y: () => rel(span).y, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, "<0.1")
            .to(clone, { x: () => rel(first).x + rel(first).w / 2 - 30, y: () => rel(first).y + rel(first).h * 0.3, duration: 0.5, ease: "power2.inOut" })
            .to(clone, { x: () => rel(last).x + rel(last).w / 2 - 30, duration: 0.6, ease: "none" })
            .fromTo(pulse, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.6, ease: "none" }, "<")
            .to(leds, { keyframes: [{ opacity: 1, duration: 0.06 }, { opacity: 0.3, duration: 0.14 }], stagger: 0.14 }, "<");
          if (bad)
            tl.set(leds[2], { attr: { "data-lit": "error" } }, "<0.3").set(leds[3], { attr: { "data-lit": "on" } }, "<0.25");
          tl.to(clone, { x: () => rel(slot).x, y: () => rel(slot).y, duration: 0.5, ease: "power2.inOut" })
            .to(clone, { autoAlpha: 0, duration: 0.1 })
            .to(span, { color: "#e9edf2", textShadow: "0 0 0px rgba(255,106,26,0)", duration: 0.3 }, "<");
          if (bad) {
            const tag = el.querySelector<HTMLElement>(`[data-tag="${f.key}"]`)!;
            tl.to(slot, { duration: 0.35, scrambleText: { text: f.raw!, chars: "0123456789O.,", speed: 0.5 }, color: "#c2410c" }, "<")
              .to(tag, { autoAlpha: 1, duration: 0.15 })
              .to(slot.parentElement, { keyframes: { x: [0, -6, 5, -3, 0] }, duration: 0.25 })
              .to(tag, { autoAlpha: 0, duration: 0.15 }, "+=0.35")
              .to(slot, { duration: 0.4, scrambleText: { text: show(f.key, f.value), chars: "0123456789", speed: 0.5 }, color: "#e9edf2" })
              .to(el.querySelector(`[data-fix="${f.key}"]`), { autoAlpha: 1, duration: 0.2 }, "<0.2")
              .set([leds[2], leds[3]], { attr: { "data-lit": "off" } });
          } else tl.to(slot, { duration: 0.4, scrambleText: { text: show(f.key, f.value), chars: "{}[]<>/#01", speed: 0.5 }, color: "#e9edf2" }, "<");
        }
        if (seal)
          tl.fromTo(seal, { scale: 2.6, rotate: -22, autoAlpha: 0 }, { scale: 1, rotate: -9, autoAlpha: 1, duration: 0.35, ease: "back.out(2.2)" })
            .to(el.querySelector("[data-json]"), { keyframes: { x: [0, -8, 7, -4, 2, 0], y: [0, 4, -3, 2, 0] }, duration: 0.2 }, "<0.25")
            .call(() => {
              amp.power(98, 0.85);
              setLive("Schema valid: 6 fields extracted from the invoice; total repaired from 1,2O8.50 to 1208.50.");
            });
        tl.to({}, { duration: 0.6 });
      };

      const finish = () => {
        el.querySelectorAll<HTMLElement>("[data-slot]").forEach((s) => {
          const f = RUN.fields.find((x) => x.key === s.dataset.slot);
          if (f) s.textContent = show(f.key, f.value);
        });
        gsap.set("[data-fix]", { autoAlpha: 1 });
        gsap.set(seal, { autoAlpha: 1, rotate: -9 });
      };

      if (prefersReduced()) {
        finish();
        return;
      }

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: stage, pin: true, start: "top top", end: "+=240%", scrub: 1, invalidateOnRefresh: true },
        });
        build(tl);
      });
      mm.add("(max-width: 1023px)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" }, scrollTrigger: { trigger: stage, start: "top 60%", once: true } });
        build(tl);
        tl.timeScale(1.6);
      });
      return () => clones.forEach((c) => c.remove());
    },
    { scope: root },
  );

  const fields = editing ? result.fields : RUN.fields;

  return (
    <div ref={root} className="relative">
      <div data-stage className="relative mx-auto flex max-w-[1440px] flex-col justify-center gap-4 px-5 py-10 sm:px-8 lg:h-[100svh] lg:px-12 lg:pb-8 lg:pt-24">
        <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
          {/* DI: raw input */}
          <div className="amp-panel flex min-h-0 flex-col">
            <div className="amp-panel-head">
              <span>DI · raw input</span>
              {editing ? (
                <button type="button" onClick={() => setText(SAMPLE)} className="panel-btn">
                  Reset
                </button>
              ) : (
                <button type="button" onClick={() => setEditing(true)} className="panel-btn panel-btn-hot" data-cursor="plug in">
                  Plug in your own ✎
                </button>
              )}
            </div>
            {editing ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                data-lenis-prevent
                aria-label="Raw input text to extract from"
                className="min-h-[220px] flex-1 resize-none bg-transparent p-5 font-mono text-[13px] leading-[1.75] text-chrome/85 outline-none focus:bg-white/[0.02]"
              />
            ) : (
              <pre className="flex-1 overflow-hidden whitespace-pre-wrap p-5 font-mono text-[13px] leading-[1.75] text-chrome/70 lg:p-7 lg:text-[15px] lg:leading-[1.9]">
                {segs.map((s, i) =>
                  s.key ? (
                    <span key={i} data-raw={s.key} className="rounded-[3px] bg-white/[0.04] text-chrome">
                      {s.text}
                    </span>
                  ) : (
                    <Fragment key={i}>{s.text}</Fragment>
                  ),
                )}
              </pre>
            )}
          </div>

          {/* Amp out: JSON */}
          <div data-json className="amp-panel relative flex min-h-0 flex-col">
            <div className="amp-panel-head">
              <span>Amp out · JSON</span>
              <span className="text-chrome/50">schema: Invoice(msgspec.Struct)</span>
            </div>
            <pre className="flex-1 overflow-hidden p-5 font-mono text-[13px] leading-[1.95] text-chrome/60 lg:p-7 lg:text-[15px] lg:leading-[2.1]">
              {"{\n"}
              {fields.map((f, i) => (
                // Keyed by mode so live rows never inherit the scripted run's inline GSAP styles.
                <span key={`${editing ? "live" : "run"}-${f.key}`} className="relative block pl-5">
                  <span className="text-titanium">&quot;{f.key}&quot;</span>
                  {": "}
                  {editing ? (
                    <span className={f.status === "missing" ? (f.key === "po_ref" ? "text-dim" : "text-rust") : "text-chrome"}>{show(f.key, f.value)}</span>
                  ) : (
                    <span data-slot={f.key} className="text-dim">
                      ░░░░
                    </span>
                  )}
                  {i < fields.length - 1 ? "," : ""}
                  <span className="ml-3 text-dim/80">{`// ${TYPES[f.key]}`}</span>
                  {f.caughtBy && (
                    <span data-fix={editing ? undefined : f.key} className={`ml-2 rounded bg-forge/15 px-1.5 py-0.5 text-[10px] text-forge ${editing ? "" : "invisible"}`}>
                      {f.caughtBy === "constrain" ? "masked at decode" : `repaired ${f.note}`}
                    </span>
                  )}
                  {!editing && f.caughtBy === "repair" && (
                    <span data-tag={f.key} className="invisible absolute right-0 top-0 rounded bg-rust/20 px-1.5 py-0.5 text-[10px] text-[#ff8a5c]">
                      ✕ invalid Decimal
                    </span>
                  )}
                </span>
              ))}
              {"}"}
            </pre>
            {editing ? (
              <div key="seal-live" className={`seal pointer-events-none absolute bottom-5 right-5 ${result.valid ? "" : "seal-bad"}`} aria-hidden>
                {result.valid ? "Schema valid ✓" : "Schema invalid ✕"}
              </div>
            ) : (
              <div key="seal-run" data-seal className="seal invisible pointer-events-none absolute bottom-5 right-5" aria-hidden>
                Schema valid ✓
              </div>
            )}
          </div>
        </div>

        {/* Pedalboard */}
        <div className="amp-panel !bg-transparent relative grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center">
          <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-[38%] hidden h-16 w-full sm:block" aria-hidden>
              <path d="M0 40 Q6 80 12.5 40 Q25 95 37.5 40 Q50 95 62.5 40 Q75 95 87.5 40 Q94 80 100 40" fill="none" stroke="#2a2e35" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <path data-pulse d="M0 40 Q6 80 12.5 40 Q25 95 37.5 40 Q50 95 62.5 40 Q75 95 87.5 40 Q94 80 100 40" pathLength={100} fill="none" stroke="#ff6a1a" strokeWidth="3" strokeDasharray="8 92" strokeDashoffset="100" vectorEffect="non-scaling-stroke" />
            </svg>
            {PEDALS.map((p) => (
              <Pedal key={`${editing ? "live" : "run"}-${p.id}`} {...p} lit={lit(p.id)} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div role="radiogroup" aria-label="Failure-handling strategy" className="grid grid-cols-2 rounded-full border border-line-2 p-1 font-mono text-[11px] uppercase tracking-[0.12em]">
              {(["constrained", "posthoc"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m && editing}
                  onClick={() => {
                    setMode(m);
                    setEditing(true);
                  }}
                  className={`rounded-full px-3 py-2 transition-colors ${mode === m && editing ? "bg-chrome text-void" : "text-mute hover:text-chrome"}`}
                >
                  {m === "constrained" ? "Constrained decoding" : "Post-hoc validation"}
                </button>
              ))}
            </div>
            <ol className="min-h-[5.5rem] space-y-1 font-mono text-[11px] leading-relaxed text-mute" aria-label="Pipeline trace">
              {(editing ? result.trace : [{ stage: "tokenize", msg: "scroll to run the chain, then plug in your own text" } as const]).map((t, i) => (
                <li key={i}>
                  <span className={t.stage === "validate" && t.msg !== "schema valid" ? "text-[#ff8a5c]" : "text-forge"}>{t.stage}</span> · {t.msg}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div data-fly className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden />
        <p className="sr-only" aria-live="polite">
          {editing ? `${result.valid ? "Schema valid" : "Schema invalid"}: ${result.fields.filter((f) => f.value !== null).length} of 6 fields extracted.` : live}
        </p>
      </div>
    </div>
  );
}
