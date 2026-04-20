'use client';

import { useTranslations } from 'next-intl';
import Reveal from '@/components/ui/Reveal';
import type { IconType } from 'react-icons';
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiThreedotjs,
  SiVercel
} from 'react-icons/si';
import { TbBrandThreejs, TbAtom } from 'react-icons/tb';

const stack: { name: string; Icon: IconType }[] = [
  { name: 'Next.js', Icon: SiNextdotjs },
  { name: 'React', Icon: SiReact },
  { name: 'TypeScript', Icon: SiTypescript },
  { name: 'Tailwind CSS', Icon: SiTailwindcss },
  { name: 'Framer Motion', Icon: SiFramer },
  { name: 'React Three Fiber', Icon: TbAtom },
  { name: 'Drei', Icon: TbBrandThreejs },
  { name: 'Three.js', Icon: SiThreedotjs },
  { name: 'Lenis', Icon: TbAtom },
  { name: 'next-intl', Icon: TbAtom },
  { name: 'Vercel', Icon: SiVercel }
];

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer id="footer" data-snap className="section relative border-t border-white/5 px-6 pb-10 pt-20 md:px-12 md:pt-28">
      <Reveal className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-[0.32em] text-ink-300">
            {t('builtWith')}
          </span>
          <h3 className="font-display text-xl uppercase tracking-wider2 text-ink-50 md:text-2xl">
            This experience uses
          </h3>
        </div>

        <ul className="flex flex-wrap gap-x-3 gap-y-3">
          {stack.map(({ name, Icon }) => (
            <li
              key={name}
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink-100 transition-colors duration-500 ease-cine hover:border-white/25 hover:text-white"
            >
              <Icon aria-hidden className="h-3.5 w-3.5 text-ink-200 transition-colors duration-500 ease-cine group-hover:text-white" />
              {name}
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-16 flex flex-col gap-4 border-t border-white/5 pt-8 text-[10px] uppercase tracking-[0.3em] text-ink-300 md:flex-row md:items-center md:justify-between">
        <span>© {year} · {t('rights')}</span>
        <span className="tabular-nums">v1.0.0 · build stable</span>
      </div>
    </footer>
  );
}
