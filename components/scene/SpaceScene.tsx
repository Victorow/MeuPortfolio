'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import DeepStars from './DeepStars';
import Nebula from './Nebula';
import Comets from './Comets';
import Planets from './Planets';
import CentralObject from './CentralObject';
import CameraRig from './CameraRig';
import { usePerfTier } from '@/lib/device';
import { useScrollProgress, useActiveSection } from '@/lib/activeSection';
import * as THREE from 'three';

function WorldScrollDrift() {
  const group = useRef<THREE.Group>(null);
  const progress = useScrollProgress();
  useFrame(() => {
    if (!group.current) return;
    // Subtle slow drift of the whole world across the journey
    group.current.position.z = -progress * 2.2;
    group.current.rotation.y = progress * 0.25;
    group.current.rotation.x = progress * -0.05;
  });
  return (
    <group ref={group}>
      <DeepStarsWrapper />
    </group>
  );
}

function DeepStarsWrapper() {
  const tier = usePerfTier();
  const density = tier === 'high' ? 1 : tier === 'mid' ? 0.6 : 0.35;
  return <DeepStars density={density} />;
}

function SectionFog() {
  const active = useActiveSection();
  const ref = useRef<THREE.Fog>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    // Vary fog depth per section for mood shift
    const targets: Record<string, { near: number; far: number }> = {
      hero: { near: 12, far: 34 },
      projects: { near: 10, far: 28 },
      about: { near: 14, far: 30 },
      expertise: { near: 8, far: 24 },
      contact: { near: 6, far: 20 },
      footer: { near: 4, far: 16 }
    };
    const t = 1 - Math.pow(0.01, delta);
    const target = targets[active] ?? targets.hero;
    ref.current.near += (target.near - ref.current.near) * t;
    ref.current.far += (target.far - ref.current.far) * t;
  });
  return <fog ref={ref} attach="fog" args={[0x060607, 12, 34]} />;
}

export default function SpaceScene() {
  const tier = usePerfTier();

  const dpr: [number, number] = tier === 'low' ? [1, 1] : tier === 'mid' ? [1, 1.5] : [1, 1.75];
  const showNebula = tier !== 'low';
  const showPlanets = tier !== 'low';
  const cometCount = tier === 'high' ? 5 : tier === 'mid' ? 3 : 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 42 }}
        dpr={dpr}
        gl={{
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
          depth: true
        }}
        style={{ background: 'transparent' }}
      >
        <PerformanceMonitor />
        <color attach="background" args={[0x060607]} />
        <SectionFog />

        <ambientLight intensity={0.12} />
        <directionalLight position={[4, 3, 6]} intensity={0.7} color="#ffffff" />
        <pointLight position={[-6, -2, 3]} intensity={0.45} color="#C9C9CE" />
        <pointLight position={[3, 4, -2]} intensity={0.25} color="#FFFFFF" />

        <Suspense fallback={null}>
          <WorldScrollDrift />
          {showNebula && <Nebula opacity={tier === 'high' ? 0.6 : 0.42} />}
          {showPlanets && <Planets />}
          {cometCount > 0 && <Comets count={cometCount} />}
          <CentralObject />
        </Suspense>

        <CameraRig />
      </Canvas>
    </div>
  );
}
