"use client";

import { useEffect, useRef } from "react";

type Shot = { kind: "shot"; src: string; alt: string; caption: string; tag: string };
type Quote = { kind: "quote"; text: string; emphasis: string; source: string };
// In reel order; the last frame stays on screen while the paper opens behind it.
const ITEMS: (Shot | Quote)[] = [
  { kind: "shot", src: "/media/field/rack-infrastructure.webp", alt: "A row of dark server drive trays and perforated metal in a rack.", caption: "Production infrastructure", tag: "Systems" },
  { kind: "quote", text: "A validation failure is not an exception to hide. It is a record your system does not yet know how to trust.", emphasis: "does not yet know how to trust.", source: "Field notes · Dead-letter queues" },
  { kind: "shot", src: "/media/field/documentir-registration.webp", alt: "Opaque and translucent document sheets aligned on registration pins.", caption: "Document registration", tag: "Extraction" },
  { kind: "shot", src: "/media/field/guitar-bridge.webp", alt: "Six guitar strings crossing the saddles of a dark electric guitar bridge.", caption: "Schecter Demon-6 FR", tag: "Guitar" },
  { kind: "shot", src: "/media/field/schema-extraction.webp", alt: "A steel stencil with geometric cutouts above matching forms on a white card.", caption: "Schema as a stencil", tag: "Structured outputs" },
  { kind: "shot", src: "/media/field/barbell-chalk.webp", alt: "A chalk-dusted steel barbell with a diamond knurl.", caption: "Knurl and chalk", tag: "Powerlifting" },
  { kind: "quote", text: "The discipline of progressive overload turns out to map surprisingly well onto debugging distributed systems.", emphasis: "debugging distributed systems.", source: "Off the clock" },
  { kind: "shot", src: "/media/field/observability.webp", alt: "A black loupe magnifying a spike in a signal trace on ivory paper.", caption: "Trace inspection", tag: "Observability" },
  { kind: "shot", src: "/media/field/worn-guitar-picks.webp", alt: "Two overlapping worn guitar picks on textured paper.", caption: "Worn picks", tag: "Rehearsal" },
  { kind: "shot", src: "/media/field/print-studio.webp", alt: "A metal monogram block beside an ivory card embossed with a lowercase h.", caption: "The h, in proof", tag: "Identity" },
];
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * A reel: every still and quote is a frame on a ring of film that surrounds the camera. You fly into
 * the ring, then each beat of scrolling turns it one frame, with the neighbours wrapping toward you
 * at the edges of the screen. The caption is printed on the film edge; quotes are intertitle cards.
 * Without motion (or JavaScript) the same items sit in a plain staggered grid.
 */
export function Field() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current!;
    const stage = section.querySelector<HTMLElement>(".field-stage")!;
    const space = section.querySelector<HTMLElement>(".field-space")!;
    const items = [...section.querySelectorAll<HTMLElement>(".field-item")];
    const counter = section.querySelector<HTMLElement>(".field-count b")!;
    const cap = section.querySelector<HTMLElement>(".field-cap")!;
    const root = document.documentElement;
    const narrow = matchMedia("(max-width:760px)");
    const N = items.length;
    let queued = false;
    let last = -1;
    // Ring geometry: degrees between frames, frame width and ring radius (also the perspective, so
    // the frame facing the camera renders at its natural size).
    let step = 36;
    let R = 1000;

    const tunnelOn = () => root.classList.contains("scrub") && !root.classList.contains("reveal-fallback");

    const size = () => {
      const vw = innerWidth;
      const vh = innerHeight;
      const small = narrow.matches;
      step = small ? 30 : 36;
      const band = small ? 46 : 74;
      const w = Math.max(220, Math.min(vw * (small ? 0.8 : 0.46), (vh * (small ? 0.56 : 0.62) - band) * 1.5));
      // Each frame fills 80% of its slice of the ring.
      R = w / (2 * Math.sin(((step * 0.4) * Math.PI) / 180));
      const on = tunnelOn();
      stage.style.perspective = on ? `${R.toFixed(0)}px` : "";
      items.forEach((el, i) => {
        el.style.width = on ? `${w.toFixed(1)}px` : "";
        el.dataset.angle = String(-i * step);
      });
    };

    const update = () => {
      queued = false;
      const tunnel = tunnelOn();
      const r = section.getBoundingClientRect();
      const vh = innerHeight;
      const p = tunnel ? clamp(-r.top / Math.max(1, r.height - vh)) : 1;
      // Paper opens as a circle from the centre near the end, so there is never a grey midpoint.
      const m = tunnel ? clamp((p - 0.86) / 0.1) : clamp((vh * 0.35 - r.top) / (vh * 0.75));
      section.style.setProperty("--m", m.toFixed(3));
      section.style.setProperty("--fp", p.toFixed(4));
      section.classList.toggle("is-light", m > 0.5);
      if (!tunnel) {
        space.style.transform = "";
        items.forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
          el.style.visibility = "";
        });
        return;
      }
      // The ring waits until the title has gone, then flies in from a distance, seen from above.
      const fade = smooth(clamp((p - 0.042) / 0.05));
      const go = smooth(clamp((p - 0.042) / 0.11));
      const back = (1 - go) * (1 - go) * R * 4;
      const v = window.__lenis?.velocity ?? 0;
      const tilt = -(1 - go) * 16 + Math.max(-4, Math.min(4, v * 0.08));
      // One frame per beat: the ring holds on each frame, then turns to the next.
      const raw = clamp((p - 0.12) / 0.7) * (N - 1);
      const base = Math.floor(raw);
      const c = Math.min(N - 1, base + smooth(clamp((raw - base - 0.2) / 0.6)));
      space.style.transform = `translateZ(${(R - back).toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) rotateY(${(c * step).toFixed(3)}deg)`;
      items.forEach((el, i) => {
        const delta = (c - i) * step;
        const cos = Math.cos((delta * Math.PI) / 180);
        // Frames behind the camera are never drawn, and the reel never wraps the last frame round to
        // the first.
        const ahead = Math.abs(delta) < 90 && back + R * cos > R * 0.2;
        const leave = i === N - 1 ? 1 : 1 - smooth(clamp(m * 2));
        const o = ahead ? fade * leave : 0;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.style.setProperty("--d", (delta / step).toFixed(3));
        el.style.setProperty("--a", Math.min(1, Math.abs(delta) / step).toFixed(3));
        el.style.transform = `translate(-50%,-50%) rotateY(${(-i * step).toFixed(1)}deg) translateZ(${(-R).toFixed(1)}px)`;
      });
      const n = Math.round(c);
      if (n !== last) {
        last = n;
        counter.textContent = String(n + 1).padStart(2, "0");
        const it = ITEMS[n];
        cap.textContent = it.kind === "shot" ? `${it.caption} · ${it.tag}` : it.source;
      }
    };
    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      size();
      request();
    };
    size();
    update();
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", onResize, { passive: true });
    return () => {
      removeEventListener("scroll", request);
      removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="field" ref={ref} aria-labelledby="field-title">
      <div className="field-stage">
        <div className="field-intro">
          <p className="field-kicker">Stills &amp; notes</p>
          <h2 id="field-title" className="field-title">
            Around
            <br />
            the bench
          </h2>
        </div>
        <div className="field-space">
          {ITEMS.map((item, i) => {
            if (item.kind === "quote") {
              const lead = item.text.slice(0, item.text.length - item.emphasis.length);
              return (
                <figure key={i} className="field-item field-quote">
                  <blockquote>
                    <p>
                      {lead}
                      <mark>{item.emphasis}</mark>
                    </p>
                  </blockquote>
                  <figcaption>
                    <img src="/media/maker-mark.svg" width={28} height={28} alt="" />
                    {item.source}
                  </figcaption>
                </figure>
              );
            }
            return (
              <figure key={i} className="field-item field-shot">
                <figcaption>
                  <span>{item.caption}</span>
                  <b>{item.tag}</b>
                </figcaption>
                <div className="field-frame">
                  <img src={item.src} alt={item.alt} width={960} height={640} loading="lazy" decoding="async" />
                </div>
              </figure>
            );
          })}
        </div>
        <div className="field-hud" aria-hidden="true">
          <span className="field-count">
            <b>01</b> / {String(ITEMS.length).padStart(2, "0")}
          </span>
          <span className="field-cap" />
          <span className="field-bar">
            <i />
          </span>
          <span>Keep scrolling</span>
        </div>
      </div>
    </section>
  );
}
