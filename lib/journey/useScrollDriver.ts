'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useJourney } from './store';
import { CHAPTERS, CHAPTER_RANGES } from './timeline';
import type { ChapterId } from '@/content/planets';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/**
 * Chapter sections measured in the DOM. Journey progress is a piecewise-linear
 * map from scrollY over [section top, next section top) onto the chapter's
 * timeline range, so DOM, camera and indicator always agree. The last chapter
 * ends at the page's maximum scroll.
 */
type Seg = { id: ChapterId; top: number; bottom: number; start: number; stop: number };
let segs: Seg[] = [];

export function measureChapters() {
  const vh = window.innerHeight;
  const y = window.scrollY;
  const found = CHAPTERS.map((id) => {
    const el = document.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { id, top: r.top + y, height: r.height };
  }).filter((s): s is { id: ChapterId; top: number; height: number } => !!s);
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
  segs = found.map((s, i) => {
    const next = found[i + 1];
    const bottom = next ? next.top : Math.min(maxScroll, s.top + s.height - vh);
    return { id: s.id, top: s.top, bottom: Math.max(s.top + 1, bottom), start: CHAPTER_RANGES[s.id].start, stop: CHAPTER_RANGES[s.id].end };
  });
}

export function scrollYToProgress(y: number): number {
  if (!segs.length) return 0;
  if (y <= segs[0].top) return 0;
  for (const s of segs) {
    if (y < s.bottom) {
      const f = Math.min(1, Math.max(0, (y - s.top) / (s.bottom - s.top)));
      return s.start + f * (s.stop - s.start);
    }
  }
  return 1;
}

export function progressToScrollY(p: number): number {
  if (!segs.length) return 0;
  for (const s of segs) {
    if (p < s.stop) {
      const f = Math.min(1, Math.max(0, (p - s.start) / (s.stop - s.start)));
      return s.top + f * (s.bottom - s.top);
    }
  }
  return segs[segs.length - 1].bottom;
}

/**
 * Lenis smooth scroll + one master ScrollTrigger that pushes journey progress.
 * No snap: navigation to chapters is explicit (menu, rail, CTAs).
 */
export function useScrollDriver(reduced: boolean, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, touchMultiplier: 1.3 });
      lenisInstance = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    measureChapters();
    const onResize = () => measureChapters();
    window.addEventListener('resize', onResize);
    ScrollTrigger.addEventListener('refresh', onResize);

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        const y = self.scroll();
        useJourney.getState().setProgress(scrollYToProgress(y), self.getVelocity() / 1000);
      }
    });

    useJourney.getState().setProgress(scrollYToProgress(window.scrollY), 0);

    // One wheel notch = one chapter. Wheel events only come from mice/trackpads, so
    // touch stays native by construction. Flow chapters (taller than a screen)
    // scroll natively until their edge.
    let stepLock = 0;
    let lastWheel = 0;
    const tryStep = (dir: 1 | -1, e?: Event) => {
      const st = useJourney.getState();
      if (!st.ready || st.menuOpen || st.sixtyOpen || st.warping) return;
      const sec = document.querySelector<HTMLElement>(`[data-chapter="${st.chapter}"]`);
      if (sec?.dataset.layout === 'flow') {
        const r = sec.getBoundingClientRect();
        const canDown = r.bottom > window.innerHeight + 2;
        const canUp = r.top < -2;
        if ((dir > 0 && canDown) || (dir < 0 && canUp)) return; // let native scroll read the chapter
      }
      const idx = CHAPTERS.indexOf(st.chapter);
      const next = idx + dir;
      if (next < 0 || next >= CHAPTERS.length) return; // footer stays reachable natively
      e?.preventDefault();
      if (e && 'stopImmediatePropagation' in e) e.stopImmediatePropagation();
      const now = performance.now();
      if (now < stepLock) return;
      stepLock = now + 700;
      scrollToProgress(CHAPTER_RANGES[CHAPTERS[next]].start);
    };
    const onWheel = (e: WheelEvent) => {
      if (reduced) return;
      // normalise: Firefox reports lines (deltaMode 1) with |deltaY| ≈ 3
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (Math.abs(dy) < 1) return;
      const now = performance.now();
      // trackpad inertia: a burst of events right after a step must not fire a second step
      const burst = now - lastWheel < 90;
      lastWheel = now;
      if (burst && now < stepLock + 400) {
        e.preventDefault();
        return;
      }
      tryStep(dy > 0 ? 1 : -1, e);
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') tryStep(1, e);
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') tryStep(-1, e);
    };
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
      window.removeEventListener('keydown', onKey);
      st.kill();
      window.removeEventListener('resize', onResize);
      ScrollTrigger.removeEventListener('refresh', onResize);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenisInstance = null;
    };
  }, [reduced, enabled]);
}

/** Smooth-scroll the page to a journey progress value (chapter start). */
export function scrollToProgress(progress: number, immediate = false) {
  measureChapters();
  const top = progressToScrollY(progress) + 2;
  if (lenisInstance) lenisInstance.scrollTo(top, immediate ? { immediate: true } : { duration: 1.0, easing: (t) => 1 - Math.pow(1 - t, 3) });
  else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
}

export function lockScroll(locked: boolean) {
  if (lenisInstance) locked ? lenisInstance.stop() : lenisInstance.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
