import { Ore } from "@/components/sections/Ore";

// Sections 02–09 land after the hero is signed off; this list only gives the hero
// something to scroll away from in the meantime.
const NEXT = [
  ["02", "Smelt", "Extract"],
  ["03", "Forge", "Structure"],
  ["04", "Alloy", "Stack"],
  ["05", "Temper", "Trace"],
  ["06", "Assay", "Query"],
  ["07", "Press", "Publish"],
  ["08", "Iron", "Signal"],
  ["09", "Strike", "Ship"],
];

export default function Home() {
  return (
    <>
      <Ore />
      <section aria-label="Coming next" className="mx-auto max-w-[1440px] px-5 py-32 sm:px-8 lg:px-12">
        <ol className="divide-y divide-line border-y border-line">
          {NEXT.map(([n, name, was]) => (
            <li key={n} className="flex items-baseline gap-6 py-7">
              <span className="eyebrow w-10 text-forge">{n}</span>
              <span className="display text-[clamp(2rem,6vw,5rem)] text-chrome/25">{name}</span>
              <span className="eyebrow ml-auto">was {was}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
