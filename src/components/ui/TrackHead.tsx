import { SplitReveal } from "../fx/Reveal";

type Track = { n: string; id: string; name: string; was?: string };

/** Section header: `TRACK 03 / DISCOGRAPHY · was Structure`, a big chrome title, optional lead. */
export function TrackHead({ track, title, accent, lead, className = "" }: { track: Track; title: string; accent?: string; lead?: string; className?: string }) {
  return (
    <header className={className}>
      <p className="eyebrow flex flex-wrap items-center gap-3">
        <span className="text-forge">
          Track {track.n} / {track.name}
        </span>
        {track.was && (
          <>
            <span className="h-px w-8 bg-line-2" aria-hidden />
            <span>was {track.was}</span>
          </>
        )}
      </p>
      <SplitReveal as="h2" type="chars" id={`${track.id}-title`} className="display mt-5 text-[clamp(2.8rem,7.4vw,7.5rem)] text-chrome">
        {title}
        {accent && (
          <>
            {" "}
            <span className="blackletter molten">{accent}</span>
          </>
        )}
      </SplitReveal>
      {lead && <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-mute">{lead}</p>}
    </header>
  );
}
