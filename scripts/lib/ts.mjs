// Loads the site's TypeScript modules (content/*, lib/seo/*) from build scripts, with the `@/` alias.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const createJiti = require('jiti');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const jiti = createJiti(path.join(ROOT, 'scripts', 'lib', 'ts.mjs'), {
  alias: { '@': ROOT },
  interopDefault: true,
  cache: false
});

/** Import a TS module relative to the repo root, e.g. loadTs('lib/seo/sitemap.ts'). */
export function loadTs(rel) {
  return jiti(path.join(ROOT, rel));
}

export function readMessages(locale) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'messages', `${locale}.json`), 'utf8'));
}

/** Last commit date (YYYY-MM-DD); today when git is unavailable. Mirrors lib/seo/updated.ts. */
export function lastModified() {
  try {
    const out = execSync('git log -1 --format=%cs', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    /* fall through */
  }
  return new Date().toISOString().slice(0, 10);
}

export function writePublic(rel, content) {
  const file = path.join(ROOT, 'public', rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`wrote public/${rel.replace(/\\/g, '/')}`);
}
