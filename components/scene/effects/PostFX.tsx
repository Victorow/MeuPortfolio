'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise, SMAA, ToneMapping, ChromaticAberration, GodRays } from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useJourney } from '@/lib/journey/store';
import { usePerfTier } from '@/lib/device';

type Props = { sun: THREE.Mesh | null };

/**
 * Cinematic grade: SMAA, bloom (velocity-reactive), subtle chromatic aberration,
 * grain, vignette, ACES. God rays from the Sun on mid/high tiers.
 */
export default function PostFX({ sun }: Props) {
  const tier = usePerfTier();
  const bloom = useRef<any>(null);
  const ca = useRef<any>(null);
  const offset = useRef(new THREE.Vector2(0.0004, 0.0004));

  useFrame(() => {
    const v = Math.min(1, Math.abs(useJourney.getState().velocity) * 0.5);
    if (bloom.current) bloom.current.intensity = 0.5 + v * 0.35;
    if (ca.current) {
      const o = 0.0004 + v * 0.0012;
      offset.current.set(o, o);
    }
  });

  if (tier === 'low') return null;

  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      {sun ? (
        <GodRays
          sun={sun}
          samples={tier === 'high' ? 60 : 32}
          density={0.96}
          decay={0.93}
          weight={0.28}
          exposure={0.22}
          clampMax={1}
          blur
        />
      ) : (
        <></>
      )}
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.25} intensity={0.5} />
      {tier === 'high' ? (
        <ChromaticAberration ref={ca} offset={offset.current} radialModulation modulationOffset={0.45} />
      ) : (
        <></>
      )}
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.16} />
      <Vignette eskil={false} offset={0.22} darkness={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
