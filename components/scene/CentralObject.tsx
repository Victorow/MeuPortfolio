'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useActiveSection, type SectionId } from '@/lib/activeSection';

/**
 * A single sculptural form that morphs shape/position per active section
 * using smooth spring-like interpolation. Keeps one draw call + one material.
 */

type Config = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  wireframe: boolean;
  metalness: number;
  roughness: number;
  rimOpacity: number;
  ringScale: number;
  haloOpacity: number;
};

const CONFIGS: Record<SectionId, Config> = {
  hero: {
    position: [0, -0.3, 0],
    rotation: [0, 0, 0],
    scale: 1.0,
    wireframe: false,
    metalness: 0.95,
    roughness: 0.28,
    rimOpacity: 0.35,
    ringScale: 1.0,
    haloOpacity: 0.025
  },
  projects: {
    position: [3.2, 0.4, -1.5],
    rotation: [0.2, 0.6, 0.1],
    scale: 0.75,
    wireframe: true,
    metalness: 0.6,
    roughness: 0.5,
    rimOpacity: 0.55,
    ringScale: 0.6,
    haloOpacity: 0.015
  },
  about: {
    position: [-3.0, -0.2, -2.0],
    rotation: [-0.3, -0.4, 0.3],
    scale: 0.95,
    wireframe: false,
    metalness: 0.9,
    roughness: 0.22,
    rimOpacity: 0.3,
    ringScale: 1.2,
    haloOpacity: 0.03
  },
  expertise: {
    position: [0, 0.2, -2.5],
    rotation: [0.3, 0.8, -0.15],
    scale: 1.15,
    wireframe: true,
    metalness: 0.7,
    roughness: 0.35,
    rimOpacity: 0.65,
    ringScale: 1.6,
    haloOpacity: 0.02
  },
  contact: {
    position: [2.4, -0.6, -1.0],
    rotation: [-0.15, -0.8, 0.25],
    scale: 1.4,
    wireframe: false,
    metalness: 1.0,
    roughness: 0.18,
    rimOpacity: 0.8,
    ringScale: 1.0,
    haloOpacity: 0.05
  },
  footer: {
    position: [0, -1.2, -3.5],
    rotation: [0.2, 0.3, 0],
    scale: 0.6,
    wireframe: false,
    metalness: 0.95,
    roughness: 0.4,
    rimOpacity: 0.2,
    ringScale: 0.5,
    haloOpacity: 0.01
  }
};

// Simple exponential smoothing utility
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function CentralObject() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const rim = useRef<THREE.Mesh>(null);
  const ringGroup = useRef<THREE.Group>(null);

  const active = useActiveSection();
  const target = CONFIGS[active];

  // Internal smoothed state
  const state = useRef<Config>({ ...CONFIGS.hero });

  // Perfectly round sphere with dense tessellation — reads as a pristine
  // spherical body at every zoom level, no faceting artefacts on the rim.
  const geom = useMemo(() => new THREE.SphereGeometry(1.4, 128, 128), []);
  const wireGeom = useMemo(() => new THREE.SphereGeometry(1.42, 64, 64), []);

  // Distinctive cool-titanium tone with a faint cyan/violet bias — reads as
  // a luminous iridium body, clearly different from the muted gas-giant palettes
  // while staying faithful to the monochrome cosmos.
  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1E2632'),
        metalness: 1.0,
        roughness: 0.22,
        emissive: new THREE.Color('#3A5A78'),
        emissiveIntensity: 0.18,
        envMapIntensity: 1.1
      }),
    []
  );

  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#B8D4E8'),
        wireframe: true,
        transparent: true,
        opacity: 0
      }),
    []
  );

  useFrame((s, delta) => {
    // Smooth config interpolation
    const t = 1 - Math.pow(0.001, delta); // frame-rate independent
    state.current.position = [
      lerp(state.current.position[0], target.position[0], t),
      lerp(state.current.position[1], target.position[1], t),
      lerp(state.current.position[2], target.position[2], t)
    ];
    state.current.rotation = [
      lerp(state.current.rotation[0], target.rotation[0], t),
      lerp(state.current.rotation[1], target.rotation[1], t),
      lerp(state.current.rotation[2], target.rotation[2], t)
    ];
    state.current.scale = lerp(state.current.scale, target.scale, t);
    state.current.metalness = lerp(state.current.metalness, target.metalness, t);
    state.current.roughness = lerp(state.current.roughness, target.roughness, t);
    state.current.rimOpacity = lerp(state.current.rimOpacity, target.rimOpacity, t);
    state.current.ringScale = lerp(state.current.ringScale, target.ringScale, t);
    state.current.haloOpacity = lerp(state.current.haloOpacity, target.haloOpacity, t);

    const wireOpacityTarget = target.wireframe ? 0.55 : 0.0;
    wireMat.opacity = lerp(wireMat.opacity, wireOpacityTarget, t);

    if (group.current) {
      const [px, py, pz] = state.current.position;
      // Floating bob
      const bob = Math.sin(s.clock.elapsedTime * 0.3) * 0.12;
      group.current.position.set(px, py + bob, pz);
      group.current.rotation.set(
        state.current.rotation[0],
        state.current.rotation[1] + s.clock.elapsedTime * 0.04,
        state.current.rotation[2]
      );
      group.current.scale.setScalar(state.current.scale);
    }

    if (core.current) {
      coreMat.metalness = state.current.metalness;
      coreMat.roughness = state.current.roughness;
      // Gentle self rotation
      core.current.rotation.x += delta * 0.02;
      core.current.rotation.y += delta * 0.015;
    }
    if (wire.current) {
      wire.current.rotation.x -= delta * 0.05;
      wire.current.rotation.y -= delta * 0.03;
    }

    if (rim.current) {
      (rim.current.material as THREE.MeshBasicMaterial).opacity = state.current.rimOpacity;
    }

    if (halo.current) {
      (halo.current.material as THREE.MeshBasicMaterial).opacity = state.current.haloOpacity;
    }

    if (ringGroup.current) {
      ringGroup.current.scale.setScalar(state.current.ringScale);
      ringGroup.current.rotation.z += delta * 0.02;
      ringGroup.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <group ref={group}>
      {/* Soft halo — faint cyan-white */}
      <mesh ref={halo}>
        <sphereGeometry args={[2.3, 48, 48]} />
        <meshBasicMaterial color="#CFE4F3" transparent opacity={0.025} depthWrite={false} />
      </mesh>

      {/* Core */}
      <mesh ref={core} geometry={geom} material={coreMat} />

      {/* Wireframe overlay (fades in when wireframe target is true) */}
      <mesh ref={wire} geometry={wireGeom} material={wireMat} />

      {/* Rim ring — bright cyan-white highlight */}
      <mesh ref={rim} rotation={[Math.PI / 2.1, 0.4, 0]}>
        <torusGeometry args={[1.55, 0.005, 24, 220]} />
        <meshBasicMaterial color="#DCEBFA" transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Orbital rings group (morphs scale per section) */}
      <group ref={ringGroup}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.8, 0.004, 24, 220]} />
          <meshBasicMaterial color="#E6E6E8" transparent opacity={0.2} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0.4, 0.2]}>
          <torusGeometry args={[3.6, 0.003, 24, 220]} />
          <meshBasicMaterial color="#E6E6E8" transparent opacity={0.13} depthWrite={false} />
        </mesh>
        <mesh rotation={[-0.4, 0.2, 0]}>
          <torusGeometry args={[4.6, 0.003, 24, 220]} />
          <meshBasicMaterial color="#E6E6E8" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
