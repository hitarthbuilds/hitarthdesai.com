"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import type { Project } from "@/content/projects";
import type { ProjectStats } from "@/lib/stats";
import { AlbumArt } from "../viz/AlbumArt";
import { Odometer } from "../fx/Odometer";
import { ArrowRight } from "../ui/Icons";

/** A record sleeve: the album art is a live visual; a vinyl slides out and spins on hover. */
function Sleeve({ p, stats }: { p: Project; stats?: ProjectStats }) {
  return (
    <article data-card className="sleeve group relative flex w-[min(86vw,500px)] shrink-0 flex-col gap-5 lg:w-[min(44svh,460px)]">
      <Link href={`/projects/${p.slug}`} className="relative block aspect-square" aria-label={`${p.name}: liner notes`} data-cursor="liner notes">
        <span className="vinyl" aria-hidden>
          <span className="vinyl-label">{p.track}</span>
        </span>
        <span className="sleeve-art">
          <AlbumArt visual={p.visual} />
          <span className="absolute right-4 top-4 rounded-full border border-line-2 bg-void/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-chrome/80">
            {p.format}
          </span>
        </span>
      </Link>
      <div>
        <p className="eyebrow flex items-center gap-3">
          <span className="text-forge">Side {p.side} · {p.track}</span>
          <span>{p.status}</span>
        </p>
        <h3 className="display mt-3 text-[clamp(2rem,3.4vw,3.2rem)] text-chrome">{p.name}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-mute lg:line-clamp-3">{p.blurb}</p>
        {stats && (stats.downloadsMonth !== null || stats.stars !== null) && (
          <dl className="mt-5 flex flex-wrap gap-6 font-mono">
            {stats.downloadsMonth !== null && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-dim">PyPI downloads / mo</dt>
                <dd className="mt-1 text-[28px] text-chrome">
                  <Odometer value={stats.downloadsMonth.toLocaleString("en-US")} />
                </dd>
              </div>
            )}
            {stats.stars !== null && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-dim">GitHub stars</dt>
                <dd className="mt-1 text-[28px] text-chrome">
                  <Odometer value={String(stats.stars)} />
                </dd>
              </div>
            )}
            {stats.version && (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-dim">Latest</dt>
                <dd className="mt-1 text-[28px] text-chrome">{stats.version}</dd>
              </div>
            )}
          </dl>
        )}
        <ul className="mt-5 flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-mute">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 text-[14px] [&>a]:py-2.5">
          <Link href={`/projects/${p.slug}`} className="group/l inline-flex items-center gap-2 font-semibold text-chrome">
            Liner notes
            <ArrowRight className="h-4 w-4 transition-transform group-hover/l:translate-x-1" />
          </Link>
          {p.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-mute underline decoration-line-2 underline-offset-4 transition-colors hover:text-chrome">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * Track 03's gallery. Desktop: the section pins and the row of sleeves scrolls sideways
 * (each one swings in from rotateY(-14deg)). Touch and narrow screens: a plain vertical stack.
 */
export function DiscographyGallery({ projects, stats }: { projects: Project[]; stats: Record<string, ProjectStats> }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (pointer: fine)", () => {
        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: root.current, pin: true, start: "top top", end: () => `+=${distance()}`, scrub: 1, invalidateOnRefresh: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-card]", root.current).forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: -14, transformPerspective: 1200, opacity: 0.35 },
            { rotateY: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 95%", end: "left 55%", scrub: true } },
          );
        });
        gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true } });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
      <div data-track className="flex flex-col gap-16 px-5 sm:px-8 lg:w-max lg:flex-row lg:items-start lg:gap-14 lg:px-12 lg:pr-[20vw]">
        {projects.map((p) => (
          <Sleeve key={p.slug} p={p} stats={stats[p.slug]} />
        ))}
      </div>
      <div className="absolute inset-x-12 bottom-8 hidden h-px bg-line lg:block" aria-hidden>
        <div data-progress className="h-full origin-left scale-x-0 bg-forge" />
      </div>
    </div>
  );
}
