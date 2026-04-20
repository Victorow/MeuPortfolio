'use client';

import { useEffect } from 'react';
import { getLenis } from '@/lib/lenis';

/**
 * Hijacks wheel / touch / keyboard input to snap to the next or previous
 * section via Lenis. Any intent to scroll moves by one full section.
 *
 * - Wheel events are captured with `{ passive: false, capture: true }` so
 *   this handler runs BEFORE Lenis and can preventDefault the browser's
 *   native scroll entirely.
 * - Uses Lenis.scrollTo() for the smooth animated jump.
 * - Opt out with [data-no-snap] on any element inside a scrollable region.
 */
export default function ScrollSnap() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let isAnimating = false;
    let lastTriggerTs = 0;
    const COOLDOWN = 850; // ms between snaps

    let touchStartY: number | null = null;

    function snapTargets(): HTMLElement[] {
      return Array.from(document.querySelectorAll<HTMLElement>('[data-snap]'));
    }

    function currentIndex(targets: HTMLElement[]): number {
      // Use a probe just below the top of the viewport so "you are in section X"
      // means section X's top is at/above the probe.
      const probe = window.scrollY + window.innerHeight * 0.35;
      let idx = 0;
      for (let i = 0; i < targets.length; i++) {
        const top = targets[i].getBoundingClientRect().top + window.scrollY;
        if (probe >= top - 4) idx = i;
      }
      return idx;
    }

    function go(direction: 1 | -1) {
      const now = performance.now();
      if (isAnimating || now - lastTriggerTs < COOLDOWN) return;
      const lenis = getLenis();
      const targets = snapTargets();
      if (!targets.length) return;

      const cur = currentIndex(targets);
      const nextIdx = Math.min(targets.length - 1, Math.max(0, cur + direction));
      if (nextIdx === cur) return;
      const target = targets[nextIdx];
      if (!target) return;

      lastTriggerTs = now;
      isAnimating = true;
      const onDone = () => {
        // Small tail cooldown to absorb residual wheel inertia from trackpads
        window.setTimeout(() => {
          isAnimating = false;
        }, 120);
      };

      if (lenis) {
        lenis.scrollTo(target, {
          duration: 1.1,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          onComplete: onDone
        });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(onDone, 1000);
      }
    }

    function onWheel(e: WheelEvent) {
      // Let inner scrollable widgets keep their native behavior
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-no-snap]')) return;

      // Only hijack predominantly vertical intents
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      // Always swallow the event so the browser does not scroll natively
      // and Lenis does not receive it either. This is the key to making
      // "every scroll = one section" reliable with trackpads and mice.
      e.preventDefault();
      e.stopPropagation();

      if (isAnimating) return;

      if (e.deltaY > 0) go(1);
      else if (e.deltaY < 0) go(-1);
    }

    function onKey(e: KeyboardEvent) {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        const targets = snapTargets();
        const lenis = getLenis();
        if (targets[0] && lenis) lenis.scrollTo(targets[0], { duration: 1.2 });
      } else if (e.key === 'End') {
        e.preventDefault();
        const targets = snapTargets();
        const lenis = getLenis();
        const last = targets[targets.length - 1];
        if (last && lenis) lenis.scrollTo(last, { duration: 1.2 });
      }
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0]?.clientY ?? null;
    }
    function onTouchMove(e: TouchEvent) {
      // Block native scroll while we own navigation
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-no-snap]')) return;
      if (e.cancelable) e.preventDefault();
    }
    function onTouchEnd(e: TouchEvent) {
      if (touchStartY == null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY;
      const dy = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(dy) < 40) return;
      if (dy > 0) go(1);
      else go(-1);
    }

    // Capture-phase wheel listener so we run BEFORE Lenis / body handlers
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true } as AddEventListenerOptions);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return null;
}
