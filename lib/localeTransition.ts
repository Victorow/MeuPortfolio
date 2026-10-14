'use client';

import { useSyncExternalStore } from 'react';

/**
 * Locale switch choreography: the overlay wipes in (same look as the preloader),
 * then the full navigation happens. The new page opens on the preloader, so the
 * two black screens read as one continuous transition.
 */
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

export const LOCALE_WIPE_MS = 720;

export function beginLocaleTransition(navigate: () => void) {
  try {
    sessionStorage.setItem('vp:localeSwitch', '1');
  } catch {
    /* ignore */
  }
  setLocaleTransitionPending(true);
  window.setTimeout(navigate, LOCALE_WIPE_MS);
}

/** True on the first render after a locale switch (lets the preloader skip its minimum dwell). */
export function consumeLocaleSwitchFlag(): boolean {
  try {
    const v = sessionStorage.getItem('vp:localeSwitch') === '1';
    sessionStorage.removeItem('vp:localeSwitch');
    return v;
  } catch {
    return false;
  }
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
