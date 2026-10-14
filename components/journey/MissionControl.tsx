'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProgress } from '@react-three/drei';
import { useJourney } from '@/lib/journey/store';
import { chapterIndex } from '@/lib/journey/timeline';
import { forceTier, usePerfTier, type PerfTier } from '@/lib/device';
import { fpsStats, glRef, rendererString } from '@/lib/journey/glRef';
import { getLastSoundEvent } from '@/lib/audio';
import manifest from '@/public/textures/manifest.json';

const REPO = 'https://github.com/Victorow/MeuPortfolio';
const MANIFEST_COUNT = Object.keys(manifest).length;
const TIERS: PerfTier[] = ['high', 'mid', 'low'];

type Snapshot = {
  fps: number;
  min: number;
  renderer: string;
  progress: number;
  loaded: number;
  total: number;
  bytes: number;
  calls: number;
  tris: number;
  w: number;
  h: number;
  dpr: number;
  last: string;
};

function textureBytes() {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return 0;
  let sum = 0;
  for (const e of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
    if (e.name.includes('/textures/')) sum += e.transferSize || e.encodedBodySize || e.decodedBodySize || 0;
  }
  return sum;
}

const fmtBytes = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} kB`);
const fmtTris = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n));

function snapshot(): Snapshot {
  const gl = glRef.gl;
  const { avg, min } = fpsStats(performance.now());
  const canvas = gl?.domElement;
  return {
    fps: avg,
    min,
    renderer: rendererString(),
    progress: useJourney.getState().progress,
    loaded: useProgress.getState().loaded,
    total: useProgress.getState().total,
    bytes: textureBytes(),
    calls: glRef.calls,
    tris: glRef.triangles,
    w: canvas?.width ?? 0,
    h: canvas?.height ?? 0,
    dpr: gl?.getPixelRatio() ?? 0,
    last: getLastSoundEvent()
  };
}

/**
 * Mission Control: live rendering stats for the curious (toggle with ~ or `,
 * or from the menu). Polls 4×/s instead of re-rendering every frame.
 */
export default function MissionControl() {
  const t = useTranslations('mission');
  const tc = useTranslations('chapters');
  const open = useJourney((s) => s.missionOpen);
  const setOpen = useJourney((s) => s.setMissionOpen);
  const chapter = useJourney((s) => s.chapter);
  const soundOn = useJourney((s) => s.soundOn);
  const tier = usePerfTier();
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!open) return;
    setSnap(snapshot());
    const id = window.setInterval(() => setSnap(snapshot()), 250);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open || !snap) return null;

  const v = (x: string | number) => <span className="text-fg">{x}</span>;

  return (
    <aside
      data-mission-control
      aria-label={t('title')}
      className="fixed bottom-20 right-4 z-[75] w-[min(320px,calc(100vw-32px))] border border-white/10 bg-[#030305]/70 p-3 font-mono text-[11px] leading-[1.7] text-fg/55 backdrop-blur-md md:bottom-7 md:right-[3vw]"
    >
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-wider2 text-fg">{t('title')}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t('close')}
          data-cursor="link"
          className="text-fg/40 transition-colors hover:text-[#5FA8FF]"
        >
          {t('hint')}
        </button>
      </div>
      <div aria-live="off">
        <div>
          {t('fps')} {v(Math.round(snap.fps))} · {t('min')} {v(Math.round(snap.min))}
        </div>
        <div className="truncate" title={snap.renderer}>
          {t('gpu')} {v(tier)} · {snap.renderer}
        </div>
        <div>
          {t('chapter')} {v(`${String(chapterIndex(chapter) + 1).padStart(2, '0')} ${tc(chapter).toLowerCase()}`)} · {t('progress')} {v(snap.progress.toFixed(3))}
        </div>
        <div>
          {t('textures')} {v(`${snap.loaded}/${Math.max(snap.total, MANIFEST_COUNT)}`)} · {fmtBytes(snap.bytes)}
        </div>
        <div>
          {t('draws')} {v(snap.calls)} · {t('tris')} {v(fmtTris(snap.tris))}
        </div>
        <div>
          {t('canvas')} {v(`${snap.w}×${snap.h} @${snap.dpr.toFixed(2)}`)} · {t('sound')} {v(soundOn ? t('on') : t('off'))} · {t('last')} {v(snap.last)}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span>{t('tier')}</span>
          {TIERS.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={tier === x}
              aria-label={t('forceTier', { tier: x })}
              data-cursor="link"
              onClick={() => forceTier(x)}
              className={`border px-2 leading-[1.6] transition-colors ${
                tier === x ? 'border-[#5FA8FF] text-[#5FA8FF]' : 'border-white/15 text-fg/70 hover:border-fg/50'
              }`}
            >
              {x}
            </button>
          ))}
        </div>
        <a href={REPO} target="_blank" rel="noopener noreferrer" data-cursor="link" className="mt-1 block text-fg/40 transition-colors hover:text-[#5FA8FF]">
          {t('footer')} ↗
        </a>
      </div>
    </aside>
  );
}
