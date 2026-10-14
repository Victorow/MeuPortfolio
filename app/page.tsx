import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import SecurityMeta from '@/components/seo/SecurityMeta';
import { canonicalFor } from '@/lib/seo/alternates';
import { VERSION_KEY } from '@/lib/version';
import pt from '@/messages/pt-BR.json';
import en from '@/messages/en.json';

// Static export has no server to redirect `/`. A tiny script sends the visitor to the default
// locale (or to the classic page if that was their last choice). No meta refresh: search engines
// treat it as a soft redirect; this page is noindex with a canonical to the classic page instead.
const target = `/${routing.defaultLocale}/`;
const classic = `/${routing.defaultLocale}/classic/`;

export const metadata: Metadata = {
  title: 'Victor Augusto Ferreira dos Santos',
  robots: { index: false, follow: true },
  alternates: { canonical: canonicalFor(routing.defaultLocale) }
};

const redirect = `(function(){var t=${JSON.stringify(target)};try{if(localStorage.getItem(${JSON.stringify(VERSION_KEY)})==='classic')t=${JSON.stringify(classic)}}catch(e){}location.replace(t+location.hash)})();`;

export default function RootRedirect() {
  return (
    <html lang={routing.defaultLocale}>
      <head>
        <SecurityMeta />
        <script dangerouslySetInnerHTML={{ __html: redirect }} />
      </head>
      <body style={{ background: '#030305', color: '#9A9AA1', fontFamily: 'sans-serif', margin: 0, padding: 24 }}>
        <p>
          <a href={target} style={{ color: '#fff' }}>
            victors.codes
          </a>
          {' · '}
          <a href={classic} style={{ color: '#fff' }}>
            {pt.header.classic} / {en.header.classic}
          </a>
        </p>
      </body>
    </html>
  );
}
