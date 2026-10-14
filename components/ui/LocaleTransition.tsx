'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLocaleTransitionPending, LOCALE_WIPE_MS } from '@/lib/localeTransition';

/**
 * Wipe-in overlay for the locale switch. Visually identical to the preloader's
 * background, so the hand-off to the next page's preloader is seamless.
 */
export default function LocaleTransition({ locale }: { locale: string }) {
  const pending = useLocaleTransitionPending();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !pending) return;
    gsap.set(el, { pointerEvents: 'auto' });
    const tl = gsap.timeline();
    tl.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: LOCALE_WIPE_MS / 1000, ease: 'expo.inOut' }, 0).fromTo(
      label.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
      0.3
    );
    return () => {
      tl.kill();
    };
  }, [pending]);

  return (
    <div
      ref={root}
      aria-hidden
      data-locale-transition
      className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center bg-[#030305]"
      style={{ clipPath: 'inset(100% 0 0 0)' }}
    >
      <div ref={label} className="font-mono text-[11px] uppercase tracking-wider3 text-fg/50 opacity-0">
        {locale === 'pt-BR' ? 'switching to english' : 'mudando para português'}
      </div>
    </div>
  );
}
