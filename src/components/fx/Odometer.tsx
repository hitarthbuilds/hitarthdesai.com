"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

const DIGITS = "0123456789";

/**
 * Mechanical odometer: every digit is a strip that rolls to its value once scrolled into view.
 * Columns are keyed from the right so units stay aligned. Space is reserved up front (no CLS).
 */
export function Odometer({ value, className = "" }: { value: string; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(() => value.replace(/\d/g, "0"));
  useEffect(() => {
    const st = ScrollTrigger.create({ trigger: el.current, start: "top 92%", once: true, onEnter: () => setShown(value) });
    return () => st.kill();
  }, [value]);
  const chars = shown.split("");
  return (
    <span ref={el} className={`odo ${className}`} role="img" aria-label={value}>
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}`} aria-hidden className="inline-block">
              {ch}
            </span>
          );
        return (
          <span key={`d${key}`} aria-hidden className="odo-col">
            <span className="odo-strip" style={{ transform: `translateY(-${+ch * 10}%)`, transitionDelay: `${(key % 6) * 60}ms` }}>
              {DIGITS.split("").map((x) => (
                <span key={x}>{x}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
