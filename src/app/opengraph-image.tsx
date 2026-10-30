import { ogCard, OG_SIZE } from "@/lib/og";
import { PROFILE } from "@/content/profile";

export const alt = `${PROFILE.name}, ${PROFILE.title}: ${PROFILE.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "Track 01 / Overture", title: PROFILE.tagline });
}
