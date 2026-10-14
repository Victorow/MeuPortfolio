'use client';

import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS, type PlanetId, type ChapterId } from '@/content/planets';
import { useTex } from '@/lib/assets/useTexture';
import type { TextureKey } from '@/lib/assets/manifest';
import { usePerfTier, useReducedMotion } from '@/lib/device';
import { useJourney } from '@/lib/journey/store';
import { chapterIndex } from '@/lib/journey/timeline';

type Props = {
  id: PlanetId;
  map: TextureKey;
  /** Chapter that owns this planet; it renders only in that chapter ±1. */
  chapter: ChapterId;
  roughness?: number;
  /** Ring shadow band (planet-local radii) darkens the surface where the sun ray crosses the ring plane. */
  ringShadow?: { inner: number; outer: number };
  /** Optional per-frame hook on the material (e.g. Jupiter band flow). */
  onBeforeCompile?: (shader: THREE.WebGLProgramParametersWithUniforms) => void;
  uniformsRef?: React.MutableRefObject<Record<string, THREE.IUniform> | null>;
  children?: ReactNode;
};

export function useChapterVisible(chapter: ChapterId, spread = 1) {
  return useJourney((s) => Math.abs(chapterIndex(s.chapter) - chapterIndex(chapter)) <= spread);
}

/**
 * Generic textured planet: group placed at its world position and tilted by the
 * axial tilt; inner mesh spins. Children (rings, atmosphere) live in the tilted
 * group, outside the spinning mesh.
 */
export default function Planet({ id, map, chapter, roughness = 1, ringShadow, onBeforeCompile, uniformsRef, children }: Props) {
  const data = PLANETS[id];
  const tex = useTex(map);
  const tier = usePerfTier();
  const reduced = useReducedMotion();
  const mesh = useRef<THREE.Mesh>(null);
  const visible = useChapterVisible(chapter);

  const segs: [number, number] = tier === 'high' ? [128, 64] : [64, 32];

  const compile = useMemo(() => {
    return (shader: THREE.WebGLProgramParametersWithUniforms) => {
      if (ringShadow) {
        shader.uniforms.uRingInner = { value: ringShadow.inner };
        shader.uniforms.uRingOuter = { value: ringShadow.outer };
        shader.uniforms.uSunDirLocal = { value: new THREE.Vector3(1, 0, 0) };
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vLocalPos;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocalPos = position;');
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec3 vLocalPos;
             uniform float uRingInner; uniform float uRingOuter; uniform vec3 uSunDirLocal;`
          )
          .replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             {
               // Ray from surface point towards the sun; intersect ring plane y=0 (planet-local, tilted frame).
               float denom = uSunDirLocal.y;
               if (abs(denom) > 1e-4) {
                 float t = -vLocalPos.y / denom;
                 if (t > 0.0) {
                   vec3 hit = vLocalPos + uSunDirLocal * t;
                   float r = length(hit.xz);
                   float band = smoothstep(uRingInner - 0.15, uRingInner + 0.15, r) * (1.0 - smoothstep(uRingOuter - 0.15, uRingOuter + 0.15, r));
                   gl_FragColor.rgb *= 1.0 - band * 0.78;
                 }
               }
             }`
          );
      }
      onBeforeCompile?.(shader);
      if (uniformsRef) uniformsRef.current = shader.uniforms;
    };
  }, [ringShadow, onBeforeCompile, uniformsRef]);

  // Sun direction expressed in the tilted planet frame (for the ring shadow).
  const sunLocal = useRef(new THREE.Vector3());
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (mesh.current && !reduced) {
      mesh.current.rotation.y += (delta * Math.PI * 2) / data.rotationPeriod;
    }
    if (ringShadow && uniformsRef?.current?.uSunDirLocal && groupRef.current) {
      const inv = new THREE.Matrix4().copy(groupRef.current.matrixWorld).invert();
      // SUN_POSITION is far away; a direction is enough.
      sunLocal.current.set(-400, 50, 200).sub(new THREE.Vector3(...data.position)).normalize();
      sunLocal.current.transformDirection(inv);
      (uniformsRef.current.uSunDirLocal.value as THREE.Vector3).copy(sunLocal.current);
    }
  });

  return (
    <group ref={groupRef} position={data.position} rotation={[0, 0, THREE.MathUtils.degToRad(data.axialTilt)]} visible={visible}>
      <mesh ref={mesh} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[data.radius, segs[0], segs[1]]} />
        <meshStandardMaterial map={tex} roughness={roughness} metalness={0} onBeforeCompile={compile} />
      </mesh>
      {children}
    </group>
  );
}
