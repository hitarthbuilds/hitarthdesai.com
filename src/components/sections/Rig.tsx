import { PROFILE, TRACKS } from "@/content/profile";
import { TrackHead } from "../ui/TrackHead";
import { Marquee } from "../fx/Marquee";
import { Stagger } from "../fx/Reveal";

const ALL = Object.values(PROFILE.stack).flat();
/** "Rust (learning)" shows how far along it is: 3 of 10 meter segments. */
const LEARNING: Record<string, number> = { "Rust (learning)": 3 };

/** Track 04 / The Rig: the stack as band patches and rack-mounted gear. */
export function Rig() {
  const track = TRACKS[3];
  return (
    <section id={track.id} aria-labelledby={`${track.id}-title`} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <TrackHead track={track} title="The" accent="rig." lead="What's on the pedalboard: the languages, LLM tooling, infrastructure and MLOps I reach for." />
      </div>

      <div className="mt-16 space-y-5" aria-hidden>
        <Marquee speed={46} className="-rotate-1">
          {ALL.map((t) => (
            <span key={t} className="patch patch-fill mx-2.5">
              {t}
            </span>
          ))}
        </Marquee>
        <Marquee speed={52} reverse className="rotate-1">
          {ALL.map((t) => (
            <span key={t} className="patch patch-outline mx-2.5">
              {t}
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto mt-16 max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Stagger className="grid gap-4 md:grid-cols-2">
          {Object.entries(PROFILE.stack).map(([group, items], gi) => (
            <div key={group} className="rack">
              <span className="rack-ear" aria-hidden />
              <div className="flex-1 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-forge">{group}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">CH {String(gi + 1).padStart(2, "0")}</span>
                </div>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {items.map((t) =>
                    t in LEARNING ? (
                      <li key={t} className="rack-chip flex items-center gap-3">
                        {t}
                        <span className="flex gap-[3px]" role="img" aria-label={`${LEARNING[t] * 10}% of the way`}>
                          {Array.from({ length: 10 }, (_, i) => (
                            <i key={i} className={`h-2.5 w-1.5 rounded-[1px] ${i < LEARNING[t] ? "bg-forge shadow-[0_0_6px_var(--forge)]" : "bg-steel-3"}`} />
                          ))}
                        </span>
                      </li>
                    ) : (
                      <li key={t} className="rack-chip">
                        {t}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <span className="rack-ear" aria-hidden />
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
