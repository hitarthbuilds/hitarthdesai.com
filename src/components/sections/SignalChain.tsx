import { TRACKS } from "@/content/profile";
import { TrackHead } from "../ui/TrackHead";
import { Stagger } from "../fx/Reveal";
import { ExtractionDemo } from "../viz/ExtractionDemo";

const FOCUS = [
  {
    title: "Schema-constrained extraction",
    body: "Schema-constrained, validated, deterministic structured output from LLMs, instead of “parse the JSON and pray.”",
    knobs: ["Schema", "Mask", "Validate"],
  },
  {
    title: "Async & batched pipelines",
    body: "Async, batched, observable document-processing flows that hold up under real traffic.",
    knobs: ["Batch", "Queue", "Retry"],
  },
  {
    title: "Observability & eval harnesses",
    body: "Traces, failure telemetry, dead-letter paths and eval harnesses, so every extraction can be measured, replayed and trusted.",
    knobs: ["Trace", "Eval", "Replay"],
  },
];

/** Track 02 / Signal Chain: the raw-text → JSON demo, then three focus areas as amp heads. */
export function SignalChain() {
  const track = TRACKS[1];
  return (
    <section id={track.id} aria-labelledby={`${track.id}-title`} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <TrackHead
          track={track}
          title="Raw signal in,"
          accent="clean tone out."
          lead="I care about the gap between a model that demos well and a system that survives real traffic. Most of my work lives in that gap: turning probabilistic model output into something a downstream service can trust."
        />
      </div>
      <ExtractionDemo />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {FOCUS.map((f) => (
            <article key={f.title} className="amp-head group">
              <div className="amp-head-grille">
                <span className="blackletter chrome-text text-[22px] leading-none">HD</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                {f.knobs.map((k) => (
                  <span key={k} className="flex flex-col items-center gap-1.5">
                    <i className="pedal-knob amp-head-knob" aria-hidden />
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">{k}</span>
                  </span>
                ))}
                <span className="h-2.5 w-2.5 rounded-full bg-blood shadow-[0_0_10px_2px_rgba(217,20,43,.7)]" aria-hidden />
              </div>
              <div className="p-5">
                <h3 className="font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-chrome">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mute">{f.body}</p>
              </div>
            </article>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
