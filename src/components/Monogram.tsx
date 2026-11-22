"use client";

import { useEffect, useRef } from "react";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// The maker mark (public/media/maker-mark.svg), extruded into a solid.
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#000" fill-rule="evenodd" transform="translate(5.7 0) skewX(-9)" d="M7 13h9v14h10V13h13c12 0 20 7.8 20 19s-8 19-20 19H26V36H16v15H7V13Zm28 8v22h4c7.4 0 11.7-4.4 11.7-11S46.4 21 39 21h-4Z"/></svg>`;

// One camera station per chapter: orbit angles in degrees, how far the layers split, how strongly
// the construction lines show, and where the key light sits.
const STATIONS = [
  { yaw: -34, pitch: 9, zoom: 1, explode: 0, edges: 0, light: -0.7 },
  { yaw: 52, pitch: 24, zoom: 1.08, explode: 1, edges: 1, light: 0.15 },
  { yaw: -8, pitch: 3, zoom: 0.94, explode: 0, edges: 0.12, light: 0.85 },
];
const SLABS = 5;
const T = 2.4;

/**
 * A machined version of the HD maker mark that the practice section orbits as it scrolls: steel and
 * graphite layers, a key light that travels across them, and an exploded construction view for the
 * middle chapter. It loads three.js only when the section comes near, and leaves the still image in
 * place if WebGL is unavailable.
 */
export function Monogram() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current!;
    const figure = host.closest("figure")!;
    const section = host.closest<HTMLElement>(".practice")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover:hover) and (pointer:fine)");
    let disposed = false;
    let cleanup = () => {};

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          boot();
        }
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(section);

    async function boot() {
      if (!document.createElement("canvas").getContext("webgl2")) return;
      const THREE = await import("three");
      const { SVGLoader } = await import("three/addons/loaders/SVGLoader.js");
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return;
      }
      const narrow = innerWidth < 761;
      renderer.setPixelRatio(Math.min(devicePixelRatio, narrow ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.96;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.VSMShadowMap;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTexture;
      scene.environmentIntensity = 0.85;

      const camera = new THREE.PerspectiveCamera(28, 1, 1, 2000);

      // Geometry: one extruded layer, shared by every slab.
      const shapes = new SVGLoader().parse(MARK).paths.flatMap((p) => p.toShapes());
      const geometry = new THREE.ExtrudeGeometry(shapes, { depth: T, bevelEnabled: true, bevelThickness: 0.32, bevelSize: 0.28, bevelSegments: 3, curveSegments: 32 });
      geometry.computeBoundingBox();
      const bb = geometry.boundingBox!;
      geometry.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -T / 2);
      const height = bb.max.y - bb.min.y;
      const edgesGeometry = new THREE.EdgesGeometry(geometry, 28);

      const steel = new THREE.MeshPhysicalMaterial({ color: 0xcdcdcd, metalness: 1, roughness: 0.2, clearcoat: 0.35, clearcoatRoughness: 0.2 });
      const graphite = new THREE.MeshPhysicalMaterial({ color: 0x232323, metalness: 0.55, roughness: 0.46 });
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xefefef, transparent: true, opacity: 0, depthTest: false });

      const model = new THREE.Group();
      // SVG runs y-down; the negative scale flips it upright (three.js corrects the face winding).
      const flip = new THREE.Group();
      flip.scale.set(1, -1, 1);
      model.add(flip);
      const slabs = Array.from({ length: SLABS }, (_, i) => {
        const slab = new THREE.Group();
        const mesh = new THREE.Mesh(geometry, i % 2 ? graphite : steel);
        mesh.castShadow = true;
        const lines = new THREE.LineSegments(edgesGeometry, lineMaterial);
        lines.renderOrder = 2;
        slab.add(mesh, lines);
        flip.add(slab);
        return slab;
      });
      scene.add(model);

      const floorY = -height / 2 - 7;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.ShadowMaterial({ opacity: 0.42 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = floorY;
      floor.receiveShadow = true;
      scene.add(floor);

      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.castShadow = true;
      key.shadow.mapSize.set(narrow ? 1024 : 2048, narrow ? 1024 : 2048);
      key.shadow.camera.left = -130;
      key.shadow.camera.right = 130;
      key.shadow.camera.top = 130;
      key.shadow.camera.bottom = -130;
      key.shadow.camera.near = 10;
      key.shadow.camera.far = 400;
      key.shadow.radius = 16;
      key.shadow.blurSamples = 24;
      key.shadow.bias = -0.0006;
      scene.add(key, key.target);
      const rim = new THREE.DirectionalLight(0xffffff, 1.4);
      rim.position.set(-30, 40, -90);
      scene.add(rim);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x0c0c0c, 0.35));

      // Smoothed state, eased toward the scroll targets every frame so jumps glide like a camera move.
      const cur = { yaw: -90, pitch: 10, zoom: 1.2, explode: 0, edges: 0, light: -1, rise: 1 };
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      let width = 0;
      let heightPx = 0;
      let raf = 0;
      let visible = false;
      let shown = false;

      const resize = () => {
        width = host.clientWidth;
        heightPx = host.clientHeight;
        if (!width || !heightPx) return;
        renderer.setSize(width, heightPx, false);
        camera.aspect = width / heightPx;
        camera.updateProjectionMatrix();
      };

      const target = () => {
        const r = section.getBoundingClientRect();
        const vh = innerHeight;
        const pinned = r.height > vh * 1.6;
        const run = pinned ? clamp(-r.top / (r.height - vh)) : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.4));
        const enter = clamp((vh - r.top) / vh);
        // Hold each chapter's station, and swing between them around the chapter boundaries.
        const c = run * STATIONS.length;
        const i = Math.min(STATIONS.length - 1, Math.floor(c));
        const local = c - i;
        let a = STATIONS[i];
        let b = STATIONS[i];
        let k = 0;
        if (local > 0.78 && i < STATIONS.length - 1) {
          b = STATIONS[i + 1];
          k = smooth((local - 0.78) / 0.44);
        } else if (local < 0.22 && i > 0) {
          a = STATIONS[i - 1];
          k = smooth((local + 0.22) / 0.44);
        }
        const mix = <K extends keyof (typeof STATIONS)[number]>(key: K) => lerp(a[key], b[key], k);
        // A slow drift inside each chapter keeps the model moving while you read.
        const drift = (local - 0.5) * 18;
        const end = smooth(clamp((run - 0.9) / 0.1));
        return {
          yaw: mix("yaw") + drift - (1 - enter) * 70,
          pitch: mix("pitch") + (1 - enter) * 14,
          zoom: mix("zoom") * lerp(1, 0.88, end) * lerp(1.35, 1, enter),
          explode: mix("explode"),
          edges: mix("edges"),
          light: mix("light"),
          rise: 1 - smooth(enter),
        };
      };

      const frame = (now: number) => {
        raf = 0;
        if (!width) resize();
        const t = target();
        const ease = reduced.matches ? 1 : 0.085;
        (Object.keys(t) as (keyof typeof t)[]).forEach((k) => {
          cur[k] = lerp(cur[k], t[k], ease);
        });
        pointer.x = lerp(pointer.x, pointer.tx, 0.06);
        pointer.y = lerp(pointer.y, pointer.ty, 0.06);
        const time = reduced.matches ? 0 : now / 1000;

        // Layers split apart along the depth axis, each with a slight stagger, like an exploded drawing.
        slabs.forEach((slab, i) => {
          const o = i - (SLABS - 1) / 2;
          slab.position.z = o * (T + 0.75 + cur.explode * 8.5);
          slab.position.x = o * cur.explode * 2.2;
          slab.position.y = -o * cur.explode * 1.1;
          slab.rotation.z = o * cur.explode * 0.035;
        });
        lineMaterial.opacity = cur.edges * 0.55;
        model.position.y = Math.sin(time * 0.8) * 0.7 - cur.rise * 26;
        model.rotation.y = Math.sin(time * 0.25) * 0.04;

        // Fit the model to the frame, then orbit.
        const vfov = (camera.fov * Math.PI) / 180;
        const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
        const fit = Math.max(40 / Math.tan(hfov / 2), 34 / Math.tan(vfov / 2));
        const dist = fit * cur.zoom;
        const yaw = ((cur.yaw + pointer.x * 10) * Math.PI) / 180;
        const pitch = ((cur.pitch - pointer.y * 6) * Math.PI) / 180;
        camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
        camera.lookAt(0, -2, 0);

        // The key light sweeps across the steel from one side to the other through the chapters.
        const la = cur.light * 1.2;
        key.position.set(Math.sin(la) * 120, 110, Math.cos(la) * 120);

        renderer.render(scene, camera);
        if (!shown) {
          shown = true;
          figure.setAttribute("data-gl", "");
        }
        if (visible && !reduced.matches) raf = requestAnimationFrame(frame);
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(frame);
      };

      const view = new IntersectionObserver((entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) kick();
      });
      view.observe(host);
      const ro = new ResizeObserver(() => {
        resize();
        kick();
      });
      ro.observe(host);
      const onMove = (e: PointerEvent) => {
        if (!fine.matches || e.pointerType !== "mouse") return;
        pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
      };
      const onScroll = () => {
        if (reduced.matches) kick();
      };
      section.addEventListener("pointermove", onMove, { passive: true });
      addEventListener("scroll", onScroll, { passive: true });
      resize();
      kick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        view.disconnect();
        ro.disconnect();
        section.removeEventListener("pointermove", onMove);
        removeEventListener("scroll", onScroll);
        geometry.dispose();
        edgesGeometry.dispose();
        floor.geometry.dispose();
        (floor.material as InstanceType<typeof THREE.Material>).dispose();
        [steel, graphite, lineMaterial].forEach((m) => m.dispose());
        envTexture.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        figure.removeAttribute("data-gl");
      };
    }

    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  return <div className="mono-gl" ref={ref} aria-hidden="true" />;
}
