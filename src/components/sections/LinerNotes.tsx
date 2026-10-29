import Link from "next/link";
import { TRACKS } from "@/content/profile";
import { formatDate, getPosts } from "@/lib/posts";
import { TrackHead } from "../ui/TrackHead";
import { LinerNotesList } from "./LinerNotesList";
import { ArrowRight } from "../ui/Icons";

/** Track 07 / Liner Notes: the latest writing. */
export function LinerNotes() {
  const track = TRACKS[6];
  const posts = getPosts();
  const rows = posts.slice(0, 3).map((p) => ({ slug: p.slug, title: p.title, date: formatDate(p.date), readMinutes: p.readMinutes, excerpt: p.excerpt ?? p.description, tags: p.tags }));
  return (
    <section id={track.id} aria-labelledby={`${track.id}-title`} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <TrackHead track={track} title="Liner" accent="notes." lead="Field notes on making LLMs reliable in production: structured outputs, pipeline infrastructure, and the unglamorous layer in between." />
          <Link href="/blog" className="btn btn-steel">
            <span className="btn-fill" />
            All {posts.length} notes
            <ArrowRight />
          </Link>
        </div>
        <div className="mt-14">
          <LinerNotesList rows={rows} />
        </div>
      </div>
    </section>
  );
}
