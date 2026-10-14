'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerfTier } from '@/lib/device';

function prng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const vert = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uTime;
  uniform float uScale;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vTwinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aPhase * 1.4) + aPhase * 6.2831);
    gl_PointSize = aSize * uScale * vTwinkle * (420.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uOpacity;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, r);
    gl_FragColor = vec4(vColor, a * uOpacity * vTwinkle);
  }
`;

type LayerProps = { count: number; radius: number; seed: number; size: number; opacity: number; follow: number };

/** One shell of stars. `follow` (0..1) makes it track the camera for parallax depth. */
function Layer({ count, radius, seed, size, opacity, follow }: LayerProps) {
  const group = useRef<THREE.Group>(null);
  const { positions, sizes, phases, colors } = useMemo(() => {
    const rnd = prng(seed);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const palette = [
      [0.78, 0.84, 1.0], // blue-white
      [1.0, 1.0, 1.0],
      [1.0, 0.93, 0.8], // warm
      [0.9, 0.95, 1.0],
      [1.0, 0.8, 0.65] // orange giant
    ];
    for (let i = 0; i < count; i++) {
      // uniform on a sphere shell with slight radial jitter
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const rr = radius * (0.85 + rnd() * 0.3);
      const s = Math.sqrt(1 - u * u);
      positions.set([rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)], i * 3);
      const big = rnd() < 0.04;
      sizes[i] = size * (big ? 2.4 + rnd() * 1.5 : 0.5 + rnd());
      phases[i] = rnd();
      const c = palette[Math.floor(rnd() * palette.length)];
      colors.set(c, i * 3);
    }
    return { positions, sizes, phases, colors };
  }, [count, radius, seed, size]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 1 }, uOpacity: { value: opacity } }), [opacity]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (group.current) {
      // parallax: far layers follow the camera almost fully (so they never get "passed")
      group.current.position.copy(state.camera.position).multiplyScalar(follow);
    }
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
          <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        </bufferGeometry>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

/** Three parallax star shells on top of the Milky Way skybox. */
export default function Starfield() {
  const tier = usePerfTier();
  const k = tier === 'high' ? 1 : tier === 'mid' ? 0.6 : 0.35;
  return (
    <>
      <Layer count={Math.round(1600 * k)} radius={700} seed={11} size={1.4} opacity={0.8} follow={1} />
      <Layer count={Math.round(700 * k)} radius={260} seed={23} size={1.2} opacity={0.6} follow={0.85} />
      <Layer count={Math.round(300 * k)} radius={120} seed={37} size={1.0} opacity={0.5} follow={0.6} />
    </>
  );
}
