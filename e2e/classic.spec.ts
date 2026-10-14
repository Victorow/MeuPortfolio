import { test, expect, type Page } from '@playwright/test';

const LOCALES = ['pt-BR', 'en'] as const;
const ORIGIN = 'http://localhost:3100';

/** Collects page errors, console errors and any request leaving the site's origin. */
function watch(page: Page) {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(ORIGIN) && !url.startsWith('data:') && !url.startsWith('blob:')) external.push(url);
  });
  return { errors, external };
}

const design = (page: Page) => page.locator('html').getAttribute('data-design');

test.describe('classic route', () => {
  for (const locale of LOCALES) {
    test(`/${locale}/classic/ renders design A with the full name, 5 projects, FAQ and contact`, async ({ page }) => {
      const w = watch(page);
      const res = await page.goto(`/${locale}/classic/`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      expect(await design(page)).toBe('a');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(/Victor\s*Augusto\s*Ferreira dos Santos/);
      await expect(page.locator('[data-project]')).toHaveCount(5);
      await expect(page.locator('#faq details')).toHaveCount(7);
      await expect(page.locator('a[href="mailto:victoroow@gmail.com"]').first()).toBeVisible();
      await expect(page.locator('a[href="/cv/Victor-Augusto-Ferreira-dos-Santos.pdf"]').first()).toBeVisible();
      await expect(page.locator(`a[href="/${locale}/"]`).first()).toBeVisible();
      // never an availability status
      await expect(page.locator('body')).not.toContainText(/dispon[ií]vel|open to work|available for/i);
      // external links are isolated
      for (const a of await page.locator('a[target="_blank"]').all()) {
        await expect(a).toHaveAttribute('rel', /noopener/);
        await expect(a).toHaveAttribute('rel', /noreferrer/);
      }
      await page.waitForTimeout(500);
      expect(w.errors, w.errors.join('\n')).toEqual([]);
      expect(w.external, w.external.join('\n')).toEqual([]);
    });
  }

  test('switch toggles the design, persists across reloads, and A/B keys work', async ({ page }) => {
    const w = watch(page);
    await page.goto('/pt-BR/classic/');
    const pill = page.locator('[data-design-switch]');
    await expect(pill).toBeVisible();
    await pill.getByRole('button', { name: /B · Dossi/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-design', 'b');
    await expect(page.locator('.cb')).toBeVisible();
    await expect(page.locator('.ca')).toHaveCount(0);
    await expect(pill.getByRole('button', { name: /B · Dossi/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('h1')).toHaveText(/Victor\s*Augusto\s*Ferreira dos Santos/);
    await expect(page.locator('[data-project]')).toHaveCount(5);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-design', 'b');
    await expect(page.locator('.cb')).toBeVisible();

    await page.locator('body').press('a');
    await expect(page.locator('html')).toHaveAttribute('data-design', 'a');
    await expect(page.locator('.ca')).toBeVisible();
    await page.locator('body').press('b');
    await expect(page.locator('html')).toHaveAttribute('data-design', 'b');
    expect(w.errors, w.errors.join('\n')).toEqual([]);
  });

  test('without the View Transitions API the switch falls back to the crossfade', async ({ page }) => {
    await page.addInitScript(() => {
      delete (Document.prototype as unknown as { startViewTransition?: unknown }).startViewTransition;
    });
    const w = watch(page);
    await page.goto('/pt-BR/classic/');
    await page.locator('[data-design-switch]').getByRole('button', { name: /B · Dossi/ }).click();
    await expect(page.locator('.ds-stage')).toHaveAttribute('data-phase', 'out');
    await expect(page.locator('html')).toHaveAttribute('data-design', 'b');
    await expect(page.locator('.ds-stage')).toHaveAttribute('data-phase', 'idle');
    await expect(page.locator('.cb')).toBeVisible();
    expect(w.errors, w.errors.join('\n')).toEqual([]);
  });

  test('#b in the URL selects design B on load', async ({ page }) => {
    await page.goto('/en/classic/#b');
    await expect(page.locator('html')).toHaveAttribute('data-design', 'b');
    await expect(page.locator('.cb')).toBeVisible();
    await page.goto('/en/classic/#a');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-design', 'a');
  });

  test('projects expand and the locale link keeps the classic route', async ({ page }) => {
    await page.goto('/pt-BR/classic/');
    const duo = page.locator('[data-project="duo"] details');
    await expect(duo).not.toHaveAttribute('open', '');
    await duo.locator('summary').click();
    await expect(duo).toHaveAttribute('open', '');
    await expect(duo.getByRole('link', { name: /reposit/i })).toHaveAttribute('href', /github\.com\/Victorow/);
    await page.locator('header.top').getByRole('link', { name: 'EN', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/classic\/$/);
  });
});

test.describe('classic without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('content and expandable projects work with JS disabled', async ({ page }) => {
    await page.goto('/pt-BR/classic/');
    await expect(page.locator('h1')).toHaveText(/Victor\s*Augusto\s*Ferreira dos Santos/);
    await expect(page.locator('[data-project]')).toHaveCount(5);
    const tg = page.locator('[data-project="telegram"] details');
    await tg.locator('summary').click();
    await expect(tg).toHaveAttribute('open', '');
    await expect(page.locator('[data-design-switch]')).toBeHidden();
  });
});

test.describe('3D <-> classic bridge', () => {
  test('header links to classic; choosing it is remembered; "3D version" forgets it', async ({ page }) => {
    await page.goto('/pt-BR/');
    const link = page.locator('header [data-classic-link]');
    await expect(link).toHaveAttribute('href', '/pt-BR/classic/');
    await link.click();
    await expect(page).toHaveURL(/\/pt-BR\/classic\/$/);
    expect(await page.evaluate(() => localStorage.getItem('vp:version'))).toBe('classic');

    // returning to the 3D home sends the visitor back to classic
    await page.goto('/pt-BR/');
    await expect(page).toHaveURL(/\/pt-BR\/classic\/$/, { timeout: 10_000 });

    // ?stay=3d opts out once
    await page.goto('/pt-BR/?stay=3d');
    await expect(page).toHaveURL(/\/pt-BR\/\?stay=3d$/);

    // "Versão 3D" clears the preference
    await page.goto('/pt-BR/classic/');
    await page.locator('[data-version-link="3d"]').first().click();
    await expect(page).toHaveURL(/\/pt-BR\/$/);
    expect(await page.evaluate(() => localStorage.getItem('vp:version'))).toBeNull();
  });

  test('menu offers the classic version', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('[data-menu-overlay] [data-classic-link]')).toHaveAttribute('href', '/en/classic/');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('3D shows a one-line banner pointing to the classic version', async ({ page }) => {
    await page.goto('/pt-BR/');
    const banner = page.locator('[data-classic-banner]');
    await expect(banner).toBeVisible({ timeout: 15_000 });
    await expect(banner.getByRole('link')).toHaveAttribute('href', '/pt-BR/classic/');
  });
});
