'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useJourney } from '@/lib/journey/store';
import { lockScroll } from '@/lib/journey/useScrollDriver';
import { goToChapter } from '@/lib/journey/navigate';
import { click } from '@/lib/audio';
import { featuredProjects, SOCIAL, TODO, type Project } from '@/content/projects';

const BLUE = '#5FA8FF';
/** Preferred link per project in the summary: something a recruiter can open right away. */
const LINK_PREF = ['live', 'store', 'playStore', 'repo', 'marketplace'];

function primaryLink(p: Project): { key: string; url: string } | null {
  const entries = Object.entries(p.links).filter((e): e is [string, string] => !!e[1] && e[1] !== TODO);
  const rank = (k: string) => {
    const r = LINK_PREF.indexOf(k);
    return r < 0 ? LINK_PREF.length : r;
  };
  entries.sort((a, b) => rank(a[0]) - rank(b[0]));
  return entries[0] ? { key: entries[0][0], url: entries[0][1] } : null;
}

/**
 * "60 seconds" summary for recruiters: one screen with who, what, the three
 * strongest projects and every contact action. The scene freezes and blurs
 * behind it. Deep link: /{locale}/#60s.
 */
export default function SixtySeconds() {
  const t = useTranslations('sixty');
  const th = useTranslations('hero');
  const tp = useTranslations('projects');
  const tc = useTranslations('chapters');
  const open = useJourney((s) => s.sixtyOpen);
  const setOpen = useJourney((s) => s.setSixtyOpen);
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const featured = featuredProjects();

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    lockScroll(true);
    click();
    const id = window.setTimeout(() => closeBtn.current?.focus(), 60);
    return () => {
      window.clearTimeout(id);
      lockScroll(false);
      if (window.location.hash === '#60s') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === 'Tab' && root.current) {
        const f = root.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!root.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SOCIAL.email);
      setCopied(true);
    } catch {
      // clipboard blocked: select the address so the user can copy it by hand
      const el = root.current?.querySelector<HTMLElement>('[data-sixty-email]');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const pill =
    'inline-flex items-center rounded-full border border-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-wider2 text-fg transition-colors duration-300 hover:border-[#5FA8FF] hover:text-[#5FA8FF] focus-visible:border-[#5FA8FF]';

  return (
    <div
      ref={root}
      data-sixty
      role="dialog"
      aria-modal="true"
      aria-labelledby="sixty-title"
      data-lenis-prevent
      className="sixty fixed inset-0 z-[95] overflow-y-auto overscroll-contain bg-[#030305]/90 backdrop-blur-2xl md:overflow-hidden"
    >
      <div className="relative mx-auto flex min-h-full max-w-[1280px] flex-col px-5 pb-10 pt-6 md:h-full md:px-[6vw] md:pb-[5vh] md:pt-[4vh]">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-wider3" style={{ color: BLUE }}>
            {t('eyebrow')}
          </p>
          <button
            ref={closeBtn}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('close')}
            data-cursor="link"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-[#5FA8FF]"
          >
            <span className="absolute h-px w-4 rotate-45 bg-fg" />
            <span className="absolute h-px w-4 -rotate-45 bg-fg" />
          </button>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-1 gap-10 md:mt-0 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-[5vw]">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wider2 text-fg/60">{th('eyebrow')}</p>
            <h2 id="sixty-title" className="mt-3 font-display text-[clamp(2.6rem,6.4vw,6rem)] font-bold uppercase leading-[0.9] tracking-tightest text-fg">
              <span className="block">{th('name1')}</span>
              <span className="block" style={{ color: BLUE }}>
                {th('name2')}
              </span>
            </h2>
            <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-fg/80 md:text-[16px]">{t('pitch')}</p>

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
              <a href={`mailto:${SOCIAL.email}`} data-sixty-email data-cursor="link" className="u-link font-display text-[clamp(1.1rem,2vw,1.5rem)] font-bold text-fg">
                {SOCIAL.email}
              </a>
              <button
                type="button"
                onClick={copy}
                data-cursor="link"
                className="rounded-full bg-fg px-4 py-2 font-mono text-[11px] uppercase tracking-wider2 text-bg transition-colors duration-300 hover:bg-[#5FA8FF]"
              >
                <span aria-live="polite">{copied ? t('copied') : t('copy')}</span>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={SOCIAL.cv} download data-cursor="link" className={pill}>
                {t('cv')}
              </a>
              {SOCIAL.linkedin !== TODO && (
                <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" data-cursor="link" className={pill}>
                  {t('linkedin')} ↗
                </a>
              )}
            </div>

            <a
              href="#earth"
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="u-link mt-8 inline-block font-mono text-[11px] uppercase tracking-wider2 text-fg/60 hover:text-fg"
            >
              {t('explore')} →
            </a>
          </div>

          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wider2 text-fg/45">{t('featured')}</p>
            <ul className="mt-3">
              {featured.map((p) => {
                const link = primaryLink(p);
                return (
                  <li key={p.key} data-sixty-project className="hairline-t py-4 md:py-5">
                    <p className="font-mono text-[11px] uppercase tracking-wider2 text-fg/45">
                      {p.index} · {tc(p.planet)}
                    </p>
                    <h3 className="mt-1 font-display text-[clamp(1.25rem,2.2vw,1.8rem)] font-bold leading-tight text-fg">{tp(`items.${p.key}.title`)}</h3>
                    <p className="mt-1 text-[14px] leading-snug text-fg/70 md:truncate">{tp(`items.${p.key}.summary`)}</p>
                    {link ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="link"
                        className="u-link mt-2 inline-block font-mono text-[11px] uppercase tracking-wider2"
                        style={{ color: BLUE }}
                      >
                        {tp(`labels.${link.key}`)} ↗
                      </a>
                    ) : (
                      <a
                        href={`#${p.planet}`}
                        data-cursor="link"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                          window.setTimeout(() => goToChapter(p.planet), 200);
                        }}
                        className="u-link mt-2 inline-block font-mono text-[11px] uppercase tracking-wider2"
                        style={{ color: BLUE }}
                      >
                        {t('chapter')} →
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-wider3 text-fg/35 md:mt-0">{t('hint')}</p>
      </div>
      <style jsx>{`
        .sixty {
          animation: sixtyIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes sixtyIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sixty {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
