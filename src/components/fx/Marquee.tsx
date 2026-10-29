"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReduced, useGSAP } from "@/lib/gsap";

/** Infinite marquee whose speed and skew react to scroll velocity. */
export function Marquee({ children, reverse = false, speed = 40, className = "" }: { children: ReactNode; reverse?: boolean; speed?: number; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const t = track.current!;
      const tween = gsap.fromTo(t, { xPercent: reverse ? -50 : 0 }, { xPercent: reverse ? 0 : -50, duration: speed, ease: "none", repeat: -1 });
      const skewTo = gsap.quickTo(t, "skewX", { duration: 0.4, ease: "power3" });
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          gsap.to(tween, { timeScale: 1 + Math.min(4, Math.abs(v) / 400), duration: 0.2, overwrite: true });
          gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.2, ease: "power2.out" });
          skewTo(Math.max(-12, Math.min(12, v / -220)));
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );
  return (
    <div ref={root} className={`mask-x overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
