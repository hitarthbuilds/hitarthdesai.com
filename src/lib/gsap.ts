"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, CustomEase, Observer, useGSAP);
  CustomEase.create("hop", "0.85,0,0.15,1");
  CustomEase.create("silk", "0.16,1,0.3,1");
}

export const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export { gsap, ScrollTrigger, SplitText, Flip, Observer, useGSAP };
