"use client";

import { useEffect, useRef } from "react";

type Shot = { kind: "shot"; src: string; alt: string; caption: string; tag: string };
type Quote = { kind: "quote"; text: string; emphasis: string; source: string };
// x / y: offset from the centre of the screen in % of its width / height. w: width in vw.
// z: how far down the tunnel the item sits, in px. The last item lands centred at full size.
type Placed = (Shot | Quote) & { x: number; y: number; w: number; z: number };

const ITEMS: Placed[] = [
  { kind: "shot", src: "/media/field/rack-infrastructure.webp", alt: "A row of dark server drive trays and perforated metal in a rack.", caption: "Production infrastructure", tag: "Systems", x: -27, y: -13, w: 24, z: 700 },
  { kind: "quote", text: "A validation failure is not an exception to hide. It is a record your system does not yet know how to trust.", emphasis: "does not yet know how to trust.", source: "Field notes · Dead-letter queues", x: 15, y: 2, w: 34, z: 1320 },
  { kind: "shot", src: "/media/field/documentir-registration.webp", alt: "Opaque and translucent document sheets aligned on registration pins.", caption: "Document registration", tag: "Extraction", x: -25, y: 19, w: 28, z: 1940 },
  { kind: "shot", src: "/media/field/guitar-bridge.webp", alt: "Six guitar strings crossing the saddles of a dark electric guitar bridge.", caption: "Schecter Demon-6 FR", tag: "Guitar", x: 28, y: -19, w: 20, z: 2560 },
  { kind: "shot", src: "/media/field/schema-extraction.webp", alt: "A steel stencil with geometric cutouts above matching forms on a white card.", caption: "Schema as a stencil", tag: "Structured outputs", x: -28, y: -21, w: 22, z: 3180 },
  { kind: "shot", src: "/media/field/barbell-chalk.webp", alt: "A chalk-dusted steel barbell with a diamond knurl.", caption: "Knurl and chalk", tag: "Powerlifting", x: 27, y: 19, w: 26, z: 3800 },
  { kind: "quote", text: "The discipline of progressive overload turns out to map surprisingly well onto debugging distributed systems.", emphasis: "debugging distributed systems.", source: "Off the clock", x: -14, y: 0, w: 34, z: 4420 },
  { kind: "shot", src: "/media/field/observability.webp", alt: "A black loupe magnifying a spike in a signal trace on ivory paper.", caption: "Trace inspection", tag: "Observability", x: 28, y: -17, w: 23, z: 5040 },
  { kind: "shot", src: "/media/field/worn-guitar-picks.webp", alt: "Two overlapping worn guitar picks on textured paper.", caption: "Worn picks", tag: "Rehearsal", x: -27, y: 20, w: 18, z: 5660 },
  { kind: "shot", src: "/media/field/print-studio.webp", alt: "A metal monogram block beside an ivory card embossed with a lowercase h.", caption: "The h, in proof", tag: "Identity", x: 0, y: 2, w: 30, z: 6280 },
];
const DEPTH = 6280;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * A fly-through: stills and two pull quotes sit at different depths, and scrolling moves the
 * camera down the tunnel past them while the ground turns from the dark practice section to
 * paper. Without motion (or JavaScript) the same items sit in a plain staggered grid.
 */
export function Field() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current!;
    const items = [...section.querySelectorAll<HTMLElement>(".field-item")];
    const counter = section.querySelector<HTMLElement>(".field-count b")!;
    const root = document.documentElement;
    const narrow = matchMedia("(max-width:760px)");
    let queued = false;
    let last = -1;

    const size = () => {
      items.forEach((el, i) => {
        const w = ITEMS[i].w * (narrow.matches ? (ITEMS[i].kind === "quote" ? 2.3 : 2.1) : 1);
        el.style.width = root.classList.contains("scrub") ? `${Math.min(w, 78).toFixed(1)}vw` : "";
      });
    };

    const update = () => {
      queued = false;
      const tunnel = root.classList.contains("scrub") && !root.classList.contains("reveal-fallback");
      const r = section.getBoundingClientRect();
      const vh = innerHeight;
      const vw = innerWidth;
      const p = tunnel ? clamp(-r.top / Math.max(1, r.height - vh)) : 1;
      // Paper opens as a circle from the centre near the end, so there is never a grey midpoint.
      const m = tunnel ? clamp((p - 0.76) / 0.14) : clamp((vh * 0.35 - r.top) / (vh * 0.75));
      section.style.setProperty("--m", m.toFixed(3));
      section.style.setProperty("--fp", p.toFixed(4));
      section.classList.toggle("is-light", m > 0.5);
      if (!tunnel) {
        items.forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
          el.style.visibility = "";
        });
        return;
      }
      const cam = p * DEPTH;
      const small = narrow.matches;
      const spread = small ? 0.62 : 1;
      // Phones are too narrow for two stops side by side: show one at a time, pushed further up or down.
      const reach = small ? 900 : 1700;
      const ramp = small ? 450 : 700;
      const lift = small ? 1.35 : 1;
      // Nothing waits in the distance while the title is on screen; it clears first.
      const go = clamp((p - 0.042) / 0.04);
      // While a quote is in reading position, the stills around it step back.
      const focus = Math.max(
        0,
        ...ITEMS.map((it) => {
          if (it.kind !== "quote") return 0;
          const d = cam - it.z;
          return clamp((d + 520) / 260) * (1 - clamp((d + 40) / 200));
        }),
      );
      let passed = 0;
      items.forEach((el, i) => {
        const it = ITEMS[i];
        const d = cam - it.z; // < 0: still ahead of the camera
        // Only the next two stops are visible, so distant stills never pile up in the centre.
        const far = clamp((d + reach) / ramp) * go;
        const nearStart = it.kind === "quote" ? -60 : small ? -260 : 80;
        const near = i === items.length - 1 ? 1 : 1 - clamp((d - nearStart) / 380);
        const dim = it.kind === "quote" ? 1 : 1 - focus * 0.82;
        const o = far * near * dim;
        if (d > nearStart) passed++;
        // A slight roll toward the side each still sits on, so the corridor reads as moving.
        const roll = it.kind === "quote" || i === items.length - 1 ? 0 : Math.sign(it.x) * clamp(-d / 1700) * -4;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.style.transform = `translate(-50%,-50%) translate3d(${((it.x * vw * spread) / 100).toFixed(1)}px,${((it.y * lift * vh) / 100).toFixed(1)}px,${d.toFixed(1)}px) rotate(${roll.toFixed(2)}deg)`;
      });
      const n = Math.min(items.length, passed + 1);
      if (n !== last) {
        last = n;
        counter.textContent = String(n).padStart(2, "0");
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
          <span className="field-bar">
            <i />
          </span>
          <span>Keep scrolling</span>
        </div>
      </div>
    </section>
  );
}
