"use client";

import { Fragment, useEffect, useRef } from "react";
import { Clock } from "./Clock";
import { Words } from "./Words";
import { DotPortrait } from "./DotPortrait";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

type Point = { x: number; y: number; time: number; radius: number };

const NAME = ["Hitarth", "Desai"];
// The role line turns over through the day job and the two things after it; the first repeats so the loop is seamless.
const ROLES = ["AI Systems Engineer", "Metal guitarist", "Powerlifter", "AI Systems Engineer"];
// How far, and with how much spin, each letter lifts away as the hero scrolls off.
const LIFT = [0.75, 1.05, 0.85, 1.2, 0.7, 1.1, 0.9, 1, 0.8, 1.15, 0.72, 0.95, 1.05];
const SPIN = [-6, 4, -3, 7, -5, 3, -8, 5, -4, 6, -7, 2, 4];

/**
 * The pinned introduction. Scroll contracts the portrait into a rounded inset; the story rises in
 * beside it once the picture has cleared its column. A fine pointer brushes the halftone plate.
 * Everything runs on refs and CSS variables, so React never re-renders while scrolling.
 */
export function Hero() {
  const entranceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const entrance = entranceRef.current!;
    const pin = entrance.querySelector<HTMLElement>(".hero-pin")!;
    const stage = entrance.querySelector<HTMLElement>(".hero-stage")!;
    const portrait = entrance.querySelector<HTMLElement>(".portrait-figure")!;
    const ink = portrait.querySelector<HTMLElement>(".print-layer")!;
    const inkButton = entrance.querySelector<HTMLButtonElement>(".print-button")!;
    const story = entrance.querySelector<HTMLElement>(".story")!;
    const storyText = story.querySelector<HTMLElement>(".story-text")!;
    const storyEdges = [...storyText.querySelectorAll<HTMLElement>(".w, .story-text > p:not(.story-role), .story-steps")];
    const marquee = story.querySelector<HTMLElement>(".story-marquee")!;
    const controls = [".hero-info", ".portrait-tool", ".hero-foot"].map((s) => stage.querySelector<HTMLElement>(s)!);
    const letters = [...stage.querySelectorAll<HTMLElement>(".hn .chi:not(.dot)")];
    const force = letters.map(() => 0);
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = matchMedia("(max-width:700px), (max-aspect-ratio:4/5)");
    const finePointer = matchMedia("(hover:hover) and (pointer:fine)");

    let pinned = false;
    let expandedInk = false;
    let scheduled = false;
    let brushFrame = 0;
    let brush: Point[] = [];
    let lastPoint: Point | null = null;
    let progress = 0;

    const setInert = (el: HTMLElement, value: boolean) => {
      if (el.inert !== value) el.inert = value;
    };

    function layout() {
      scheduled = false;
      if (!pinned) return;
      const h = pin.offsetHeight;
      const w = pin.clientWidth;
      const distance = Math.max(1, entrance.offsetHeight - h);
      progress = clamp(-entrance.getBoundingClientRect().top / distance);
      const t = smooth(progress);
      const mobile = mobileQuery.matches;
      const box = mobile ? { top: 12, right: 7, bottom: 51, left: 39 } : { top: 17, right: 9, bottom: 18, left: 58 };
      stage.style.setProperty("--ct", box.top * t + "%");
      stage.style.setProperty("--cr", box.right * t + "%");
      stage.style.setProperty("--cb", box.bottom * t + "%");
      stage.style.setProperty("--cl", box.left * t + "%");
      stage.style.setProperty("--ui", String(clamp(1 - progress / 0.28)));
      stage.style.setProperty("--sp", clamp(progress / 0.3).toFixed(4));
      stage.style.setProperty("--herohit", progress > 0.55 ? "none" : "auto");
      const initialSize = mobile ? Math.min(w * 1.52, h * 0.83) : Math.min(h * 0.98, w * 0.73);
      const endSize = Math.max((1 - (box.top + box.bottom) / 100) * h, 0.98 * (1 - (box.left + box.right) / 100) * w);
      portrait.style.setProperty("--size", lerp(initialSize, endSize, t).toFixed(1) + "px");
      const initialCenter = mobile ? 54 : Math.max(59, 100 - (initialSize / w) * 50 + 0.1);
      portrait.style.left = lerp(initialCenter, (box.left + 100 - box.right) / 2, t).toFixed(2) + "%";
      portrait.style.bottom = (box.bottom * t).toFixed(2) + "%";
      stage.style.setProperty("--t", t.toFixed(4));
      story.style.setProperty("--p", progress.toFixed(4));
      // The story is only shown once the shrinking portrait has moved clear of it, so no line of it
      // is ever hidden under the picture; the marquee likewise waits for the card to lift off it.
      const pr = pin.getBoundingClientRect();
      const card = { l: (w * box.left * t) / 100, r: w - (w * box.right * t) / 100, t: (h * box.top * t) / 100, b: h - (h * box.bottom * t) / 100 };
      const sr = storyText.getBoundingClientRect();
      const right = Math.max(...storyEdges.map((e) => (e.offsetParent ? e.getBoundingClientRect().right : 0))) - pr.left;
      const clear = !(right > card.l - 28 && sr.left - pr.left < card.r + 28 && sr.bottom - pr.top > card.t - 28 && sr.top - pr.top < card.b + 28);
      const live = clear && progress > 0.2;
      story.classList.toggle("is-live", live);
      setInert(story, !live);
      const mq = marquee.getBoundingClientRect().top - pr.top + 12;
      marquee.style.opacity = clamp((mq - card.b) / 60).toFixed(3);
      for (const el of controls) setInert(el, progress >= 0.38);
      if (progress > 0.35 && brush.length) clearBrush();
      if (progress > 0.2 && force.some(Boolean)) releaseLetters();
    }

    // The name answers the pointer: letters near it lift and open into outlines, the contour map
    // lights up under it, and the portrait leans toward it.
    let aimFrame = 0;
    let aimX = 0;
    let aimY = 0;
    function aim() {
      aimFrame = 0;
      const rects = letters.map((l) => l.getBoundingClientRect());
      rects.forEach((r, i) => {
        const d = Math.hypot(aimX - (r.left + r.width / 2), aimY - (r.top + r.height / 2));
        const f = smooth(clamp(1 - d / Math.max(150, r.height * 1.6)));
        if (Math.abs(f - force[i]) > 0.015 || (f === 0 && force[i] !== 0)) {
          force[i] = f;
          letters[i].style.setProperty("--f", f.toFixed(3));
        }
      });
    }
    function releaseLetters() {
      force.fill(0);
      letters.forEach((l) => l.style.removeProperty("--f"));
    }
    const onStageMove = (event: PointerEvent) => {
      if (!finePointer.matches || !pinned || progress > 0.2 || event.pointerType !== "mouse") return;
      const box = stage.getBoundingClientRect();
      stage.style.setProperty("--sx", (event.clientX - box.left).toFixed(0) + "px");
      stage.style.setProperty("--sy", (event.clientY - box.top).toFixed(0) + "px");
      stage.style.setProperty("--ry", (((event.clientX - box.left) / box.width - 0.5) * 5).toFixed(2) + "deg");
      stage.style.setProperty("--rx", ((0.5 - (event.clientY - box.top) / box.height) * 3.5).toFixed(2) + "deg");
      aimX = event.clientX;
      aimY = event.clientY;
      if (!aimFrame) aimFrame = requestAnimationFrame(aim);
    };
    const onStageLeave = () => {
      cancelAnimationFrame(aimFrame);
      aimFrame = 0;
      releaseLetters();
      ["--sx", "--sy", "--rx", "--ry"].forEach((v) => stage.style.removeProperty(v));
    };

    const requestLayout = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(layout);
      }
    };

    function clearBrush() {
      cancelAnimationFrame(brushFrame);
      brushFrame = 0;
      brush = [];
      lastPoint = null;
      ink.classList.remove("brushing");
      ink.style.removeProperty("--brush");
      stage.style.removeProperty("--map-x");
      stage.style.removeProperty("--map-y");
    }

    function updateMotion() {
      pinned = !motionQuery.matches;
      root.classList.toggle("scrub", pinned);
      if (!pinned) {
        clearBrush();
        progress = 0;
        stage.removeAttribute("style");
        portrait.removeAttribute("style");
        story.removeAttribute("style");
        marquee.removeAttribute("style");
        story.classList.add("is-live");
        setInert(story, false);
        controls.forEach((el) => setInert(el, false));
      }
      requestLayout();
    }

    function paintBrush(now: number) {
      brushFrame = 0;
      brush = brush.filter((p) => now - p.time < 680);
      if (!brush.length || expandedInk || !pinned) {
        clearBrush();
        return;
      }
      const layers = brush.map((p) => {
        const age = clamp((now - p.time) / 680);
        const size = p.radius * (1 - 0.92 * smooth(age));
        const a = 1 - age * age;
        return `radial-gradient(ellipse ${size.toFixed(1)}px ${(size * 0.81).toFixed(1)}px at ${p.x.toFixed(1)}% ${p.y.toFixed(1)}%, rgba(0,0,0,${a.toFixed(3)}) 54%,transparent 100%)`;
      });
      ink.style.setProperty("--brush", layers.join(","));
      ink.classList.add("brushing");
      brushFrame = requestAnimationFrame(paintBrush);
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || !pinned || progress > 0.34 || expandedInk) return;
      const rect = portrait.getBoundingClientRect();
      const x = (100 * (event.clientX - rect.left)) / rect.width;
      const y = (100 * (event.clientY - rect.top)) / rect.height;
      // Record the position in the registered image so the mask stays locked to the print plate.
      if (lastPoint && Math.hypot(x - lastPoint.x, y - lastPoint.y) < 0.65) return;
      const dist = lastPoint ? Math.hypot(x - lastPoint.x, y - lastPoint.y) : 0;
      const point = { x, y, time: performance.now(), radius: clamp(rect.width * (0.102 + dist * 0.003), 46, 128) };
      brush.push(point);
      if (brush.length > 11) brush.shift();
      lastPoint = point;
      stage.style.setProperty("--map-x", ((x - 50) * 0.1).toFixed(2) + "px");
      stage.style.setProperty("--map-y", ((y - 50) * 0.08).toFixed(2) + "px");
      if (!brushFrame) brushFrame = requestAnimationFrame(paintBrush);
    };
    const onPointerLeave = () => {
      lastPoint = null;
      stage.style.setProperty("--map-x", "0px");
      stage.style.setProperty("--map-y", "0px");
    };
    const onInk = () => {
      expandedInk = !expandedInk;
      clearBrush();
      ink.classList.toggle("stamped", expandedInk);
      inkButton.setAttribute("aria-pressed", String(expandedInk));
    };

    stage.addEventListener("pointermove", onStageMove, { passive: true });
    stage.addEventListener("pointerleave", onStageLeave);
    portrait.addEventListener("pointermove", onPointerMove, { passive: true });
    portrait.addEventListener("pointerleave", onPointerLeave);
    inkButton.addEventListener("click", onInk);
    window.addEventListener("scroll", requestLayout, { passive: true });
    window.addEventListener("resize", requestLayout, { passive: true });
    window.addEventListener("pageshow", requestLayout);
    motionQuery.addEventListener("change", updateMotion);
    mobileQuery.addEventListener("change", requestLayout);
    updateMotion();

    return () => {
      clearBrush();
      cancelAnimationFrame(aimFrame);
      stage.removeEventListener("pointermove", onStageMove);
      stage.removeEventListener("pointerleave", onStageLeave);
      portrait.removeEventListener("pointermove", onPointerMove);
      portrait.removeEventListener("pointerleave", onPointerLeave);
      inkButton.removeEventListener("click", onInk);
      window.removeEventListener("scroll", requestLayout);
      window.removeEventListener("resize", requestLayout);
      window.removeEventListener("pageshow", requestLayout);
      motionQuery.removeEventListener("change", updateMotion);
      mobileQuery.removeEventListener("change", requestLayout);
    };
  }, []);

  return (
    <section className="entrance" id="home" aria-label="Introduction" ref={entranceRef}>
      <div className="hero-pin">
        <div className="story">
          <div className="story-marquee" aria-hidden="true">
            <p className="mq-row mq-row--rev">
              <span>Documents in · Data out · Documents in · Data out · Documents in · Data out ·&nbsp;</span>
            </p>
          </div>
          <div className="story-text">
            <p className="story-role">AI systems engineering</p>
            <h2>
              <Words text={"Behind\nthe model."} />
            </h2>
            <p>
              I build the infrastructure that turns messy documents into data people can use. At InfraDock AI, that means extraction, validation and a path for human
              review.
            </p>
            <ol className="story-steps" aria-label="How a document moves through the pipeline">
              <li>
                <span>01</span>
                <b>Extraction</b>
                <i>PDF ingestion, adapters</i>
              </li>
              <li>
                <span>02</span>
                <b>Validation</b>
                <i>Confidence scoring</i>
              </li>
              <li>
                <span>03</span>
                <b>Human review</b>
                <i>Review workflows</i>
              </li>
            </ol>
            <a href="#work" className="story-link">
              See the work
            </a>
          </div>
        </div>
        <div className="hero-stage">
          <div className="hero-map" aria-hidden="true" />
          <div className="hero-spot" aria-hidden="true" />
          <div className="hero-info">
            <p className="hero-role">
              <span className="sr-only">AI Systems Engineer</span>
              <span className="role-roll" aria-hidden="true">
                <span>
                  {ROLES.map((r, i) => (
                    <span key={i}>{r}</span>
                  ))}
                </span>
              </span>
            </p>
            <h1>
              <span className="sr-only">Hitarth Desai</span>
              <span className="hn" aria-hidden="true">
                {NAME.map((word, wi) => (
                  <Fragment key={word}>
                    {wi > 0 && <br />}
                    <span className="w">
                      {[...word, ...(wi === NAME.length - 1 ? ["."] : [])].map((c, ci) => {
                        const n = wi * NAME[0].length + ci;
                        const style = { "--c": n, "--k": LIFT[n % LIFT.length], "--rot": SPIN[n % SPIN.length] } as React.CSSProperties;
                        return (
                          <span className="ch" key={ci} style={style}>
                            <span className={c === "." ? "chi dot" : "chi"}>{c}</span>
                          </span>
                        );
                      })}
                    </span>
                  </Fragment>
                ))}
              </span>
            </h1>
            <a className="featured-link" href="/projects/seerflow">
              <span>Featured project</span>
              <strong>SeerFlow</strong>
              <i aria-hidden="true" />
            </a>
          </div>
          <div className="portrait-figure">
            <picture>
              <source media="(max-width:700px)" srcSet="/media/hero-portrait-mobile.webp" />
              <img className="hero-photo" src="/media/hero-portrait.webp" width={1254} height={1254} alt="Hitarth Desai smiling in a black-and-white portrait." fetchPriority="high" />
            </picture>
            <picture className="print-layer" aria-hidden="true">
              <source media="(max-width:700px)" srcSet="/media/hero-print-mobile.webp" />
              <img src="/media/hero-print.webp" width={1254} height={1254} alt="" decoding="async" />
            </picture>
            <DotPortrait />
          </div>
          <div className="portrait-tool">
            <button type="button" className="print-button" aria-pressed="false">
              <span className="print-symbol" aria-hidden="true" />
              <span>Ink portrait</span>
            </button>
            <span className="brush-hint">Brush to reveal</span>
          </div>
          <div className="hero-foot">
            <span>
              Surat, India <i className="sep" aria-hidden="true">/</i> <Clock />
            </span>
            <a href="#paths">
              Explore portfolio <i aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
