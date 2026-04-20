'use client';

import { useSyncExternalStore } from 'react';

export type SectionId = 'hero' | 'projects' | 'about' | 'expertise' | 'contact' | 'footer';
export const SECTION_ORDER: SectionId[] = ['hero', 'projects', 'about', 'expertise', 'contact', 'footer'];

let current: SectionId = 'hero';
let progress = 0; // 0..1 scroll progress across the whole page
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setActiveSection(id: SectionId) {
  if (id !== current) {
    current = id;
    emit();
  }
}

export function setScrollProgress(p: number) {
  const clamped = Math.min(1, Math.max(0, p));
  if (Math.abs(clamped - progress) > 0.001) {
    progress = clamped;
    emit();
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useActiveSection(): SectionId {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current
  );
}

export function useScrollProgress(): number {
  return useSyncExternalStore(
    subscribe,
    () => progress,
    () => progress
  );
}

export function getActiveSectionIndex(id: SectionId) {
  return SECTION_ORDER.indexOf(id);
}
