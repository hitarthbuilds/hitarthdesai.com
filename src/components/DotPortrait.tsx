"use client";

import { useEffect, useRef } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

// Each dot knows its place in the portrait, how dark that spot is, and a random seed that decides
// where it flies from, how far it bursts and how it swirls.
const VERT = `
attribute vec2 a_home;
attribute float a_dark;
attribute vec3 a_seed;
uniform float u_build, u_burst, u_time, u_pitch, u_on, u_vel, u_wave, u_age;
uniform vec2 u_ptr, u_at;
varying float v_a;
void main() {
  float delay = (a_seed.x * .5 + .5) * .5;
  float b = clamp((u_build - delay) / .5, 0., 1.);
  b = 1. - pow(1. - b, 3.);
  vec3 dust = vec3(a_seed.xy * 1.8, a_seed.z * 1.5);
  vec3 p = mix(dust, vec3(a_home, 0.), b);

  // Scrolling turns the portrait into a relief: dark dots stand forward, the whole face swings round
  // and tips back, and its edges come loose into drifting dust before it all settles again.
  float s = u_burst;
  p.z += (a_dark - .35) * .55 * s;
  vec3 dir = normalize(vec3(a_home * .6 + a_seed.xy, a_seed.z + .3));
  float loose = smoothstep(.25, 1., length(a_home) + a_seed.x * .35);
  p += dir * s * s * (.18 + loose * (.55 + (a_seed.y * .5 + .5) * .6));
  float ang = s * (1.15 + a_seed.z * .25 * loose);
  float c = cos(ang), sn = sin(ang);
  p.xz = vec2(c * p.x - sn * p.z, sn * p.x + c * p.z);
  float tip = s * .38;
  float ct = cos(tip), st = sin(tip);
  p.yz = vec2(ct * p.y - st * p.z, st * p.y + ct * p.z);

  vec2 d = p.xy - u_ptr;
  float dist = length(d);
  float f = u_on * smoothstep(.34, 0., dist);
  p.xy += d / max(dist, 1e-4) * f * .12;
  p.z += f * .4;

  vec2 dw = p.xy - u_at;
  float dwl = length(dw);
  float ring = u_wave * exp(-pow((dwl - u_age * 1.7) / .1, 2.));
  p.xy += dw / max(dwl, 1e-4) * ring * .08;
  p.z += ring * .3;

  float idle = (1. - s) * b;
  p.xy += .002 * vec2(sin(u_time * 1.4 + a_seed.y * 9.), cos(u_time * 1.1 + a_seed.x * 9.)) * idle;
  p.y += u_vel * a_seed.y * .07;

  float z = clamp(p.z, -2., 2.1);
  float persp = 2.6 / (2.6 - z);
  gl_Position = vec4(p.xy * persp, 0., 1.);
  gl_PointSize = max(1., u_pitch * (.12 + 1.15 * sqrt(a_dark)) * persp * (1. + f * .5));
  // Dots fade out before they reach the edge of the portrait's slot, so the cloud never shows a cut.
  vec2 q = abs(p.xy * persp);
  float edge = (1. - smoothstep(.8, .99, q.x)) * (1. - smoothstep(.8, .99, q.y));
  v_a = clamp(.3 + b, 0., 1.) * (1. - smoothstep(1.5, 2.1, z)) * mix(1., edge, smoothstep(0., .15, s + (1. - b)));
}`;

const FRAG = `
precision mediump float;
varying float v_a;
uniform vec3 u_ink;
void main() {
  float r = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .36, r) * v_a;
  if (a < .01) discard;
  gl_FragColor = vec4(u_ink * a, a);
}`;

type Dots = { home: Float32Array; dark: Float32Array; seed: Float32Array; count: number };

/** Reads the portrait into a halftone grid: one dot per cell, sized by how dark the cell is. */
function sample(img: HTMLImageElement, n: number): Dots {
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, n, n);
  const px = ctx.getImageData(0, 0, n, n).data;
  const home: number[] = [];
  const dark: number[] = [];
  const seed: number[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      if (px[i + 3] < 128) continue;
      const lum = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
      // The photograph is low-key, so its tones are stretched before they become dot sizes; that keeps
      // the eyes, teeth and highlights open instead of filling in.
      const d = Math.pow(1 - clamp((lum - 0.1) / 0.56), 1.35);
      if (d < 0.04) continue;
      // Alternate rows sit half a cell over, the way a printed screen does.
      const ox = y % 2 ? 0.5 : 0;
      home.push(((x + 0.5 + ox) / n) * 2 - 1, 1 - ((y + 0.5) / n) * 2);
      dark.push(d);
      seed.push(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    }
  }
  return { home: new Float32Array(home), dark: new Float32Array(dark), seed: new Float32Array(seed), count: dark.length };
}

function program(gl: WebGLRenderingContext) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  return p;
}

/**
 * The hero portrait as a live halftone of ink dots. On load the dots blow in from loose dust and
 * settle into the face; around the pointer (or a finger) they part, and a tap sends a ring through
 * them; scrolling the hero bursts them into a turning cloud that reforms inside the shrinking card.
 * The photograph stays underneath for reduced motion, missing WebGL, and screen readers.
 */
export function DotPortrait() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const root = document.documentElement;
    const figure = canvas.parentElement!;
    const stage = canvas.closest<HTMLElement>(".hero-stage")!;
    const entrance = canvas.closest<HTMLElement>(".entrance")!;
    const pin = entrance.querySelector<HTMLElement>(".hero-pin")!;
    const photo = figure.querySelector<HTMLImageElement>(".hero-photo")!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return;

    let disposed = false;
    let frame = 0;
    let visible = true;
    let dots: Dots | null = null;
    const uni: Record<string, WebGLUniformLocation | null> = {};
    let buildStart = 0;
    let lastFill = "";
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
    const wave = { x: 0, y: 0, start: -10 };
    const narrow = matchMedia("(max-width:700px), (max-aspect-ratio:4/5)").matches;

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const px = Math.round(Math.max(figure.offsetWidth, 200) * dpr);
      if (canvas.width !== px) canvas.width = canvas.height = px;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const setup = (img: HTMLImageElement) => {
      if (disposed) return;
      try {
        const prog = program(gl);
        gl.useProgram(prog);
        dots = sample(img, narrow ? 136 : 176);
        const attr = (name: string, data: Float32Array, n: number) => {
          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
          const loc = gl.getAttribLocation(prog, name);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
        };
        attr("a_home", dots.home, 2);
        attr("a_dark", dots.dark, 1);
        attr("a_seed", dots.seed, 3);
        for (const u of ["u_build", "u_burst", "u_time", "u_pitch", "u_on", "u_vel", "u_wave", "u_age", "u_ptr", "u_at", "u_ink"]) uni[u] = gl.getUniformLocation(prog, u);
        gl.uniform3f(uni.u_ink, 0.086, 0.086, 0.086);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        size();
        stage.classList.add("has-dots");
        loop();
      } catch {
        dots = null;
      }
    };

    const progress = () => {
      const distance = Math.max(1, entrance.offsetHeight - pin.offsetHeight);
      return clamp(-entrance.getBoundingClientRect().top / distance);
    };

    const loop = () => {
      frame = 0;
      if (disposed || !dots) return;
      const now = performance.now();
      if (!buildStart && (root.classList.contains("intro-done") || root.classList.contains("intro-skip"))) buildStart = now + 150;
      const built = buildStart && now > buildStart ? clamp((now - buildStart) / 2400) : 0;
      const p = root.classList.contains("scrub") ? progress() : 0;
      const burst = smooth(clamp((p - 0.04) / 0.3)) * (1 - smooth(clamp((p - 0.42) / 0.36)));
      ptr.x += (ptr.tx - ptr.x) * 0.16;
      ptr.y += (ptr.ty - ptr.y) * 0.16;
      ptr.on += ((p < 0.25 ? ptr.ton : 0) - ptr.on) * 0.08;
      const age = (now - wave.start) / 1000;
      const vel = Math.max(-1, Math.min(1, (window.__lenis?.velocity ?? 0) / 40));

      // The photo underneath turns into a paper silhouette that keeps the contour map out of the
      // face while the dots hold it, and clears away when they fly apart.
      const fill = (built * (1 - burst * 1.6)).toFixed(3);
      if (fill !== lastFill) stage.style.setProperty("--dots", (lastFill = fill));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uni.u_build, built);
      gl.uniform1f(uni.u_burst, burst);
      gl.uniform1f(uni.u_time, now / 1000);
      gl.uniform1f(uni.u_pitch, canvas.width / (narrow ? 136 : 176));
      gl.uniform1f(uni.u_on, ptr.on);
      gl.uniform1f(uni.u_vel, vel);
      gl.uniform1f(uni.u_wave, age < 1.3 ? 1 - age / 1.3 : 0);
      gl.uniform1f(uni.u_age, age);
      gl.uniform2f(uni.u_ptr, ptr.x, ptr.y);
      gl.uniform2f(uni.u_at, wave.x, wave.y);
      gl.drawArrays(gl.POINTS, 0, dots.count);
      if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!frame && dots && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    // Pointer positions in the portrait's own -1..1 space.
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: 1 - ((e.clientY - r.top) / r.height) * 2, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
    };
    const onMove = (e: PointerEvent) => {
      const l = local(e);
      ptr.tx = l.x;
      ptr.ty = l.y;
      ptr.ton = l.inside ? 1 : 0;
      if (e.pointerType !== "mouse" && ptr.on < 0.05) {
        ptr.x = l.x;
        ptr.y = l.y;
      }
    };
    const onDown = (e: PointerEvent) => {
      const l = local(e);
      if (!l.inside || progress() > 0.25) return;
      Object.assign(wave, { x: l.x, y: l.y, start: performance.now() });
      onMove(e);
    };
    const onOff = () => (ptr.ton = 0);
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") ptr.ton = 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      wake();
    });
    io.observe(entrance);
    const onVis = () => wake();
    const onResize = () => {
      if (dots) size();
    };
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerdown", onDown, { passive: true });
    stage.addEventListener("pointerleave", onOff);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onOff);
    document.addEventListener("visibilitychange", onVis);
    addEventListener("resize", onResize, { passive: true });

    const img = new Image();
    img.decoding = "async";
    img.onload = () => setup(img);
    const start = () => (img.src = photo.currentSrc || photo.src);
    if (photo.complete && photo.currentSrc) start();
    else photo.addEventListener("load", start, { once: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      io.disconnect();
      stage.classList.remove("has-dots");
      stage.style.removeProperty("--dots");
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerleave", onOff);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onOff);
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("resize", onResize);
      photo.removeEventListener("load", start);
    };
  }, []);

  return <canvas className="dot-canvas" ref={ref} aria-hidden="true" />;
}
