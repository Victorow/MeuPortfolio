'use client';

import { useEffect, useState } from 'react';

export type PerfTier = 'high' | 'mid' | 'low';

export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>('mid');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

    let t: PerfTier = 'high';
    if (mobile || cores <= 4 || mem <= 4) t = 'mid';
    if (reduced || cores <= 2 || mem <= 2) t = 'low';
    setTier(t);
  }, []);

  return tier;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener?.('change', update);
    return () => m.removeEventListener?.('change', update);
  }, []);
  return reduced;
}
