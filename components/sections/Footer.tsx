import { useLocale, useTranslations } from 'next-intl';
import { formatUpdated } from '@/lib/seo/format';

export default function Footer({ updated }: { updated: string }) {
  const t = useTranslations('footer');
  const locale = useLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 hairline-t bg-bg/70 px-5 py-6 backdrop-blur-sm md:px-[3vw]">
      <div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-wider2 text-fg/45 md:flex-row md:items-center md:justify-between">
        <p>
          © {year} Victor Augusto · {t('rights')}
        </p>
        <p>{t('credits')}</p>
        <p>
          <time dateTime={updated} data-updated>
            {t('updated', { date: formatUpdated(updated, locale) })}
          </time>
          {' · '}
          {t('builtWith')} {t('stack')}
        </p>
      </div>
    </footer>
  );
}
