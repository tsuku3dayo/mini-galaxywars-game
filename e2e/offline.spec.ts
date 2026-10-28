import { expect, test } from '@playwright/test';

// Service Worker のオフラインの確認は Chromium だけで行う（WebKit の Playwright は Service Worker の扱いが限られるため）
test.describe('オフライン', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium だけ');

  test('MGW-TC-0002-01 一度開いたあと、ネットワークを切っても起動して遊べる', async ({ page, context }) => {
    await page.goto('./');
    // Service Worker が動き、このページを受け持つまで待つ
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('.app-name')).toHaveText('銀河戦争ミニ');
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
    await context.setOffline(false);
  });
});
