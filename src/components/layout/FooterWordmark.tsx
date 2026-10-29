"use client";

import { useRef } from "react";
import { gsap, SplitText, isTouch, prefersReduced, useGSAP } from "@/lib/gsap";

/**
 * Full-width outlined blackletter wordmark. Letters rise in as the footer arrives; on pointer
 * move the ones nearest the cursor bulge vertically and fill with chrome, then spring back.
 */
export function FooterWordmark({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const el = root.current!.querySelector("p")!;
      const split = new SplitText(el, { type: "chars", charsClass: "fw-char" });
      const chars = split.chars as HTMLElement[];
      gsap.from(chars, { yPercent: 100, rotate: 8, stagger: 0.05, ease: "expo.out", duration: 1.4, scrollTrigger: { trigger: root.current, start: "top 95%" } });
      if (isTouch()) return;
      const onMove = (e: PointerEvent) => {
        chars.forEach((c) => {
          const r = c.getBoundingClientRect();
          const k = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 380);
          gsap.to(c, { scaleY: 1 + k * 0.3, duration: 0.5, ease: "power3.out", overwrite: "auto" });
          c.classList.toggle("is-lit", k > 0.55);
        });
      };
      const onLeave = () => {
        gsap.to(chars, { scaleY: 1, duration: 0.9, ease: "elastic.out(1,0.4)" });
        chars.forEach((c) => c.classList.remove("is-lit"));
      };
      const node = root.current!;
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
      return () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root },
  );
  return (
    <div ref={root} className="select-none overflow-hidden px-2 pb-4" aria-hidden>
      <p className="footer-wordmark">{text}</p>
    </div>
  );
}
