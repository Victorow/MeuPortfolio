'use client';

import Planet from './Planet';
import Atmosphere from './Atmosphere';
import { PLANETS } from '@/content/planets';

export default function Mars() {
  return (
    <Planet id="mars" map="mars" chapter="mars" roughness={1}>
      <Atmosphere radius={PLANETS.mars.radius} color="#D96A3C" intensity={0.38} power={4.0} />
    </Planet>
  );
}
