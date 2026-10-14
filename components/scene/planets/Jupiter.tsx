'use client';

import { useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Planet from './Planet';
import Atmosphere from './Atmosphere';
import { PLANETS } from '@/content/planets';
import { usePerfTier } from '@/lib/device';

/** Jupiter with a subtle band "flow" distortion on high tier. */
export default function Jupiter() {
  const tier = usePerfTier();
  const uniforms = useRef<Record<string, THREE.IUniform> | null>(null);

  const compile = useCallback(
    (shader: THREE.WebGLProgramParametersWithUniforms) => {
      if (tier !== 'high') return;
      shader.uniforms.uTime = { value: 0 };
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <map_fragment>',
          `#ifdef USE_MAP
             vec2 juv = vMapUv;
             juv.x += sin(juv.y * 42.0 + uTime * 0.15) * 0.0012 + sin(juv.y * 9.0 - uTime * 0.07) * 0.0018;
             vec4 sampledDiffuseColor = texture2D( map, juv );
             diffuseColor *= sampledDiffuseColor;
           #endif`
        );
    },
    [tier]
  );

  useFrame((state) => {
    if (uniforms.current?.uTime) uniforms.current.uTime.value = state.clock.elapsedTime;
  });

  return (
    <Planet id="jupiter" map="jupiter" chapter="jupiter" roughness={0.95} onBeforeCompile={compile} uniformsRef={uniforms}>
      <Atmosphere radius={PLANETS.jupiter.radius} color="#E0A862" intensity={0.28} power={3.6} />
    </Planet>
  );
}
