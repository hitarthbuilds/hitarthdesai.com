import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PROFILE } from "@/content/profile";
import { IS_CANONICAL_HOST } from "@/lib/site";
import { Motion } from "@/components/Motion";
import { Cursor } from "@/components/Cursor";
import "@/styles/base.css";
import "@/styles/motion.css";

// Open Sans Condensed Bold for display, Open Sans for text (licence in src/fonts).
const display = localFont({ src: "../fonts/display.woff", weight: "700", variable: "--font-display", display: "swap", preload: true });
const sans = localFont({
  src: [
    { path: "../fonts/text.woff", weight: "400" },
    { path: "../fonts/text-bold.woff", weight: "700" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.url),
  title: { default: `${PROFILE.name} — ${PROFILE.title}`, template: `%s — ${PROFILE.name}` },
  description: PROFILE.description,
  openGraph: {
    type: "website",
    siteName: PROFILE.name,
    title: `${PROFILE.name} — ${PROFILE.title}`,
    description: "Systems, selected work and field notes from Surat, India.",
    url: PROFILE.url,
  },
  twitter: { card: "summary_large_image", site: "@hitarthbuilds", creator: "@hitarthbuilds" },
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/rss.xml", title: "Field notes" }] } },
  robots: IS_CANONICAL_HOST ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#dedede", colorScheme: "light" };

/**
 * Runs before first paint. Marks the page as scripted (menu and ink controls appear), turns on the
 * pinned introduction unless reduced motion is preferred, and decides whether the intro curtain
 * plays (home page, first visit of the session). If the app never hydrates, everything is shown.
 */
const BOOT = `(function(d){d.classList.add("interactive");var r=false,s=false;try{r=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}if(!r)d.classList.add("scrub");try{s=!!sessionStorage.getItem("hd-intro")}catch(e){}if(r||s||location.pathname!=="/")d.classList.add("intro-skip");setTimeout(function(){if(!window.__hdReady)d.classList.add("intro-skip","intro-done","reveal-fallback")},4500)})(document.documentElement)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <Motion />
        {children}
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
