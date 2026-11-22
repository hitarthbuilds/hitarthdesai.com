"use client";

import { useEffect, useRef } from "react";
import { Words } from "./Words";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The two ways into the portfolio. Pinned, each photo first shows only through its own giant
 * lettering; scrolling dives the camera through one letter's stroke until the photo fills the card,
 * while the pair unfolds from an angled corner into a flat split. Then the real titles rise in.
 */
export function Pathways() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = ref.current!;
    const root = document.documentElement;
    const cards = [...nav.querySelectorAll<HTMLElement>(".path-card")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let queued = false;

    // Dive through the middle of one letter's stroke, so the photo opens from inside the type.
    const aim = () => {
      cards.forEach((card) => {
        const word = card.querySelector<HTMLElement>(".pm-word");
        const focus = card.querySelector<HTMLElement>(".pm-f");
        if (!word || !focus) return;
        const x = focus.offsetLeft + focus.offsetWidth / 2;
        const y = focus.offsetTop + focus.offsetHeight * 0.56;
        word.style.transformOrigin = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
    };

    const update = () => {
      queued = false;
      const on = root.classList.contains("scrub") && !root.classList.contains("reveal-fallback") && !reduced.matches;
      nav.toggleAttribute("data-pinned", on);
      if (!on) {
        nav.style.removeProperty("--book");
        cards.forEach((c) => ["--ms", "--mo", "--txt"].forEach((v) => c.style.removeProperty(v)));
        return;
      }
      const r = nav.getBoundingClientRect();
      const vh = innerHeight;
      const u = clamp(-r.top / Math.max(1, r.height - vh));
      nav.style.setProperty("--book", (1 - smooth(clamp(u / 0.46))).toFixed(4));
      cards.forEach((card, i) => {
        const lag = i * 0.07;
        const k = clamp((u - 0.03 - lag) / 0.46);
        // Slow at first, then rushing through the stroke.
        card.style.setProperty("--ms", (1 + k * k * k * 80).toFixed(3));
        card.style.setProperty("--mo", (1 - smooth(clamp((k - 0.8) / 0.2))).toFixed(3));
        card.style.setProperty("--txt", smooth(clamp((u - 0.5 - lag) / 0.24)).toFixed(4));
      });
    };
    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      aim();
      request();
    };
    aim();
    update();
    document.fonts?.ready.then(onResize);
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", request);
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", onResize);
      reduced.removeEventListener("change", request);
    };
  }, []);

  return (
    <nav id="paths" aria-label="Explore Hitarth's portfolio" className="pathways" ref={ref}>
      <div className="paths-stage">
        <a className="path-card path-work" href="#work" data-cursor="Dive in">
          <img src="/media/split/machine.webp" alt="" width={1440} height={960} loading="lazy" />
          <span className="path-meta" aria-hidden="true">
            <b>01</b>
            <span>6 live sites · 10 projects</span>
          </span>
          <div className="path-text">
            <span>Systems, products &amp; client work</span>
            <strong>
              <Words text={"In the\nstudio."} />
            </strong>
          </div>
          <span className="path-go" aria-hidden="true">
            <span>↓</span>
          </span>
          <span className="path-mask" aria-hidden="true">
            <span className="pm-word">
              <span className="pm-f">I</span>n the
              <br />
              studio.
            </span>
          </span>
        </a>
        <a className="path-card path-life" href="#personal" data-cursor="Dive in">
          <img src="/media/portraits/stairwell.webp" alt="" width={1024} height={1280} loading="lazy" />
          <span className="path-meta" aria-hidden="true">
            <b>02</b>
            <span>Guitar · Powerlifting</span>
          </span>
          <div className="path-text">
            <span>Guitar &amp; powerlifting</span>
            <strong>
              <Words text={"After\nhours."} start={3} />
            </strong>
          </div>
          <span className="path-go" aria-hidden="true">
            <span>↓</span>
          </span>
          <span className="path-mask" aria-hidden="true">
            <span className="pm-word">
              Af<span className="pm-f">t</span>er
              <br />
              hours.
            </span>
          </span>
        </a>
      </div>
    </nav>
  );
}
