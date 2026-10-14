// Typographic Open Graph images per locale (1200x630 and 1080x1080) plus PWA icons, composed with sharp from SVG.
// Deterministic and fast (no browser). Output is committed: public/og/*.png, public/icons/*.png.
// Usage: npm run og
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/ts.mjs';

const BG = '#030305';
const FG = '#F4F5F7';
const MUTED = '#9AA0AD';
const BLUE = '#4F8DFF';
const SANS = "'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif";
const MONO = "'JetBrains Mono', Consolas, 'DejaVu Sans Mono', monospace";

const LOCALES = {
  'pt-BR': { eyebrow: 'FULLSTACK DEVELOPER · SÃO JOSÉ DOS CAMPOS, SP' },
  en: { eyebrow: 'FULLSTACK DEVELOPER · SÃO JOSÉ DOS CAMPOS, BRAZIL' }
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svgWide({ eyebrow }) {
  const W = 1200, H = 630, P = 72;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <circle cx="1080" cy="120" r="250" fill="none" stroke="${FG}" stroke-opacity="0.12" stroke-width="1.5"/>
  <circle cx="1080" cy="120" r="150" fill="none" stroke="${FG}" stroke-opacity="0.08" stroke-width="1.5"/>
  <circle cx="903" cy="297" r="9" fill="${BLUE}"/>
  <text x="${P}" y="${P + 18}" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${MUTED}">${esc(eyebrow)}</text>
  <text x="${P - 4}" y="330" font-family="${SANS}" font-weight="800" font-size="104" letter-spacing="-4" fill="${FG}">Victor Augusto</text>
  <text x="${P - 4}" y="430" font-family="${SANS}" font-weight="800" font-size="88" letter-spacing="-3" fill="${BLUE}">Ferreira dos Santos</text>
  <line x1="${P}" y1="${H - 118}" x2="${W - P}" y2="${H - 118}" stroke="${FG}" stroke-opacity="0.9" stroke-width="2"/>
  <text x="${P}" y="${H - 66}" font-family="${MONO}" font-size="26" letter-spacing="2" fill="${FG}">victors.codes</text>
  <text x="${W - P}" y="${H - 66}" text-anchor="end" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${MUTED}">REACT NATIVE · NODE.JS · AWS</text>
</svg>`;
}

function svgSquare({ eyebrow }) {
  const S = 1080, P = 80;
  const [role, city] = eyebrow.split(' · ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="${BG}"/>
  <circle cx="900" cy="200" r="300" fill="none" stroke="${FG}" stroke-opacity="0.12" stroke-width="1.5"/>
  <circle cx="900" cy="200" r="180" fill="none" stroke="${FG}" stroke-opacity="0.08" stroke-width="1.5"/>
  <circle cx="688" cy="412" r="11" fill="${BLUE}"/>
  <text x="${P}" y="${P + 22}" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${MUTED}">${esc(role)}</text>
  <text x="${P}" y="${P + 58}" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${MUTED}">${esc(city)}</text>
  <text x="${P - 6}" y="600" font-family="${SANS}" font-weight="800" font-size="150" letter-spacing="-6" fill="${FG}">Victor</text>
  <text x="${P - 6}" y="740" font-family="${SANS}" font-weight="800" font-size="150" letter-spacing="-6" fill="${FG}">Augusto</text>
  <text x="${P - 2}" y="830" font-family="${SANS}" font-weight="800" font-size="68" letter-spacing="-2" fill="${BLUE}">Ferreira dos Santos</text>
  <line x1="${P}" y1="${S - 130}" x2="${S - P}" y2="${S - 130}" stroke="${FG}" stroke-opacity="0.9" stroke-width="2"/>
  <text x="${P}" y="${S - 76}" font-family="${MONO}" font-size="30" letter-spacing="2" fill="${FG}">victors.codes</text>
</svg>`;
}

function svgIcon(size) {
  // Same mark as favicon.svg, flat (no gradient): planet disc + orbit ring.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${BG}"/>
  <circle cx="32" cy="32" r="19" fill="${BLUE}"/>
  <circle cx="32" cy="32" r="27" fill="none" stroke="${FG}" stroke-opacity="0.45" stroke-width="1"/>
</svg>`;
}

const ogDir = path.join(ROOT, 'public', 'og');
const iconDir = path.join(ROOT, 'public', 'icons');
fs.mkdirSync(ogDir, { recursive: true });
fs.mkdirSync(iconDir, { recursive: true });

for (const [locale, copy] of Object.entries(LOCALES)) {
  await sharp(Buffer.from(svgWide(copy))).png({ compressionLevel: 9 }).toFile(path.join(ogDir, `og-${locale}.png`));
  await sharp(Buffer.from(svgSquare(copy))).png({ compressionLevel: 9 }).toFile(path.join(ogDir, `og-square-${locale}.png`));
  console.log(`og: ${locale}`);
}
for (const size of [192, 512]) {
  await sharp(Buffer.from(svgIcon(size))).png().toFile(path.join(iconDir, `icon-${size}.png`));
}
await sharp(Buffer.from(svgIcon(180))).png().toFile(path.join(iconDir, 'apple-touch-icon.png'));
console.log('icons: 192, 512, apple-touch-icon');
