import { test, expect, type Page } from '@playwright/test';

test.setTimeout(120_000);

async function waitReady(page: Page, path = '/pt-BR/') {
  await page.goto(path);
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 30_000 });
  await page.waitForTimeout(800);
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return () => errors.filter((e) => !/favicon|Download the React DevTools|posters\//i.test(e));
}

test.describe('phase 2 tools', () => {
  test('#60s opens the summary with 3 projects and the e-mail; Esc closes it', async ({ page }) => {
    const errors = collectErrors(page);
    await waitReady(page, '/pt-BR/#60s');
    const dialog = page.locator('[data-sixty]');
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await expect(dialog.locator('[data-sixty-project]')).toHaveCount(3);
    await expect(dialog).toContainText('victoroow@gmail.com');
    await expect(dialog.getByRole('link', { name: /curr[ií]culo/i })).toHaveAttribute('href', /\/cv\/.*\.pdf$/);
    await expect(dialog).not.toContainText(/dispon[ií]vel|open to work/i);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(errors()).toEqual([]);
  });

  test('header 60s button opens the summary; "explore" closes it', async ({ page }) => {
    await waitReady(page);
    await page.getByRole('button', { name: /resumo em 60 segundos/i }).click();
    const dialog = page.locator('[data-sixty]');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('link', { name: /explorar a vers[aã]o completa/i }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('~ toggles Mission Control with fps, tier and chapter', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard shortcut; mobile uses the menu entry');
    await waitReady(page);
    await page.keyboard.press('~');
    const panel = page.locator('[data-mission-control]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('fps');
    await expect(panel).toContainText('tier');
    await expect(panel).toContainText(/01 terra/i);
    await page.keyboard.press('~');
    await expect(panel).toHaveCount(0);
  });

  test('menu opens Mission Control', async ({ page }) => {
    await waitReady(page);
    await page.getByRole('button', { name: /^menu$/i }).click();
    await page.locator('[data-menu-overlay]').getByRole('button', { name: /mission control/i }).click();
    await expect(page.locator('[data-mission-control]')).toContainText('fps');
  });

  test('P hides the UI and shows the photo bar; capture downloads a PNG', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard shortcut; mobile uses the menu entry');
    const errors = collectErrors(page);
    await waitReady(page);
    await expect(page.locator('header')).toBeVisible();
    await page.keyboard.press('p');
    await expect(page.locator('header')).toHaveCount(0);
    await expect(page.locator('[data-chapter-indicator]')).toHaveCount(0);
    const bar = page.locator('[data-photo-bar]');
    await expect(bar.getByRole('button', { name: 'Capturar' })).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent('download'), bar.getByRole('button', { name: 'Capturar' }).click()]);
    expect(download.suggestedFilename()).toBe('victor-augusto-earth.png');
    await bar.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.locator('header')).toBeVisible();
    expect(errors()).toEqual([]);
  });
});
