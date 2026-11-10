"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/gsap";
import { Cursor } from "./Cursor";
import { CommandPalette, type PaletteMode, type PostLink } from "./CommandPalette";

type Ui = { lenis: Lenis | null; openPalette: (mode?: PaletteMode) => void };

const UiContext = createContext<Ui | null>(null);

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <Providers>");
  return ctx;
}

export function Providers({ children, posts }: { children: ReactNode; posts: PostLink[] }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [palette, setPalette] = useState<{ open: boolean; mode: PaletteMode }>({ open: false, mode: "search" });
  const pathname = usePathname();

  // One Lenis instance, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (prefersReduced()) return;
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const hash = window.location.hash.slice(1);
      const target = hash ? document.getElementById(hash) : null;
      if (lenis) lenis.scrollTo(target ?? 0, { immediate: true, force: true });
      else target?.scrollIntoView();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  const openPalette = useCallback((mode: PaletteMode = "search") => setPalette({ open: true, mode }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => ({ open: !p.open, mode: "search" }));
      } else if (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea,select,[contenteditable]")) {
        e.preventDefault();
        setPalette({ open: true, mode: "search" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (palette.open) lenis?.stop();
    else lenis?.start();
  }, [palette.open, lenis]);

  const value = useMemo<Ui>(() => ({ lenis, openPalette }), [lenis, openPalette]);

  return (
    <UiContext.Provider value={value}>
      {children}
      <button type="button" onClick={() => openPalette("ask")} className="ask-chip" aria-label="Ask the Roadie, the AI concierge" data-cursor="ask AI">
        <span className="text-ember" aria-hidden>
          ✦
        </span>
        Ask
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-dim sm:inline">AI</span>
      </button>
      <CommandPalette
        open={palette.open}
        mode={palette.mode}
        posts={posts}
        lenis={lenis}
        onMode={(mode) => setPalette((p) => ({ ...p, mode }))}
        onClose={() => setPalette((p) => ({ ...p, open: false }))}
      />
      <Cursor />
    </UiContext.Provider>
  );
}
