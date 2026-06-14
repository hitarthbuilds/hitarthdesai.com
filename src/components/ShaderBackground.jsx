import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Raw WebGL2 (no three.js) atmosphere: a slow domain-warped fbm flow field that
// surfaces faint ember/steel contour lines over near-black — an instrument
// readout, not a gradient blob. Decorative + aria-hidden; pauses off-screen and
// when the tab is hidden; not rendered at all under reduced motion (CSS vignette
// shows through instead). Never required for content or legibility.
const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;

float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v=0., a=.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy/uRes.xy;
  vec2 p = uv; p.x *= uRes.x/uRes.y;
  float t = uTime*0.035;
  vec2 q = vec2(fbm(p*2.0 + t), fbm(p*2.0 - t + 5.0));
  float f = fbm(p*3.0 + q*1.4 + vec2(0.0, uScroll*0.6));
  float lines = abs(fract(f*7.0) - 0.5);
  float contour = smoothstep(0.07, 0.0, lines);
  vec3 col = vec3(0.043,0.047,0.055);
  vec3 ember = vec3(0.91,0.45,0.23);
  vec3 steel = vec3(0.27,0.43,0.66);
  col = mix(col, steel, contour*0.10);
  col = mix(col, ember, contour*pow(f,2.0)*0.20);
  col += (hash(uv*uRes.xy) - 0.5)*0.012;
  float vig = smoothstep(1.25, 0.15, length(uv-0.5));
  col *= mix(0.62, 1.0, vig);
  o = vec4(col, 1.0);
}`;

const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function ShaderBackground() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return; // graceful fallback: CSS vignette remains

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uScroll = gl.getUniformLocation(prog, 'uScroll');

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const SCALE = 0.7; // atmosphere — render below native res for performance
    const resize = () => {
      const w = Math.floor(window.innerWidth * DPR * SCALE);
      const h = Math.floor(window.innerHeight * DPR * SCALE);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf;
    let running = true;
    const start = performance.now();
    const render = (now) => {
      if (!running) return;
      gl.uniform1f(uTime, (now - start) / 1000);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      gl.uniform1f(uScroll, max > 0 ? window.scrollY / max : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="bg-shader" aria-hidden="true" />;
}
