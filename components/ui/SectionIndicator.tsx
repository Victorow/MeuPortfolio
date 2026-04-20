'use client';

import { useTranslations } from 'next-intl';
import { useActiveSection, SECTION_ORDER, type SectionId } from '@/lib/activeSection';
import { motion } from 'framer-motion';

const LABEL_KEY: Partial<Record<SectionId, string>> = {
  hero: 'nav.hero',
  projects: 'nav.projects',
  about: 'nav.about',
  expertise: 'nav.expertise',
  contact: 'nav.contact'
};

export default function SectionIndicator() {
  const active = useActiveSection();
  const t = useTranslations();

  const items = SECTION_ORDER.filter((id) => id !== 'footer');

  return (
    <nav
      aria-label="Sections"
      className="pointer-events-auto fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {items.map((id, i) => {
        const isActive = active === id;
        const label = LABEL_KEY[id];
        return (
          <a
            key={id}
            href={`#${id}`}
            className="group relative flex items-center justify-end gap-3"
          >
            <span
              className={`text-[10px] uppercase tracking-[0.3em] transition-all duration-500 ease-cine ${
                isActive
                  ? 'text-white opacity-100 translate-x-0'
                  : 'text-ink-300 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            >
              {label ? t(label) : id}
            </span>
            <span className="relative flex h-6 w-6 items-center justify-center">
              <span
                className={`block h-[1px] transition-all duration-700 ease-cine ${
                  isActive ? 'w-6 bg-white' : 'w-3 bg-ink-400 group-hover:w-5 group-hover:bg-white'
                }`}
              />
              {isActive && (
                <motion.span
                  layoutId="section-dot"
                  className="absolute right-0 block h-1 w-1 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                />
              )}
            </span>
            <span className="sr-only">{id}</span>
            <span className="tabular-nums text-[9px] text-ink-400">
              {String(i + 1).padStart(2, '0')}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
