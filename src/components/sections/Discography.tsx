import { TRACKS } from "@/content/profile";
import { PROJECTS } from "@/content/projects";
import { getStats, type ProjectStats } from "@/lib/stats";
import { TrackHead } from "../ui/TrackHead";
import { DiscographyGallery } from "./DiscographyGallery";

/** Track 03 / Discography: selected work as records, with live PyPI/GitHub numbers (ISR). */
export async function Discography() {
  const track = TRACKS[2];
  const stats: Record<string, ProjectStats> = {};
  await Promise.all(PROJECTS.filter((p) => p.stats).map(async (p) => void (stats[p.slug] = await getStats(p.slug, p.stats!))));
  return (
    <section id={track.id} aria-labelledby={`${track.id}-title`} className="relative py-24 lg:pb-0 lg:pt-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <TrackHead track={track} title="Selected" accent="releases." lead="Open-source libraries, workbenches and products: the tools I needed and couldn't find, pressed and shipped." />
      </div>
      <DiscographyGallery projects={PROJECTS} stats={stats} />
    </section>
  );
}
