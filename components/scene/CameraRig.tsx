'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useActiveSection, type SectionId } from '@/lib/activeSection';
import { useMotionValue, useSpring } from 'framer-motion';
import * as THREE from 'three';

type CamPose = { pos: [number, number, number]; look: [number, number, number]; fov: number };

const POSES: Record<SectionId, CamPose> = {
  hero:      { pos: [0, 0, 8],      look: [0, 0, 0],    fov: 42 },
  projects:  { pos: [-3, 0.6, 9.5], look: [1, 0, 0],    fov: 38 },
  about:     { pos: [3, -0.4, 8.5], look: [-1, 0, 0],   fov: 40 },
  expertise: { pos: [0, 1.5, 10],   look: [0, 0, -1],   fov: 46 },
  contact:   { pos: [-1.5, -1, 7],  look: [1.5, -0.5, 0], fov: 48 },
  footer:    { pos: [0, -0.5, 12],  look: [0, -0.8, 0], fov: 36 }
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function CameraRig() {
  const { camera } = useThree();
  const active = useActiveSection();

  // Cursor input
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 45, damping: 22, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my]);

  const state = useRef<CamPose>({ ...POSES.hero });
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const target = POSES[active];
    const t = 1 - Math.pow(0.002, delta);

    state.current.pos = [
      lerp(state.current.pos[0], target.pos[0], t),
      lerp(state.current.pos[1], target.pos[1], t),
      lerp(state.current.pos[2], target.pos[2], t)
    ];
    state.current.fov = lerp(state.current.fov, target.fov, t);

    lookAt.current.x = lerp(lookAt.current.x, target.look[0], t);
    lookAt.current.y = lerp(lookAt.current.y, target.look[1], t);
    lookAt.current.z = lerp(lookAt.current.z, target.look[2], t);

    const parallaxX = sx.get() * 0.8;
    const parallaxY = -sy.get() * 0.5;

    camera.position.set(
      state.current.pos[0] + parallaxX,
      state.current.pos[1] + parallaxY,
      state.current.pos[2]
    );

    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = state.current.fov;
      cam.updateProjectionMatrix();
    }

    camera.lookAt(lookAt.current);
  });

  return null;
}
