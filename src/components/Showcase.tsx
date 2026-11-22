"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { CATEGORIES, PROJECTS, type Category } from "@/content/projects";
import { Words } from "./Words";

// The six products that are live today, in the order they are shown.
const LIVE = [
  { slug: "seerflow", url: "https://seerflow.in/", host: "seerflow.in" },
  { slug: "shott", url: "https://shott.in/", host: "shott.in" },
  { slug: "shah-bv", url: "https://shahbv.vercel.app/", host: "shahbv.vercel.app" },
  { slug: "reaxon", url: "https://reaxon.in/", host: "reaxon.in" },
  { slug: "fossae", url: "https://fossae.in/", host: "fossae.in" },
  { slug: "barenature", url: "https://barenature.co.in/", host: "barenature.co.in" },
].map((l) => ({ ...l, project: PROJECTS.find((p) => p.slug === l.slug)! }));

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Selected work. The first panel opens with the words "Selected work" cut out of a paper plate over
 * the first live site; scrolling dives through the lettering, then the site settles into a frame
 * beside its description. Each following site rises as a sheet over the one before, which recedes.
 * The copy never sits on a screenshot. An index of all ten projects follows, with a hover preview.
 */
export function Showcase() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current!;
    const dwell = section.querySelector<HTMLElement>(".sc-dwell")!;
    const word = section.querySelector<HTMLElement>(".sc-word")!;
    const anchor = section.querySelector<HTMLElement>(".sc-anchor")!;
    const first = section.querySelector<HTMLElement>(".sc-card")!;
    const firstFrame = first.querySelector<HTMLElement>(".sc-frame")!;
    const cards = [...section.querySelectorAll<HTMLElement>(".sc-card")];
    const index = section.querySelector<HTMLElement>(".sc-index")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let queued = false;

    // Zoom toward the stem of the "L" so the dive ends inside a letter, not in a gap.
    // The first site starts scaled up to cover the screen and settles into its frame after the dive.
    const measure = () => {
      const x = anchor.offsetLeft + anchor.offsetWidth * 0.2;
      const y = anchor.offsetTop + anchor.offsetHeight * 0.55;
      word.style.transformOrigin = `${x}px ${y}px`;
      const w = first.clientWidth;
      const h = first.clientHeight;
      const fw = firstFrame.offsetWidth;
      const fh = firstFrame.offsetHeight;
      const k = Math.max(w / fw, h / fh);
      first.style.setProperty("--k", k.toFixed(4));
      first.style.setProperty("--tx", (w / 2 - (firstFrame.offsetLeft + fw / 2)).toFixed(1) + "px");
      first.style.setProperty("--ty", (h / 2 - (firstFrame.offsetTop + fh / 2)).toFixed(1) + "px");
    };

    const update = () => {
      queued = false;
      const vh = innerHeight;
      if (reduced.matches) {
        cards.forEach((c) => {
          c.style.removeProperty("--e");
          c.style.removeProperty("--l");
          c.classList.add("is-active");
        });
        section.style.setProperty("--dp", "1");
        first.style.setProperty("--s", "1");
        return;
      }
      const p = clamp(-section.getBoundingClientRect().top / Math.max(1, dwell.offsetHeight));
      section.style.setProperty("--dp", p.toFixed(4));
      word.style.transform = `scale(${(1 + Math.pow(Math.min(p, 0.46) / 0.46, 2.4) * 38).toFixed(3)})`;
      // The dive finishes in the first half; the rest holds the first site still, long enough to read.
      const settle = clamp((p - 0.48) / 0.24);
      first.style.setProperty("--s", (settle * settle * (3 - 2 * settle)).toFixed(4));
      const enter = cards.map((c, i) => (i === 0 ? 1 : clamp(1 - c.getBoundingClientRect().top / vh)));
      // The index slides over the last site the way each site slides over the one before.
      enter.push(clamp(1 - index.getBoundingClientRect().top / vh));
      cards.forEach((c, i) => {
        const e = enter[i];
        const l = enter[i + 1] ?? 0;
        c.style.setProperty("--e", e.toFixed(4));
        c.style.setProperty("--l", l.toFixed(4));
        const active = i === 0 ? p > 0.66 && l < 0.5 : e > 0.45 && l < 0.5;
        c.classList.toggle("is-active", active);
      });
    };
    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      request();
    };
    measure();
    update();
    document.fonts?.ready.then(onResize);
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", request);
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", onResize);
      reduced.removeEventListener("change", request);
    };
  }, []);

  return (
    <section className="showcase" id="work" aria-labelledby="work-heading" ref={ref}>
      <h2 id="work-heading" className="sr-only">
        Selected work
      </h2>
      {LIVE.map(({ project: p, url, host }, i) => (
        <Fragment key={p.slug}>
          <Panel index={i} total={LIVE.length} project={p} url={url} host={host} dive={i === 0} />
          {i === 0 && <div className="sc-dwell" aria-hidden="true" />}
          {i > 0 && i < LIVE.length - 1 && <div className="sc-hold" aria-hidden="true" />}
        </Fragment>
      ))}
      <div className="sc-tail" aria-hidden="true" />
      <ProjectIndex />
    </section>
  );
}

function Panel({ index, total, project: p, url, host, dive }: { index: number; total: number; project: (typeof PROJECTS)[number]; url: string; host: string; dive: boolean }) {
  return (
    <article className={`sc-card${dive ? " sc-card--dive" : ""}`} aria-labelledby={`sc-${p.slug}`} style={{ zIndex: index + 1 }}>
      <div className="sc-sheet">
        <div className="sc-bar">
          <span className="sc-count">
            {pad(index + 1)} <i>/</i> {pad(total)}
          </span>
          <a className="sc-url" href={url} rel="noopener" target="_blank" data-magnetic="">
            <span className="sc-dot" aria-hidden="true" />
            {host}
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="sc-frame">
          <img src={`/work/live/${p.slug}.webp`} alt={`The ${p.name} website, live at ${host}.`} width={2000} height={1250} loading={dive ? "eager" : "lazy"} decoding="async" />
          <a className="sc-hit" href={`/projects/${p.slug}`} data-cursor="Case study" tabIndex={-1} aria-hidden="true" />
        </div>
        {dive && (
          <div className="sc-mask" aria-hidden="true">
            <p className="sc-word">
              <span>
                Se<span className="sc-anchor">l</span>ected
              </span>
              <span>work</span>
            </p>
          </div>
        )}
        {dive && (
          <p className="sc-hint" aria-hidden="true">
            <span>Six live products</span>
            <span>Scroll to dive in</span>
          </p>
        )}
        <div className="sc-info">
          <p className="sc-kind">
            <b>Selected work</b> {p.category} <i>—</i> {p.field}
          </p>
          <h3
            id={`sc-${p.slug}`}
            className={`sc-name${p.name.length > 12 ? " sc-name--long" : ""}`}
            style={{ "--len": Math.max(...p.name.split(" ").map((w) => w.length)) } as React.CSSProperties}
          >
            <Words text={p.name} />
          </h3>
          <div className="sc-detail">
            <p className="sc-desc">{p.description}</p>
            <ul className="sc-tools" aria-label="Built with">
              {p.tools.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="sc-actions">
              <a className="sc-btn sc-btn--solid" href={`/projects/${p.slug}`} data-magnetic="">
                <span className="roll">
                  <span>Case study</span>
                  <span aria-hidden="true">Case study</span>
                </span>
                <span className="sr-only">: {p.name}</span>
              </a>
              <a className="sc-btn" href={url} rel="noopener" target="_blank" data-magnetic="">
                <span className="roll">
                  <span>Visit site ↗</span>
                  <span aria-hidden="true">Visit site ↗</span>
                </span>
                <span className="sr-only">: {host} (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
        <span className="sc-shade" aria-hidden="true" />
      </div>
    </article>
  );
}

/** Every project as a row; a preview floats beside the pointer, and the list filters by kind. */
function ProjectIndex() {
  const [category, setCategory] = useState<Category>("All");
  const [hover, setHover] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const shown = category === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === category);

  useEffect(() => {
    const ul = list.current!;
    const box = float.current!;
    const fine = matchMedia("(hover:hover) and (pointer:fine)");
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      frame = 0;
    const tick = () => {
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      const tilt = Math.max(-8, Math.min(8, (x - cx) * 0.06));
      box.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`;
      frame = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!fine.matches) return;
      const r = ul.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!box.classList.contains("is-on")) {
        cx = x;
        cy = y;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    ul.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ul.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="sc-index" id="projects">
      <div className="sc-index-head">
        <h3 data-reveal="words">
          <Words text="All projects" />
          <sup>({pad(PROJECTS.length)})</sup>
        </h3>
        <div className="sc-filters" role="group" aria-label="Filter projects" data-reveal="up">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
              <sup>{pad(c === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === c).length)}</sup>
            </button>
          ))}
        </div>
      </div>
      <div className="sc-list" ref={list} onPointerLeave={() => setHover(null)}>
        <ul className="sc-rows">
        {shown.map((p, i) => (
          <li key={`${category}-${p.slug}`} style={{ "--i": i } as React.CSSProperties}>
            <a className="sc-row" href={`/projects/${p.slug}`} onPointerEnter={() => setHover(p.slug)} onFocus={() => setHover(p.slug)} onBlur={() => setHover(null)}>
              <span className="sc-row-n">{pad(PROJECTS.indexOf(p) + 1)}</span>
              <img className="sc-row-thumb" src={thumb(p)} alt="" width={160} height={100} loading="lazy" decoding="async" />
              <span className="sc-row-name">{p.name}</span>
              <span className="sc-row-field">{p.field}</span>
              <span className="sc-row-kind">{p.category}</span>
              <span className="sc-row-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
        </ul>
        <div className={`sc-float${hover ? " is-on" : ""}`} ref={float} aria-hidden="true">
          {PROJECTS.map((p) => (
            <img key={p.slug} src={thumb(p)} alt="" width={640} height={400} loading="lazy" decoding="async" className={hover === p.slug ? "is-active" : undefined} />
          ))}
        </div>
      </div>
    </div>
  );
}

const thumb = (p: (typeof PROJECTS)[number]) => (LIVE.some((l) => l.slug === p.slug) ? `/work/live/${p.slug}.webp` : p.image);
