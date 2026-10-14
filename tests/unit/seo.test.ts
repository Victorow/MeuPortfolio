import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { serializeJsonLd, buildJsonLd, type JsonLdMessages } from '@/lib/seo/jsonld';
import { sitemapEntries, sitemapXml } from '@/lib/seo/sitemap';
import { alternatesFor, canonicalFor, languagesFor } from '@/lib/seo/alternates';
import { formatUpdated } from '@/lib/seo/format';
import { CSP } from '@/lib/seo/csp';
import pt from '@/messages/pt-BR.json';
import en from '@/messages/en.json';

const root = path.resolve(__dirname, '..', '..');

describe('serializeJsonLd', () => {
  it('escapes characters that could close the script tag or open a comment', () => {
    const out = serializeJsonLd({ text: '</script><script>alert(1)</script> & <!-- x -->' });
    expect(out).not.toMatch(/[<>]/);
    expect(out).not.toContain('&');
    expect(out).toContain('\\u003c/script\\u003e');
    expect(JSON.parse(out).text).toBe('</script><script>alert(1)</script> & <!-- x -->');
  });

  it('escapes JS line separators', () => {
    const out = serializeJsonLd({ t: 'a\u2028b\u2029c' });
    expect(out).not.toMatch(/[\u2028\u2029]/);
    expect(JSON.parse(out).t).toBe('a\u2028b\u2029c');
  });
});

describe('buildJsonLd', () => {
  for (const [locale, messages] of [
    ['pt-BR', pt],
    ['en', en]
  ] as const) {
    it(`classic graph (${locale}) has Person, ProfilePage, FAQPage, BreadcrumbList and 5 projects`, () => {
      const g = buildJsonLd({ locale, page: 'classic', messages: messages as unknown as JsonLdMessages, updated: '2026-10-13' })['@graph'];
      const types = g.map((n) => n['@type']);
      expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite', 'ProfilePage', 'FAQPage', 'BreadcrumbList']));
      expect(types.filter((t) => t === 'SoftwareSourceCode' || t === 'CreativeWork')).toHaveLength(5);
      const person = g.find((n) => n['@type'] === 'Person') as { name: string; sameAs: string[] };
      expect(person.name).toBe('Victor Augusto Ferreira dos Santos');
      expect(person.sameAs).toContain('https://github.com/Victorow');
    });
  }

  it('home graph has no FAQPage (the FAQ is only visible on the classic page)', () => {
    const g = buildJsonLd({ locale: 'pt-BR', page: 'home', messages: pt as unknown as JsonLdMessages, updated: '2026-10-13' })['@graph'];
    expect(g.some((n) => n['@type'] === 'FAQPage')).toBe(false);
  });
});

describe('sitemap', () => {
  it('lists the 4 URLs, each with pt-BR, en and x-default alternates', () => {
    const entries = sitemapEntries('2026-10-13');
    expect(entries.map((e) => e.loc).sort()).toEqual(
      ['https://victors.codes/en/', 'https://victors.codes/en/classic/', 'https://victors.codes/pt-BR/', 'https://victors.codes/pt-BR/classic/'].sort()
    );
    for (const e of entries) {
      expect(e.alternates.map((a) => a.hreflang)).toEqual(['pt-BR', 'en', 'x-default']);
      expect(e.lastmod).toBe('2026-10-13');
    }
    const xml = sitemapXml('2026-10-13');
    expect(xml.match(/<url>/g)).toHaveLength(4);
    expect(xml.match(/xhtml:link/g)).toHaveLength(12);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });
});

describe('alternates', () => {
  it('uses the classic page as canonical for every locale, x-default pt-BR', () => {
    expect(canonicalFor('en')).toBe('https://victors.codes/en/classic/');
    expect(alternatesFor('pt-BR').canonical).toBe('https://victors.codes/pt-BR/classic/');
    expect(languagesFor()['x-default']).toBe('https://victors.codes/pt-BR/classic/');
  });
});

describe('robots.txt', () => {
  const robots = fs.readFileSync(path.join(root, 'public', 'robots.txt'), 'utf8');
  it('allows everything and points to the sitemap', () => {
    expect(robots).toMatch(/User-agent: \*\s+Allow: \//);
    expect(robots).toContain('Sitemap: https://victors.codes/sitemap.xml');
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
  });
  it('explicitly allows the AI crawlers', () => {
    for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Bingbot', 'Applebot-Extended', 'CCBot']) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
  });
});

describe('messages', () => {
  it('meta descriptions fit in 155 characters and titles carry the full name', () => {
    for (const m of [pt, en]) {
      expect(m.meta.description.length).toBeLessThanOrEqual(155);
      expect(m.meta.title).toContain('Victor Augusto Ferreira dos Santos');
    }
  });
  it('never advertise availability', () => {
    const text = JSON.stringify([pt, en]).toLowerCase();
    for (const word of ['disponível', 'open to work', 'aberto a oportunidades', 'open to full-stack', 'available for']) expect(text).not.toContain(word);
  });
});

describe('misc', () => {
  it('formats the updated date per locale', () => {
    expect(formatUpdated('2026-10-13', 'pt-BR')).toBe('13 out 2026');
    expect(formatUpdated('2026-10-13', 'en')).toBe('13 Oct 2026');
  });
  it('CSP blocks objects, foreign bases and form posts', () => {
    expect(CSP).toContain("object-src 'none'");
    expect(CSP).toContain("base-uri 'self'");
    expect(CSP).toContain("form-action 'none'");
    expect(CSP).toContain("default-src 'self'");
  });
});
