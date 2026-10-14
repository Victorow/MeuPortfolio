'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS, SUN_POSITION, type PlanetId } from '@/content/planets';
import { usePerfTier, useReducedMotion } from '@/lib/device';
import { GHOSTS, flareIntensity, sunVisibility, type Sphere, type Vec3 } from '@/lib/scene/flare';
import { moonState } from '@/lib/scene/eclipse';

const SUN_RADIUS = 18;
const TINT: Record<'white' | 'blue' | 'warm', string> = {
  white: '255,255,255',
  blue: '159,192,255',
  warm: '255,228,196'
};

function canvasTex(draw: (ctx: CanvasRenderingContext2D, s: number) => void, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function disc(rgb: string) {
  return canvasTex((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, `rgba(${rgb},0.55)`);
    g.addColorStop(0.72, `rgba(${rgb},0.4)`);
    g.addColorStop(0.9, `rgba(${rgb},0.6)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

function ring(rgb: string) {
  return canvasTex((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, `rgba(${rgb},0)`);
    g.addColorStop(0.74, `rgba(${rgb},0)`);
    g.addColorStop(0.87, `rgba(${rgb},0.8)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

/** Halo with chromatic dispersion: red, green and blue rings at slightly different radii. */
function chromaticHalo() {
  return canvasTex((ctx, s) => {
    ctx.globalCompositeOperation = 'lighter';
    const rings: [string, number][] = [
      ['255,80,60', 0.9],
      ['80,255,120', 0.86],
      ['90,140,255', 0.82]
    ];
    for (const [rgb, r] of rings) {
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, `rgba(${rgb},0)`);
      g.addColorStop(Math.max(0, r - 0.12), `rgba(${rgb},0)`);
      g.addColorStop(r, `rgba(${rgb},0.14)`);
      g.addColorStop(Math.min(1, r + 0.08), `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    }
    // soft glow core
    const core = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.32);
    core.addColorStop(0, 'rgba(255,246,228,0.5)');
    core.addColorStop(1, 'rgba(255,246,228,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, s, s);
  }, 512);
}

/** Six-point starburst: three spikes through the centre, 60° apart. */
function starburst() {
  return canvasTex((ctx, s) => {
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(s / 2, s / 2);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      const g = ctx.createLinearGradient(-s / 2, 0, s / 2, 0);
      g.addColorStop(0, 'rgba(255,244,224,0)');
      g.addColorStop(0.5, 'rgba(255,244,224,0.9)');
      g.addColorStop(1, 'rgba(255,244,224,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, s / 2, s * 0.006, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, 512);
}

type Element = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; f: number; size: number; alpha: number };

/**
 * Physical-looking lens flare for the Sun: chromatic halo, 6-point starburst and
 * six ghosts along the Sun → screen-centre axis. Intensity follows the Sun's
 * visibility (frame edges + occlusion by planets). Tier low: halo only.
 * Reduced motion: static (no shimmer, no smoothing).
 */
export default function LensFlare() {
  const tier = usePerfTier();
  const reduced = useReducedMotion();
  const group = useRef<THREE.Group>(null);

  const textures = useMemo(
    () => ({
      halo: chromaticHalo(),
      burst: starburst(),
      ghosts: GHOSTS.map((g) => (g.kind === 'disc' ? disc(TINT[g.tint]) : ring(TINT[g.tint])))
    }),
    []
  );
  useEffect(
    () => () => {
      textures.halo.dispose();
      textures.burst.dispose();
      textures.ghosts.forEach((t) => t.dispose());
    },
    [textures]
  );

  const elements = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1, 1);
    const make = (map: THREE.Texture, f: number, size: number, alpha: number): Element => {
      const mat = new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        fog: false
      });
      const mesh = new THREE.Mesh(plane, mat);
      mesh.renderOrder = 1000;
      mesh.frustumCulled = false;
      return { mesh, mat, f, size, alpha };
    };
    const halo = make(textures.halo, 1, 0.46, 0.7);
    const burst = make(textures.burst, 1, 0.7, 0.45);
    const ghosts = GHOSTS.map((g, i) => make(textures.ghosts[i], g.f, g.size, g.alpha));
    return { plane, halo, burst, ghosts };
  }, [textures]);

  useEffect(() => {
    const g = group.current;
    if (!g) return;
    const all = [elements.halo, elements.burst, ...elements.ghosts];
    all.forEach((e) => g.add(e.mesh));
    return () => {
      all.forEach((e) => {
        g.remove(e.mesh);
        e.mat.dispose();
      });
      elements.plane.dispose();
    };
  }, [elements]);

  const sun = useMemo(() => new THREE.Vector3(...SUN_POSITION), []);
  const ndc = useRef(new THREE.Vector3());
  const fwd = useRef(new THREE.Vector3());
  const toSun = useRef(new THREE.Vector3());
  const level = useRef(0);
  const occluders = useMemo<Sphere[]>(
    () =>
      (Object.keys(PLANETS) as PlanetId[])
        .filter((id) => id !== 'moon')
        .map((id) => ({ center: PLANETS[id].position as Vec3, radius: PLANETS[id].radius })),
    []
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const cam = state.camera as THREE.PerspectiveCamera;
    g.position.copy(cam.position);
    g.quaternion.copy(cam.quaternion);

    cam.getWorldDirection(fwd.current);
    toSun.current.copy(sun).sub(cam.position);
    const behind = toSun.current.dot(fwd.current) <= 0;
    ndc.current.copy(sun).project(cam);
    const camPos: Vec3 = [cam.position.x, cam.position.y, cam.position.z];
    const vis = behind
      ? 0
      : sunVisibility(camPos, SUN_POSITION, SUN_RADIUS, [...occluders, { center: moonState.pos, radius: moonState.radius }]);
    const target = flareIntensity(ndc.current.x, ndc.current.y, behind, vis);
    level.current = reduced ? target : level.current + (target - level.current) * (1 - Math.exp(-Math.min(delta, 0.1) * 10));
    const k = level.current;
    g.visible = k > 0.002;
    if (!g.visible) return;

    const hh = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const hw = hh * cam.aspect;
    const sx = ndc.current.x;
    const sy = ndc.current.y;
    const place = (e: Element, alphaScale: number, rot = 0) => {
      e.mesh.position.set(sx * e.f * hw, sy * e.f * hh, -1);
      const s = e.size * hh * 2;
      e.mesh.scale.set(s, s, 1);
      e.mesh.rotation.z = rot;
      e.mat.opacity = e.alpha * alphaScale;
    };

    // a faint shimmer keeps the flare alive; reduced motion keeps it still
    const t = state.clock.elapsedTime;
    const shimmer = reduced ? 1 : 0.94 + Math.sin(t * 1.7) * 0.04 + Math.sin(t * 4.3) * 0.02;
    place(elements.halo, k * shimmer);
    const full = tier !== 'low';
    elements.burst.mesh.visible = full;
    elements.ghosts.forEach((e) => (e.mesh.visible = full));
    if (!full) return;
    // starburst angle follows the Sun's screen position, like a real aperture
    place(elements.burst, k * shimmer, Math.atan2(sy, sx) * 0.25);
    for (const e of elements.ghosts) place(e, k * 0.75);
  });

  return <group ref={group} />;
}
