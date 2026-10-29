import { Ore } from "@/components/sections/Ore";
import { SignalChain } from "@/components/sections/SignalChain";
import { Discography } from "@/components/sections/Discography";
import { Strings } from "@/components/fx/Strings";
import { TRACKS } from "@/content/profile";

// Tracks 02–09 land after the hero is signed off; this list only gives the hero
// something to scroll away from in the meantime.
// Live project stats are fetched at build time and refreshed daily.
export const revalidate = 86400;

export default function Home() {
  return (
    <>
      <Ore />
      <Strings />
      <SignalChain />
      <Discography />
      <section aria-label="Tracklist" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12">
        <ol className="divide-y divide-line border-y border-line">
          {TRACKS.slice(3).map((t) => (
            <li key={t.n} className="flex items-baseline gap-6 py-7">
              <span className="eyebrow w-20 text-forge">Track {t.n}</span>
              <span className="display text-[clamp(2rem,6vw,5rem)] text-chrome/25">{t.name}</span>
              <span className="eyebrow ml-auto hidden sm:inline">was {t.was}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
