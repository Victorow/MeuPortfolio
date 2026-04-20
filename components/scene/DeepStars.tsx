'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Multi-layer starfield: 3 concentric shells at different radii + sizes for
 * strong depth parallax. Also a small set of "glint" stars that twinkle.
 */
function buildShell(count: number, inner: number, outer: number, sizeBase: number, sizeVar: number) {
  const pos = new Float32Array(count * 3);
  const sz = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = inner + Math.random() * (outer - inner);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
    sz[i] = sizeBase + Math.random() * sizeVar;
  }
  return { pos, sz };
}

function Shell({
  count,
  inner,
  outer,
  size,
  opacity,
  rotX,
  rotY
}: {
  count: number;
  inner: number;
  outer: number;
  size: number;
  opacity: number;
  rotX: number;
  rotY: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const { pos } = useMemo(() => {
    const b = buildShell(count, inner, outer, size, size * 0.8);
    return { pos: b.pos };
  }, [count, inner, outer, size]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * rotY;
    ref.current.rotation.x += delta * rotX;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#E6E6E8"
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}

function Glints({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { pos } = useMemo(() => {
    const b = buildShell(count, 10, 20, 0.1, 0.1);
    return { pos: b.pos };
  }, [count]);

  useFrame((state) => {
    if (matRef.current) {
      // Twinkle
      matRef.current.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2.0) * 0.25;
    }
    if (ref.current) {
      ref.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#FFFFFF"
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

export default function DeepStars({ density = 1 }: { density?: number }) {
  const near = Math.round(1400 * density);
  const mid = Math.round(900 * density);
  const far = Math.round(1600 * density);

  return (
    <group>
      {/* Far dense field */}
      <Shell count={far} inner={40} outer={60} size={0.03} opacity={0.65} rotX={0.002} rotY={0.006} />
      {/* Mid layer */}
      <Shell count={mid} inner={20} outer={36} size={0.05} opacity={0.85} rotX={-0.004} rotY={0.012} />
      {/* Near bright */}
      <Shell count={near} inner={8} outer={18} size={0.08} opacity={0.95} rotX={0.003} rotY={0.018} />
      {/* Twinkling glints */}
      <Glints count={Math.round(120 * density)} />
    </group>
  );
}
