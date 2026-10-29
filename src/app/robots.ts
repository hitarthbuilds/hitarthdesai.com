import type { MetadataRoute } from "next";
import { PROFILE } from "@/content/profile";
import { IS_CANONICAL_HOST } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!IS_CANONICAL_HOST) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${PROFILE.url}/sitemap.xml`, host: PROFILE.url };
}
