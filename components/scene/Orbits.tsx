'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Orbits() {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const c = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (a.current) a.current.rotation.z += delta * 0.03;
    if (b.current) b.current.rotation.z -= delta * 0.02;
    if (c.current) c.current.rotation.z += delta * 0.012;
  });

  const ring = (r: number, opacity: number) => (
    <mesh rotation={[Math.PI / 2.4, 0, 0]}>
      <torusGeometry args={[r, 0.004, 32, 220]} />
      <meshBasicMaterial color="#E6E6E8" transparent opacity={opacity} />
    </mesh>
  );

  return (
    <group position={[0, 0, 0]}>
      <group ref={a} rotation={[0.1, 0.2, 0]}>{ring(3.8, 0.18)}</group>
      <group ref={b} rotation={[0.3, -0.15, 0.2]}>{ring(5.4, 0.12)}</group>
      <group ref={c} rotation={[-0.2, 0.1, -0.1]}>{ring(7.2, 0.08)}</group>
    </group>
  );
}
