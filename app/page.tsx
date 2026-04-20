import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';

// Static export has no server runtime to call `redirect()`, so we emit a
// real HTML file at `/` that meta-refreshes to the default locale. Also
// triggers a JS fallback for the rare case that a browser disables meta
// refresh but runs scripts.
const target = `/${routing.defaultLocale}/`;

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default function RootRedirect() {
  return (
    <html lang={routing.defaultLocale}>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
        <link rel="canonical" href={target} />
        <title>Redirecting…</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace(${JSON.stringify(target)});`
          }}
        />
      </head>
      <body style={{ background: '#060607', color: '#9A9AA1', fontFamily: 'sans-serif' }}>
        <noscript>
          <a href={target} style={{ color: '#fff' }}>
            Continue to {routing.defaultLocale}
          </a>
        </noscript>
      </body>
    </html>
  );
}
