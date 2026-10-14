'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerfTier, useReducedMotion } from '@/lib/device';

type Comet = {
  start: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
  length: number;
  t: number;
  period: number;
  delay: number;
};

const TRAIL = 24;

/**
 * Comets streak across the mid distance on a loop. Each one is a bright head sprite
 * plus a tapered additive trail (line segments with per-vertex alpha).
 */
export default function Comets() {
  const tier = usePerfTier();
  const reduced = useReducedMotion();
  const count = tier === 'high' ? 3 : tier === 'mid' ? 2 : 0;

  const comets = useMemo<Comet[]>(() => {
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: count }, (_, i) => {
      // spread along the journey corridor (planets run from x≈0 → 240, z≈0 → -305)
      const along = i / Math.max(1, count - 1);
      const base = new THREE.Vector3(along * 240 + rnd(-30, 30), rnd(-30, 40), -along * 305 + rnd(-40, 20));
      const dir = new THREE.Vector3(rnd(-1, 1), rnd(-0.5, 0.3), rnd(-1, 1)).normalize();
      return {
        start: base.addScaledVector(dir, -70),
        dir,
        speed: rnd(14, 26),
        length: rnd(10, 18),
        t: rnd(0, 1),
        period: rnd(9, 16),
        delay: rnd(0, 6)
      };
    });
  }, [count]);

  const headTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(200,225,255,0.8)');
    g.addColorStop(1, 'rgba(160,200,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const heads = useRef<(THREE.Sprite | null)[]>([]);
  const trails = useRef<(THREE.Line | null)[]>([]);

  const trailGeos = useMemo(
    () =>
      comets.map(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
        const alpha = new Float32Array(TRAIL);
        for (let i = 0; i < TRAIL; i++) alpha[i] = Math.pow(1 - i / (TRAIL - 1), 1.6);
        g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
        return g;
      }),
    [comets]
  );

  const trailMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color('#BFD8FF') }, uOpacity: { value: 0.9 } },
        vertexShader: /* glsl */ `
          attribute float aAlpha; varying float vA;
          void main(){ vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          varying float vA; uniform vec3 uColor; uniform float uOpacity;
          void main(){ gl_FragColor = vec4(uColor, vA * uOpacity); }`
      }),
    []
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (reduced) return;
    const time = state.clock.elapsedTime;
    comets.forEach((c, i) => {
      const local = ((time + c.delay) % c.period) / c.period; // 0..1
      const active = local < 0.55; // visible for ~55% of the period
      const head = heads.current[i];
      const trail = trails.current[i];
      if (!head || !trail) return;
      head.visible = active;
      trail.visible = active;
      if (!active) return;
      const dist = local * c.period * c.speed;
      tmp.copy(c.start).addScaledVector(c.dir, dist);
      head.position.copy(tmp);
      const fade = Math.min(1, local / 0.08) * Math.min(1, (0.55 - local) / 0.12);
      (head.material as THREE.SpriteMaterial).opacity = fade;
      const pos = trail.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let k = 0; k < TRAIL; k++) {
        const back = (k / (TRAIL - 1)) * c.length;
        pos.setXYZ(k, tmp.x - c.dir.x * back, tmp.y - c.dir.y * back, tmp.z - c.dir.z * back);
      }
      pos.needsUpdate = true;
      (trail.material as THREE.ShaderMaterial).uniforms.uOpacity.value = 0.9 * fade;
    });
    void delta;
  });

  if (count === 0) return null;

  return (
    <group>
      {comets.map((_, i) => (
        <group key={i}>
          <sprite ref={(el) => { heads.current[i] = el; }} scale={[1.6, 1.6, 1]}>
            <spriteMaterial map={headTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <primitive object={new THREE.Line(trailGeos[i], trailMat.clone())} ref={(el: THREE.Line | null) => { trails.current[i] = el; }} />
        </group>
      ))}
    </group>
  );
}
