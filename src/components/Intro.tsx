"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A short curtain on the first visit of a session: the HD mark and a counter while the portrait
 * decodes, then the curtain lifts away as six staggered strips and the hero type rises. Skipped for reduced motion and repeat visits.
 */
export function Intro() {
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const finish = () => {
      root.classList.add("intro-done");
      setGone(true);
    };
    if (root.classList.contains("intro-skip")) {
      finish();
      return;
    }
    try {
      sessionStorage.setItem("hd-intro", "1");
    } catch {}
    window.__lenis?.stop();
    const img = document.querySelector<HTMLImageElement>(".hero-photo");
    const ready = img ? img.decode().catch(() => undefined) : Promise.resolve();
    const t0 = performance.now();
    const MIN = 1100;
    let raf = 0;
    let loaded = false;
    ready.then(() => (loaded = true));
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / MIN);
      // Ease toward 90 until the portrait is ready, then run to 100.
      const target = loaded ? 100 : 90;
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1 || !loaded) {
        raf = requestAnimationFrame(step);
        return;
      }
      setCount(100);
      panel.current?.classList.add("intro-out");
      root.classList.add("intro-done");
      window.__lenis?.start();
      setTimeout(() => setGone(true), 1400);
    };
    raf = requestAnimationFrame(step);
    // Never hold the page for more than about three seconds.
    const bail = setTimeout(() => {
      loaded = true;
    }, 2600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bail);
    };
  }, []);

  if (gone) return null;
  return (
    <div className="intro" ref={panel} aria-hidden="true">
      <div className="intro-strips">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="intro-inner">
        <img className="intro-mark" src="/media/maker-mark.svg" width={64} height={64} alt="" />
        <p className="intro-name">
          <span>Hitarth Desai</span>
          <span>AI Systems Engineer</span>
        </p>
      </div>
      <p className="intro-count">{String(count).padStart(3, "0")}</p>
      <span className="intro-bar" style={{ transform: `scaleX(${count / 100})` }} />
    </div>
  );
}
