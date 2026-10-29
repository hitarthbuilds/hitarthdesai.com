import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Preloader } from "@/components/layout/Preloader";
import { PROFILE } from "@/content/profile";

const sans = Geist({ subsets: ["latin"], variable: "--ff-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--ff-mono", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--ff-display", axes: ["wdth", "opsz"], display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--ff-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.url),
  title: { default: `${PROFILE.name} · ${PROFILE.title}`, template: `%s · ${PROFILE.name}` },
  description: `${PROFILE.tagline} ${PROFILE.bio}`,
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${display.variable} ${serif.variable}`}>
      <body>
        <Script id="preloader-seen" strategy="beforeInteractive">
          {`try{if(sessionStorage.getItem('pl'))document.documentElement.dataset.pl='1'}catch(e){}`}
        </Script>
        <Providers>
          <a href="#main" className="sr-only z-[110] rounded-full bg-forge px-4 py-2 font-semibold text-void focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
        </Providers>
        <Preloader />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
