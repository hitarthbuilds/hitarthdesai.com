// Server-only: shared renderer for every Open Graph card (next/og). Fonts are read from
// src/og-fonts at build time; all cards are static.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (f: string) => readFile(path.join(process.cwd(), "src/og-fonts", f));

/** A tolex-black card: stage-fire glow, a spinning-vinyl corner, chrome title, forge rule. */
export async function ogCard({ eyebrow, title, footer }: { eyebrow: string; title: string; footer?: string }) {
  const [display, black, mono] = await Promise.all([font("bricolage-800.woff"), font("unifraktur-700.woff"), font("geist-mono-500.woff")]);
  const size = title.length > 70 ? 58 : title.length > 44 ? 70 : 88;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(ellipse 90% 60% at 30% 120%, rgba(217,20,43,.45), rgba(255,106,26,.18) 40%, rgba(8,9,11,0) 70%), linear-gradient(180deg, #121316, #08090b)",
          color: "#e9edf2",
          position: "relative",
        }}
      >
        {/* Vinyl in the corner */}
        <div style={{ position: "absolute", right: -120, top: -120, width: 460, height: 460, borderRadius: 999, background: "radial-gradient(circle, #ff6a1a 0 11%, #08090b 11.5% 13%, #16181b 13.5%, #0b0c0e 40%, #16181b 41%, #0b0c0e 60%, #16181b 61%, #0b0c0e 100%)", border: "2px solid rgba(220,228,240,.12)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontFamily: "Black", fontSize: 64, color: "#e9edf2", lineHeight: 1 }}>HD</span>
          <span style={{ fontFamily: "Mono", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#ff6a1a" }}>{eyebrow}</span>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Display",
            fontSize: size,
            lineHeight: 0.98,
            letterSpacing: -1,
            maxWidth: 980,
            backgroundImage: "linear-gradient(180deg, #fdfdfd 0%, #c9ced6 40%, #7d848f 55%, #e9edf2 78%, #9aa1ab 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ width: 160, height: 5, background: "linear-gradient(90deg, #ff6a1a, #ffb547, #d9142b)", display: "flex" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Mono", fontSize: 22, color: "#9aa1ab", letterSpacing: 1 }}>
            <span>{footer ?? "Hitarth Desai · AI Systems Engineer"}</span>
            <span>hitarthdesai.com</span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: display, weight: 800, style: "normal" },
        { name: "Black", data: black, weight: 700, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
