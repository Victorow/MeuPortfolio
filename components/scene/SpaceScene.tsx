'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { usePerfTier, useHasWebGL, downgradeTier } from '@/lib/device';
import { useJourney } from '@/lib/journey/store';
import { SUN_POSITION } from '@/content/planets';
import Skybox from './Skybox';
import CameraRig from './CameraRig';
import Sun from './Sun';
import PostFX from './effects/PostFX';
import Earth from './planets/Earth';
import Moon from './planets/Moon';
import Mars from './planets/Mars';
import Jupiter from './planets/Jupiter';
import Saturn from './planets/Saturn';
import Uranus from './planets/Uranus';
import Venus from './planets/Venus';
import Neptune from './planets/Neptune';
import Constellation from './Constellation';
import Poster from './Poster';
import Starfield from './space/Starfield';
import Comets from './space/Comets';
import Galaxies from './space/Galaxies';
import Nebulae from './space/Nebulae';
import LensFlare from './LensFlare';
import { glRef, recordFrame } from '@/lib/journey/glRef';

/**
 * Publishes the renderer for DOM tools (Mission Control, photo mode) and
 * records frame times + whole-frame draw stats. Runs first in every frame
 * (negative priority) so `gl.info` holds the totals of the previous frame,
 * all post-processing passes included.
 */
function GlProbe() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    glRef.gl = gl;
    glRef.scene = scene;
    glRef.camera = camera;
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
      glRef.gl = null;
      glRef.scene = null;
      glRef.camera = null;
    };
  }, [gl, scene, camera]);
  useFrame(() => {
    recordFrame(performance.now());
    glRef.calls = gl.info.render.calls;
    glRef.triangles = gl.info.render.triangles;
    gl.info.reset();
  }, -100);
  return null;
}

/**
 * Fixed full-screen canvas. Chapter-1 assets load first (preloader tracks them);
 * the remaining planets mount after the hand-off so they never block the hero.
 */
export default function SpaceScene() {
  const tier = usePerfTier();
  const webgl = useHasWebGL();
  const ready = useJourney((s) => s.ready);
  // "60 seconds" overlay: the scene freezes (renders on demand only) behind the blur.
  const frozen = useJourney((s) => s.sixtyOpen);
  const [sun, setSun] = useState<THREE.Mesh | null>(null);

  if (!webgl) return <Poster />;

  const dpr: [number, number] = tier === 'low' ? [1, 1] : tier === 'mid' ? [1, 1.5] : [1, 1.75];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={dpr}
        frameloop={frozen ? 'demand' : 'always'}
        camera={{ fov: 42, near: 0.1, far: 3000, position: [-3, 0.6, 7] }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false, depth: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping; // ACES is applied in PostFX
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <PerformanceMonitor onDecline={() => downgradeTier()} flipflops={2} />
        <color attach="background" args={['#030305']} />
        <ambientLight intensity={0.05} />
        <directionalLight position={SUN_POSITION} intensity={2.3} color="#FFF6E8" />

        <Suspense fallback={null}>
          <Skybox />
          <Starfield />
          <Sun ref={setSun} />
          <Earth />
          <Moon />
        </Suspense>

        {ready && (
          <Suspense fallback={null}>
            <Galaxies />
            <Nebulae />
            <Comets />
            <Mars />
            <Jupiter />
            <Saturn />
            <Uranus />
            <Venus />
            <Neptune />
            <Constellation />
          </Suspense>
        )}

        <CameraRig />
        <LensFlare />
        <GlProbe />
        <PostFX sun={sun} />
      </Canvas>
    </div>
  );
}
