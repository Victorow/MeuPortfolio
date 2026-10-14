import { describe, it, expect } from 'vitest';
import { edgeFalloff, flareIntensity, sunVisibility, GHOSTS, type Vec3 } from '@/lib/scene/flare';

const CAM: Vec3 = [0, 0, 0];
const SUN: Vec3 = [0, 0, -1000];
const SUN_R = 18;

describe('sunVisibility', () => {
  it('is 1 with no occluders', () => {
    expect(sunVisibility(CAM, SUN, SUN_R, [])).toBe(1);
  });

  it('is 0 when a big planet sits on the line of sight', () => {
    expect(sunVisibility(CAM, SUN, SUN_R, [{ center: [0, 0, -50], radius: 5 }])).toBe(0);
  });

  it('ignores occluders far off the line of sight', () => {
    expect(sunVisibility(CAM, SUN, SUN_R, [{ center: [40, 0, -50], radius: 5 }])).toBe(1);
  });

  it('ignores occluders behind the Sun or behind the camera', () => {
    expect(sunVisibility(CAM, SUN, SUN_R, [{ center: [0, 0, -1500], radius: 50 }])).toBe(1);
    expect(sunVisibility(CAM, SUN, SUN_R, [{ center: [0, 0, 50], radius: 5 }])).toBe(1);
  });

  it('falls off smoothly and monotonically as a planet slides across the Sun', () => {
    const vals: number[] = [];
    for (let x = 0; x <= 8; x += 0.25) vals.push(sunVisibility(CAM, SUN, SUN_R, [{ center: [x, 0, -50], radius: 5 }]));
    expect(vals[0]).toBe(0);
    expect(vals[vals.length - 1]).toBe(1);
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeGreaterThanOrEqual(vals[i - 1]);
      expect(vals[i] - vals[i - 1]).toBeLessThan(0.35); // no hard switch
    }
    expect(vals.some((v) => v > 0.05 && v < 0.95)).toBe(true);
  });

  it('a tiny occluder only dims the Sun by its area ratio', () => {
    // angular radius ratio 0.5 → at most 25% of the disc blocked
    const v = sunVisibility(CAM, SUN, SUN_R, [{ center: [0, 0, -100], radius: 0.9 }]);
    expect(v).toBeCloseTo(0.75, 2);
  });

  it('is 0 with the camera inside an occluder', () => {
    expect(sunVisibility(CAM, SUN, SUN_R, [{ center: [0, 0, 0], radius: 2 }])).toBe(0);
  });
});

describe('edgeFalloff / flareIntensity', () => {
  it('is full near the centre and zero behind the camera', () => {
    expect(edgeFalloff(0, 0, false)).toBe(1);
    expect(edgeFalloff(0.5, -0.6, false)).toBe(1);
    expect(edgeFalloff(0, 0, true)).toBe(0);
  });

  it('fades out just past the frame edge', () => {
    expect(edgeFalloff(1.3, 0, false)).toBe(0);
    const edge = edgeFalloff(1.0, 0, false);
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(1);
    expect(edgeFalloff(0.95, 0, false)).toBeGreaterThan(edgeFalloff(1.1, 0, false));
  });

  it('scales with visibility and stays in [0, 1]', () => {
    expect(flareIntensity(0, 0, false, 0.4)).toBeCloseTo(0.4);
    expect(flareIntensity(0, 0, false, 0)).toBe(0);
    expect(flareIntensity(0, 0, true, 1)).toBe(0);
    expect(flareIntensity(0.2, 0.1, false, 2)).toBe(1);
  });

  it('defines six ghosts on both sides of the screen centre', () => {
    expect(GHOSTS).toHaveLength(6);
    expect(GHOSTS.some((g) => g.f > 0)).toBe(true);
    expect(GHOSTS.some((g) => g.f < 0)).toBe(true);
  });
});
