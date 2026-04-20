'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Central sculptural form: a dark glossy sphere with a subtle rim, floating.
export default function Monolith() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.05;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Soft halo */}
      <mesh>
        <sphereGeometry args={[2.3, 64, 64]} />
        <meshBasicMaterial color="#E6E6E8" transparent opacity={0.025} depthWrite={false} />
      </mesh>
      {/* Core sphere */}
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[1.6, 96, 96]} />
        <meshStandardMaterial
          color="#0B0B0D"
          metalness={0.95}
          roughness={0.28}
          envMapIntensity={0.8}
        />
      </mesh>
      {/* Rim light ring */}
      <mesh rotation={[Math.PI / 2.1, 0.4, 0]}>
        <torusGeometry args={[1.68, 0.006, 32, 240]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
