import { ogCard, OG_SIZE } from "@/lib/og";
import { formatDate, getPost, getPosts } from "@/lib/posts";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return [{ id: "card", alt: post?.meta.title ?? "Liner notes", size: OG_SIZE, contentType }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)!;
  return ogCard({ eyebrow: `Liner notes · ${post.meta.readMinutes} min`, title: post.meta.title, footer: `Hitarth Desai · ${formatDate(post.meta.date)}` });
}
