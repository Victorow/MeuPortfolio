import * as THREE from 'three';
import { PLANETS, type PlanetId, type ChapterId } from '@/content/planets';
import { CHAPTER_RANGES } from './timeline';

type Key = { t: number; pos: [number, number, number]; look: [number, number, number]; fov: number };
type V3 = [number, number, number];

/** Offset relative to a planet's position so moving a planet moves its shots. */
const P = (id: PlanetId, d: V3): V3 => {
  const p = PLANETS[id].position;
  return [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
};

/** Rotate an offset around the Y axis (slow orbit while the chapter is pinned). */
const orbit = (d: V3, deg: number): V3 => {
  const a = THREE.MathUtils.degToRad(deg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [d[0] * c + d[2] * s, d[1], -d[0] * s + d[2] * c];
};

/**
 * Per chapter: where the camera sits while the content is pinned (arrive at the
 * chapter start, hold with a gentle orbit, leave during the final 30%).
 * Framing rule: to put a planet on the RIGHT of the frame, look at a point to
 * its LEFT (negative x) and vice versa.
 */
type Shot = { planet: PlanetId; pos: V3; look: V3; fov: number; orbitDeg: number };
const SHOTS: Record<Exclude<ChapterId, 'deep'>, Shot> = {
  earth: { planet: 'earth', pos: [-3.2, 0.6, 7.2], look: [-2.6, 0.1, 0], fov: 42, orbitDeg: 10 },
  mars: { planet: 'mars', pos: [-3.6, 0.5, 5.2], look: [-1.9, 0, 0], fov: 40, orbitDeg: 18 },
  jupiter: { planet: 'jupiter', pos: [-15.5, 2.5, 21], look: [7.5, 0, 0], fov: 40, orbitDeg: 12 },
  saturn: { planet: 'saturn', pos: [-21, -8, 21.5], look: [-7, 0, 0], fov: 40, orbitDeg: 20 },
  uranus: { planet: 'uranus', pos: [-8, 1.2, 9.8], look: [4, 0, 0], fov: 40, orbitDeg: 16 },
  venus: { planet: 'venus', pos: [-5.5, 0.6, 6.7], look: [-2.6, 0, 0], fov: 40, orbitDeg: 18 },
  neptune: { planet: 'neptune', pos: [-8.8, 1.4, 11.5], look: [-4.5, 0, 0], fov: 40, orbitDeg: 14 }
};

const HOLD = 0.55; // fraction of the chapter spent pinned on the planet; travel fills the rest

function build(): Key[] {
  const keys: Key[] = [];
  const order: Exclude<ChapterId, 'deep'>[] = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'venus', 'neptune'];
  for (const id of order) {
    const r = CHAPTER_RANGES[id];
    const s = SHOTS[id];
    const len = r.end - r.start;
    keys.push({ t: r.start, pos: P(s.planet, s.pos), look: P(s.planet, s.look), fov: s.fov });
    keys.push({ t: r.start + len * HOLD, pos: P(s.planet, orbit(s.pos, s.orbitDeg)), look: P(s.planet, s.look), fov: s.fov + 1.5 });
  }
  // Deep space: leave the ecliptic, face the Milky Way.
  const d = CHAPTER_RANGES.deep;
  keys.push({ t: d.start, pos: P('neptune', [-6, 9, 14]), look: P('neptune', [20, 32, -60]), fov: 50 });
  keys.push({ t: 1, pos: P('neptune', [-10, 30, 25]), look: P('neptune', [40, 80, -120]), fov: 60 });
  return keys;
}

export const CAMERA_KEYFRAMES: Key[] = build();

const posCurve = new THREE.CatmullRomCurve3(
  CAMERA_KEYFRAMES.map((k) => new THREE.Vector3(...k.pos)),
  false,
  'centripetal'
);
const lookCurve = new THREE.CatmullRomCurve3(
  CAMERA_KEYFRAMES.map((k) => new THREE.Vector3(...k.look)),
  false,
  'centripetal'
);

const smooth = (f: number) => f * f * (3 - 2 * f);

/** Progress → curve parameter u, piecewise over keyframe times with smoothstep easing per segment. */
function toU(p: number) {
  const n = CAMERA_KEYFRAMES.length - 1;
  const x = Math.min(1, Math.max(0, p));
  for (let i = 0; i < n; i++) {
    const a = CAMERA_KEYFRAMES[i].t;
    const b = CAMERA_KEYFRAMES[i + 1].t;
    if (x <= b) {
      const f = b === a ? 0 : (x - a) / (b - a);
      return (i + smooth(f)) / n;
    }
  }
  return 1;
}

function fovAt(p: number) {
  const x = Math.min(1, Math.max(0, p));
  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    const a = CAMERA_KEYFRAMES[i];
    const b = CAMERA_KEYFRAMES[i + 1];
    if (x <= b.t) {
      const f = b.t === a.t ? 0 : (x - a.t) / (b.t - a.t);
      return a.fov + (b.fov - a.fov) * smooth(f);
    }
  }
  return CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].fov;
}

export type CameraSample = { position: THREE.Vector3; lookAt: THREE.Vector3; fov: number };

export function sampleCamera(progress: number, out?: CameraSample): CameraSample {
  const u = toU(progress);
  const o = out ?? { position: new THREE.Vector3(), lookAt: new THREE.Vector3(), fov: 42 };
  // getPoint (not getPointAt): keyframe spacing already controls pacing.
  posCurve.getPoint(u, o.position);
  lookCurve.getPoint(u, o.lookAt);
  o.fov = fovAt(progress);
  return o;
}
