"use client";

import { createElement, useRef, type ReactNode } from "react";
import { gsap, SplitText, prefersReduced, useGSAP } from "@/lib/gsap";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

/**
 * Splits text into masked lines/words/chars and slides them up when scrolled into view.
 * The text is server-rendered, so crawlers and no-JS visitors see it unchanged.
 */
export function SplitReveal({
  as = "h2",
  children,
  className = "",
  type = "words",
  delay = 0,
  stagger,
  scrub = false,
  id,
}: {
  as?: Tag;
  children: ReactNode;
  className?: string;
  type?: "chars" | "words" | "lines";
  delay?: number;
  stagger?: number;
  scrub?: boolean;
  id?: string;
}) {
  const el = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const split = new SplitText(el.current!, { type: type === "chars" ? "words,chars" : type, mask: type });
      const targets = type === "chars" ? split.chars : type === "lines" ? split.lines : split.words;
      gsap.from(targets, {
        yPercent: 115,
        rotate: type === "chars" ? 6 : 2,
        duration: type === "chars" ? 1.1 : 1.2,
        ease: "expo.out",
        stagger: stagger ?? (type === "chars" ? 0.022 : type === "words" ? 0.06 : 0.12),
        delay,
        scrollTrigger: { trigger: el.current, start: "top 88%", end: "top 40%", scrub: scrub ? 1 : false },
      });
    },
    { scope: el },
  );
  return createElement(as, { ref: el, className, id }, children);
}

/** Fades and lifts direct children in sequence when the container enters the viewport. */
export function Stagger({ children, className = "", y = 40, selector = ":scope > *" }: { children: ReactNode; className?: string; y?: number; selector?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const items = el.current!.querySelectorAll(selector);
      gsap.from(items, { y, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el.current, start: "top 85%" } });
    },
    { scope: el },
  );
  return (
    <div ref={el} className={className}>
      {children}
    </div>
  );
}

/** Word-by-word highlight scrubbed to scroll position. */
export function ScrubWords({ text, className = "" }: { text: string; className?: string }) {
  const el = useRef<HTMLParagraphElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const split = new SplitText(el.current!, { type: "words" });
      gsap.fromTo(split.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el.current, start: "top 80%", end: "bottom 45%", scrub: true } });
    },
    { scope: el },
  );
  return (
    <p ref={el} className={className}>
      {text}
    </p>
  );
}
