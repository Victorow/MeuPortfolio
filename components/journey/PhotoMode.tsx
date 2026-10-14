'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useJourney } from '@/lib/journey/store';
import { CHAPTERS, chapterIndex } from '@/lib/journey/timeline';
import { captureFrame } from '@/lib/journey/glRef';
import type { ChapterId } from '@/content/planets';

const SCALE = 2;

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

type Caption = { kicker: string; title: string; accent?: string };

/** Draw the chapter caption onto the captured frame (offscreen 2D canvas, no dependency). */
async function compose(blob: Blob, cap: Caption): Promise<Blob | null> {
  const img = await createImageBitmap(blob);
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  if (!ctx) return blob;
  ctx.drawImage(img, 0, 0);
  img.close?.();
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
  const css = getComputedStyle(document.documentElement);
  const display = css.getPropertyValue('--font-display').trim() || 'sans-serif';
  const mono = css.getPropertyValue('--font-mono').trim() || 'monospace';
  const pad = Math.round(c.width * 0.05);
  const big = Math.round(Math.min(c.width * 0.07, c.height * 0.12));
  const small = Math.max(14, Math.round(big * 0.2));
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = big * 0.25;
  let y = c.height - pad;
  ctx.font = `700 ${big}px ${display}`;
  ctx.fillStyle = '#F2F2F0';
  if (cap.accent) {
    ctx.fillStyle = '#5FA8FF';
    ctx.fillText(cap.accent.toUpperCase(), pad, y);
    y -= big * 0.95;
    ctx.fillStyle = '#F2F2F0';
  }
  ctx.fillText(cap.title.toUpperCase(), pad, y);
  y -= big * 0.95 + small * 0.6;
  ctx.font = `500 ${small}px ${mono}`;
  ctx.fillStyle = 'rgba(242,242,240,0.75)';
  ctx.fillText(cap.kicker.toUpperCase(), pad, y);
  return new Promise((resolve) => c.toBlob((b) => resolve(b), 'image/png'));
}

/**
 * Photo mode (key P or menu "Foto"): every piece of UI hides and a minimal bar
 * captures the current frame at 2× as a PNG, optionally with the chapter title.
 */
export default function PhotoMode() {
  const t = useTranslations('photo');
  const th = useTranslations('hero');
  const tm = useTranslations('menu');
  const tc = useTranslations('chapters');
  const active = useJourney((s) => s.photoMode);
  const setActive = useJourney((s) => s.setPhotoMode);
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;
    const measure = () => setSize({ w: Math.round(window.innerWidth * SCALE), h: Math.round(window.innerHeight * SCALE) });
    measure();
    window.addEventListener('resize', measure);
    const id = window.setTimeout(() => first.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', measure);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, setActive]);

  if (!active) return null;

  const caption = (id: ChapterId): Caption => {
    const n = `${String(chapterIndex(id) + 1).padStart(2, '0')} / ${String(CHAPTERS.length).padStart(2, '0')}`;
    if (id === 'earth') return { kicker: th('eyebrow'), title: th('name1'), accent: th('name2') };
    return { kicker: `${n} — ${tc(id)}`, title: tm(id) };
  };

  const shoot = async (withText: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const chapter = useJourney.getState().chapter;
      let blob = await captureFrame(SCALE);
      if (blob && withText) blob = await compose(blob, caption(chapter));
      if (blob) download(blob, `victor-augusto-${chapter}.png`);
    } finally {
      setBusy(false);
    }
  };

  const btn =
    'rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-wider2 transition-colors duration-300 disabled:opacity-50';

  return (
    <div
      data-photo-bar
      role="toolbar"
      aria-label={t('label')}
      className="fixed bottom-5 left-1/2 z-[96] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap border border-white/10 bg-[#030305]/70 px-2.5 py-2 backdrop-blur-md"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <button ref={first} type="button" disabled={busy} onClick={() => shoot(false)} className={`${btn} bg-fg text-bg hover:bg-[#5FA8FF]`}>
        {busy ? t('busy') : t('capture')}
      </button>
      <button type="button" disabled={busy} onClick={() => shoot(true)} className={`${btn} border border-white/20 text-fg hover:border-[#5FA8FF] hover:text-[#5FA8FF]`}>
        {t('withText')}
      </button>
      <button type="button" onClick={() => setActive(false)} className={`${btn} border border-white/20 text-fg hover:border-[#5FA8FF] hover:text-[#5FA8FF]`}>
        {t('back')}
      </button>
      <span className="ml-1 hidden font-mono text-[10px] uppercase tracking-wider2 text-fg/40 sm:inline">{t('meta', { w: size.w, h: size.h })}</span>
    </div>
  );
}
