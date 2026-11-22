"use client";

import { useState } from "react";
import { Words } from "./Words";

export type Note = { slug: string; title: string; date: string; dateLabel: string; readMinutes: number; art: string; excerpt: string };
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Three featured essays. The picture is sticky and changes with a shutter as you point at a row;
 * the active row opens to show its excerpt, and a hovered row inverts to ink.
 */
export function FieldNotes({ notes }: { notes: Note[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="lower-notes fn" id="writing" aria-labelledby="notes-heading">
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
      <div className="fn-layout">
        <div className="fn-picture" aria-hidden="true" data-reveal="clip">
          {notes.map((n, i) => (
            <img key={n.slug} className={`fn-art${i === active ? " is-active" : ""}`} src={n.art} width={950} height={633} loading="lazy" decoding="async" alt="" />
          ))}
          <span className="fn-picture-n" key={active}>
            {pad(active + 1)}
          </span>
        </div>
        <ol className="fn-list" data-skew="">
          {notes.map((n, i) => (
            <li key={n.slug} data-reveal="up" style={{ "--delay": `${i * 110}ms` } as React.CSSProperties}>
              <a
                className={`fn-row${i === active ? " is-active" : ""}`}
                href={`/blog/${n.slug}`}
                data-cursor="Read"
                onFocus={() => setActive(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "touch") setActive(i);
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
                    <span>{n.excerpt}</span>
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
    </section>
  );
}
