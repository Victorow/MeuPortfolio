'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import type { Locale } from '@/i18n/routing';
import { AnimatePresence, motion } from 'framer-motion';
import { easeCine } from '@/lib/motion';
import { setLocaleTransitionPending } from '@/lib/localeTransition';

export default function LocaleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations('locale');
  const [pending, startTransition] = useTransition();

  const next: Locale = locale === 'pt-BR' ? 'en' : 'pt-BR';
  const current = locale === 'pt-BR' ? 'PT' : 'EN';
  const target = next === 'pt-BR' ? 'PT' : 'EN';

  const handle = () => {
    setLocaleTransitionPending(true);
    // Small delay so the overlay can begin its entrance before navigation
    window.setTimeout(() => {
      startTransition(() => {
        router.replace(pathname, { locale: next });
      });
    }, 420);
  };

  return (
    <button
      type="button"
      aria-label="Toggle language"
      disabled={pending}
      onClick={handle}
      data-no-snap
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
        right: 'calc(env(safe-area-inset-right, 0px) + 1.25rem)'
      }}
      className="group fixed z-50 flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink-200 backdrop-blur-md transition-all duration-500 ease-cine hover:-translate-y-0.5 hover:border-white/25 hover:text-white disabled:opacity-60"
    >
      <motion.span
        className="inline-block h-1 w-1 rounded-full bg-ink-100"
        animate={{ scale: pending ? [1, 1.4, 1] : 1, opacity: pending ? [0.8, 1, 0.8] : 0.9 }}
        transition={{ duration: 1.2, repeat: pending ? Infinity : 0, ease: easeCine }}
      />
      <span className="relative flex h-4 items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ duration: 0.45, ease: easeCine }}
            className="inline-block tabular-nums text-white"
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-ink-400">·</span>
      <span className="tabular-nums text-ink-300 transition-colors duration-500 group-hover:text-ink-100">
        {target}
      </span>
      <span className="ml-1 text-[9px] tracking-[0.28em] text-ink-400 transition-colors duration-500 group-hover:text-ink-200">
        {t('switchTo')}
      </span>
    </button>
  );
}
