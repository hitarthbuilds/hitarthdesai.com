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

// Live project stats are fetched at build time and refreshed daily.
export const revalidate = 86400;

/** The record, tracks 01–09. */
export default function Home() {
  return (
    <>
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
