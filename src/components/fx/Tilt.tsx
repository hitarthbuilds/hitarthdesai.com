"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, isTouch, prefersReduced, useGSAP } from "@/lib/gsap";

/** 3D tilt toward the pointer, publishing --mx / --my for sheen and spotlight layers. */
export function Tilt({ children, className = "", max = 8, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const el = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (isTouch() || prefersReduced()) return;
      const node = el.current!;
      gsap.set(node, { transformPerspective: 900 });
      const rx = gsap.quickTo(node, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(node, "rotationY", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = node.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        node.style.setProperty("--mx", `${px * 100}%`);
        node.style.setProperty("--my", `${py * 100}%`);
        rx((0.5 - py) * max);
        ry((px - 0.5) * max);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
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
    <div ref={el} className={`will-change-transform ${className}`} style={style}>
      {children}
    </div>
  );
}
