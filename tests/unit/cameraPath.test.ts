import { describe, it, expect } from 'vitest';
import { sampleCamera, CAMERA_KEYFRAMES } from '@/lib/journey/cameraPath';

describe('cameraPath', () => {
  it('keyframe times are strictly increasing within [0,1]', () => {
    expect(CAMERA_KEYFRAMES[0].t).toBe(0);
    expect(CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].t).toBe(1);
    for (let i = 1; i < CAMERA_KEYFRAMES.length; i++) {
      expect(CAMERA_KEYFRAMES[i].t).toBeGreaterThan(CAMERA_KEYFRAMES[i - 1].t);
    }
  });

  it('returns finite values across the whole range', () => {
    for (let i = 0; i <= 400; i++) {
      const s = sampleCamera(i / 400);
      for (const v of [s.position.x, s.position.y, s.position.z, s.lookAt.x, s.lookAt.y, s.lookAt.z, s.fov]) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });

  it('is continuous (no position jump > 14 units per 1/400 step)', () => {
    // Measured: inter-planet travel (last 30% of a chapter) peaks at ~10 units/step
    // (Jupiter→Saturn, ~70 units). A real discontinuity would be tens of units in one
    // step, so 14 catches it without false alarms.
    let prev = sampleCamera(0).position.clone();
    for (let i = 1; i <= 400; i++) {
      const cur = sampleCamera(i / 400).position.clone();
      expect(cur.distanceTo(prev)).toBeLessThan(14);
      prev = cur;
    }
  });

  it('starts framing Earth from the front-left', () => {
    const s = sampleCamera(0);
    expect(s.position.z).toBeGreaterThan(0);
    expect(s.position.x).toBeLessThan(0);
    expect(s.lookAt.length()).toBeLessThan(3);
  });

  it('camera never sits inside a keyframe lookAt target', () => {
    for (let i = 0; i <= 400; i++) {
      const s = sampleCamera(i / 400);
      expect(s.position.distanceTo(s.lookAt)).toBeGreaterThan(1);
    }
  });
});
