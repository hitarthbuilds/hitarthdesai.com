import { ogCard, OG_SIZE } from "@/lib/og";
import { PROJECTS } from "@/content/projects";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug)!;
  return ogCard({ eyebrow: `Discography · ${p.track} · ${p.format}`, title: `${p.name}: ${p.blurb}`.slice(0, 110) });
}
