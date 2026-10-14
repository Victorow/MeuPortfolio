import type { Metadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import ClassicA from '@/components/classic/ClassicA';
import ClassicB from '@/components/classic/ClassicB';
import DesignSwitch from '@/components/classic/DesignSwitch';
import { getClassicContent } from '@/components/classic/content';
import JsonLd from '@/components/seo/JsonLd';
import { buildJsonLd, type JsonLdMessages } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteUpdated } from '@/lib/seo/updated';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, 'classic');
}

export default async function ClassicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const updated = siteUpdated();
  const messages = (await getMessages()) as unknown as JsonLdMessages;
  const c = await getClassicContent(locale, updated);

  return (
    <>
      <JsonLd data={buildJsonLd({ locale, page: 'classic', messages, updated })} />
      <DesignSwitch a={<ClassicA c={c} />} b={<ClassicB c={c} />} labels={{ group: c.labels.switchLabel, a: c.labels.switchA, b: c.labels.switchB }} />
    </>
  );
}
