'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { writeVersionPref } from '@/lib/version';
import gsap from 'gsap';
import { useJourney } from '@/lib/journey/store';
import { CHAPTERS } from '@/lib/journey/timeline';
import { lockScroll } from '@/lib/journey/useScrollDriver';
import { goToChapter } from '@/lib/journey/navigate';
import { CHAPTER_ACCENT } from '@/content/planets';

/** Full-screen chapter menu. The big label is the project/section; the planet is the small caption. */
export default function MenuOverlay() {
  const t = useTranslations('menu');
  const locale = useLocale();
  const tc = useTranslations('chapters');
  const open = useJourney((s) => s.menuOpen);
  const chapter = useJourney((s) => s.chapter);
  const setOpen = useJourney((s) => s.setMenuOpen);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = list.current?.querySelectorAll('li') ?? [];
    if (open) {
      lockScroll(true);
      gsap.set(el, { pointerEvents: 'auto' });
      gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(items, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, delay: 0.3, ease: 'power3.out' });
      window.setTimeout(() => firstLink.current?.focus(), 400);
    } else {
      gsap.to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: () => gsap.set(el, { pointerEvents: 'none' }) });
      gsap.to(items, { opacity: 0, duration: 0.2 });
      lockScroll(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && root.current) {
        const f = root.current.querySelectorAll<HTMLElement>('a, button');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <div
      ref={root}
      id="menu-overlay"
      data-menu-overlay
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className="pointer-events-none fixed inset-0 z-[90] flex items-center bg-[#030305]/94 backdrop-blur-2xl"
      style={{ clipPath: 'inset(0 0 100% 0)' }}
    >
      <ul ref={list} className="w-full px-6 md:px-[8vw]">
        {CHAPTERS.map((id, i) => (
          <li key={id} className="hairline-b py-2 md:py-3">
            <a
              ref={i === 0 ? firstLink : undefined}
              href={`#${id}`}
              data-cursor="link"
              aria-label={`${t(id)} — ${tc(id)}`}
              aria-current={chapter === id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                window.setTimeout(() => goToChapter(id), 250);
              }}
              className="group flex items-baseline justify-between gap-6 outline-none"
              style={{ ['--row-accent' as string]: CHAPTER_ACCENT[id] }}
            >
              <span className="flex items-baseline gap-4 md:gap-8">
                <span className="font-mono text-[11px] tabular-nums text-fg/40 transition-colors group-hover:text-[var(--row-accent)] group-focus-visible:text-[var(--row-accent)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="font-display text-[clamp(1.7rem,5.6vw,4.4rem)] font-bold uppercase leading-[0.95] tracking-tightest transition-colors duration-500 group-hover:text-[var(--row-accent)] group-focus-visible:text-[var(--row-accent)]"
                  style={{ color: chapter === id ? CHAPTER_ACCENT[id] : undefined }}
                >
                  {t(id)}
                </span>
              </span>
              <span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-wider2 text-fg/45 sm:flex">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: CHAPTER_ACCENT[id] }} />
                {tc(id)}
              </span>
            </a>
          </li>
        ))}
        <li className="pt-5 md:pt-7">
          <a
            href={`/${locale}/classic/`}
            data-cursor="link"
            data-classic-link
            onClick={() => writeVersionPref('classic')}
            className="font-mono text-[11px] uppercase tracking-wider2 text-fg/60 transition-colors hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
          >
            {t('classic')} →
          </a>
        </li>
      </ul>
      <div
        role="group"
        aria-label={t('tools')}
        className="absolute bottom-6 left-6 flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider2 text-fg/50 md:bottom-8 md:left-[8vw]"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          type="button"
          data-cursor="link"
          onClick={() => {
            setOpen(false);
            useJourney.getState().setMissionOpen(true);
          }}
          className="u-link transition-colors hover:text-fg"
        >
          {t('mission')}
        </button>
        <button
          type="button"
          data-cursor="link"
          onClick={() => {
            setOpen(false);
            window.setTimeout(() => useJourney.getState().setPhotoMode(true), 300);
          }}
          className="u-link transition-colors hover:text-fg"
        >
          {t('photo')}
        </button>
      </div>
    </div>
  );
}
