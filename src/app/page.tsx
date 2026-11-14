import { Ore } from "@/components/sections/Ore";
import { SignalChain } from "@/components/sections/SignalChain";
import { Discography } from "@/components/sections/Discography";
import { ClientWork } from "@/components/sections/ClientWork";
import { Rig } from "@/components/sections/Rig";
import { Tour } from "@/components/sections/Tour";
import { Soundcheck } from "@/components/sections/Soundcheck";
import { LinerNotes } from "@/components/sections/LinerNotes";
import { IronAndStrings } from "@/components/sections/IronAndStrings";
import { Encore } from "@/components/sections/Encore";
import { Strings } from "@/components/fx/Strings";
import { PROFILE } from "@/content/profile";

// Live project stats are fetched at build time and refreshed daily.
export const revalidate = 86400;

/** Person schema: ties the site to the same profiles the footer links, so search engines treat them as one identity. */
const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  url: PROFILE.url,
  jobTitle: PROFILE.title,
  description: PROFILE.tagline,
  address: {
    "@type": "PostalAddress",
    addressLocality: PROFILE.location.city,
    addressRegion: PROFILE.location.region,
    addressCountry: PROFILE.location.countryCode,
  },
  alumniOf: { "@type": "CollegeOrUniversity", name: PROFILE.education.school },
  sameAs: PROFILE.socials.map((s) => s.href),
};

/** The record, tracks 01–09. */
export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }} />
      <Ore />
      <Strings />
      <SignalChain />
      <Discography />
      <ClientWork />
      <Rig />
      <Tour />
      <Soundcheck />
      <LinerNotes />
      <IronAndStrings />
      <Encore />
    </>
  );
}
