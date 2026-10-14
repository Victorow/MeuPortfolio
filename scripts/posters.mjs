// Renders a static poster per chapter from the built site (no-WebGL fallback + OG image).
// Usage: npm run build:e2e && npm run posters   (serves .next-e2e on :3100, or reuses one)
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const CHAPTERS = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'venus', 'neptune', 'deep'];
const BASE = 'http://localhost:3100';

async function serverUp() {
  try {
    const r = await fetch(BASE + '/pt-BR/');
    return r.ok;
  } catch {
    return false;
  }
}

let server = null;
if (!(await serverUp())) {
  server = spawn('npx', ['serve', '.next-e2e', '-l', '3100'], { shell: true, stdio: 'ignore' });
  for (let i = 0; i < 40 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 500));
}

await fs.mkdir('public/posters', { recursive: true });
await fs.mkdir('public/og', { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(BASE + '/pt-BR/?poster=1');
await page.waitForSelector('[data-preloader]', { state: 'hidden', timeout: 60_000 });
await page.waitForTimeout(2500);

for (const c of CHAPTERS) {
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-chapter="${id}"]`);
    const top = el.getBoundingClientRect().top + window.scrollY + 2;
    window.scrollTo({ top, behavior: 'auto' });
    window.dispatchEvent(new Event('scroll'));
  }, c);
  await page.waitForTimeout(2200);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toFile(`public/posters/${c}.jpg`);
  console.log('poster', c);
  if (c === 'earth') {
    await sharp(png).resize(1200, 630, { fit: 'cover', position: 'centre' }).png().toFile('public/og/earth.png');
    console.log('og image written');
  }
}

await browser.close();
if (server) server.kill();
