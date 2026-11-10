"use client";

import { useRef, useState } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import { amp } from "@/lib/amp";
import { PROFILE, TRACKS } from "@/content/profile";
import { SplitReveal } from "../fx/Reveal";
import { Magnetic } from "../fx/Magnetic";
import { SocialIcon } from "../ui/Icons";

const LINKEDIN = PROFILE.socials.find((s) => s.id === "linkedin")!;

/**
 * Track 09 / Encore. A giant headline and a big circular magnetic button: with an email set it
 * copies it (a spark burst confirms) and opens mailto; until then it sends people to LinkedIn.
 */
export function Encore() {
  const track = TRACKS[8];
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const email = PROFILE.email;

  const { contextSafe } = useGSAP({ scope: root });
  const burst = contextSafe!((x: number, y: number) => {
    if (prefersReduced()) return;
    const host = root.current!.querySelector<HTMLElement>("[data-sparks]")!;
    for (let i = 0; i < 18; i++) {
      const s = document.createElement("i");
      s.className = "spark";
      host.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
      gsap.fromTo(s, { x, y, scale: 1, opacity: 1 }, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, scale: 0, opacity: 0, duration: 0.7 + Math.random() * 0.4, ease: "power3.out", onComplete: () => s.remove() });
    }
  });

  const onPrimary = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    amp.power(82.41, 1);
    const r = e.currentTarget.getBoundingClientRect(), h = root.current!.getBoundingClientRect();
    burst(r.left - h.left + r.width / 2, r.top - h.top + r.height / 2);
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  return (
    <section ref={root} id={track.id} aria-labelledby={`${track.id}-title`} className="relative overflow-hidden py-28 lg:py-40">
      <div data-sparks className="pointer-events-none absolute inset-0 z-10" aria-hidden />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="eyebrow flex flex-wrap items-center gap-3">
          <span className="text-forge">
            Track {track.n} / {track.name}
          </span>
          <span className="h-px w-8 bg-line-2" aria-hidden />
          <span>was {track.was}</span>
        </p>
        <SplitReveal as="h2" type="chars" id={`${track.id}-title`} className="display mt-6 text-[clamp(3.4rem,12vw,12rem)] text-chrome">
          Let&apos;s build something <span className="blackletter molten">loud.</span>
        </SplitReveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
          <Magnetic strength={0.4}>
            <a
              href={email ? `mailto:${email}` : LINKEDIN.href}
              target={email ? undefined : "_blank"}
              rel={email ? undefined : "me noopener noreferrer"}
              onClick={onPrimary}
              className="encore-btn"
              data-cursor={email ? "copy + mail" : "LinkedIn"}
            >
              <span className="relative z-[1] flex flex-col items-center gap-1">
                <span className="font-display text-[26px] font-extrabold tracking-[-0.03em]">{email ? (copied ? "Copied ✓" : "Email me") : "Message me"}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">{email ?? "on LinkedIn"}</span>
              </span>
            </a>
          </Magnetic>
          <div>
            <p className="max-w-xl text-[18px] leading-relaxed text-mute">
              Currently at InfraDock AI. <span className="text-chrome">{PROFILE.status.label}.</span> For a freelance website, commerce build, or workflow tool, tell me what you want people to be able to do.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {PROFILE.bookingUrl && (
                <a href={PROFILE.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-steel mr-3">
                  <span className="btn-fill" />
                  Book a call
                </a>
              )}
              {PROFILE.socials.map((s) => (
                <Magnetic key={s.id} strength={0.5}>
                  <a href={s.href} target="_blank" rel="me noopener noreferrer" className="icon-btn !h-12 !w-12" aria-label={`${s.label} (${s.handle})`} data-cursor={s.label}>
                    <SocialIcon id={s.id} className="h-5 w-5" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </p>
    </section>
  );
}
