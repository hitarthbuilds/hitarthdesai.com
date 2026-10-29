"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, prefersReduced, useGSAP } from "@/lib/gsap";

// Flipped asynchronously so StrictMode's synchronous double-invoke of effects on the
// initial load doesn't mistake the re-run for a client-side navigation.
let ready = false;

/**
 * Route transition: a steel shutter drops and lifts on every client-side navigation.
 * Only opacity touches the page wrapper; transforms would break fixed/pinned children.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const shutter = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ready || prefersReduced()) {
      setTimeout(() => (ready = true), 0);
      return;
    }
    const s = shutter.current!;
    const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
    tl.set(s, { display: "grid", yPercent: 0 })
      .fromTo(s.querySelector("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power3.out" })
      .to(s.querySelector("[data-mark]"), { opacity: 0, yPercent: -40, duration: 0.35, ease: "power3.in" }, "+=0.05")
      .to(s, { yPercent: -100, duration: 0.85, ease: "hop" }, "<0.1")
      .fromTo(page.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out", clearProps: "opacity" }, "<0.25")
      .set(s, { display: "none" });
  });

  return (
    <>
      <div ref={shutter} aria-hidden className="brushed pointer-events-none fixed inset-0 z-[85] place-items-center !rounded-none" style={{ display: "none" }}>
        <div className="flex flex-col items-center gap-5">
          <span data-mark className="display chrome-text text-[14vw] leading-none sm:text-[9vw]">
            HD
          </span>
          <span data-rule className="block h-[2px] w-40 origin-left bg-forge shadow-[0_0_14px_var(--forge)]" />
        </div>
      </div>
      <div ref={page}>{children}</div>
    </>
  );
}
