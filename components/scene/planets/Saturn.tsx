'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import Planet from './Planet';
import Rings from './Rings';
import Atmosphere from './Atmosphere';
import { PLANETS } from '@/content/planets';
import { usePerfTier } from '@/lib/device';

export default function Saturn() {
  const tier = usePerfTier();
  const uniforms = useRef<Record<string, THREE.IUniform> | null>(null);
  const rings = PLANETS.saturn.rings!;
  return (
    <Planet
      id="saturn"
      map="saturn"
      chapter="saturn"
      roughness={0.95}
      ringShadow={tier === 'low' ? undefined : { inner: rings.inner, outer: rings.outer }}
      uniformsRef={uniforms}
    >
      <Rings planet="saturn" />
      <Atmosphere radius={PLANETS.saturn.radius} color="#E8C98A" intensity={0.22} power={3.8} />
    </Planet>
  );
}
