"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Words } from "./Words";

export type Note = { slug: string; title: string; date: string; dateLabel: string; readMinutes: number; art: string; excerpt: string };
const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** The excerpt set one character per span, so scrolling can type it out like a sheet in a typewriter. */
function Typed({ text }: { text: string }) {
  let c = 0;
  const words = text.split(" ");
  return (
    <span className="tw" style={{ "--n": text.length } as React.CSSProperties}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          {wi > 0 && <i style={{ "--c": c++ } as React.CSSProperties}> </i>}
          <span className="tw-w">
            {[...w].map((ch, ci) => (
              <i key={ci} style={{ "--c": c++ } as React.CSSProperties}>
                {ch}
              </i>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Three featured essays. On wide screens the reel pins: the pictures are a stack of prints that peel
 * away one by one as you scroll, and the open note's excerpt types itself out. Elsewhere the picture
 * follows the row you point at, with the excerpt shown in full.
 */
export function FieldNotes({ notes }: { notes: Note[] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const pinnedRef = useRef(false);

  useEffect(() => {
    const section = ref.current!;
    const reel = section.querySelector<HTMLElement>(".fn-reel")!;
    const root = document.documentElement;
    const wide = matchMedia("(min-width:761px) and (min-height:600px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const arts = [...section.querySelectorAll<HTMLElement>(".fn-art")];
    const rows = [...section.querySelectorAll<HTMLElement>(".fn-row")];
    let queued = false;

    const update = () => {
      queued = false;
      const on = root.classList.contains("scrub") && !root.classList.contains("reveal-fallback") && wide.matches && !reduced.matches;
      pinnedRef.current = on;
      section.toggleAttribute("data-pinned", on);
      if (!on) {
        arts.forEach((a) => a.style.removeProperty("--off"));
        rows.forEach((r) => r.style.removeProperty("--type"));
        return;
      }
      const r = reel.getBoundingClientRect();
      const u = clamp(-r.top / Math.max(1, r.height - innerHeight));
      const n = arts.length;
      const c = u * n;
      const i = Math.min(n - 1, Math.floor(c));
      // The top print peels away at the end of its note; the last one stays.
      arts.forEach((a, j) => a.style.setProperty("--off", (j < n - 1 ? smooth(clamp((c - j - 0.74) / 0.26)) : 0).toFixed(4)));
      rows.forEach((row, j) => row.style.setProperty("--type", (j < i ? 1 : j > i ? 0 : clamp((c - j - 0.03) / 0.6)).toFixed(4)));
      setActive(i);
    };
    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request, { passive: true });
    wide.addEventListener("change", request);
    reduced.addEventListener("change", request);
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      wide.removeEventListener("change", request);
      reduced.removeEventListener("change", request);
    };
  }, []);

  const point = (i: number) => {
    if (!pinnedRef.current) setActive(i);
  };

  return (
    <section className="lower-notes fn" id="writing" aria-labelledby="notes-heading" ref={ref}>
      <div className="fn-head">
        <p className="fn-kicker" data-reveal="up">
          <span>Writing</span>
          <span>({pad(notes.length)}) Featured</span>
        </p>
        <h2 id="notes-heading" className="fn-title" data-reveal="words">
          <Words text="Field notes" tail={<span className="dot">.</span>} />
        </h2>
        <a className="fn-all" href="/blog" data-magnetic="" data-reveal="up">
          <span className="roll">
            <span>All writing</span>
            <span aria-hidden="true">All writing</span>
          </span>
          <i aria-hidden="true">↗</i>
        </a>
      </div>
      <div className="fn-reel">
        <div className="fn-layout">
          <div className="fn-side" aria-hidden="true">
            <div className="fn-picture">
              {notes.map((n, i) => (
                <img
                  key={n.slug}
                  className={`fn-art${i === active ? " is-active" : ""}`}
                  style={{ "--k": i } as React.CSSProperties}
                  src={n.art}
                  width={950}
                  height={633}
                  loading="lazy"
                  decoding="async"
                  alt=""
                />
              ))}
            </div>
            <p className="fn-count">
              <span className="fn-picture-n" key={active}>
                {pad(active + 1)}
              </span>
              <span>/ {pad(notes.length)}</span>
            </p>
          </div>
          <ol className="fn-list" data-skew="">
            {notes.map((n, i) => (
              <li key={n.slug} data-reveal="up" style={{ "--delay": `${i * 110}ms` } as React.CSSProperties}>
                <a
                  className={`fn-row${i === active ? " is-active" : ""}`}
                  href={`/blog/${n.slug}`}
                  data-cursor="Read"
                  onFocus={() => point(i)}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "touch") point(i);
                  }}
                >
                  <span className="fn-n">{pad(i + 1)}</span>
                  <span className="fn-body">
                    <span className="fn-meta">
                      <time dateTime={n.date}>{n.dateLabel}</time>
                      <span>{n.readMinutes} min read</span>
                    </span>
                    <span className="fn-name">{n.title}</span>
                    <span className="fn-excerpt">
                      <span>
                        <span className="sr-only">{n.excerpt}</span>
                        <span aria-hidden="true">
                          <Typed text={n.excerpt} />
                        </span>
                      </span>
                    </span>
                  </span>
                  <span className="fn-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
