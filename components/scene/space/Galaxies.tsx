'use client';

import DeepSky from './DeepSky';

/**
 * Three real galaxies (Hubble photos), flat and very far: they read as the
 * distant universe behind the volumetric nebulae. depth=0 keeps the photo intact.
 */
export default function Galaxies() {
  return (
    <>
      <DeepSky map="galaxy_whirlpool" position={[-90, 190, -640]} size={110} aspect={1.44} rotation={0.4} opacity={0.55} feather={0.35} spin={0.1} depth={0} />
      <DeepSky map="galaxy_pinwheel" position={[470, -200, -800]} size={140} aspect={1.28} rotation={-0.3} opacity={0.5} feather={0.4} spin={-0.08} depth={0} />
      <DeepSky map="galaxy_barred" position={[360, 270, -560]} size={90} aspect={1.75} rotation={0.9} opacity={0.5} feather={0.4} spin={0.06} depth={0} />
    </>
  );
}
