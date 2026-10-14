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
import SixtySeconds from './SixtySeconds';
import MissionControl from './MissionControl';
import PhotoMode from './PhotoMode';
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
    if (ready && !useJourney.getState().warping) whoosh(chapter);
  }, [chapter, ready]);

  // Deep link / locale switch: #chapter → jump there once the journey is ready.
  useEffect(() => {
    if (!ready) return;
    if (window.location.hash === '#60s') {
      useJourney.getState().setSixtyOpen(true);
      return;
    }
    const id = window.location.hash.replace('#', '') as ChapterId;
    if (!CHAPTERS.includes(id) || id === 'earth') return;
    scrollToProgress(rangeOf(id).start, true);
  }, [ready]);

  // Tool keys: ~ or ` toggles Mission Control, P toggles photo mode. Neither opens over the 60s summary.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      const s = useJourney.getState();
      if (!s.ready || s.sixtyOpen || s.menuOpen) return;
      const tilde = e.key === '~' || e.key === '`' || e.code === 'Backquote' || (e.key === 'Dead' && e.code === 'Quote');
      if (tilde) {
        e.preventDefault();
        s.setMissionOpen(!s.missionOpen);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        s.setPhotoMode(!s.photoMode);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const photo = useJourney((s) => s.photoMode);

  // ?poster=1 → scene only (used by scripts/posters.mjs to render fallback posters)
  const [poster, setPoster] = useState(false);
  useEffect(() => {
    setPoster(new URLSearchParams(window.location.search).get('poster') === '1');
  }, []);

  return (
    <>
      <SpaceScene />
      <Preloader />
      {!poster && !photo && <Header />}
      {!poster && <MenuOverlay />}
      <main className="relative z-10" style={poster ? { opacity: 0 } : photo ? { visibility: 'hidden' } : undefined}>
        {children}
      </main>
      {!poster && !photo && <ChapterIndicator />}
      {!poster && !photo && <ProgressRail />}
      {!poster && <WarpOverlay />}
      {!poster && !photo && <CustomCursor />}
      {!poster && <SixtySeconds />}
      {!poster && !photo && <MissionControl />}
      {!poster && <PhotoMode />}
      <LocaleTransition locale={locale} />
    </>
  );
}
