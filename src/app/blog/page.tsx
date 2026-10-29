import type { Metadata } from "next";
import { formatDate, getPosts } from "@/lib/posts";
import { BlogIndex } from "./BlogIndex";

export const metadata: Metadata = {
  title: "Liner notes",
  description: "Field notes on making LLMs reliable in production: structured outputs, pipeline infrastructure, and the unglamorous layer in between.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getPosts().map((p) => ({ slug: p.slug, title: p.title, date: formatDate(p.date), readMinutes: p.readMinutes, excerpt: p.excerpt ?? p.description, tags: p.tags }));
  return <BlogIndex posts={posts} />;
}
