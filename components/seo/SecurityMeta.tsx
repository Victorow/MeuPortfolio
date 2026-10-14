import { CSP, CSP_ENABLED } from '@/lib/seo/csp';

/** Security-related <meta> tags that must come first in <head>. */
export default function SecurityMeta() {
  if (!CSP_ENABLED) return null;
  return <meta httpEquiv="Content-Security-Policy" content={CSP} />;
}
