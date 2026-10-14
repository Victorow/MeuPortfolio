/** Pure helpers for the Sun lens flare (unit tested; no three.js dependency). */

export type Vec3 = [number, number, number];
export type Sphere = { center: Vec3; radius: number };

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec3) => Math.sqrt(dot(a, a));

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Fraction of the Sun's disc visible from `cam`, given spherical occluders.
 * Works in angles: each occluder closer than the Sun covers the disc according
 * to the angular separation of the two centres versus their angular radii
 * (linear coverage between "touching" and "fully inside").
 */
export function sunVisibility(cam: Vec3, sun: Vec3, sunRadius: number, occluders: Sphere[]): number {
  const toSun = sub(sun, cam);
  const dSun = len(toSun);
  if (dSun <= sunRadius) return 1;
  const aSun = Math.asin(Math.min(1, sunRadius / dSun));
  let vis = 1;
  for (const o of occluders) {
    const toO = sub(o.center, cam);
    const dO = len(toO);
    if (dO <= o.radius) return 0; // camera inside the occluder
    if (dO >= dSun) continue; // behind the Sun
    const aO = Math.asin(Math.min(1, o.radius / dO));
    const cos = Math.min(1, Math.max(-1, dot(toSun, toO) / (dSun * dO)));
    const sep = Math.acos(cos);
    const outer = aO + aSun; // discs just touch
    if (sep >= outer) continue;
    // fully covered when the Sun's disc sits inside the occluder's disc
    const inner = aO - aSun;
    let cover: number;
    if (inner <= 0) {
      // occluder smaller than the Sun: at best it blocks its area ratio
      const maxCover = (aO * aO) / (aSun * aSun);
      cover = maxCover * (1 - smoothstep(Math.max(0, aSun - aO), outer, sep));
    } else {
      cover = 1 - smoothstep(inner, outer, sep);
    }
    vis *= 1 - cover;
  }
  return Math.max(0, Math.min(1, vis));
}

/**
 * Screen-edge falloff from the Sun's NDC position: full inside the central
 * area, fading to zero just past the frame edge. Behind the camera → 0.
 */
export function edgeFalloff(ndcX: number, ndcY: number, behind: boolean): number {
  if (behind) return 0;
  const m = Math.max(Math.abs(ndcX), Math.abs(ndcY));
  return 1 - smoothstep(0.85, 1.2, m);
}

/** Final flare intensity: visibility × on-screen falloff, clamped to [0, 1]. */
export function flareIntensity(ndcX: number, ndcY: number, behind: boolean, visibility: number): number {
  return Math.max(0, Math.min(1, edgeFalloff(ndcX, ndcY, behind) * visibility));
}

/** Ghost positions along the Sun → centre axis (multiples of the Sun's NDC vector). */
export const GHOSTS: { f: number; size: number; alpha: number; kind: 'disc' | 'ring'; tint: 'white' | 'blue' | 'warm' }[] = [
  { f: 0.62, size: 0.07, alpha: 0.32, kind: 'disc', tint: 'blue' },
  { f: 0.34, size: 0.035, alpha: 0.4, kind: 'disc', tint: 'warm' },
  { f: -0.12, size: 0.11, alpha: 0.22, kind: 'ring', tint: 'blue' },
  { f: -0.38, size: 0.05, alpha: 0.3, kind: 'disc', tint: 'white' },
  { f: -0.7, size: 0.16, alpha: 0.16, kind: 'ring', tint: 'warm' },
  { f: -1.05, size: 0.025, alpha: 0.45, kind: 'disc', tint: 'blue' }
];
