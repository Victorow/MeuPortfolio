'use client';

import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { useJourney } from '@/lib/journey/store';
import { lockScroll } from '@/lib/journey/useScrollDriver';
import { useHasWebGL } from '@/lib/device';
import { consumeLocaleSwitchFlag } from '@/lib/localeTransition';

const MIN_VISIBLE_MS = 900;
const MAX_WAIT_MS = 20000;

/**
 * Counter 000→100 while chapter-1 textures load. Hands off to the journey
 * (store.ready) with a wipe, then unmounts.
 */
export default function Preloader() {
  const t = useTranslations('preloader');
  const { progress, active } = useProgress();
  const webgl = useHasWebGL();
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const shown = useRef(0);
  const mounted = useRef(performance.now());
  const done = useRef(false);
  // Arriving from a locale switch: textures are cached, so hand off as soon as they are in.
  const minVisible = useRef(MIN_VISIBLE_MS);
  useEffect(() => {
    if (consumeLocaleSwitchFlag()) minVisible.current = 250;
  }, []);

  useEffect(() => {
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  // Smoothly animate the displayed number towards the real progress.
  useEffect(() => {
    const target = webgl ? progress : 100;
    const obj = { v: shown.current };
    const tween = gsap.to(obj, {
      v: target,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        shown.current = obj.v;
        if (counter.current) counter.current.textContent = String(Math.round(obj.v)).padStart(3, '0');
        if (bar.current) bar.current.style.transform = `scaleX(${obj.v / 100})`;
      }
    });
    return () => {
      tween.kill();
    };
  }, [progress, webgl]);

  useEffect(() => {
    if (done.current) return;
    const complete = !webgl || (progress >= 100 && !active);
    const elapsed = performance.now() - mounted.current;
    const fire = () => {
      if (done.current) return;
      done.current = true;
      const el = root.current;
      const tl = gsap.timeline({
        onComplete: () => {
          useJourney.getState().setReady(true);
          lockScroll(false);
          setGone(true);
        }
      });
      tl.to(counter.current, { scale: 0.92, opacity: 0, duration: 0.45, ease: 'power3.in' }, 0)
        .to(bar.current, { opacity: 0, duration: 0.3 }, 0)
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, 0.25);
    };
    let timer: number | undefined;
    if (complete) timer = window.setTimeout(fire, Math.max(0, minVisible.current - elapsed));
    else timer = window.setTimeout(fire, Math.max(0, MAX_WAIT_MS - elapsed));
    return () => window.clearTimeout(timer);
  }, [progress, active, webgl]);

  if (gone) return null;

  return (
    <div
      ref={root}
      data-preloader
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030305] text-fg"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div ref={counter} className="font-display text-[clamp(5rem,22vw,16rem)] font-bold leading-none tracking-tightest tabular-nums">
        000
      </div>
      <div className="mt-6 h-px w-[min(60vw,420px)] overflow-hidden bg-white/10">
        <div ref={bar} className="h-full w-full origin-left bg-fg" style={{ transform: 'scaleX(0)' }} />
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-wider3 text-fg/50">{t('caption')}</p>
    </div>
  );
}
