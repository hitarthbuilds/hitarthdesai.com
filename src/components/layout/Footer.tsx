import Link from "next/link";
import { PROFILE } from "@/content/profile";
import { FooterWordmark } from "./FooterWordmark";

export function Footer() {
  return (
    <footer className="relative border-t border-line pt-14">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-start justify-between gap-10 px-5 sm:px-8 lg:px-12">
        <div>
          <p className="font-display text-[20px] font-bold tracking-[-0.02em] text-chrome">{PROFILE.name}</p>
          <p className="mt-1 text-[14px] text-mute">
            {PROFILE.title} · {PROFILE.location.city}, {PROFILE.location.countryCode}
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-1 text-[14px] text-mute [&>a]:min-w-8 [&>a]:py-2.5">
          <Link href="/#discography" className="hover:text-chrome">
            Work
          </Link>
          <Link href="/blog" className="hover:text-chrome">
            Writing
          </Link>
          {PROFILE.socials.map((s) => (
            <a key={s.id} href={s.href} target="_blank" rel="me noopener noreferrer" className="hover:text-chrome">
              {s.label}
            </a>
          ))}
        </nav>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
          © {new Date().getFullYear()} · {PROFILE.motto}
        </p>
      </div>
      <FooterWordmark text="Hitarth" />
    </footer>
  );
}
