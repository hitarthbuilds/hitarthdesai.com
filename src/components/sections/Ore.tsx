"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap, SplitText, prefersReduced, useGSAP } from "@/lib/gsap";
import { PROFILE, TRACKS } from "@/content/profile";
import { Magnetic } from "../fx/Magnetic";
import { onPreloaderDone } from "../layout/Preloader";
import { Anvil, ArrowRight, SocialIcon } from "../ui/Icons";

const ShaderCanvas = dynamic(() => import("../fx/ShaderCanvas").then((m) => m.ShaderCanvas), { ssr: false });
const FilingsField = dynamic(() => import("../fx/FilingsField").then((m) => m.FilingsField), { ssr: false });

const HEADLINE_TEXT = PROFILE.headline.map((l) => l.map((s) => s.text).join("")).join(" ");

/** Track 01 / Overture: liquid-chrome stage, iron-filings field and the headline. */
export function Ore() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const reduced = prefersReduced();
      const segs = gsap.utils.toArray<HTMLElement>("[data-seg]", el);
      const splits = segs.map((s) => new SplitText(s, { type: "words,chars", charsClass: "ch", mask: "chars", aria: "none" }));
      segs.forEach((s) => s.classList.add("is-split"));
      const chars = splits.flatMap((s) => s.chars);
      const chrome = splits.filter((_, i) => segs[i].classList.contains("hl-chrome")).flatMap((s) => s.chars);
      const accent = el.querySelector<HTMLElement>("[data-accent]");

      // Hidden in a layout effect, i.e. before first paint: never via CSS, which would
      // leave the headline invisible without JS.
      if (!reduced) gsap.set(chars, { yPercent: 120, rotate: 8 });
      gsap.set("[data-hero-in]", { autoAlpha: 0, y: reduced ? 0 : 24 });
      gsap.set("[data-field]", { opacity: 0 });

      // contextSafe: the preloader fires this from inside its own timeline callback, which
      // would otherwise run (and resolve selectors) in the preloader's gsap context.
      const intro = contextSafe!(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(chars, { yPercent: 0, rotate: 0, duration: reduced ? 0 : 1.3, stagger: reduced ? 0 : 0.018 })
          .to("[data-hero-in]", { autoAlpha: 1, y: 0, duration: reduced ? 0.3 : 1, stagger: 0.07 }, reduced ? 0 : 0.65)
          .to("[data-field]", { opacity: 1, duration: reduced ? 0.3 : 2.2, ease: "power2.out" }, 0.1);
        if (reduced) return;
        // One specular sweep across the chrome, char by char.
        tl.fromTo(chrome, { "--sheen": "130%" }, { "--sheen": "-30%", duration: 1.1, stagger: 0.016, ease: "power2.inOut" }, 0.5);
        // The accent word lands white-hot and cools through ember to forge.
        if (accent)
          tl.fromTo(
            accent,
            { color: "#fff6e8", textShadow: "0 0 22px rgba(255,236,205,0.95), 0 0 70px rgba(255,106,26,0.9)" },
            {
              keyframes: [
                { color: "#ffb547", textShadow: "0 0 18px rgba(255,181,71,0.75), 0 0 50px rgba(217,20,43,0.6)", duration: 0.45, ease: "power1.out" },
                { color: "#ff6a1a", textShadow: "0 0 18px rgba(255,106,26,0.35), 0 0 46px rgba(217,20,43,0.18)", duration: 0.85, ease: "power2.out" },
              ],
            },
            0.75,
          );
      });
      const off = onPreloaderDone(intro);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-copy]", { yPercent: -18, opacity: 0.1, ease: "none", scrollTrigger: st });
        gsap.to("[data-field-drift]", { yPercent: 22, scale: 1.15, ease: "none", scrollTrigger: st });
        gsap.to("[data-shader]", { yPercent: 12, ease: "none", scrollTrigger: st });
        gsap.to("[data-ring]", { rotate: 360, duration: 22, repeat: -1, ease: "none" });
      });

      return () => {
        off();
        segs.forEach((s) => s.classList.remove("is-split"));
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id={TRACKS[0].id} aria-labelledby="overture-title" className="relative isolate min-h-[100svh] overflow-hidden">
      <div data-shader className="absolute inset-0 -z-30">
        <ShaderCanvas />
      </div>
      {/* Legibility scrims: the copy sits on the darker left, the filings on the right. */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(8,9,11,.86)_0%,rgba(8,9,11,.55)_42%,rgba(8,9,11,.05)_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-48 bg-gradient-to-t from-void via-void/70 to-transparent" />
      <div data-field className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[56%]">
        <div data-field-drift className="h-full w-full opacity-30 sm:opacity-45 lg:opacity-100">
          <FilingsField />
        </div>
      </div>

      <div data-hero-copy className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-center px-5 pb-16 pt-24 sm:px-8 lg:px-12">
        <p data-hero-in className="eyebrow flex items-center gap-3">
          <span className="text-forge">
            Track {TRACKS[0].n} / {TRACKS[0].name}
          </span>
          <span className="h-px w-8 bg-line-2" />
          <span>
            {PROFILE.name} · {PROFILE.title} · {PROFILE.location.city}, {PROFILE.location.countryCode}
          </span>
        </p>

        <h1 id="overture-title" className="display hl mt-6 text-[min(clamp(3.2rem,10.5vw,11rem),15vh)]">
          <span className="sr-only">{HEADLINE_TEXT}</span>
          <span aria-hidden>
            {PROFILE.headline.map((line, i) => (
              <span key={i} className="block">
                {line.map((seg, j) =>
                  seg.accent ? (
                    <span key={j} data-seg data-accent className="blackletter molten hl-accent pr-[0.04em]">
                      {seg.text}
                    </span>
                  ) : (
                    <span key={j} data-seg className="hl-chrome">
                      {seg.text}
                    </span>
                  ),
                )}
              </span>
            ))}
          </span>
        </h1>

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div className="max-w-[40rem]">
            {PROFILE.status.open && (
              <p data-hero-in className="pill">
                <span className="forge-dot" aria-hidden />
                <span className="text-[13px] leading-snug text-chrome/90">{PROFILE.status.label}</span>
              </p>
            )}
            <p data-hero-in className="mt-5 text-[16px] leading-relaxed text-mute sm:text-[17px]">
              {PROFILE.intro}
            </p>
          </div>

          <div data-hero-in className="flex flex-col items-start gap-6 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/#discography" className="btn btn-forge !h-14 !px-7 !text-[16px]" data-cursor="discography">
                  See the work
                  <ArrowRight />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/blog" className="btn btn-steel !h-14 !px-7 !text-[16px]" data-cursor="liner notes">
                  <span className="btn-fill" />
                  Read the writing
                </Link>
              </Magnetic>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Elsewhere">
              {PROFILE.socials.map((s) => (
                <li key={s.id}>
                  <Magnetic strength={0.5}>
                    <a href={s.href} target="_blank" rel="me noopener noreferrer" className="icon-btn" aria-label={`${s.label} (${s.handle})`} data-cursor={s.label}>
                      <SocialIcon id={s.id} />
                    </a>
                  </Magnetic>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div data-hero-in className="pointer-events-none absolute right-8 top-24 hidden h-32 w-32 lg:block xl:right-12">
        <svg data-ring viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          <defs>
            <path id="overture-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-mute font-mono text-[8.2px] uppercase tracking-[0.28em]">
            <textPath href="#overture-ring">Forged not demoed · Forged not demoed · </textPath>
          </text>
        </svg>
        <span className="absolute inset-0 grid place-items-center text-forge">
          <Anvil className="h-6 w-8 drop-shadow-[0_0_8px_rgba(255,106,26,.55)]" />
        </span>
      </div>
      <div data-hero-in className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim [@media(min-height:1000px)]:flex">
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-line-2">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.6s_ease-in-out_infinite] bg-forge" />
        </span>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
