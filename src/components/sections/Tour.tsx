"use client";

import { useRef } from "react";
import { gsap, prefersReduced, useGSAP } from "@/lib/gsap";
import { PROFILE, TRACKS } from "@/content/profile";
import { TrackHead } from "../ui/TrackHead";

/**
 * Track 05 / Tour History: experience as tour dates. The spine is a guitar string that lights
 * up as it is scrubbed past (white-hot at the playhead, cooling to steel behind it); each stop
 * rises in line by line and the current headliner pulses.
 */
export function Tour() {
  const track = TRACKS[4];
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const list = root.current!.querySelector("[data-list]")!;
      gsap.fromTo("[data-spine]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 60%", scrub: true } });
      gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((stop) => {
        gsap.from(stop.querySelectorAll("[data-in]"), { yPercent: 60, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: stop, start: "top 78%" } });
        gsap.fromTo(
          stop.querySelector("[data-fret]"),
          { backgroundColor: "#20242b", boxShadow: "0 0 0 0 rgba(255,106,26,0)" },
          { backgroundColor: "#ff6a1a", boxShadow: "0 0 18px 4px rgba(255,106,26,.7)", duration: 0.4, scrollTrigger: { trigger: stop, start: "top 62%", toggleActions: "play none none reverse" } },
        );
      });
    },
    { scope: root },
  );

  const stops = [
    ...PROFILE.experience.map((r) => ({ when: r.dates ?? r.when, title: r.title, org: r.org, summary: r.summary, current: "current" in r && r.current })),
    { when: "Education", title: PROFILE.education.degree, org: PROFILE.education.school, summary: `Class of ${PROFILE.education.year}.`, current: false },
  ];

  return (
    <section ref={root} id={track.id} aria-labelledby={`${track.id}-title`} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <TrackHead track={track} title="On the" accent="road." lead="Where I've played. Billing reads top to bottom, headliner first." />
        <ol data-list className="relative mt-16 lg:ml-[18%]">
          <span className="absolute bottom-0 left-[7px] top-0 w-[3px] rounded-full bg-steel-3" aria-hidden />
          <span data-spine className="absolute bottom-0 left-[7px] top-0 w-[3px] origin-top rounded-full bg-gradient-to-b from-steel-3 via-forge to-[#fff4e0] shadow-[0_0_14px_rgba(255,106,26,.6)]" aria-hidden />
          {stops.map((s) => (
            <li key={s.org + s.title} data-stop className="relative grid gap-3 pb-16 pl-12 last:pb-0 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10">
              <span data-fret className={`absolute left-0 top-2 h-[17px] w-[17px] rounded-full border-2 border-void bg-steel-3 ${s.current ? "headliner" : ""}`} aria-hidden />
              <div className="overflow-hidden">
                <p data-in className="font-mono text-[12px] uppercase tracking-[0.18em] text-forge">
                  {s.when}
                </p>
              </div>
              <div>
                <div className="overflow-hidden">
                  <h3 data-in className="display text-[clamp(2rem,4.4vw,3.8rem)] text-chrome">
                    {s.org}
                  </h3>
                </div>
                <div className="overflow-hidden">
                  <p data-in className="mt-2 flex flex-wrap items-center gap-3 font-display text-[19px] font-semibold tracking-[-0.01em] text-chrome/85">
                    {s.title}
                    {s.current && <span className="rounded-full bg-forge px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-void">Headlining</span>}
                  </p>
                </div>
                <div className="overflow-hidden">
                  <p data-in className="mt-3 max-w-2xl text-[16px] leading-relaxed text-mute">
                    {s.summary}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
