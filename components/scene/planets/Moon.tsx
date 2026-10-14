'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS, SUN_POSITION } from '@/content/planets';
import { useTex } from '@/lib/assets/useTexture';
import { usePerfTier, useReducedMotion } from '@/lib/device';
import { useJourney } from '@/lib/journey/store';
import { moonState, orbitAngle, transitPhase } from '@/lib/scene/eclipse';
import { useChapterVisible } from './Planet';

/** Hero camera position relative to Earth (first keyframe of the camera path). */
const HERO_CAM = new THREE.Vector3(-3.2, 0.6, 7.2);
const TRANSIT_RADIUS = 2.6;
const DISTANT_RADIUS = 11.4;
const DISTANT_PERIOD_S = 300;

/**
 * The Moon. In the hero it orbits Earth on a plane almost aligned with the
 * camera, crossing in front of the Earth (and shadowing it, see Earth.tsx)
 * every 75 s; elsewhere it eases back to a slow, distant orbit.
 */
export default function Moon() {
  const data = PLANETS.moon;
  const earth = PLANETS.earth.position;
  const tex = useTex('moon');
  const tier = usePerfTier();
  const reduced = useReducedMotion();
  const visible = useChapterVisible('earth');
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const ready = useJourney((s) => s.ready);
  const readyAt = useRef<number | null>(null);
  const heroWeight = useRef(useJourney.getState().chapter === 'earth' ? 1 : 0);

  useEffect(() => {
    if (ready && readyAt.current === null) readyAt.current = performance.now();
  }, [ready]);

  // Orbit basis: `a` points between the hero camera and the Sun, so at the
  // transit the Moon sits in front of Earth and its shadow lands on the lit,
  // visible face; `b` is the (slightly inclined) horizontal tangent.
  const basis = useMemo(() => {
    const sun = new THREE.Vector3(...SUN_POSITION).normalize();
    const a = HERO_CAM.clone().normalize().multiplyScalar(3).add(sun).normalize();
    const b = new THREE.Vector3().crossVectors(a, new THREE.Vector3(0, 1, 0)).normalize();
    b.y += 0.4;
    b.normalize();
    return { a, b };
  }, []);

  const transit = useRef(new THREE.Vector3());
  const distant = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const since = !reduced && readyAt.current !== null ? (performance.now() - readyAt.current) / 1000 : 0;
    const theta = orbitAngle(transitPhase(since));
    transit.current
      .copy(basis.a)
      .multiplyScalar(Math.cos(theta) * TRANSIT_RADIUS)
      .addScaledVector(basis.b, Math.sin(theta) * TRANSIT_RADIUS);

    const phi = Math.atan2(-9, -7) + (reduced ? 0 : (performance.now() / 1000 / DISTANT_PERIOD_S) * Math.PI * 2);
    distant.current.set(Math.cos(phi) * DISTANT_RADIUS, 2.5 + Math.sin(phi * 2) * 1.2, Math.sin(phi) * DISTANT_RADIUS);

    const target = useJourney.getState().chapter === 'earth' ? 1 : 0;
    if (reduced) heroWeight.current = target;
    else heroWeight.current += (target - heroWeight.current) * (1 - Math.exp(-Math.min(delta, 0.1) * 1.4));
    const w = heroWeight.current;
    const e = w * w * (3 - 2 * w);

    g.position.lerpVectors(distant.current, transit.current, e);
    g.position.x += earth[0];
    g.position.y += earth[1];
    g.position.z += earth[2];
    moonState.pos[0] = g.position.x;
    moonState.pos[1] = g.position.y;
    moonState.pos[2] = g.position.z;
    moonState.radius = data.radius;

    if (mesh.current && !reduced) mesh.current.rotation.y += (delta * Math.PI * 2) / data.rotationPeriod;
  });

  const segs: [number, number] = tier === 'high' ? [96, 48] : [48, 24];

  return (
    <group ref={group} position={data.position} visible={visible}>
      <mesh ref={mesh} rotation={[0, 0, THREE.MathUtils.degToRad(data.axialTilt)]}>
        <sphereGeometry args={[data.radius, segs[0], segs[1]]} />
        <meshStandardMaterial map={tex} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
