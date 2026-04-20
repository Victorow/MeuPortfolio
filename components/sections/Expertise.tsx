'use client';

import { useTranslations } from 'next-intl';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from './SectionHeader';
import { expertiseKeys, type ExpertiseKey } from '@/content/projects';
import { motion } from 'framer-motion';
import { easeCine } from '@/lib/motion';
import type { IconType } from 'react-icons';
import {
  TbServerBolt,
  TbDeviceLaptop,
  TbApi,
  TbShieldLock,
  TbDatabase,
  TbCloud,
  TbRefresh,
  TbSparkles,
  TbGauge,
  TbLockCheck
} from 'react-icons/tb';

const ICONS: Record<ExpertiseKey, IconType> = {
  backend: TbServerBolt,
  frontend: TbDeviceLaptop,
  apis: TbApi,
  auth: TbShieldLock,
  db: TbDatabase,
  cloud: TbCloud,
  automation: TbRefresh,
  ai: TbSparkles,
  performance: TbGauge,
  security: TbLockCheck
};

export default function Expertise() {
  const t = useTranslations('expertise');

  return (
    <section id="expertise" data-snap className="section relative min-h-[100svh] px-6 py-24 md:px-12 md:py-40">
      <SectionHeader eyebrow={t('eyebrow')} title={t('title')} caption={t('caption')} />

      <ul className="grid grid-cols-1 border-t border-white/5 sm:grid-cols-2 lg:grid-cols-5">
        {expertiseKeys.map((k, i) => (
          <Reveal
            as="li"
            key={k}
            delay={(i % 5) * 0.06}
            className="group relative border-b border-white/5 px-5 py-8 transition-colors duration-700 ease-cine hover:bg-white/[0.015] md:px-6 md:py-10 lg:[&:not(:nth-child(5n))]:border-r"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-display text-xs uppercase tracking-[0.3em] text-ink-300 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <motion.span
                aria-hidden
                className="mt-1 block h-[1px] w-8 bg-ink-400 transition-all duration-700 ease-cine group-hover:w-16 group-hover:bg-white"
                transition={{ ease: easeCine }}
              />
            </div>

            {(() => {
              const Icon = ICONS[k];
              return (
                <Icon
                  aria-hidden
                  className="mt-10 h-7 w-7 text-ink-200 transition-all duration-700 ease-cine group-hover:-translate-y-0.5 group-hover:text-white"
                />
              );
            })()}

            <h3 className="mt-6 font-display text-xl uppercase tracking-wider2 text-ink-50">
              {t(`clusters.${k}.name`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-200">
              {t(`clusters.${k}.desc`)}
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
