// Fails (exit 1) when JSON-LD is missing, does not parse or is structurally wrong.
//   node scripts/validate-jsonld.mjs           -> validates the graphs built from source (lib/seo/jsonld.ts)
//   node scripts/validate-jsonld.mjs <outDir>  -> validates every <script type="application/ld+json"> in the exported HTML
import fs from 'node:fs';
import path from 'node:path';
import { loadTs, readMessages, ROOT } from './lib/ts.mjs';

const FULL_NAME = 'Victor Augusto Ferreira dos Santos';
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

function checkGraph(where, data, { expectFaq }) {
  if (data['@context'] !== 'https://schema.org') fail(where, '@context must be https://schema.org');
  const graph = data['@graph'];
  if (!Array.isArray(graph) || graph.length === 0) return fail(where, '@graph missing or empty');
  const ids = new Set(graph.map((n) => n['@id']).filter(Boolean));
  const types = graph.map((n) => n['@type']);
  for (const n of graph) {
    if (!n['@type']) fail(where, `node without @type: ${JSON.stringify(n).slice(0, 80)}`);
    for (const [k, v] of Object.entries(n)) {
      if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 1 && v['@id'] && !ids.has(v['@id'])) {
        fail(where, `${n['@type']}.${k} references unknown @id ${v['@id']}`);
      }
    }
  }
  const person = graph.find((n) => n['@type'] === 'Person');
  if (!person) fail(where, 'Person missing');
  else {
    if (person.name !== FULL_NAME) fail(where, `Person.name must be "${FULL_NAME}"`);
    if (!Array.isArray(person.sameAs) || person.sameAs.length === 0) fail(where, 'Person.sameAs empty');
    if (!/^https:\/\//.test(person.url || '')) fail(where, 'Person.url must be absolute https');
  }
  for (const t of ['WebSite', 'ProfilePage']) if (!types.includes(t)) fail(where, `${t} missing`);
  const profile = graph.find((n) => n['@type'] === 'ProfilePage');
  if (profile && !/^\d{4}-\d{2}-\d{2}/.test(profile.dateModified || '')) fail(where, 'ProfilePage.dateModified missing');
  const works = graph.filter((n) => n['@type'] === 'SoftwareSourceCode' || n['@type'] === 'CreativeWork');
  if (works.length < 5) fail(where, `expected 5 projects, found ${works.length}`);
  for (const w of works) if (!w.name || !w.description) fail(where, `project ${w['@id']} needs name and description`);
  const faq = graph.find((n) => n['@type'] === 'FAQPage');
  if (expectFaq) {
    if (!faq) fail(where, 'FAQPage missing');
    else {
      if (!Array.isArray(faq.mainEntity) || faq.mainEntity.length === 0) fail(where, 'FAQPage.mainEntity empty');
      for (const q of faq.mainEntity || []) {
        if (q['@type'] !== 'Question' || !q.name || q.acceptedAnswer?.['@type'] !== 'Answer' || !q.acceptedAnswer.text) fail(where, `bad Question: ${q.name}`);
      }
    }
    if (!types.includes('BreadcrumbList')) fail(where, 'BreadcrumbList missing');
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '_next' ? [] : walk(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

const outArg = process.argv[2];
if (outArg) {
  const outDir = path.resolve(ROOT, outArg);
  if (!fs.existsSync(outDir)) {
    console.error(`validate-jsonld: ${outArg} does not exist`);
    process.exit(1);
  }
  let pages = 0;
  for (const file of walk(outDir)) {
    const rel = path.relative(outDir, file).replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const isContent = /^(pt-BR|en)\/(classic\/)?index\.html$/.test(rel);
    if (!isContent) continue;
    pages++;
    if (blocks.length !== 1) {
      fail(rel, `expected exactly 1 JSON-LD block, found ${blocks.length}`);
      continue;
    }
    if (/[<>]/.test(blocks[0])) fail(rel, 'JSON-LD contains raw < or > (must be unicode-escaped)');
    try {
      checkGraph(rel, JSON.parse(blocks[0]), { expectFaq: rel.includes('classic/') });
    } catch (e) {
      fail(rel, `does not parse: ${e.message}`);
    }
  }
  if (pages !== 4) fail(outArg, `expected 4 content pages with JSON-LD, found ${pages}`);
  report(`${pages} exported pages`);
} else {
  const { buildJsonLd, serializeJsonLd } = loadTs('lib/seo/jsonld.ts');
  for (const locale of ['pt-BR', 'en']) {
    const messages = readMessages(locale);
    for (const page of ['home', 'classic']) {
      const where = `${locale}/${page}`;
      const text = serializeJsonLd(buildJsonLd({ locale, page, messages, updated: '2026-01-01' }));
      if (/[<>]/.test(text)) fail(where, 'serialized JSON-LD contains raw < or >');
      try {
        checkGraph(where, JSON.parse(text), { expectFaq: page === 'classic' });
      } catch (e) {
        fail(where, `does not parse: ${e.message}`);
      }
    }
  }
  report('4 source graphs');
}

function report(what) {
  if (errors.length) {
    console.error(`validate-jsonld: ${errors.length} problem(s)\n  ${errors.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`validate-jsonld: ok (${what})`);
}
