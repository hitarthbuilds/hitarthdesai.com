import { TRACKS } from "@/content/profile";
import { FAQ } from "@/content/faq";
import { TrackHead } from "../ui/TrackHead";
import { Stagger } from "../fx/Reveal";

/** Track 06 / Soundcheck: the questions founders ask, as an accordion of amp panels. */
export function Soundcheck() {
  const track = TRACKS[5];
  return (
    <section id={track.id} aria-labelledby={`${track.id}-title`} className="relative py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-12">
        <TrackHead track={track} title="Check," accent="one two." lead="A soundcheck tests the fit before the show. These are the questions founders usually ask first." />
        <Stagger className="flex flex-col gap-3 lg:pt-10" y={24}>
          {FAQ.map((f) => (
            <details key={f.q} className="faq group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5">
                <span className="font-display text-[19px] font-semibold leading-snug tracking-[-0.01em] text-chrome">{f.q}</span>
                <span className="faq-plus" aria-hidden />
              </summary>
              <div className="faq-answer px-6 pb-6 text-[16px] leading-relaxed text-mute">{f.a}</div>
            </details>
          ))}
        </Stagger>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
    </section>
  );
}
