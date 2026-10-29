"use client";

import { useSyncExternalStore } from "react";

/**
 * The AMP: all site sound, off by default. Guitar tones are synthesized on the fly
 * (Karplus-Strong plucks into a waveshaper and a cab-sim lowpass), so no samples ship.
 */

/** Standard tuning, low E to high E, in Hz. */
export const OPEN_STRINGS = [82.41, 110, 146.83, 196, 246.94, 329.63];

const KEY = "amp";
let on = false;
let ctx: AudioContext | null = null;
let input: GainNode | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    on = localStorage.getItem(KEY) === "1";
  } catch {}
  // A remembered "on" can't start audio until the visitor interacts with the page.
  const wake = () => {
    if (on) void chain().resume();
    window.removeEventListener("pointerdown", wake);
    window.removeEventListener("keydown", wake);
  };
  window.addEventListener("pointerdown", wake);
  window.addEventListener("keydown", wake);
}

function chain() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  input = ctx.createGain();
  const drive = ctx.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 9) * 0.9;
  }
  drive.curve = curve;
  drive.oversample = "4x";
  const cab = ctx.createBiquadFilter();
  cab.type = "lowpass";
  cab.frequency.value = 4200;
  cab.Q.value = 0.7;
  const body = ctx.createBiquadFilter();
  body.type = "peaking";
  body.frequency.value = 180;
  body.gain.value = 5;
  const master = ctx.createGain();
  master.gain.value = 0.16;
  input.connect(drive).connect(body).connect(cab).connect(master).connect(ctx.destination);
  return ctx;
}

/** Every riff is also visual: the stage and the pick swarm react to `amp:hit`, sound on or off. */
function hit(strength: number) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("amp:hit", { detail: strength }));
}

export const amp = {
  get on() {
    return on;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
  /** Must be called from a user gesture the first time, so the AudioContext may start. */
  async set(next: boolean) {
    on = next;
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
    listeners.forEach((l) => l());
    if (next) await chain().resume();
  },
  /** One plucked note. `delay` in seconds lets chords strum. */
  pluck(freq: number, { velocity = 1, delay = 0, length = 1.6, visual = true } = {}) {
    if (visual) hit(velocity * 0.3);
    if (!on) return;
    const ac = chain();
    if (ac.state !== "running") return;
    const sr = ac.sampleRate;
    const n = Math.floor(sr * length);
    const buf = ac.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / freq));
    for (let i = 0; i < period; i++) d[i] = (Math.random() * 2 - 1) * velocity;
    const decay = 0.996;
    for (let i = period; i < n; i++) d[i] = decay * 0.5 * (d[i - period] + d[i - period + 1]);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    const t = ac.currentTime + delay;
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    src.connect(g).connect(input!);
    src.start(t);
  },
  /** Root–fifth–octave power chord, strummed down. */
  power(root = OPEN_STRINGS[0], velocity = 1) {
    hit(velocity);
    [1, 1.4983, 2].forEach((m, i) => amp.pluck(root * m, { velocity, delay: i * 0.012, visual: false }));
  },
};

export function useAmp() {
  return useSyncExternalStore(
    amp.subscribe,
    () => on,
    () => false,
  );
}
