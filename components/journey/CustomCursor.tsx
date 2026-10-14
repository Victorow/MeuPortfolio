'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/device';

/** Dot + lagging ring. Fine pointers only. Elements opt in with data-cursor="link". */
export default function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.body.classList.add('has-cursor');

    const xDot = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' });
    const yDot = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' });
    const xRing = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const yRing = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], a, button');
      const hot = !!target;
      const text = target?.getAttribute('data-cursor-label') ?? '';
      gsap.to(ring.current, { scale: hot ? 1.8 : 1, opacity: hot ? 0.9 : 0.55, duration: 0.35, ease: 'power3.out' });
      if (label.current) {
        label.current.textContent = text;
        gsap.to(label.current, { opacity: text ? 1 : 0, duration: 0.25 });
      }
    };
    const onDown = () => gsap.to(ring.current, { scale: 0.8, duration: 0.15 });
    const onUp = () => gsap.to(ring.current, { scale: 1, duration: 0.3 });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      document.body.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [reduced]);

  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 z-[120] ${enabled ? '' : 'hidden'}`}>
      <div ref={dot} className="absolute -left-[3px] -top-[3px] h-[6px] w-[6px] rounded-full bg-[var(--accent)] mix-blend-difference" />
      <div
        ref={ring}
        className="absolute -left-[18px] -top-[18px] flex h-[36px] w-[36px] items-center justify-center rounded-full border border-fg/70"
        style={{ opacity: 0.55 }}
      >
        <span ref={label} className="font-mono text-[9px] uppercase tracking-wider2 text-fg opacity-0" />
      </div>
    </div>
  );
}
