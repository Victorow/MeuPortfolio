/**
 * Moon transit in the hero: orbit timing and the shadow test shared (as GLSL)
 * with the Earth shader. Pure functions, unit tested.
 */
import type { Vec3 } from './flare';
import { smoothstep } from './flare';

export const TRANSIT_PERIOD_S = 75;
/** Time to cross the Earth's disc. */
export const TRANSIT_S = 4;
/** First transit starts this long after the preloader hands off. */
export const FIRST_TRANSIT_DELAY_S = 6;
/** Half width of the speed bump around the transit (s). */
const BUMP_H = 4;
/** Angle swept while crossing the disc (rad, either side of the transit centre). */
const CROSS_HALF = 0.82;

// ω(u) = ω0 + A·(1 + cos(πu/h))/2 for |u| < h. Solve so one period sweeps 2π and
// the central TRANSIT_S seconds sweep 2·CROSS_HALF.
const half = TRANSIT_S / 2;
const bumpInt = (u: number) => u / 2 + (BUMP_H / (2 * Math.PI)) * Math.sin((Math.PI * u) / BUMP_H);
const A = (CROSS_HALF - (2 * Math.PI * half) / TRANSIT_PERIOD_S) / (bumpInt(half) - (BUMP_H * half) / TRANSIT_PERIOD_S);
const W0 = (2 * Math.PI - A * BUMP_H) / TRANSIT_PERIOD_S;

/** Signed time (s) relative to the nearest transit centre, in [-P/2, P/2). */
export function transitPhase(sinceReady: number): number {
  const centre = FIRST_TRANSIT_DELAY_S + half;
  const P = TRANSIT_PERIOD_S;
  const u = (((sinceReady - centre) % P) + P) % P; // [0, P)
  return u >= P / 2 ? u - P : u;
}

/**
 * Orbit angle (rad) as a function of the transit phase: 0 at the transit centre,
 * fast through the crossing, slow elsewhere, continuous velocity everywhere.
 */
export function orbitAngle(u: number): number {
  const s = Math.sign(u) || 1;
  const a = Math.abs(u);
  const bump = a < BUMP_H ? bumpInt(a) : bumpInt(BUMP_H);
  return s * (W0 * a + A * bump);
}

/** True while the Moon is crossing the Earth's disc. */
export function inTransit(sinceReady: number): boolean {
  return Math.abs(transitPhase(sinceReady)) <= half;
}

export const ORBIT_CONSTANTS = { A, W0, CROSS_HALF };

/**
 * Shadow amount (0 = lit, 1 = umbra) at surface point `p` for a Sun in
 * direction `sunDir` (normalised) and a Moon sphere. The fragment is shadowed
 * when the ray p → Sun passes within `radius` of the Moon's centre; `penumbra`
 * widens the soft edge (fraction of the radius, 0 = hard edge).
 */
export function moonShadow(p: Vec3, sunDir: Vec3, moon: Vec3, radius: number, penumbra = 0.35): number {
  const m: Vec3 = [moon[0] - p[0], moon[1] - p[1], moon[2] - p[2]];
  const t = m[0] * sunDir[0] + m[1] * sunDir[1] + m[2] * sunDir[2];
  if (t <= 0) return 0; // Moon is not towards the Sun
  const cx = m[0] - sunDir[0] * t;
  const cy = m[1] - sunDir[1] * t;
  const cz = m[2] - sunDir[2] * t;
  const d = Math.sqrt(cx * cx + cy * cy + cz * cz);
  const pen = Math.max(0.01, penumbra);
  return 1 - smoothstep(radius * (1 - pen), radius * (1 + pen), d);
}

/** GLSL twin of `moonShadow` (keep in sync). */
export const MOON_SHADOW_GLSL = /* glsl */ `
  float moonShadow(vec3 p, vec3 sunDir, vec3 moon, float radius, float penumbra) {
    vec3 m = moon - p;
    float t = dot(m, sunDir);
    if (t <= 0.0) return 0.0;
    float d = length(m - sunDir * t);
    float pen = max(0.01, penumbra);
    return 1.0 - smoothstep(radius * (1.0 - pen), radius * (1.0 + pen), d);
  }
`;

/** Live Moon world position, written by Moon and read by Earth / LensFlare. */
export const moonState = { pos: [1e4, 0, 0] as Vec3, radius: 0.5 };
