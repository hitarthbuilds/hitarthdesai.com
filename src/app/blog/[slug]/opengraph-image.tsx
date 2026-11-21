import { getPost, getPosts } from "@/lib/posts";
import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Field note by Hitarth Desai";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return ogCard({ kicker: "Field notes", title: post?.meta.title ?? "Field notes" });
}
