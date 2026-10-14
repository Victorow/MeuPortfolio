import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 hairline-t bg-bg/70 px-5 py-6 backdrop-blur-sm md:px-[3vw]">
      <div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-wider2 text-fg/45 md:flex-row md:items-center md:justify-between">
        <p>
          © {year} Victor Augusto · {t('rights')}
        </p>
        <p>{t('credits')}</p>
        <p>
          {t('builtWith')} {t('stack')}
        </p>
      </div>
    </footer>
  );
}
