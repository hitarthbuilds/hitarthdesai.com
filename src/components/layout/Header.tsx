"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { PROFILE } from "@/content/profile";
import { onPreloaderDone } from "./Preloader";

const NAV = [
  { href: "/#forge", label: "Work" },
  { href: "/#alloy", label: "Stack" },
  { href: "/#temper", label: "Experience" },
  { href: "/blog", label: "Writing" },
];

export function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-flex h-[1.25em] overflow-hidden leading-[1.25em]">
      <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-1/2">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </span>
  );
}

/** HD stamped into a small machined plate, plus the name. */
export function Wordmark() {
  return (
    <span className="group inline-flex items-center gap-3">
      <span className="brushed grid h-9 w-9 place-items-center !rounded-[10px]">
        <span className="display chrome-text chrome-hover text-[15px] leading-none tracking-[-0.06em]">HD</span>
      </span>
      <span className="hidden font-display text-[17px] font-bold tracking-[-0.03em] text-chrome sm:inline" style={{ fontVariationSettings: '"wdth" 85' }}>
        {PROFILE.name}
      </span>
    </span>
  );
}

export function Header() {
  const bar = useRef<HTMLElement>(null);

  useGSAP((_, contextSafe) => {
    const el = bar.current!;
    gsap.set(el, { yPercent: -100, opacity: 0 });
    const off = onPreloaderDone(contextSafe!(() => gsap.to(el, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", delay: 0.4 })));
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        el.dataset.scrolled = String(y > 24);
        if (y > 240 && self.direction === 1) gsap.to(el, { yPercent: -120, duration: 0.5, ease: "power3.out", overwrite: true });
        else if (self.direction === -1) gsap.to(el, { yPercent: 0, duration: 0.5, ease: "power3.out", overwrite: true });
      },
    });
    return () => {
      off();
      st.kill();
    };
  });

  return (
    <header
      ref={bar}
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-500 data-[scrolled=true]:border-b data-[scrolled=true]:border-line data-[scrolled=true]:bg-void/70 data-[scrolled=true]:backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label={`${PROFILE.name}, home`} data-cursor="home">
          <Wordmark />
        </Link>
        <nav className="ml-auto hidden items-center gap-8 text-[14px] text-mute md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="group transition-colors hover:text-chrome">
              <RollText>{n.label}</RollText>
            </Link>
          ))}
        </nav>
        <Link href="/#strike" className="btn btn-steel ml-auto !h-10 !px-4 !text-[13px] md:ml-0">
          <span className="btn-fill" />
          Let&apos;s talk
        </Link>
      </div>
    </header>
  );
}
