'use client';

import { useSyncExternalStore } from 'react';

let pending = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setLocaleTransitionPending(v: boolean) {
  if (pending === v) return;
  pending = v;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLocaleTransitionPending(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => pending,
    () => false
  );
}
