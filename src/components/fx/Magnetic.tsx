"use client";

import { useRef, type ReactNode } from "react";
import { gsap, isTouch, prefersReduced, useGSAP } from "@/lib/gsap";

/** Pulls its child toward the pointer while hovered, then snaps back on an elastic ease. */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (isTouch() || prefersReduced()) return;
      const node = el.current!;
      const xTo = gsap.quickTo(node, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(node, "y", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = node.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => gsap.to(node, { x: 0, y: 0, duration: 1, ease: "elastic.out(1,0.35)" });
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      return () => {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      };
    },
    { scope: el },
  );
  return (
    <div ref={el} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}
