import type { Metadata } from 'next';
import { getMessages, setRequestLocale } from 'next-intl/server';
import Chapter from '@/components/journey/Chapter';
import Marquee from '@/components/journey/Marquee';
import Hero from '@/components/sections/Hero';
import ProjectChapter from '@/components/sections/ProjectChapter';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import { projects } from '@/content/projects';
import JsonLd from '@/components/seo/JsonLd';
import { buildJsonLd, type JsonLdMessages } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteUpdated } from '@/lib/seo/updated';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, 'home');
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await getMessages()) as unknown as JsonLdMessages;
  const updated = siteUpdated();

  // Planet side alternates per chapter (see cameraPath keyframes): content goes on the opposite side.
  const side: Record<string, 'left' | 'right'> = { mars: 'left', jupiter: 'right', saturn: 'left', uranus: 'right', venus: 'left' };

  return (
    <>
      <JsonLd data={buildJsonLd({ locale, page: 'home', messages, updated })} />
      <Chapter id="earth" align="left">
        <Hero />
      </Chapter>
      <Marquee />
      {projects.map((p) => (
        <Chapter key={p.key} id={p.planet} align={side[p.planet]}>
          <ProjectChapter project={p} />
        </Chapter>
      ))}
      <Chapter id="neptune" align="left" layout="flow" className="chapter-neptune">
        <About />
      </Chapter>
      <Chapter id="deep" align="center">
        <Contact />
      </Chapter>
      <Footer updated={updated} />
    </>
  );
}
