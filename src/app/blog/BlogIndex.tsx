"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Flip, gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import { SplitReveal } from "@/components/fx/Reveal";
import { ArrowRight } from "@/components/ui/Icons";

type Post = { slug: string; title: string; date: string; readMinutes: number; excerpt: string; tags: string[] };

/** The /blog index: every post as a track listing, with tag filters animated by GSAP Flip. */
export function BlogIndex({ posts }: { posts: Post[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [tag, setTag] = useState<string | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const tags = useMemo(() => {
    const count = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t);
  }, [posts]);

  const pick = (t: string | null) => {
    flipState.current = Flip.getState(root.current!.querySelectorAll("[data-post]"));
    setTag(t);
  };
  useGSAP(
    () => {
      if (!flipState.current || prefersReduced()) return;
      Flip.from(flipState.current, {
        duration: 0.6,
        ease: "power3.inOut",
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
      });
      flipState.current = null;
    },
    { scope: root, dependencies: [tag] },
  );

  const shown = tag ? posts.filter((p) => p.tags.includes(tag)) : posts;

  return (
    <div ref={root} className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 sm:px-8 lg:px-12">
      <p className="eyebrow text-forge">Track 07 / Liner Notes · was Publish</p>
      <SplitReveal as="h1" type="chars" className="display mt-5 text-[clamp(3.4rem,10vw,10rem)] text-chrome">
        Liner <span className="blackletter molten">notes.</span>
      </SplitReveal>
      <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-mute">
        Field notes on making LLMs reliable in production by Hitarth Desai, AI Systems Engineer: structured outputs, pipeline infrastructure, and the unglamorous layer in between.
      </p>
      <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
        {[null, ...tags].map((t) => (
          <button
            key={t ?? "all"}
            type="button"
            aria-pressed={tag === t}
            onClick={() => pick(t)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[12px] transition-colors ${tag === t ? "border-forge bg-forge text-void" : "border-line-2 text-mute hover:text-chrome"}`}
          >
            {t ?? `All ${posts.length}`}
          </button>
        ))}
      </div>
      <ol className="mt-12 border-t border-line">
        {shown.map((p, i) => (
          <li key={p.slug} data-post className="border-b border-line" data-flip-id={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group grid gap-3 py-8 md:grid-cols-[4rem_9rem_minmax(0,1fr)_auto] md:items-baseline md:gap-8">
              <span className="font-mono text-[12px] text-forge">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-dim">
                {p.date}
                <span className="block text-mute">{p.readMinutes} min</span>
              </span>
              <span>
                <span className="block font-display text-[clamp(1.4rem,2.6vw,2.2rem)] font-bold leading-[1.08] tracking-[-0.03em] text-chrome transition-colors group-hover:text-ember">{p.title}</span>
                <span className="mt-2 block max-w-3xl text-[15px] leading-relaxed text-mute">{p.excerpt}</span>
              </span>
              <ArrowRight className="hidden h-6 w-6 text-mute transition-transform group-hover:translate-x-2 group-hover:text-forge md:block" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
