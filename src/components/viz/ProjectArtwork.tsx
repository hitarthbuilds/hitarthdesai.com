import Image from "next/image";
import type { Project } from "@/content/projects";
import { AlbumArt } from "./AlbumArt";

export function ProjectArtwork({ project, sizes }: { project: Project; sizes: string }) {
  if (!project.clientWork) return <AlbumArt visual={project.visual} />;

  return (
    <Image
      src={project.clientWork.image}
      alt={project.clientWork.alt}
      fill
      sizes={sizes}
      className="object-contain"
    />
  );
}
