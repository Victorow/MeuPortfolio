'use client';

import Planet from './Planet';
import Atmosphere from './Atmosphere';
import { PLANETS } from '@/content/planets';

export default function Neptune() {
  return (
    <Planet id="neptune" map="neptune" chapter="neptune" roughness={0.9}>
      <Atmosphere radius={PLANETS.neptune.radius} color="#3E6CFF" intensity={0.6} power={3.0} />
    </Planet>
  );
}
