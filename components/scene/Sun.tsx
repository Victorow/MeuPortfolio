'use client';

import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { SUN_POSITION } from '@/content/planets';

/** Emissive Sun used as the GodRays occluder source plus a soft sprite halo. */
const Sun = forwardRef<THREE.Mesh>(function Sun(_, ref) {
  const halo = useMemo(() => {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,246,220,1)');
    g.addColorStop(0.25, 'rgba(255,230,180,0.55)');
    g.addColorStop(0.6, 'rgba(255,210,140,0.12)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group position={SUN_POSITION}>
      <mesh ref={ref} frustumCulled={false}>
        <sphereGeometry args={[18, 32, 16]} />
        <meshBasicMaterial color="#FFF4D6" toneMapped={false} />
      </mesh>
      <sprite scale={[140, 140, 1]}>
        <spriteMaterial map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
});

export default Sun;
