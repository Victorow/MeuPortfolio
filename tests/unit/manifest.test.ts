import { describe, it, expect } from 'vitest';
import { resolveTexture, chapterPreloadList, type Manifest } from '@/lib/assets/manifest';

const fake: Manifest = {
  earth_day: { high: '/t/h/earth_day.jpg', mid: '/t/m/earth_day.jpg', low: '/t/l/earth_day.jpg' },
  milkyway: { low: 'only-low' },
  mars: { high: 'only-high' }
};

describe('manifest', () => {
  it('resolves exact tier when present', () => {
    expect(resolveTexture('earth_day', 'high', fake)).toBe('/t/h/earth_day.jpg');
    expect(resolveTexture('earth_day', 'low', fake)).toBe('/t/l/earth_day.jpg');
  });

  it('falls back to lower tiers first, then higher', () => {
    expect(resolveTexture('milkyway', 'high', fake)).toBe('only-low');
    expect(resolveTexture('mars', 'low', fake)).toBe('only-high');
  });

  it('throws for unknown texture', () => {
    expect(() => resolveTexture('venus', 'high', fake)).toThrow(/missing/);
  });

  it('earth chapter preload includes earth maps, moon and milkyway; not saturn', () => {
    const l = chapterPreloadList('earth');
    expect(l).toEqual(expect.arrayContaining(['earth_day', 'earth_night', 'earth_clouds', 'moon', 'milkyway']));
    expect(l).not.toContain('saturn');
  });

  it('generated manifest has every key in all tiers', () => {
    const keys = [
      'earth_day', 'earth_night', 'earth_clouds', 'earth_specular', 'earth_normal', 'moon', 'mars', 'jupiter',
      'saturn', 'saturn_ring', 'uranus', 'venus', 'neptune', 'sun', 'milkyway'
    ] as const;
    for (const k of keys) {
      for (const tier of ['high', 'mid', 'low'] as const) {
        expect(resolveTexture(k, tier)).toMatch(new RegExp(`^/textures/${tier}/${k}\\.(jpg|png|ktx2)$`));
      }
    }
  });
});
