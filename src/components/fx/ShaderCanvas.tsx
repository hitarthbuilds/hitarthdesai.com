"use client";

import { useEffect, useRef } from "react";
import { prefersReduced } from "@/lib/gsap";

/** Pointer heat trail length. Each point is (x, y, temperature) in aspect-corrected space. */
const HEAT = 16;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

/*
 * Liquid chrome:
 *  1. domain-warped fbm height field h(p,t)
 *  2. normals from finite differences, view vector reflected off them
 *  3. shaded with a procedural studio (softbox bands, dark floor, cool blue rim) + Schlick fresnel
 *  4. pointer heat dents the surface and glows forge → ember, cooling back to chrome
 * Every smoothstep keeps edge0 < edge1 (reversed edges are undefined behaviour), and the
 * final colour is clamped.
 */
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define HEAT ${HEAT}
uniform vec2 u_res;
uniform float u_time;
uniform float u_fade;
uniform vec3 u_heat[HEAT];

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}
const mat2 ROT=mat2(.8,.6,-.6,.8);
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*noise(p);p=ROT*p*2.03+vec2(1.7,9.2);a*=.5;}
  return v;
}
float heatAt(vec2 p){
  float h=0.;
  for(int i=0;i<HEAT;i++){
    vec3 s=u_heat[i];
    h+=s.z*(1.-smoothstep(0.,.2,length(p-s.xy)));
  }
  return h;
}
float field(vec2 p,vec2 r){return fbm(p*.85+1.45*r)-.1*heatAt(p);}

vec3 env(vec3 R){
  float y=R.y,x=R.x;
  vec3 c=mix(vec3(.010,.011,.014),vec3(.060,.066,.078),smoothstep(-.7,.55,y));
  float b1=1.-smoothstep(.025,.10,abs(y-.36-.06*x*x));
  float b2=1.-smoothstep(.010,.045,abs(y-.64+.03*x));
  float b3=1.-smoothstep(.015,.060,abs(y+.16));
  c+=vec3(1.,.985,.96)*b1*1.15;
  c+=vec3(.90,.94,1.)*b2*.75;
  c+=vec3(.70,.74,.80)*b3*.30;
  c+=vec3(.18,.40,.95)*smoothstep(.40,.95,abs(x))*.50;
  return c;
}
vec3 heatCol(float k){
  vec3 c=mix(vec3(.55,.18,.03),vec3(1.,.416,.102),smoothstep(0.,.35,k));
  c=mix(c,vec3(1.,.71,.28),smoothstep(.35,.8,k));
  return mix(c,vec3(1.,.94,.82),smoothstep(.85,1.3,k));
}

void main(){
  vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;
  float t=u_time;
  vec2 P=p*.95;
  vec2 q=vec2(fbm(P+vec2(0.,t*.06)),fbm(P+vec2(5.2,1.3)-t*.045));
  vec2 r=vec2(fbm(P+2.1*q+vec2(1.7,9.2)+t*.08),fbm(P+2.1*q+vec2(8.3,2.8)-t*.055));

  float e=.004;
  float h=field(p,r);
  vec2 g=vec2(field(p+vec2(e,0.),r)-h,field(p+vec2(0.,e),r)-h)/e;
  vec3 n=normalize(vec3(-g*.34,1.));

  vec3 I=normalize(vec3(p*.35,-1.));
  vec3 R=reflect(I,n);
  float cosT=clamp(dot(n,-I),0.,1.);
  vec3 F0=vec3(.60,.63,.68);
  vec3 F=F0+(1.-F0)*pow(1.-cosT,5.);
  vec3 col=env(R)*F;
  col*=.7+.3*smoothstep(.2,.8,h);

  float k=clamp(heatAt(p),0.,1.4);
  vec3 hc=heatCol(k);
  float hk=smoothstep(0.,.55,k);
  col=mix(col,col*hc*2.2+hc*.22*k,hk);

  col*=1.-.6*smoothstep(.3,1.25,length(p*vec2(.78,1.)));
  col=clamp(col*u_fade,0.,1.);
  col+=(hash(gl_FragCoord.xy+t)-.5)/255.;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;

type GL = WebGLRenderingContext;

/**
 * Full-bleed liquid-chrome background. Renders at ≤0.5× device resolution (DPR capped at 2),
 * pauses offscreen or in a hidden tab, and draws one static frame under reduced motion.
 */
export function ShaderCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const still = prefersReduced();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let scale = 0.5;

    let gl: GL | null = null;
    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uFade: WebGLUniformLocation | null = null;
    let uHeat: WebGLUniformLocation | null = null;

    // Builds the program on the (possibly reused) context. Never force-lose the context in
    // cleanup: a StrictMode remount gets the same context back, and a dead one paints white.
    const setup = () => {
      gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false });
      if (!gl || gl.isContextLost()) return false;
      const compile = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) console.warn("[ShaderCanvas]", gl!.getShaderInfoLog(s));
        return s;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(prog, "u_res");
      uTime = gl.getUniformLocation(prog, "u_time");
      uFade = gl.getUniformLocation(prog, "u_fade");
      uHeat = gl.getUniformLocation(prog, "u_heat[0]");
      return true;
    };

    let W = 1, H = 1; // CSS size
    const size = () => {
      if (!gl) return;
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.max(1, Math.round(W * dpr * scale));
      canvas.height = Math.max(1, Math.round(H * dpr * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    // Heat trail: the pointer warms the slot under it; slots it leaves behind cool off.
    const heat = new Float32Array(HEAT * 3).fill(0);
    for (let i = 0; i < HEAT; i++) heat[i * 3] = heat[i * 3 + 1] = 99;
    let cur = -1;
    let lastMove = 0;
    const pointer = { x: 0, y: 0, inside: false };
    const toField = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      const px = cx - r.left, py = r.height - (cy - r.top);
      return { x: (px - 0.5 * r.width) / r.height, y: (py - 0.5 * r.height) / r.height, inside: px >= 0 && px <= r.width && py >= 0 && py <= r.height };
    };
    const coldest = () => {
      let best = 0;
      for (let i = 1; i < HEAT; i++) if (heat[i * 3 + 2] < heat[best * 3 + 2]) best = i;
      return best;
    };
    const onMove = (e: PointerEvent) => {
      const f = toField(e.clientX, e.clientY);
      pointer.x = f.x;
      pointer.y = f.y;
      pointer.inside = f.inside;
      lastMove = performance.now();
      if (!f.inside) return;
      if (cur < 0 || Math.hypot(heat[cur * 3] - f.x, heat[cur * 3 + 1] - f.y) > 0.035) {
        const prevT = cur < 0 ? 0 : heat[cur * 3 + 2];
        cur = coldest();
        heat[cur * 3] = f.x;
        heat[cur * 3 + 1] = f.y;
        heat[cur * 3 + 2] = prevT * 0.9;
      }
    };
    const onLeave = () => (pointer.inside = false);

    let time = 12;
    let fade = still ? 1 : 0;
    let last = 0;
    let slow = 0, frames = 0;
    const draw = () => {
      if (!gl || gl.isContextLost()) return;
      gl.uniform1f(uTime, time);
      gl.uniform1f(uFade, fade);
      gl.uniform3fv(uHeat, heat);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      time += dt;
      fade += (1 - fade) * Math.min(1, dt * 1.6);
      const active = pointer.inside && now - lastMove < 1600;
      for (let i = 0; i < HEAT; i++) {
        const z = i * 3 + 2;
        if (i === cur && active) heat[z] += (0.95 - heat[z]) * Math.min(1, dt * 5);
        else heat[z] *= Math.exp(-dt / 0.32);
      }
      draw();
      // Adaptive quality: if the GPU can't hold ~40fps, drop the render scale (twice at most).
      if (frames < 90) {
        frames++;
        if (dt > 0.025) slow++;
        if (frames === 90 && slow > 45 && scale > 0.3) {
          scale *= 0.7;
          size();
          frames = slow = 0;
        }
      }
    };

    let raf = 0;
    let running = false;
    let visible = true;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      step(now);
    };
    const start = () => {
      if (running || still || !gl) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => (visible && !document.hidden ? start() : stop());

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        size();
        if (still || !running) draw();
      }, 80);
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      gl = null;
    };
    const onRestored = () => {
      if (!setup()) return;
      size();
      draw();
      sync();
    };

    if (!setup()) return;
    size();
    draw();
    ro.observe(canvas);
    io.observe(canvas);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    document.addEventListener("visibilitychange", sync);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    sync();

    return () => {
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      // Free GPU objects but keep the context alive for a StrictMode/fast-refresh remount.
      const g = gl as GL | null;
      if (g && !g.isContextLost()) {
        g.deleteProgram(prog);
        g.deleteBuffer(buf);
      }
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full bg-void ${className}`} />;
}
