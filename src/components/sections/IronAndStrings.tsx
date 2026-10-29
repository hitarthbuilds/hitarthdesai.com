import { PROFILE, TRACKS } from "@/content/profile";
import { TrackHead } from "../ui/TrackHead";
import { Barbell } from "../viz/Barbell";
import { Guitar } from "../viz/Guitar";
import { MedalCoin } from "../viz/MedalCoin";
import { Odometer } from "../fx/Odometer";

/** Track 08 / Iron & Strings: off the clock. A barbell that loads itself, the medal, the guitar. */
export function IronAndStrings() {
  const track = TRACKS[7];
  const p = PROFILE.powerlifting;
  const stats = [
    { label: "Best total", value: p.bestTotal },
    { label: "Weight class", value: p.weightClass },
    { label: "Years lifting", value: p.yearsLifting },
  ].filter((s): s is { label: string; value: string } => s.value !== null);

  return (
    <section id={track.id} aria-labelledby={`${track.id}-title`} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <TrackHead track={track} title="Iron &" accent="strings." lead={PROFILE.offStage} />

        <div className="mt-16">
          <Barbell />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center">
          <div className="flex flex-col items-center gap-8">
            <MedalCoin />
            {stats.length > 0 && (
              <dl className="flex flex-wrap justify-center gap-8 font-mono">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-dim">{s.label}</dt>
                    <dd className="mt-1 text-[30px] text-chrome">
                      <Odometer value={s.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div>
            <Guitar />
            <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
              {PROFILE.guitar} · drag across the strings
            </p>
          </div>
        </div>

        <p className="mx-auto mt-20 max-w-4xl text-center font-display text-[clamp(1.6rem,3.4vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.03em] text-chrome">
          Discipline under load is the same skill as <span className="blackletter molten">systems under load.</span>
        </p>
      </div>
    </section>
  );
}
