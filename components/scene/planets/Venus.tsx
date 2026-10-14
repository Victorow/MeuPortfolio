'use client';

import Planet from './Planet';
import Atmosphere from './Atmosphere';
import { PLANETS } from '@/content/planets';

export default function Venus() {
  return (
    <Planet id="venus" map="venus" chapter="venus" roughness={0.85}>
      <Atmosphere radius={PLANETS.venus.radius} color="#F0D9A0" intensity={0.7} power={2.6} />
    </Planet>
  );
}
