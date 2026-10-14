import { serializeJsonLd } from '@/lib/seo/jsonld';

/** The only dangerouslySetInnerHTML in the app: escaped JSON-LD (see serializeJsonLd). */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
