'use client';

import { useTranslations } from 'next-intl';
import { useJourney } from '@/lib/journey/store';
import { goToChapter } from '@/lib/journey/navigate';
import { SOCIAL } from '@/content/projects';
import SoundToggle from './SoundToggle';
import LocaleSwitch from '@/components/ui/LocaleSwitch';

export default function Header() {
  const t = useTranslations('header');
  const menuOpen = useJourney((s) => s.menuOpen);
  const setMenuOpen = useJourney((s) => s.setMenuOpen);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between bg-gradient-to-b from-bg/85 via-bg/40 to-transparent px-5 py-4 md:px-[3vw] md:py-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
    >
      <a
        href="#earth"
        aria-label={t('home')}
        data-cursor="link"
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen(false);
          goToChapter('earth');
        }}
        className="font-display text-sm font-bold tracking-wider2"
      >
        VA<span className="accent-text">.</span>
      </a>

      <nav className="flex items-center gap-2 md:gap-3">
        <a
          href={SOCIAL.cv}
          download
          data-cursor="link"
          className="hidden items-center rounded-full border border-white/12 bg-black/30 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider2 text-fg/85 backdrop-blur-md transition-colors duration-500 hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex"
        >
          {t('cv')}
        </a>
        <SoundToggle />
        <LocaleSwitch />
        <button
          type="button"
          aria-label={menuOpen ? t('close') : t('menu')}
          aria-expanded={menuOpen}
          aria-controls="menu-overlay"
          data-cursor="link"
          onClick={() => setMenuOpen(!menuOpen)}
          className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/30 backdrop-blur-md transition-colors duration-500 hover:border-[var(--accent)]"
        >
          <span
            className="absolute h-px w-4 bg-fg transition-transform duration-500 ease-cine"
            style={{ transform: menuOpen ? 'rotate(45deg)' : 'translateY(-3px)' }}
          />
          <span
            className="absolute h-px w-4 bg-fg transition-transform duration-500 ease-cine"
            style={{ transform: menuOpen ? 'rotate(-45deg)' : 'translateY(3px)' }}
          />
        </button>
      </nav>
    </header>
  );
}
