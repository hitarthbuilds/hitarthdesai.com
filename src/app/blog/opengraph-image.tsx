import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Liner notes: field notes on making LLMs reliable in production, by Hitarth Desai";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "Track 07 / Liner notes", title: "Field notes on making LLMs reliable in production" });
}
