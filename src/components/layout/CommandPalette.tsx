"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type Lenis from "lenis";
import { gsap, prefersReduced } from "@/lib/gsap";
import { amp } from "@/lib/amp";
import { PROFILE, TRACKS } from "@/content/profile";
import { ALL_PROJECTS } from "@/content/projects";
import { downloadResume } from "@/lib/resume";

export type PaletteMode = "search" | "ask";
export type PostLink = { slug: string; title: string };

type Row = { id: string; group: string; label: string; hint: string; glyph: string; run: () => void | Promise<void> };
type Retrieved = { title: string; url: string; score: number; used: boolean };
type Result = { answer: string; citations: { title: string; url: string }[]; confidence: "high" | "medium" | "low" };
type Ask = {
  status: "idle" | "streaming" | "done" | "error";
  question: string;
  partial: string;
  mode?: string;
  model?: string | null;
  retrieved: Retrieved[];
  result?: Result;
  trace?: { latencyMs: number; validation: string; servedBy?: string; outputTokens?: number };
  error?: string;
};

const IDLE: Ask = { status: "idle", question: "", partial: "", retrieved: [] };
const LINKEDIN = PROFILE.socials.find((s) => s.id === "linkedin")!.href;

/** Pulls the (possibly unterminated) "answer" string out of streaming JSON. */
function partialAnswer(json: string) {
  const m = /"answer"\s*:\s*"((?:[^"\\]|\\.)*)/.exec(json);
  if (!m) return "";
  try {
    return JSON.parse(`"${m[1].replace(/\\u?[0-9a-fA-F]{0,3}$|\\$/, "")}"`) as string;
  } catch {
    return m[1];
  }
}

/**
 * ⌘K palette: jump to any track, release or post, open profiles, grab the résumé, flip the
 * amp, or switch to "Ask the Roadie", the AI concierge that answers from the site and cites it.
 */
export function CommandPalette({ open, mode, posts, lenis, onMode, onClose }: { open: boolean; mode: PaletteMode; posts: PostLink[]; lenis: Lenis | null; onMode: (m: PaletteMode) => void; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [ask, setAsk] = useState<Ask>(IDLE);
  const [toast, setToast] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) {
      abort.current?.abort();
      return;
    }
    setQ("");
    setActive(0);
    setAsk(IDLE);
    requestAnimationFrame(() => input.current?.focus());
    if (prefersReduced()) return;
    gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(panel.current, { y: -24, scale: 0.97, opacity: 0, rotateX: 8, transformPerspective: 900 }, { y: 0, scale: 1, opacity: 1, rotateX: 0, duration: 0.55, ease: "expo.out", clearProps: "transform" });
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [mode, open]);

  const go = (href: string) => {
    onClose();
    const hash = href.startsWith("/#") ? href.slice(1) : null;
    if (hash && pathname === "/" && lenis) lenis.scrollTo(hash, { offset: -20 });
    else router.push(href);
  };
  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 1800);
  };

  const all: Row[] = useMemo(
    () => [
      { id: "ask", group: "AI", label: "Ask the Roadie", hint: "AI answers about Hitarth, with sources", glyph: "✦", run: () => onMode("ask") },
      ...TRACKS.map((t) => ({ id: `t-${t.id}`, group: "Tracks", label: `${t.n} · ${t.name}`, hint: `was ${t.was}`, glyph: "♪", run: () => go(`/#${t.id}`) })),
      { id: "t-client-work", group: "Tracks", label: "Client work", hint: "Freelance websites and software", glyph: "♪", run: () => go("/#client-work") },
      ...ALL_PROJECTS.map((p) => ({ id: `p-${p.slug}`, group: p.clientWork ? "Client work" : "Discography", label: p.name, hint: `${p.format} · ${p.status}`, glyph: "◉", run: () => go(`/projects/${p.slug}`) })),
      ...posts.map((p) => ({ id: `b-${p.slug}`, group: "Liner notes", label: p.title, hint: "Post", glyph: "¶", run: () => go(`/blog/${p.slug}`) })),
      { id: "a-resume", group: "Actions", label: "Download résumé (PDF)", hint: "Generated from this site, always current", glyph: "↓", run: async () => {
          flash("Pressing the PDF…");
          await downloadResume();
          flash("Résumé downloaded ✓");
        } },
      PROFILE.email
        ? { id: "a-email", group: "Actions", label: "Copy email", hint: PROFILE.email, glyph: "@", run: async () => {
              await navigator.clipboard.writeText(PROFILE.email!).catch(() => {});
              flash("Email copied ✓");
            } }
        : { id: "a-linkedin", group: "Actions", label: "Message on LinkedIn", hint: "Best way to reach him right now", glyph: "@", run: () => void window.open(LINKEDIN, "_blank", "noopener") },
      { id: "a-amp", group: "Actions", label: amp.on ? "Turn the amp off" : "Turn the amp on", hint: "Site sound: distorted guitar", glyph: "⏻", run: async () => {
          await amp.set(!amp.on);
          if (amp.on) amp.power(82.41, 0.9);
          flash(amp.on ? "Amp on 🤘" : "Amp off");
        } },
      ...PROFILE.socials.map((s) => ({ id: `s-${s.id}`, group: "Elsewhere", label: `Open ${s.label}`, hint: s.handle, glyph: "↗", run: () => void window.open(s.href, "_blank", "noopener") })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posts, pathname, lenis, open],
  );

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return all.filter((r) => r.group !== "Liner notes" || posts.slice(0, 3).some((p) => `b-${p.slug}` === r.id));
    const tokens = query.split(/\s+/);
    const hits = all.filter((r) => tokens.every((t) => `${r.label} ${r.hint} ${r.group}`.toLowerCase().includes(t)));
    // Anything typed can also be asked.
    return [{ ...all[0], label: `Ask the Roadie: “${q.trim()}”`, run: () => submit(q.trim()) }, ...hits.filter((r) => r.id !== "ask")];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, q]);

  useEffect(() => setActive(0), [q, mode]);
  useEffect(() => {
    if (!open || mode !== "search" || !list.current || prefersReduced()) return;
    gsap.fromTo(list.current.querySelectorAll("[data-row]"), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.012, ease: "power2.out", overwrite: true });
  }, [rows, open, mode]);
  useEffect(() => {
    list.current?.querySelector(`[data-row="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  async function submit(question: string) {
    if (!question) return;
    onMode("ask");
    setQ("");
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setAsk({ ...IDLE, status: "streaming", question });
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }), signal: ctl.signal });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setAsk((a) => ({ ...a, status: "error", error: err.error ?? "Something went wrong." }));
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", json = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const lineText = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (!lineText.trim()) continue;
          const ev = JSON.parse(lineText);
          if (ev.type === "meta") setAsk((a) => ({ ...a, mode: ev.mode, model: ev.model, retrieved: ev.retrieved }));
          else if (ev.type === "delta") {
            json += ev.text;
            const partial = partialAnswer(json);
            setAsk((a) => ({ ...a, partial }));
          } else if (ev.type === "done") setAsk((a) => ({ ...a, status: "done", result: ev.result, trace: ev.trace }));
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setAsk((a) => ({ ...a, status: "error", error: "Couldn't reach the Roadie. Try again." }));
    }
  }

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (mode === "ask" && ask.status === "idle") onMode("search");
      else onClose();
    } else if (mode === "ask") {
      if (e.key === "Enter" && q.trim()) submit(q.trim());
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(rows.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && rows[active]) {
      e.preventDefault();
      void rows[active].run();
    }
  };

  const shown = ask.result?.answer ?? ask.partial;
  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[8vh] sm:px-4" role="dialog" aria-modal="true" aria-label={mode === "ask" ? "Ask the Roadie" : "Command palette"} onKeyDown={onKey}>
      <div ref={backdrop} className="absolute inset-0 bg-void/75 backdrop-blur-md" onClick={onClose} />
      <div ref={panel} className="palette relative w-full max-w-2xl overflow-hidden rounded-[22px]">
        <div className="flex items-center gap-3 border-b border-line px-4 sm:px-5">
          {mode === "ask" ? (
            <button type="button" onClick={() => onMode("search")} className="rounded-full border border-forge/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ember" aria-label="Back to search">
              ✦ AI
            </button>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-mute" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          )}
          <input
            ref={input}
            value={q}
            maxLength={400}
            onChange={(e) => setQ(e.target.value)}
            placeholder={mode === "ask" ? "Ask about his work, stack, availability…" : "Jump to a track, release, post… or ask anything"}
            className="h-16 w-full bg-transparent text-[16px] text-chrome placeholder:text-dim focus:outline-none sm:text-[17px]"
            aria-label={mode === "ask" ? "Question for the AI concierge" : "Search"}
            role={mode === "ask" ? undefined : "combobox"}
            aria-expanded={mode === "ask" ? undefined : true}
            aria-controls={mode === "ask" ? undefined : "palette-list"}
          />
          <span className="kbd hidden sm:inline">ESC</span>
        </div>

        {mode === "search" ? (
          <div ref={list} id="palette-list" role="listbox" data-lenis-prevent className="max-h-[60vh] overflow-y-auto p-2">
            {rows.map((r, i) => {
              const head = r.group !== lastGroup ? r.group : null;
              lastGroup = r.group;
              return (
                <div key={r.id}>
                  {head && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">{head}</p>}
                  <button
                    type="button"
                    data-row={i}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => void r.run()}
                    className={`flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition-colors ${i === active ? "bg-white/[0.06]" : ""}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${r.group === "AI" ? "border-forge/50 bg-forge/10 text-ember" : "border-line text-mute"}`}>{r.glyph}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-chrome">{r.label}</span>
                      <span className="block truncate text-xs text-mute">{r.hint}</span>
                    </span>
                    <span className={`text-mute transition-all ${i === active ? "opacity-100" : "opacity-0"}`}>↵</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div data-lenis-prevent className="max-h-[64vh] overflow-y-auto px-5 py-5">
            {ask.status === "idle" && (
              <div>
                <p className="text-[15px] leading-relaxed text-mute">I answer questions about Hitarth using only what is on this site, and I cite where it came from. If it isn&apos;t here, I&apos;ll say so.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["What is confident-extract for?", "Has he run LLMs in production?", "Is he open to founding roles?", "What does he think about constrained decoding?"].map((s) => (
                    <button key={s} type="button" onClick={() => submit(s)} className="rounded-full border border-line-2 px-3 py-1.5 text-[13px] text-chrome/85 transition-colors hover:border-forge hover:text-chrome">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {ask.status !== "idle" && (
              <div>
                <p className="font-display text-[19px] font-bold tracking-[-0.01em] text-chrome">{ask.question}</p>
                <div className="mt-4 min-h-[3.5rem] text-[16px] leading-relaxed text-chrome/85" aria-live="polite">
                  {ask.status === "error" ? <span className="text-[#ff8a5c]">{ask.error}</span> : shown || <span className="text-dim">{ask.retrieved.length ? "Reading the liner notes…" : "Looking it up…"}</span>}
                  {ask.status === "streaming" && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-forge align-middle" aria-hidden />}
                </div>
                {ask.result && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {ask.result.citations.map((c) => (
                      <button key={c.url} type="button" onClick={() => go(c.url)} className="rounded-full border border-forge/40 bg-forge/10 px-3 py-1 text-[12px] text-ember transition-colors hover:bg-forge hover:text-void">
                        ↗ {c.title}
                      </button>
                    ))}
                    <span className={`ml-auto rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${ask.result.confidence === "high" ? "bg-forge text-void" : ask.result.confidence === "medium" ? "border border-ember/60 text-ember" : "border border-line-2 text-mute"}`}>
                      {ask.result.confidence} confidence
                    </span>
                  </div>
                )}
                <details className="mt-5 rounded-xl border border-line bg-white/[0.02] px-4 py-3 font-mono text-[11px] text-mute">
                  <summary className="cursor-pointer select-none uppercase tracking-[0.16em] text-dim">Trace</summary>
                  <dl className="mt-3 space-y-1.5">
                    <div>
                      <dt className="inline text-dim">mode </dt>
                      <dd className="inline text-chrome/80">{ask.mode ?? "…"}{ask.model ? ` · ${ask.trace?.servedBy ?? ask.model} · effort low` : ""}</dd>
                    </div>
                    <div>
                      <dt className="text-dim">retrieved (BM25)</dt>
                      {ask.retrieved.map((r) => (
                        <dd key={r.url + r.title} className={r.used ? "text-chrome/80" : "text-dim line-through"}>
                          {r.score.toFixed(2)} · {r.title}
                        </dd>
                      ))}
                      {!ask.retrieved.length && <dd>nothing matched</dd>}
                    </div>
                    {ask.trace && (
                      <>
                        <div>
                          <dt className="inline text-dim">validation </dt>
                          <dd className="inline text-chrome/80">{ask.trace.validation}</dd>
                        </div>
                        <div>
                          <dt className="inline text-dim">latency </dt>
                          <dd className="inline text-chrome/80">
                            {ask.trace.latencyMs} ms{ask.trace.outputTokens ? ` · ${ask.trace.outputTokens} output tokens` : ""}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </details>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-xs text-dim">
          {mode === "ask" ? (
            <span>AI-generated from this site&apos;s content. It can be wrong; the citations are the source of truth.</span>
          ) : (
            <span className="hidden items-center gap-2 sm:flex">
              <span className="kbd">↑</span>
              <span className="kbd">↓</span> navigate <span className="kbd ml-2">↵</span> open
            </span>
          )}
          <span className="shrink-0 font-mono">{toast || (mode === "ask" ? "↵ ask" : "⌘K")}</span>
        </div>
      </div>
    </div>
  );
}
