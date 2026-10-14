import * as THREE from 'three';
import { PLANETS, SUN_POSITION, type PlanetId, type ChapterId } from '@/content/planets';
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

/**
 * Look target for the deep-space look-back: towards the Sun, turned ~8° to the
 * left and ~18° down so the Sun lands in the upper right of the frame (still
 * inside a portrait phone frame). Kept at a moderate distance so the look curve
 * stays well behaved.
 */
function lookBack(pos: V3): V3 {
  const sun = new THREE.Vector3(...SUN_POSITION);
  const p = new THREE.Vector3(...pos);
  const dir = sun.sub(p).normalize();
  const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  dir.addScaledVector(right, -Math.tan(THREE.MathUtils.degToRad(8))).addScaledVector(up, -Math.tan(THREE.MathUtils.degToRad(18))).normalize();
  const look = p.addScaledVector(dir, 60);
  return [look.x, look.y, look.z];
}

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
  // Deep space: first 40% look back at the Solar System (the Sun sits upper-right
  // of the frame, where the lens flare plays), then leave the ecliptic and face
  // the Milky Way.
  const d = CHAPTER_RANGES.deep;
  const n = CHAPTER_RANGES.neptune;
  const dLen = d.end - d.start;
  const nepHold = keys[keys.length - 1];
  const backPos0 = P('neptune', [-6, 9, 14]);
  const backPos1 = P('neptune', [-8, 13, 19]);
  const back0: Key = { t: d.start, pos: backPos0, look: lookBack(backPos0), fov: 50 };
  const back1: Key = { t: d.start + dLen * 0.4, pos: backPos1, look: lookBack(backPos1), fov: 52 };
  const final: Key = { t: 1, pos: P('neptune', [-10, 30, 25]), look: P('neptune', [40, 80, -120]), fov: 60 };
  // The two ~140° turns (Neptune → Sun, Sun → Milky Way) get a mid key looking
  // sideways, so the look target swings around the camera instead of through it.
  keys.push(turnKey(nepHold, back0, n.start + (n.end - n.start) * 0.8, 0.15));
  keys.push(back0, back1);
  keys.push(turnKey(back1, final, d.start + dLen * 0.7, 0.6));
  keys.push(final);
  return keys;
}

/** Midway key between `a` and `b`: halfway position, look along the bisector of both view directions (+ a lift). */
function turnKey(a: Key, b: Key, t: number, lift: number): Key {
  const pa = new THREE.Vector3(...a.pos);
  const pb = new THREE.Vector3(...b.pos);
  const da = new THREE.Vector3(...a.look).sub(pa).normalize();
  const db = new THREE.Vector3(...b.look).sub(pb).normalize();
  const pos = pa.clone().lerp(pb, 0.5);
  const dir = da.add(db).normalize();
  dir.y += lift;
  dir.normalize();
  const look = pos.clone().addScaledVector(dir, 60);
  return { t, pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: (a.fov + b.fov) / 2 };
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
