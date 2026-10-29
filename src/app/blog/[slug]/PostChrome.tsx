"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Heading } from "@/lib/markdown";

/** Reading progress in forge orange, setlist scroll-spy, and copy buttons on code blocks. */
export function PostChrome({ headings }: { headings: Heading[] }) {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".prose-liner", start: "top 30%", end: "bottom bottom", scrub: 0.3 } });
    const triggers = headings.map((h) =>
      ScrollTrigger.create({
        trigger: `#${CSS.escape(h.id)}`,
        start: "top 40%",
        endTrigger: "html",
        end: "bottom top",
        onToggle: (self) => {
          if (!self.isActive) return;
          document.querySelectorAll("[data-toc-link]").forEach((a) => a.toggleAttribute("data-active", (a as HTMLElement).dataset.tocLink === h.id));
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  });

  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>(".prose-liner .code-block");
    const buttons: HTMLButtonElement[] = [];
    blocks.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(b.querySelector("code")?.textContent ?? "");
          btn.textContent = "Copied ✓";
          setTimeout(() => (btn.textContent = "Copy"), 1600);
        } catch {}
      };
      b.appendChild(btn);
      buttons.push(btn);
    });
    return () => buttons.forEach((b) => b.remove());
  }, []);

  return <div ref={bar} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-forge via-ember to-blood" style={{ transform: "scaleX(0)" }} aria-hidden />;
}
