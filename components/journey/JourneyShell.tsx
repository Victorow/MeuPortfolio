'use client';

import { useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useScrollDriver, scrollToProgress } from '@/lib/journey/useScrollDriver';
import { useJourney } from '@/lib/journey/store';
import { CHAPTERS, rangeOf } from '@/lib/journey/timeline';
import { useReducedMotion } from '@/lib/device';
import { CHAPTER_ACCENT, type ChapterId } from '@/content/planets';
import { readSoundPref, setSound, whoosh } from '@/lib/audio';
import Preloader from './Preloader';
import Header from './Header';
import MenuOverlay from './MenuOverlay';
import ChapterIndicator from './ChapterIndicator';
import ProgressRail from './ProgressRail';
import CustomCursor from './CustomCursor';
import WarpOverlay from './WarpOverlay';
import LocaleTransition from '@/components/ui/LocaleTransition';

const SpaceScene = dynamic(() => import('@/components/scene/SpaceScene'), { ssr: false });

/** Client shell: scene, scroll driver, chrome, accent variable, sound side effects. */
export default function JourneyShell({ children, locale }: { children: ReactNode; locale: string }) {
  const reduced = useReducedMotion();
  const ready = useJourney((s) => s.ready);
  const chapter = useJourney((s) => s.chapter);
  const soundOn = useJourney((s) => s.soundOn);

  useScrollDriver(reduced, true);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', CHAPTER_ACCENT[chapter]);
  }, [chapter]);

  // restore sound preference once the user has interacted (autoplay policy)
  useEffect(() => {
    if (!readSoundPref()) return;
    const arm = () => {
      useJourney.getState().setSoundOn(true);
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
    };
    window.addEventListener('pointerdown', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
    };
  }, []);

  useEffect(() => {
    setSound(soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (ready) whoosh();
  }, [chapter, ready]);

  // Deep link / locale switch: #chapter → jump there once the journey is ready.
  useEffect(() => {
    if (!ready) return;
    const id = window.location.hash.replace('#', '') as ChapterId;
    if (!CHAPTERS.includes(id) || id === 'earth') return;
    scrollToProgress(rangeOf(id).start, true);
  }, [ready]);

  // ?poster=1 → scene only (used by scripts/posters.mjs to render fallback posters)
  const [poster, setPoster] = useState(false);
  useEffect(() => {
    setPoster(new URLSearchParams(window.location.search).get('poster') === '1');
  }, []);

  return (
    <>
      <SpaceScene />
      <Preloader />
      {!poster && <Header />}
      {!poster && <MenuOverlay />}
      <main className="relative z-10" style={poster ? { opacity: 0 } : undefined}>
        {children}
      </main>
      {!poster && <ChapterIndicator />}
      {!poster && <ProgressRail />}
      {!poster && <WarpOverlay />}
      {!poster && <CustomCursor />}
      <LocaleTransition locale={locale} />
    </>
  );
}
