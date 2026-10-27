import { expect, test, type Page } from '@playwright/test';
import { clearField, getState, openPlay } from './helpers';

const body = (page: Page) => page.locator('body');

/** 一時停止していることと、止まっている間はゲームが進まないことを確かめる */
async function expectPaused(page: Page) {
  await expect(body(page)).toHaveAttribute('data-status', 'paused');
  await expect(body(page)).toHaveAttribute('data-overlay', 'pause');
  const message = page.locator('#overlay-message');
  await expect(message.locator('.message-main')).toHaveText('PAUSE');
  await expect(message.getByRole('button', { name: 'RESUME' })).toBeVisible();
  const before = (await getState(page)).stepCount;
  await page.waitForTimeout(300);
  expect((await getState(page)).stepCount).toBe(before);
}

async function expectResumed(page: Page, status: string) {
  await expect(body(page)).toHaveAttribute('data-status', status);
  await expect(body(page)).toHaveAttribute('data-overlay', 'none');
  await expect(page.locator('#overlay-message').getByRole('button', { name: 'RESUME' })).toBeHidden();
}

test.describe('一時停止', () => {
  test('MGW-TC-0018-01 P・Esc・「Pause」ボタンで一時停止し、もう一度押すと再開する', async ({ page, isMobile }) => {
    await openPlay(page);
    await clearField(page);
    const pauseButton = page.locator('#topbar').getByRole('button', { name: 'Pause' });
    await expect(pauseButton).toBeVisible();

    // Pause ボタン → もう一度 Pause
    await pauseButton.click();
    await expectPaused(page);
    await pauseButton.click();
    await expectResumed(page, 'ready');

    // Pause ボタン → RESUME
    await pauseButton.click();
    await expectPaused(page);
    await page.locator('#overlay-message').getByRole('button', { name: 'RESUME' }).click();
    await expectResumed(page, 'ready');

    if (!isMobile) {
      // P・Esc（上昇中に止めると、上昇中に戻る）
      await page.keyboard.press('Space');
      await expect(body(page)).toHaveAttribute('data-status', 'playing');
      for (const key of ['KeyP', 'Escape']) {
        await page.keyboard.press(key);
        await expectPaused(page);
        await page.keyboard.press(key);
        await expectResumed(page, 'playing');
      }
    }

    // Pause はプレイ中だけ（タイトルでは出さない）
    await page.evaluate(() => (location.hash = '#/title'));
    await expect(pauseButton).toBeHidden();
  });

  test('MGW-TC-0018-02 タブが隠れたり、アプリが裏に回ったりすると、一時停止になる', async ({ page }) => {
    await openPlay(page);
    await clearField(page);
    // 隠れたときと同じ知らせを送る
    const setVisibility = (state: 'hidden' | 'visible') =>
      page.evaluate((v) => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
        document.dispatchEvent(new Event('visibilitychange'));
      }, state);
    await setVisibility('hidden');
    await expectPaused(page);
    // また見えても勝手には再開しない（RESUME で再開する）
    await setVisibility('visible');
    await expect(body(page)).toHaveAttribute('data-status', 'paused');
    await page.locator('#overlay-message').getByRole('button', { name: 'RESUME' }).click();
    await expectResumed(page, 'ready');
  });
});
