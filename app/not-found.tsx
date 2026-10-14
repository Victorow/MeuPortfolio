import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google';
import pt from '@/messages/pt-BR.json';
import en from '@/messages/en.json';
import SecurityMeta from '@/components/seo/SecurityMeta';
import MissingPath from '@/components/notfound/MissingPath';
import styles from './not-found.module.css';

const display = Space_Grotesk({ subsets: ['latin'], display: 'swap', weight: ['500', '700'], variable: '--nf-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--nf-mono' });
const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--nf-sans' });

/**
 * Exported as 404.html; GitHub Pages serves it with a real 404 status for any unknown URL.
 * There is no locale here, so the copy is shown in pt-BR and en side by side.
 */
export default function NotFound() {
  const p = pt.notFound;
  const e = en.notFound;
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable} ${sans.variable}`}>
      <head>
        <SecurityMeta />
        <title>{`${p.docTitle} · ${e.title1} ${e.title2}`}</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" content="#030305" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={styles.root}>
        {/* Static star field (public/space/stars.svg): no WebGL on the 404. */}
        <div className={styles.sky} aria-hidden="true" />
        <main className={styles.page} data-not-found>
          <div className={`${styles.mono} ${styles.eyebrow}`}>
            <b>{p.eyebrow}</b>
            <span lang="en">{e.eyebrow}</span>
          </div>
          <h1 className={styles.title}>
            {p.title1} <span>{p.title2}</span>
          </h1>
          <p className={styles.en} lang="en">
            {e.title1} {e.title2}
          </p>
          <div className={styles.cols}>
            <div>
              <p className={`${styles.mono} ${styles.path}`}>
                <MissingPath template={p.missingPath} fallback={p.missing} />
              </p>
              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.primary}`} href="/pt-BR/" data-home>
                  {p.home}
                </a>
                <a className={styles.btn} href="/pt-BR/classic/">
                  {p.classic}
                </a>
              </div>
            </div>
            <div lang="en">
              <p className={`${styles.mono} ${styles.path}`}>
                <MissingPath template={e.missingPath} fallback={e.missing} />
              </p>
              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.primary}`} href="/en/">
                  {e.home}
                </a>
                <a className={styles.btn} href="/en/classic/">
                  {e.classic}
                </a>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
