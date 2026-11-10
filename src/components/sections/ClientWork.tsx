import Link from "next/link";
import { CLIENT_PROJECTS } from "@/content/client-projects";
import { CLIENT_TRACK } from "@/content/profile";
import { ArrowRight } from "../ui/Icons";
import { TrackHead } from "../ui/TrackHead";
import { Sleeve } from "./DiscographyGallery";

export function ClientWork() {
  return (
    <section id={CLIENT_TRACK.id} aria-labelledby={`${CLIENT_TRACK.id}-title`} className="relative scroll-mt-20 border-y border-line py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <TrackHead
          track={CLIENT_TRACK}
          title="Client"
          accent="work."
          lead="Freelance websites, booking and commerce systems, and the admin tools behind them. Explore the live projects and what I built."
        />
        <div className="mt-14 grid gap-x-12 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
          {CLIENT_PROJECTS.map((project) => <Sleeve key={project.slug} p={project} />)}
        </div>
        <div className="mt-16 border-t border-line pt-8">
          <Link href="/#encore" className="btn btn-forge">
            Discuss a project <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
