"use client";

import { useEffect, useRef, useState } from "react";
import { Monogram } from "./Monogram";
import { Words } from "./Words";

const ROWS = [
  {
    title: "InfraDock AI",
    body: "I build document-processing infrastructure: PDF ingestion, adapters, confidence scoring and review workflows. The hard part is making an extraction reliable enough for the system that consumes it.",
  },
  {
    title: "Tools I reach for",
    body: "Python, SQL and PostgreSQL for data services. FastAPI, Docker and async workers for production pipelines. Structured outputs, evaluation harnesses and observability keep failures visible.",
  },
  {
    title: "Background",
    body: "Based in Surat, Gujarat. B.E. in Computer Engineering, class of 2026, Gujarat Technological University. Previously a two-term AI/ML lead at GDSC Surat.",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The practice, three chapters. On wide screens with motion allowed the section pins and scrolling
 * steps through the chapters one at a time, each in the same slot, with a rail to jump between
 * them. Otherwise the chapters are a plain numbered list.
 */
export function Practice() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const pinnedRef = useRef(false);

  useEffect(() => {
    const section = ref.current!;
    const root = document.documentElement;
    const wide = matchMedia("(min-width:761px) and (min-height:560px)");
    let queued = false;

    const update = () => {
      queued = false;
      const pinned = root.classList.contains("scrub") && !root.classList.contains("reveal-fallback") && wide.matches;
      pinnedRef.current = pinned;
      if (!pinned) {
        section.style.removeProperty("--pp");
        return;
      }
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
      section.style.setProperty("--pp", p.toFixed(4));
      setActive(Math.min(ROWS.length - 1, Math.floor(p * ROWS.length)));
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
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
      wide.removeEventListener("change", request);
    };
  }, []);

  const goTo = (i: number) => {
    const section = ref.current!;
    if (!pinnedRef.current) return;
    const top = section.getBoundingClientRect().top + scrollY;
    const y = top + (section.offsetHeight - innerHeight) * ((i + 0.5) / ROWS.length);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });
    else scrollTo({ top: y });
  };

  return (
    <section id="practice" className="practice" aria-labelledby="practice-title" ref={ref}>
      <div className="pr-stage">
        <div className="pr-side">
          <h2 id="practice-title" data-reveal="words">
            <Words text="The practice" tail={<span className="dot">.</span>} />
          </h2>
          <p className="pr-lede" data-reveal="up">
            Production AI and data infrastructure, from ingestion through verification.
          </p>
          <figure className="pr-art" aria-hidden="true">
            <img src="/media/split/embossed-h.webp" alt="" width={1300} height={650} loading="lazy" decoding="async" />
            <Monogram />
          </figure>
        </div>
        <div className="pr-main">
          <ol className="pr-rail" aria-label="Chapters">
            {ROWS.map((row, i) => (
              <li key={row.title}>
                <button type="button" aria-current={active === i ? "step" : undefined} onClick={() => goTo(i)} data-magnetic="">
                  <span>{pad(i + 1)}</span>
                  {row.title}
                </button>
              </li>
            ))}
          </ol>
          <span className="pr-bar" aria-hidden="true">
            <i />
          </span>
          <div className="pr-rows">
            {ROWS.map((row, i) => (
              <article key={row.title} className="pr-row" data-on={active === i || undefined} data-reveal="up">
                <p className="pr-n" aria-hidden="true">
                  {pad(i + 1)}
                </p>
                <h3>
                  <Words text={row.title} />
                </h3>
                <p className="pr-body">{row.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
