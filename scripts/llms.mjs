// Writes public/llms.txt (index) and public/llms-full.txt (all facts, both languages) from content/* and messages/*.
import { loadTs, lastModified, readMessages, writePublic } from './lib/ts.mjs';

const { llmsTxt, llmsFullTxt } = loadTs('lib/seo/llms.ts');
const en = readMessages('en');
const pt = readMessages('pt-BR');
const updated = lastModified();
writePublic('llms.txt', llmsTxt(en, pt, updated));
writePublic('llms-full.txt', llmsFullTxt(en, pt, updated));
