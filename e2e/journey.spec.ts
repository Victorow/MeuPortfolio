import { test, expect, type Page } from '@playwright/test';

const CHAPTERS = ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'venus', 'neptune', 'deep'] as const;

test.setTimeout(240_000);

async function waitForJourney(page: Page) {
  await page.goto('/pt-BR/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 30_000 });
  // let the hero reveal settle
  await page.waitForTimeout(1500);
}

async function scrollToChapter(page: Page, id: string) {
  await page.evaluate((c) => {
    const el = document.querySelector(`[data-chapter="${c}"]`) as HTMLElement | null;
    if (!el) throw new Error(`chapter ${c} missing`);
    const top = el.getBoundingClientRect().top + window.scrollY + 2;
    window.scrollTo({ top, behavior: 'auto' });
    window.dispatchEvent(new Event('scroll'));
  }, id);
  await page.waitForTimeout(1600);
}

test.describe('journey', () => {
  test('renders all 8 chapters, indicator follows, no page errors', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await waitForJourney(page);
    await expect(page.locator('h1')).toContainText(/Victor/i);

    for (const c of CHAPTERS) {
      await expect(page.locator(`[data-chapter="${c}"]`)).toHaveCount(1);
      await scrollToChapter(page, c);
      await expect(page.locator('[data-chapter-indicator]')).toContainText(String(CHAPTERS.indexOf(c) + 1).padStart(2, '0'), {
        timeout: 8000
      });
      await page.screenshot({ path: `e2e/screenshots/${info.project.name}-${c}.png`, fullPage: false });
    }

    const relevant = errors.filter((e) => !/favicon|Download the React DevTools|posters\//i.test(e));
    expect(relevant, relevant.join('\n')).toEqual([]);
  });

  test('project chapters show title, stack and at least one link where available', async ({ page }) => {
    await waitForJourney(page);
    await scrollToChapter(page, 'saturn');
    const saturn = page.locator('[data-chapter="saturn"]');
    await expect(saturn.getByRole('heading', { level: 2 })).toContainText('Duo');
    await expect(saturn.locator('.chip')).toHaveCount(4);
    await expect(saturn.getByRole('link', { name: /reposit/i })).toHaveAttribute('href', /github\.com\/Victorow/);
  });

  test('header: menu navigates, CV link points to the PDF, locale switch works', async ({ page }) => {
    await waitForJourney(page);

    await page.getByRole('button', { name: /^menu$/i }).click({ timeout: 20_000 });
    const overlay = page.locator('[data-menu-overlay]');
    await expect(overlay).toBeVisible();
    await overlay.getByRole('link', { name: /saturno/i }).click();
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('[data-chapter-indicator]')).toContainText('04', { timeout: 8000 });

    const cv = page.getByRole('link', { name: /curr[ií]culo/i }).first();
    await expect(cv).toHaveAttribute('href', /\/cv\/.*\.pdf$/);

    await page.getByRole('link', { name: /^EN$/ }).click();
    await expect(page).toHaveURL(/\/en\//, { timeout: 10_000 });
    await expect(page.locator('h1')).toContainText(/Victor/i);
  });

  test('contact chapter exposes email and GitHub', async ({ page }) => {
    await waitForJourney(page);
    await scrollToChapter(page, 'deep');
    const deep = page.locator('[data-chapter="deep"]');
    await expect(deep.locator('a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:victoroow@gmail.com');
    await expect(deep.getByRole('link', { name: /github/i })).toHaveAttribute('href', 'https://github.com/Victorow');
  });

  test('"Ver projetos" lands on Mars with the first project readable', async ({ page }) => {
    await waitForJourney(page);
    await page.getByRole('button', { name: /ver projetos/i }).click();
    await expect(page.locator('[data-chapter-indicator]')).toContainText('02', { timeout: 8000 });
    await page.waitForTimeout(1800);
    const content = page.locator('[data-chapter="mars"] .chapter-content');
    await expect(content.getByRole('heading', { level: 2 })).toContainText('OppyConnect');
    const opacity = await content.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.9);
    // and the hero must be gone
    const heroOpacity = await page.locator('[data-chapter="earth"] .chapter-content').evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(heroOpacity).toBeLessThan(0.1);
  });

  test('one screen of scroll past a project chapter shows the next project', async ({ page }) => {
    await waitForJourney(page);
    await scrollToChapter(page, 'mars');
    const vh = await page.evaluate(() => window.innerHeight);
    await page.evaluate((dy) => { window.scrollBy({ top: dy, behavior: 'auto' }); window.dispatchEvent(new Event('scroll')); }, Math.round(vh * 1.4));
    await page.waitForTimeout(1800);
    await expect(page.locator('[data-chapter-indicator]')).toContainText('03');
    const opacity = await page.locator('[data-chapter="jupiter"] .chapter-content').evaluate((el) => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.9);
  });

  test('locale control highlights the current language', async ({ page }) => {
    await waitForJourney(page);
    await expect(page.getByRole('link', { name: /^PT$/ })).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('link', { name: /^EN$/ })).not.toHaveAttribute('aria-current', 'true');
  });

  test('one wheel notch steps to the next chapter; a long menu jump warps', async ({ page, isMobile }) => {
    test.skip(isMobile, 'wheel stepping is desktop only');
    await waitForJourney(page);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 120);
    await expect(page.locator('[data-chapter-indicator]')).toContainText('02', { timeout: 4000 });
    await page.waitForTimeout(1500);
    await page.mouse.wheel(0, 120);
    await expect(page.locator('[data-chapter-indicator]')).toContainText('03', { timeout: 4000 });

    await page.getByRole('button', { name: /^menu$/i }).click();
    await page.locator('[data-menu-overlay]').getByRole('link', { name: /contato/i }).click();
    await expect(page.locator('[data-warp]')).toHaveAttribute('data-active', 'true', { timeout: 3000 });
    await expect(page.locator('[data-chapter-indicator]')).toContainText('08', { timeout: 6000 });
    await expect(page.locator('[data-warp]')).toHaveAttribute('data-active', 'false', { timeout: 6000 });
  });
});
