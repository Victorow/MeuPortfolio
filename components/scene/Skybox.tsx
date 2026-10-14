'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTex } from '@/lib/assets/useTexture';
import { useJourney } from '@/lib/journey/store';
import { localProgress } from '@/lib/journey/timeline';

/** Milky Way sphere. Dim through the journey, blooms to full in the last chapter. */
export default function Skybox() {
  const map = useTex('milkyway');
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const cur = useRef(0.42);

  useFrame((_, delta) => {
    if (!mat.current) return;
    const p = useJourney.getState().progress;
    const deep = localProgress(p, 'deep');
    const target = 0.42 + deep * 0.58;
    cur.current += (target - cur.current) * (1 - Math.pow(0.02, delta));
    mat.current.color.setScalar(cur.current);
  });

  return (
    <mesh scale={[-1, 1, 1]} rotation={[0, Math.PI * 0.35, 0.2]} frustumCulled={false}>
      <sphereGeometry args={[1200, 48, 24]} />
      <meshBasicMaterial ref={mat} map={map} side={THREE.BackSide} toneMapped={false} fog={false} />
    </mesh>
  );
}
