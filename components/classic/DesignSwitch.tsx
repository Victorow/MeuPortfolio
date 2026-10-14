'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { DESIGN_KEY, isDesign, type Design } from '@/lib/classic/design';

type Phase = 'idle' | 'out' | 'pre-in';

/**
 * Floating "A · Papel | B · Dossiê" pill. Only the active design is in the DOM (no duplicate ids or h1).
 * Static HTML ships design A; the boot script in the classic layout sets html[data-design] before paint
 * (hash #a/#b, then localStorage) and this component swaps to B right after hydration.
 * Switching uses the View Transitions API when available, else a 600 ms crossfade + 24px drift + blur.
 */
export default function DesignSwitch({ a, b, labels }: { a: ReactNode; b: ReactNode; labels: { group: string; a: string; b: string } }) {
  const [design, setDesign] = useState<Design>('a');
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const busy = useRef(false);
  // A request made mid-transition is queued (latest wins) and runs when the current one ends.
  const pending = useRef<Design | null>(null);
  const switchRef = useRef<(d: Design) => void>(() => {});
  const done = useCallback(() => {
    busy.current = false;
    const next = pending.current;
    pending.current = null;
    if (next) switchRef.current(next);
  }, []);

  const apply = useCallback((next: Design) => {
    flushSync(() => setDesign(next));
    document.documentElement.setAttribute('data-design', next);
  }, []);

  const switchTo = useCallback(
    (next: Design) => {
      if (busy.current) {
        pending.current = next;
        return;
      }
      if (document.documentElement.getAttribute('data-design') === next) return;
      try {
        window.localStorage.setItem(DESIGN_KEY, next);
      } catch {
        /* not persisted */
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return apply(next);

      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void>; ready: Promise<void>; updateCallbackDone: Promise<void> };
      };
      if (typeof doc.startViewTransition === 'function') {
        busy.current = true;
        const vt = doc.startViewTransition(() => apply(next));
        // The swap itself always runs; an aborted animation (e.g. viewport resize) only skips the effect.
        const ignore = () => {};
        vt.ready.catch(ignore);
        vt.updateCallbackDone.catch(ignore);
        vt.finished.catch(ignore).finally(done);
        return;
      }

      busy.current = true;
      setPhase('out');
      window.setTimeout(() => {
        flushSync(() => setPhase('pre-in'));
        apply(next);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setPhase('idle');
            window.setTimeout(done, 320);
          })
        );
      }, 300);
    },
    [apply, done]
  );
  switchRef.current = switchTo;

  // Adopt what the boot script decided (hash or stored preference), without animation.
  useEffect(() => {
    const boot = document.documentElement.getAttribute('data-design');
    if (isDesign(boot) && boot !== 'a') apply(boot);
    setMounted(true);
  }, [apply]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'b') switchTo(k);
    };
    const onHash = () => {
      const h = window.location.hash.slice(1).toLowerCase();
      if (isDesign(h)) switchTo(h);
    };
    // Print: expand every project and answer so the PDF/paper copy is complete.
    const onPrint = () => document.querySelectorAll('details').forEach((d) => (d.open = true));
    window.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('beforeprint', onPrint);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('beforeprint', onPrint);
    };
  }, [switchTo]);

  return (
    <>
      <div className="ds-stage" data-phase={phase}>
        {design === 'a' ? a : b}
      </div>
      <div className="ds-pill" role="group" aria-label={labels.group} hidden={!mounted} data-design-switch>
        <button type="button" aria-pressed={design === 'a'} aria-keyshortcuts="A" onClick={() => switchTo('a')}>
          {labels.a}
        </button>
        <button type="button" aria-pressed={design === 'b'} aria-keyshortcuts="B" onClick={() => switchTo('b')}>
          {labels.b}
        </button>
      </div>
    </>
  );
}
