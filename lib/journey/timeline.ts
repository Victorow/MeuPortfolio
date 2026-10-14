import type { ChapterId } from '@/content/planets';

export const CHAPTERS: ChapterId[] = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'venus', 'neptune', 'deep'];

/** Relative scroll weight per chapter. Hero and deep are shorter; project chapters longer. */
const WEIGHTS: Record<ChapterId, number> = {
  earth: 1.3,
  mars: 1.4,
  jupiter: 1.4,
  saturn: 1.4,
  uranus: 1.4,
  venus: 1.4,
  neptune: 1.6,
  deep: 1.2
};

const total = CHAPTERS.reduce((s, c) => s + WEIGHTS[c], 0);

export const CHAPTER_RANGES: Record<ChapterId, { start: number; end: number }> = (() => {
  const out = {} as Record<ChapterId, { start: number; end: number }>;
  let acc = 0;
  for (const c of CHAPTERS) {
    const w = WEIGHTS[c] / total;
    out[c] = { start: acc, end: acc + w };
    acc += w;
  }
  out.deep.end = 1;
  return out;
})();

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function rangeOf(id: ChapterId) {
  return CHAPTER_RANGES[id];
}

export function chapterAt(p: number): ChapterId {
  const x = clamp01(p);
  for (const c of CHAPTERS) {
    if (x < CHAPTER_RANGES[c].end) return c;
  }
  return 'deep';
}

export function localProgress(p: number, id: ChapterId) {
  const r = CHAPTER_RANGES[id];
  return clamp01((p - r.start) / (r.end - r.start));
}

export function snapPoints() {
  return CHAPTERS.map((c) => CHAPTER_RANGES[c].start);
}

export function chapterIndex(id: ChapterId) {
  return CHAPTERS.indexOf(id);
}

/** vh per weight unit. A project chapter is ~140vh: one pinned screen + 40vh of travel. */
export const VH_PER_UNIT = 100;

export function chapterHeightVh(id: ChapterId) {
  return WEIGHTS[id] * VH_PER_UNIT;
}

export function scrollHeightVh() {
  return total * VH_PER_UNIT;
}
