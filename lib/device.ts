'use client';

import { useEffect, useState } from 'react';

export type PerfTier = 'high' | 'mid' | 'low';

let cachedTier: PerfTier | null = null;

export function detectPerfTier(): PerfTier {
  if (cachedTier) return cachedTier;
  if (typeof window === 'undefined') return 'mid';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;
  const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  let t: PerfTier = 'high';
  if (mobile || cores < 8 || mem < 8) t = 'mid';
  if (reduced || cores <= 2 || mem <= 2) t = 'low';
  cachedTier = t;
  return t;
}

/** Runtime downgrade (PerformanceMonitor). Only ever lowers the tier. */
export function downgradeTier() {
  if (cachedTier === 'high') cachedTier = 'mid';
  else if (cachedTier === 'mid') cachedTier = 'low';
  listeners.forEach((l) => l(cachedTier!));
}

/** Manual override (Mission Control): sets the tier live, up or down. */
export function forceTier(t: PerfTier) {
  cachedTier = t;
  listeners.forEach((l) => l(t));
}

const listeners = new Set<(t: PerfTier) => void>();

export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>(() => (typeof window === 'undefined' ? 'mid' : detectPerfTier()));
  useEffect(() => {
    setTier(detectPerfTier());
    listeners.add(setTier);
    return () => {
      listeners.delete(setTier);
    };
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

let webglCache: boolean | null = null;
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  if (typeof document === 'undefined') return true;
  try {
    const c = document.createElement('canvas');
    webglCache = !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

export function useHasWebGL(): boolean {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(hasWebGL()), []);
  return ok;
}

export function useIsMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setM(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return m;
}
