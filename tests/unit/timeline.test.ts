import { describe, it, expect } from 'vitest';
import { CHAPTERS, chapterAt, rangeOf, localProgress, snapPoints } from '@/lib/journey/timeline';

describe('timeline', () => {
  it('has 8 chapters in spec order', () => {
    expect(CHAPTERS).toEqual(['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'venus', 'neptune', 'deep']);
  });

  it('ranges cover [0,1] contiguously', () => {
    let end = 0;
    for (const c of CHAPTERS) {
      const r = rangeOf(c);
      expect(r.start).toBeCloseTo(end);
      end = r.end;
    }
    expect(end).toBeCloseTo(1);
  });

  it('maps progress to chapter including edges', () => {
    expect(chapterAt(0)).toBe('earth');
    expect(chapterAt(1)).toBe('deep');
    expect(chapterAt(-1)).toBe('earth');
    expect(chapterAt(2)).toBe('deep');
    const s = rangeOf('saturn');
    expect(chapterAt((s.start + s.end) / 2)).toBe('saturn');
  });

  it('localProgress is 0..1 inside a chapter and clamped outside', () => {
    const m = rangeOf('mars');
    expect(localProgress(m.start, 'mars')).toBeCloseTo(0);
    expect(localProgress(m.end, 'mars')).toBeCloseTo(1);
    expect(localProgress(0, 'mars')).toBe(0);
    expect(localProgress(1, 'mars')).toBe(1);
  });

  it('snap points are chapter starts', () => {
    expect(snapPoints()).toHaveLength(8);
    expect(snapPoints()[0]).toBe(0);
  });
});
