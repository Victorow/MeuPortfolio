import { test, expect, type Page } from '@playwright/test';

const SITE = 'https://victors.codes';
const PAGES = [
  { path: '/pt-BR/classic/', locale: 'pt-BR', og: 'pt_BR', faq: true },
  { path: '/en/classic/', locale: 'en', og: 'en_US', faq: true },
  { path: '/pt-BR/', locale: 'pt-BR', og: 'pt_BR', faq: false },
  { path: '/en/', locale: 'en', og: 'en_US', faq: false }
] as const;

const attr = (page: Page, sel: string, name = 'content') => page.locator(sel).first().getAttribute(name);

test.describe('SEO and GEO metadata', () => {
  for (const p of PAGES) {
    test(`${p.path}: title, description, canonical, hreflang, OG, JSON-LD, CSP`, async ({ page }) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      // the 3D pages may redirect on a stored preference; this context is fresh, so it must not
      await expect(page).toHaveURL(new RegExp(`${p.path.replace(/\//g, '\\/')}$`));

      expect(await page.title()).toContain('Victor Augusto Ferreira dos Santos');
      const description = (await attr(page, 'meta[name="description"]')) ?? '';
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThanOrEqual(155);

      expect(await attr(page, 'link[rel="canonical"]', 'href')).toBe(`${SITE}/${p.locale}/classic/`);
      expect(await attr(page, 'link[rel="alternate"][hreflang="pt-BR"]', 'href')).toBe(`${SITE}/pt-BR/classic/`);
      expect(await attr(page, 'link[rel="alternate"][hreflang="en"]', 'href')).toBe(`${SITE}/en/classic/`);
      expect(await attr(page, 'link[rel="alternate"][hreflang="x-default"]', 'href')).toBe(`${SITE}/pt-BR/classic/`);

      expect(await attr(page, 'meta[property="og:locale"]')).toBe(p.og);
      expect(await attr(page, 'meta[property="og:image"]')).toBe(`${SITE}/og/og-${p.locale}.png`);
      expect(await attr(page, 'meta[property="og:url"]')).toBe(`${SITE}${p.path}`);
      expect(await attr(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
      expect(await attr(page, 'meta[name="robots"]')).toBe('index, follow');
      expect(await attr(page, 'meta[name="referrer"]')).toBe('strict-origin-when-cross-origin');

      const csp = (await attr(page, 'meta[http-equiv="Content-Security-Policy"]')) ?? '';
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");

      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(blocks).toHaveLength(1);
      const data = JSON.parse(blocks[0]);
      const types: string[] = data['@graph'].map((n: { '@type': string }) => n['@type']);
      expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite', 'ProfilePage']));
      expect(types.includes('FAQPage')).toBe(p.faq);
      const person = data['@graph'].find((n: { '@type': string }) => n['@type'] === 'Person');
      expect(person.name).toBe('Victor Augusto Ferreira dos Santos');
    });
  }

  test('OG images, robots, sitemap, llms, manifest and security.txt are served', async ({ request }) => {
    for (const path of ['/og/og-pt-BR.png', '/og/og-en.png', '/og/og-square-pt-BR.png', '/og/og-square-en.png', '/icons/icon-512.png']) {
      const r = await request.get(path);
      expect(r.status(), path).toBe(200);
      expect(r.headers()['content-type']).toContain('image/png');
    }
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('User-agent: GPTBot');
    expect(robots).toContain('User-agent: ClaudeBot');
    expect(robots).toContain('Sitemap: https://victors.codes/sitemap.xml');

    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap.match(/<loc>/g)).toHaveLength(4);
    expect(sitemap).toContain('hreflang="x-default"');

    const llms = await (await request.get('/llms.txt')).text();
    expect(llms).toMatch(/^# Victor Augusto Ferreira dos Santos/);
    expect((await request.get('/llms-full.txt')).status()).toBe(200);

    const manifest = await (await request.get('/manifest.webmanifest')).json();
    expect(manifest.icons.length).toBeGreaterThan(1);

    const sec = await (await request.get('/.well-known/security.txt')).text();
    expect(sec).toContain('Contact: mailto:');
    expect(sec).toMatch(/Expires: \d{4}-/);
  });

  test('root / redirects by script (no meta refresh), is noindex and canonical to classic', async ({ page, request }) => {
    const html = await (await request.get('/')).text();
    expect(html).not.toMatch(/http-equiv="refresh"/i);
    expect(html).toMatch(/<meta name="robots" content="noindex/);
    expect(html).toContain(`<link rel="canonical" href="${SITE}/pt-BR/classic/"`);
    await page.goto('/');
    await expect(page).toHaveURL(/\/pt-BR\/$/);
  });

  test('footer shows the "updated" date on both versions', async ({ page }) => {
    await page.goto('/pt-BR/classic/');
    await expect(page.locator('footer time').first()).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    await expect(page.locator('footer time').first()).toContainText(/Atualizado em \d{1,2} \w+ \d{4}/);
    await page.goto('/en/');
    await expect(page.locator('footer [data-updated]')).toContainText(/Updated \d{1,2} \w+ \d{4}/);
  });
});

test.describe('404', () => {
  test('unknown URL shows "Perdido no espaço" with a real 404 and noindex', async ({ page }) => {
    const res = await page.goto('/qualquer-coisa/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText(/Perdido/i);
    await expect(page.locator('h1')).toContainText(/espaço/i);
    await expect(page.locator('body')).toContainText('Lost in space');
    await expect(page.locator('body')).toContainText('/qualquer-coisa/');
    expect(await page.locator('meta[name="robots"]').first().getAttribute('content')).toContain('noindex');
    await expect(page.getByRole('link', { name: 'Versão clássica' })).toHaveAttribute('href', '/pt-BR/classic/');
    await page.locator('[data-home]').click();
    await expect(page).toHaveURL(/\/pt-BR\/$/);
  });
});
