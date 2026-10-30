"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { PROFILE } from "@/content/profile";
import { amp, useAmp } from "@/lib/amp";
import { useUi } from "./Providers";
import { onPreloaderDone } from "./Preloader";

const NAV = [
  { href: "/#discography", label: "Work" },
  { href: "/#rig", label: "Stack" },
  { href: "/#tour", label: "Experience" },
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

/** A blackletter band logo in chrome, plus the name. */
export function Wordmark() {
  return (
    <span className="group inline-flex items-center gap-3">
      <span className="blackletter chrome-text chrome-hover text-[30px] leading-none">HD</span>
      <span className="hidden font-display text-[17px] font-bold tracking-[-0.03em] text-chrome sm:inline" style={{ fontVariationSettings: '"wdth" 85' }}>
        {PROFILE.name}
      </span>
    </span>
  );
}

/** Sound toggle styled as an amp's standby switch. Off by default; the choice is remembered. */
function AmpSwitch() {
  const on = useAmp();
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Amp on: turn site sound off" : "Amp off: turn site sound on"}
      onClick={() => void amp.set(!on).then(() => amp.power(82.41, 0.9))}
      className="group flex h-10 items-center gap-2.5 rounded-full border border-line bg-steel-1/60 pl-3 pr-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-mute transition-colors hover:border-line-2 hover:text-chrome"
      data-cursor={on ? "standby" : "plug in"}
    >
      <span className={`h-2 w-2 rounded-full transition-all ${on ? "bg-blood shadow-[0_0_10px_2px_rgba(217,20,43,.8)]" : "bg-steel-3"}`} aria-hidden />
      Amp
      <span className="relative h-4 w-7 rounded-full border border-line-2 bg-void" aria-hidden>
        <span className={`absolute top-[2px] h-2.5 w-2.5 rounded-full bg-chrome transition-all duration-300 ${on ? "left-[13px]" : "left-[2px]"}`} />
      </span>
    </button>
  );
}

export function Header() {
  const bar = useRef<HTMLElement>(null);
  const { openPalette } = useUi();

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
        if (y > 240 && self.direction === 1) gsap.to(el, { yPercent: -120, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        else if (self.direction === -1) gsap.to(el, { yPercent: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
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
        <button
          type="button"
          onClick={() => openPalette()}
          className="ml-auto hidden h-10 items-center gap-2.5 rounded-full border border-line pl-3.5 pr-2 text-[13px] text-mute transition-colors hover:border-line-2 hover:text-chrome md:ml-0 lg:flex"
          aria-label="Open the command palette"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Search or ask
          <span className="kbd">⌘K</span>
        </button>
        <div className="ml-auto lg:ml-0">
          <AmpSwitch />
        </div>
        <button type="button" onClick={() => openPalette()} className="icon-btn !h-10 !w-10 shrink-0 lg:hidden" aria-label="Open menu and search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>
        <Link href="/#encore" className="btn btn-steel hidden !h-10 !px-4 !text-[13px] sm:inline-flex">
          <span className="btn-fill" />
          Let&apos;s talk
        </Link>
      </div>
    </header>
  );
}
