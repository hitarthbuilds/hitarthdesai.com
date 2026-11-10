import type { MetadataRoute } from "next";
import { PROFILE } from "@/content/profile";
import { ALL_PROJECTS } from "@/content/projects";
import { getPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  return [
    { url: PROFILE.url, changeFrequency: "weekly", priority: 1 },
    { url: `${PROFILE.url}/blog`, lastModified: posts[0]?.date, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({ url: `${PROFILE.url}/blog/${p.slug}`, lastModified: p.date, priority: 0.7 })),
    ...ALL_PROJECTS.map((p) => ({ url: `${PROFILE.url}/projects/${p.slug}`, priority: 0.6 })),
  ];
}
