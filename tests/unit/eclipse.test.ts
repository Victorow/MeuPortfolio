import { describe, it, expect } from 'vitest';
import {
  moonShadow,
  orbitAngle,
  transitPhase,
  inTransit,
  TRANSIT_PERIOD_S,
  FIRST_TRANSIT_DELAY_S,
  TRANSIT_S
} from '@/lib/scene/eclipse';
import type { Vec3 } from '@/lib/scene/flare';

const SUN_DIR: Vec3 = [1, 0, 0];
const P: Vec3 = [2, 0, 0]; // surface point facing the Sun

describe('moonShadow', () => {
  it('is full umbra when the Moon sits on the fragment → Sun line', () => {
    expect(moonShadow(P, SUN_DIR, [5, 0, 0], 0.5)).toBe(1);
  });

  it('is 0 when the Moon is well off the line', () => {
    expect(moonShadow(P, SUN_DIR, [5, 2, 0], 0.5)).toBe(0);
  });

  it('is 0 when the Moon is on the night side (away from the Sun)', () => {
    expect(moonShadow(P, SUN_DIR, [-5, 0, 0], 0.5)).toBe(0);
  });

  it('has a soft penumbra around one Moon radius', () => {
    const mid = moonShadow(P, SUN_DIR, [5, 0.5, 0], 0.5, 0.4);
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.7);
    const a = moonShadow(P, SUN_DIR, [5, 0.4, 0], 0.5, 0.4);
    const b = moonShadow(P, SUN_DIR, [5, 0.6, 0], 0.5, 0.4);
    expect(a).toBeGreaterThan(mid);
    expect(b).toBeLessThan(mid);
  });

  it('tier low (no penumbra) gives an almost hard edge', () => {
    expect(moonShadow(P, SUN_DIR, [5, 0.48, 0], 0.5, 0)).toBe(1);
    expect(moonShadow(P, SUN_DIR, [5, 0.52, 0], 0.5, 0)).toBe(0);
  });
});

describe('Moon transit timing', () => {
  it('first transit starts 6 s after ready and lasts ~4 s', () => {
    expect(transitPhase(FIRST_TRANSIT_DELAY_S)).toBeCloseTo(-TRANSIT_S / 2);
    expect(inTransit(FIRST_TRANSIT_DELAY_S - 0.1)).toBe(false);
    expect(inTransit(FIRST_TRANSIT_DELAY_S + 0.1)).toBe(true);
    expect(inTransit(FIRST_TRANSIT_DELAY_S + TRANSIT_S - 0.1)).toBe(true);
    expect(inTransit(FIRST_TRANSIT_DELAY_S + TRANSIT_S + 0.1)).toBe(false);
  });

  it('repeats every 75 s', () => {
    expect(inTransit(FIRST_TRANSIT_DELAY_S + 1 + TRANSIT_PERIOD_S)).toBe(true);
    expect(inTransit(FIRST_TRANSIT_DELAY_S + 30)).toBe(false);
    expect(transitPhase(20)).toBeCloseTo(transitPhase(20 + TRANSIT_PERIOD_S));
  });

  it('orbit angle is 0 at the transit centre, ±π half a period away, and monotonic', () => {
    expect(orbitAngle(0)).toBe(0);
    expect(orbitAngle(TRANSIT_PERIOD_S / 2)).toBeCloseTo(Math.PI, 6);
    expect(orbitAngle(-TRANSIT_PERIOD_S / 2)).toBeCloseTo(-Math.PI, 6);
    let prev = orbitAngle(-TRANSIT_PERIOD_S / 2);
    for (let u = -TRANSIT_PERIOD_S / 2 + 0.05; u <= TRANSIT_PERIOD_S / 2; u += 0.05) {
      const a = orbitAngle(u);
      expect(a).toBeGreaterThan(prev);
      expect(a - prev).toBeLessThan(0.05); // continuous, no jumps
      prev = a;
    }
  });

  it('sweeps fast through the crossing and slowly elsewhere', () => {
    const crossing = orbitAngle(TRANSIT_S / 2) - orbitAngle(-TRANSIT_S / 2);
    const elsewhere = orbitAngle(30) - orbitAngle(26);
    expect(crossing).toBeGreaterThan(1.4);
    expect(crossing / elsewhere).toBeGreaterThan(5);
  });
});
