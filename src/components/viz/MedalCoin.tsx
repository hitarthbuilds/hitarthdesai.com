import { Tilt } from "../fx/Tilt";

/** The one place --gold appears: a medal whose foil sheen follows the pointer as it tilts. */
export function MedalCoin() {
  return (
    <Tilt max={14} className="medal-wrap relative mx-auto w-full max-w-[340px]">
      <div className="medal-ribbon" aria-hidden />
      <div className="medal">
        <div className="medal-inner">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#3d2f0c]">Powerlifting</span>
          <span className="blackletter mt-1 text-[64px] leading-none text-[#3d2f0c]">I</span>
          <span className="mt-1 text-center font-display text-[15px] font-bold uppercase leading-tight tracking-[0.02em] text-[#3d2f0c]">
            International
            <br />
            gold medalist
          </span>
        </div>
        <div className="medal-foil" aria-hidden />
      </div>
    </Tilt>
  );
}
