'use client';

import VolumetricNebula from './VolumetricNebula';

/**
 * Three ray-marched volumetric nebulae, each tuned to the chapters it sits behind:
 * cold blue/violet near Earth–Mars, ember orange/red near Jupiter–Saturn,
 * teal/magenta near Neptune and the finale. Far enough to stay soft, close
 * enough that camera travel reveals their volume.
 */
export default function Nebulae() {
  return (
    <>
      <VolumetricNebula position={[52, -15, -380]} radius={85} colors={['#1E2F7A', '#5468E6', '#B7C6FF']} density={1.25} opacity={0.95} seed={1.3} />
      <VolumetricNebula position={[180, 90, -470]} radius={160} colors={['#5A2414', '#D45E2E', '#F7BE86']} density={1.15} opacity={0.9} seed={2.7} rotation={[0.4, 0.8, 0]} />
      <VolumetricNebula position={[300, -60, -560]} radius={150} colors={['#123846', '#22A0A0', '#D866BE']} density={1.2} opacity={0.9} seed={4.1} rotation={[-0.3, 0.2, 0.6]} />
    </>
  );
}
