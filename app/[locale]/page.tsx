import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/sections/Hero';
import Projects from '@/components/sections/Projects';
import About from '@/components/sections/About';
import Expertise from '@/components/sections/Expertise';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative">
      <Hero />
      <Projects />
      <About />
      <Expertise />
      <Contact />
      <Footer />
    </main>
  );
}
