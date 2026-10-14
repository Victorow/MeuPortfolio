'use client';

import Planet from './Planet';
import Rings from './Rings';
import Atmosphere from './Atmosphere';
import { PLANETS } from '@/content/planets';

export default function Uranus() {
  return (
    <Planet id="uranus" map="uranus" chapter="uranus" roughness={0.9}>
      <Rings planet="uranus" opacity={0.85} />
      <Atmosphere radius={PLANETS.uranus.radius} color="#8FD8E8" intensity={0.5} power={3.0} />
    </Planet>
  );
}
