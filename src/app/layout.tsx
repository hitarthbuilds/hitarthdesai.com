import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Geist, Geist_Mono, UnifrakturCook } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Preloader } from "@/components/layout/Preloader";
import { Footer } from "@/components/layout/Footer";
import { PROFILE } from "@/content/profile";

const sans = Geist({ subsets: ["latin"], variable: "--ff-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--ff-mono", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--ff-display", axes: ["wdth", "opsz"], display: "swap" });
const blackletter = UnifrakturCook({ subsets: ["latin"], weight: "700", variable: "--ff-black", display: "swap" });

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
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${display.variable} ${blackletter.variable}`}>
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
          <Footer />
        </Providers>
        <Preloader />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
