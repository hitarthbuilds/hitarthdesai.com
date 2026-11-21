"use client";

import { useEffect, useRef, useState } from "react";
import { Words } from "./Words";

const FEATURES = [
  {
    key: "guitar",
    tab: "Guitar",
    image: "/media/portraits/soundcheck.webp",
    alt: "Hitarth laughing during soundcheck, standing with his electric guitar.",
    title: "Metal in drop A.",
    body: "I play metal and hard rock on a Schecter Demon-6 FR. Opeth and Lorna Shore are two of my favorites.",
    row: "Guitar · Drop A · Opeth · Lorna Shore · Guitar · Drop A · Opeth · Lorna Shore ·",
  },
  {
    key: "lifting",
    tab: "Powerlifting",
    image: "/media/portraits/lifting-chalk.webp",
    alt: "Hitarth in profile, concentrating as he rubs chalk into his hands.",
    title: "Under the bar.",
    body: "I’ve won gold internationally in powerlifting, a sport built around the squat, bench press, and deadlift.",
    row: "Squat · Bench · Deadlift · Powerlifting · Squat · Bench · Deadlift · Powerlifting ·",
  },
];
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * After hours, pinned. Scrolling opens a circle from the soundcheck photo into the lifting photo
 * while outlined lettering slides across; the two buttons jump to either scene. Without motion
 * the two photographs and captions simply stack.
 */
export function AfterHours() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = ref.current!;
    const root = document.documentElement;
    let queued = false;
    let current = 0;
    const update = () => {
      queued = false;
      const pinned = root.classList.contains("scrub") && !root.classList.contains("reveal-fallback");
      if (!pinned) {
        section.style.setProperty("--p", "1");
        section.style.setProperty("--r", "1");
        return;
      }
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
      const reveal = clamp((p - 0.36) / 0.3);
      section.style.setProperty("--p", p.toFixed(4));
      section.style.setProperty("--r", (reveal * reveal * (3 - 2 * reveal)).toFixed(4));
      const next = reveal > 0.5 ? 1 : 0;
      if (next !== current) {
        current = next;
        setActive(next);
      }
    };
    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request, { passive: true });
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", request);
    };
  }, []);

  const goTo = (i: number) => {
    const section = ref.current!;
    const root = document.documentElement;
    if (!root.classList.contains("scrub") || root.classList.contains("reveal-fallback")) {
      document.getElementById(`feature-${FEATURES[i].key}`)?.scrollIntoView({ block: "start" });
      return;
    }
    const top = section.getBoundingClientRect().top + scrollY;
    const y = top + (section.offsetHeight - innerHeight) * (i === 0 ? 0.12 : 0.86);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 });
    else scrollTo({ top: y });
  };

  return (
    <section className="after-hours" id="personal" aria-labelledby="personal-heading" ref={ref}>
      <div className="ah-stage">
        <div className="ah-media">
          {FEATURES.map((f) => (
            <figure key={f.key} className={`ah-shot ah-shot--${f.key}`} id={`feature-${f.key}`}>
              <img src={f.image} width={1440} height={960} loading="lazy" decoding="async" alt={f.alt} />
            </figure>
          ))}
        </div>
        <div className="ah-type" aria-hidden="true">
          {FEATURES.map((f) => (
            <p key={f.key} className={`ah-row ah-row--${f.key}`}>
              {f.row}
            </p>
          ))}
        </div>
        <div className="ah-ui">
          <div className="ah-top">
            <h2 id="personal-heading" data-reveal="words">
              <Words text="After hours" tail={<span className="dot">.</span>} />
            </h2>
            <div className="ah-switch" role="group" aria-label="Outside work" data-reveal="up">
              {FEATURES.map((f, i) => (
                <button key={f.key} type="button" aria-pressed={active === i} onClick={() => goTo(i)} data-magnetic="">
                  {f.tab}
                </button>
              ))}
            </div>
          </div>
          <div className="ah-captions">
            {FEATURES.map((f, i) => (
              <div key={f.key} className={`ah-cap${active === i ? " is-on" : ""}`}>
                <p className="ah-kicker">
                  {String(i + 1).padStart(2, "0")} / 02 <i>—</i> {f.tab}
                </p>
                <h3>
                  <Words text={f.title} />
                </h3>
                <p className="ah-body">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="ah-progress" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
