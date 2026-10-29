"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, isTouch, useGSAP } from "@/lib/gsap";
import { ArrowRight } from "../ui/Icons";

export type Row = { slug: string; title: string; date: string; readMinutes: number; excerpt: string; tags: string[] };

/** Big post rows; on desktop a lyric-sheet preview card follows the pointer over the list. */
export function LinerNotesList({ rows }: { rows: Row[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  useGSAP(
    () => {
      if (isTouch()) return;
      const card = root.current!.querySelector<HTMLElement>("[data-preview]")!;
      const xTo = gsap.quickTo(card, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = root.current!.getBoundingClientRect();
        xTo(e.clientX - r.left + 28);
        yTo(e.clientY - r.top - 90);
      };
      root.current!.addEventListener("pointermove", move);
      return () => root.current?.removeEventListener("pointermove", move);
    },
    { scope: root },
  );
  useGSAP(
    () => {
      gsap.to("[data-preview]", { autoAlpha: active === null ? 0 : 1, scale: active === null ? 0.92 : 1, rotate: active === null ? -4 : -2, duration: 0.35, ease: "power3.out" });
    },
    { scope: root, dependencies: [active] },
  );
  const cur = active === null ? null : rows[active];

  return (
    <div ref={root} className="relative" onPointerLeave={() => setActive(null)}>
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((r, i) => (
          <li key={r.slug} onPointerEnter={() => setActive(i)}>
            <Link href={`/blog/${r.slug}`} className="group grid gap-3 py-8 md:grid-cols-[9rem_minmax(0,1fr)_auto] md:items-center md:gap-10" data-cursor="read">
              <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-dim">
                {r.date}
                <span className="block text-mute">{r.readMinutes} min read</span>
              </span>
              <span className="font-display text-[clamp(1.5rem,3vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.03em] text-chrome transition-colors group-hover:text-ember">{r.title}</span>
              <span className="hidden h-14 w-14 place-items-center rounded-full border border-line-2 text-chrome transition-all duration-500 group-hover:translate-x-2 group-hover:border-forge group-hover:bg-forge group-hover:text-void md:grid">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div data-preview className="lyric-sheet pointer-events-none absolute left-0 top-0 z-10 hidden w-[320px] lg:block" style={{ opacity: 0, visibility: "hidden" }} aria-hidden>
        {cur && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-forge">Liner notes</p>
            <p className="mt-3 text-[14px] leading-relaxed text-chrome/85">{cur.excerpt}</p>
            <p className="mt-4 flex flex-wrap gap-1.5">
              {cur.tags.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[10px] text-mute">
                  {t}
                </span>
              ))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
