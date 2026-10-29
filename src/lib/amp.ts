"use client";

import { useSyncExternalStore } from "react";

/**
 * The AMP: all site sound, off by default. Guitar tones are synthesized on the fly, so no
 * samples ship: Karplus-Strong plucks feed a high-gain rig (tight boost, two clipping stages,
 * scooped 4×12 cab sim, compressor, Haas-widened double track).
 */

/** Standard tuning, low E to high E, in Hz. */
export const OPEN_STRINGS = [82.41, 110, 146.83, 196, 246.94, 329.63];

const KEY = "amp";
let on = false;
let ctx: AudioContext | null = null;
let input: AudioNode | null = null;
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

function shaper(ac: BaseAudioContext, k: number, asym: number) {
  const ws = ac.createWaveShaper();
  const curve = new Float32Array(4096);
  const norm = Math.tanh(k);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    // Asymmetric soft clip: the negative half drives harder, adding even harmonics like a tube.
    curve[i] = x >= 0 ? Math.tanh(k * x) / norm : Math.tanh(k * asym * x) / (norm * (1 + (asym - 1) * 0.6));
  }
  ws.curve = curve;
  ws.oversample = "4x";
  return ws;
}

function biquad(ac: BaseAudioContext, type: BiquadFilterType, freq: number, q: number, gain = 0) {
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  f.gain.value = gain;
  return f;
}

/** The high-gain rig, from guitar input to `out`. Exported shape keeps it testable offline. */
export function buildRig(ac: BaseAudioContext, out: AudioNode) {
  const input = ac.createGain();
  const level = (v: number) => {
    const g = ac.createGain();
    g.gain.value = v;
    return g;
  };
  // Boost pedal into the amp: cut the flub, push the mids, then two gain stages.
  const tight = biquad(ac, "highpass", 120, 0.7);
  const push = biquad(ac, "peaking", 760, 0.8, 9);
  const stage1 = shaper(ac, 14, 1.3);
  const inter = biquad(ac, "lowpass", 7000, 0.5);
  const stage2 = shaper(ac, 5, 1.1);
  // Power amp and a closed-back 4×12: scooped mids, chest thump, presence, steep top roll-off.
  const dc = biquad(ac, "highpass", 80, 0.7);
  const scoop = biquad(ac, "peaking", 480, 1.1, -7);
  const thump = biquad(ac, "peaking", 110, 1, 4);
  const presence = biquad(ac, "peaking", 2600, 1, 5);
  const cab1 = biquad(ac, "lowpass", 5000, 0.9);
  const cab2 = biquad(ac, "lowpass", 5600, 0.5);
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 10;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;
  const master = level(0.5);
  input
    .connect(tight)
    .connect(push)
    .connect(level(5))
    .connect(stage1)
    .connect(inter)
    .connect(level(3))
    .connect(stage2)
    .connect(dc)
    .connect(scoop)
    .connect(thump)
    .connect(presence)
    .connect(cab1)
    .connect(cab2)
    .connect(comp)
    .connect(master);
  // Double-tracked wall: dry hard left, a 14 ms copy hard right.
  const merge = ac.createChannelMerger(2);
  const haas = ac.createDelay(0.05);
  haas.delayTime.value = 0.014;
  master.connect(merge, 0, 0);
  master.connect(haas).connect(merge, 0, 1);
  merge.connect(out);
  return input;
}

/** A Karplus-Strong string: a warm, pick-position-combed noise burst recirculating a delay line. */
export function pluckBuffer(ac: BaseAudioContext, freq: number, velocity: number, length: number, mute = false) {
  const sr = ac.sampleRate;
  const n = Math.floor(sr * length);
  const buf = ac.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq));
  const comb = Math.max(1, Math.round(period * 0.13));
  let lp = 0;
  const burst = new Float32Array(period);
  for (let i = 0; i < period; i++) {
    lp += ((Math.random() * 2 - 1) - lp) * (mute ? 0.25 : 0.6);
    burst[i] = lp;
  }
  for (let i = 0; i < period; i++) d[i] = (burst[i] - burst[(i + comb) % period]) * velocity;
  const decay = mute ? 0.985 : 0.9985;
  for (let i = period; i < n; i++) d[i] = decay * 0.5 * (d[i - period] + d[i - period + 1]);
  return buf;
}

const RELEASE = Float32Array.from({ length: 64 }, (_, i) => (1 - i / 63) ** 3);

function chain() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  input = buildRig(ctx, ctx.destination);
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
  /** One plucked note. `delay` in seconds lets chords strum; `mute` palm-mutes it into a chug. */
  pluck(freq: number, { velocity = 1, delay = 0, length = 2.4, mute = false, visual = true } = {}) {
    if (visual) hit(velocity * 0.3);
    if (!on) return;
    const ac = chain();
    if (ac.state !== "running") return;
    const len = mute ? 0.28 : length;
    const src = ac.createBufferSource();
    src.buffer = pluckBuffer(ac, freq, velocity, len, mute);
    const g = ac.createGain();
    const t = ac.currentTime + delay;
    // The rig adds ~70× gain, so the release must land on exactly zero before the stop, or the
    // amplified tail clicks.
    g.gain.setValueAtTime(1, t);
    g.gain.setValueCurveAtTime(RELEASE, t + len * 0.45, len * 0.55 - 0.01);
    src.connect(g).connect(input!);
    src.start(t);
    src.stop(t + len);
  },
  /** Palm-muted low E chugs, e.g. `chug(4)` for a gallop. */
  chug(times = 1, root = OPEN_STRINGS[0]) {
    hit(0.5);
    for (let i = 0; i < times; i++) [1, 1.4983].forEach((m) => amp.pluck(root * m, { velocity: 0.9, delay: i * 0.13, mute: true, visual: false }));
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
