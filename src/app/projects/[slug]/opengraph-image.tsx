import { PROJECTS, getProject } from "@/content/projects";
import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study by Hitarth Desai";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  return ogCard({ kicker: p ? `${p.category} / ${p.field}` : "Selected work", title: p?.name ?? "Selected work" });
}
