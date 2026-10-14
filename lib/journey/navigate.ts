'use client';

import type { ChapterId } from '@/content/planets';
import { useJourney } from './store';
import { CHAPTERS, chapterIndex, rangeOf } from './timeline';
import { scrollToProgress } from './useScrollDriver';

export const WARP_IN_MS = 520;
export const WARP_OUT_MS = 700;

/**
 * Go to a chapter. Neighbouring chapters glide (smooth scroll + camera travel);
 * jumps of two or more chapters use the warp: the overlay closes, the scroll and
 * camera snap to the target, and the overlay opens on the new planet.
 */
export function goToChapter(id: ChapterId) {
  const s = useJourney.getState();
  const from = chapterIndex(s.chapter);
  const to = chapterIndex(id);
  if (to < 0) return;
  if (s.warping) return;
  if (Math.abs(to - from) <= 1) {
    scrollToProgress(rangeOf(id).start);
    return;
  }
  s.setWarping(true);
  window.setTimeout(() => {
    scrollToProgress(rangeOf(id).start, true);
    useJourney.getState().requestSnap();
    window.setTimeout(() => useJourney.getState().setWarping(false), WARP_OUT_MS);
  }, WARP_IN_MS);
}

export function stepChapter(dir: 1 | -1): boolean {
  const s = useJourney.getState();
  const next = chapterIndex(s.chapter) + dir;
  if (next < 0 || next >= CHAPTERS.length) return false;
  scrollToProgress(rangeOf(CHAPTERS[next]).start);
  return true;
}
