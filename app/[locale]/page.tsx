import { setRequestLocale } from 'next-intl/server';
import Chapter from '@/components/journey/Chapter';
import Marquee from '@/components/journey/Marquee';
import Hero from '@/components/sections/Hero';
import ProjectChapter from '@/components/sections/ProjectChapter';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import { projects } from '@/content/projects';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Planet side alternates per chapter (see cameraPath keyframes): content goes on the opposite side.
  const side: Record<string, 'left' | 'right'> = { mars: 'left', jupiter: 'right', saturn: 'left', uranus: 'right', venus: 'left' };

  return (
    <>
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
      <Footer />
    </>
  );
}
