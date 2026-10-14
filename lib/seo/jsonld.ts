import { projects, SOCIAL, TODO } from '@/content/projects';
import { ALL_SKILLS } from '@/content/skills';
import { FAQ_KEYS } from '@/content/faq';
import { FULL_NAME, SHORT_NAME, SITE_URL, absoluteUrl, ogImage, pagePath, type PageKind } from './site';

/**
 * Serialises JSON-LD for a <script type="application/ld+json"> tag.
 * `<`, `>`, `&` and the JS line separators are emitted as unicode escapes so that no
 * message text can ever close the script element or start an HTML comment.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

type Dict = { [k: string]: string | Dict };
/** Minimal view of the messages JSON used here. */
export type JsonLdMessages = {
  meta: { title: string; description: string };
  projects: { items: Record<string, { title: string; summary: string }> };
  faq: { items: Record<string, { q: string; a: string }> };
  classic: { breadcrumb: { home: string; classic: string } };
} & Dict;

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const inLanguage = (locale: string) => (locale === 'en' ? 'en' : 'pt-BR');

export function personNode(locale: string) {
  const sameAs = [SOCIAL.github, SOCIAL.linkedin].filter((u) => u && u !== TODO);
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: FULL_NAME,
    alternateName: SHORT_NAME,
    givenName: 'Victor Augusto',
    familyName: 'Ferreira dos Santos',
    jobTitle: 'FullStack Developer',
    url: `${SITE_URL}/`,
    email: `mailto:${SOCIAL.email}`,
    image: absoluteUrl(ogImage(locale, true)),
    worksFor: { '@type': 'Organization', name: 'CDT Software' },
    alumniOf: { '@type': 'EducationalOrganization', name: 'Faculdade de Tecnologia Senai Félix Guisard' },
    address: { '@type': 'PostalAddress', addressLocality: 'São José dos Campos', addressRegion: 'SP', addressCountry: 'BR' },
    knowsAbout: ALL_SKILLS.map((s) => s.name),
    knowsLanguage: ['pt-BR', 'en'],
    sameAs
  };
}

function projectNodes(locale: string, m: JsonLdMessages) {
  return projects.map((p) => {
    const item = m.projects.items[p.key];
    const url = [p.links.repo, p.links.live, p.links.store, p.links.marketplace].find((u) => u && u !== TODO);
    const base: Record<string, unknown> = {
      '@type': p.schemaType,
      '@id': `${SITE_URL}/#project-${p.key}`,
      name: item.title,
      description: item.summary,
      inLanguage: inLanguage(locale),
      author: { '@id': PERSON_ID },
      keywords: p.stack.join(', ')
    };
    if (url) base.url = url;
    if (p.schemaType === 'SoftwareSourceCode') {
      if (p.links.repo) base.codeRepository = p.links.repo;
      base.programmingLanguage = p.stack.filter((s) => ['TypeScript', 'JavaScript', 'Rust', 'Node.js'].includes(s));
      base.runtimePlatform = p.key === 'vscode' ? 'Visual Studio Code' : 'Node.js';
    }
    return base;
  });
}

/** Full @graph for a page: Person, WebSite, ProfilePage, projects; classic adds FAQPage and BreadcrumbList. */
export function buildJsonLd({ locale, page, messages, updated }: { locale: string; page: PageKind; messages: JsonLdMessages; updated: string }) {
  const url = absoluteUrl(pagePath(locale, page));
  const graph: Record<string, unknown>[] = [
    personNode(locale),
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: messages.meta.title,
      inLanguage: ['pt-BR', 'en'],
      publisher: { '@id': PERSON_ID }
    },
    {
      '@type': 'ProfilePage',
      '@id': `${url}#profile`,
      url,
      name: messages.meta.title,
      description: messages.meta.description,
      inLanguage: inLanguage(locale),
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: { '@id': PERSON_ID },
      dateModified: updated
    },
    ...projectNodes(locale, messages)
  ];

  if (page === 'classic') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: inLanguage(locale),
      mainEntity: FAQ_KEYS.map((k) => ({
        '@type': 'Question',
        name: messages.faq.items[k].q,
        acceptedAnswer: { '@type': 'Answer', text: messages.faq.items[k].a }
      }))
    });
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: messages.classic.breadcrumb.home, item: absoluteUrl(pagePath(locale, 'home')) },
        { '@type': 'ListItem', position: 2, name: messages.classic.breadcrumb.classic, item: url }
      ]
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
