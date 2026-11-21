// Server-only: the shared 1200×630 social card for posts and case studies.
import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => fs.readFile(path.join(process.cwd(), "src/fonts", file));

/** Paper card: mono kicker, condensed uppercase title, name and role along the foot. */
export async function ogCard({ kicker, title }: { kicker: string; title: string }) {
  const [display, text] = await Promise.all([font("display.woff"), font("text.woff")]);
  const size = title.length > 70 ? 70 : title.length > 40 ? 88 : 118;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#efefef", color: "#101010", padding: "64px 72px", fontFamily: "Text" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: "#4a4a4a" }}>
          <span>{kicker}</span>
          <span>hitarthdesai.com</span>
        </div>
        <div style={{ display: "flex", fontFamily: "Display", fontSize: size, lineHeight: 0.9, letterSpacing: -2, textTransform: "uppercase", maxWidth: 1040 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #101010", paddingTop: 22, fontSize: 26 }}>
          <span>Hitarth Desai</span>
          <span style={{ color: "#4a4a4a" }}>AI Systems Engineer · Surat, India</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: display, weight: 700, style: "normal" },
        { name: "Text", data: text, weight: 400, style: "normal" },
      ],
    },
  );
}
