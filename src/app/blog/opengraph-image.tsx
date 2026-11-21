import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Field notes by Hitarth Desai";

export default function Image() {
  return ogCard({ kicker: "Writing", title: "Field notes." });
}
