'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from '@/lib/lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // smoothWheel disabled — ScrollSnap hijacks wheel and calls lenis.scrollTo()
    // for every section-to-section jump. Lenis still powers the smooth animation
    // of scrollTo() and keeps other scroll sources smooth (drag, anchor clicks).
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      lerp: 0.1
    });
    setLenis(lenis);

    let raf = 0;
    function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
