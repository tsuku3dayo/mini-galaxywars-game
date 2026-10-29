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
  test('MGW-TC-0018-01 P・Esc・「一時停止」ボタンで一時停止し、もう一度押すと再開する', async ({ page, isMobile }) => {
    await openPlay(page);
    await clearField(page);
    // 操作空間の下（PC はゲーム画面の下）のボタンの段の左
    const pauseButton = page.locator('#play-buttons').getByRole('button', { name: '一時停止' });
    await expect(pauseButton).toBeVisible();
    // ゲーム画面（タッチ端末は操作空間）より下の、左の端
    const game = (await page.locator('#game').boundingBox())!;
    const above = isMobile ? (await page.locator('#control-area').boundingBox())! : game;
    const button = (await pauseButton.boundingBox())!;
    expect(button.y).toBeGreaterThanOrEqual(above.y + above.height - 0.5);
    expect(button.x).toBeCloseTo(game.x, 0);

    // 一時停止ボタン → もう一度押す
    await pauseButton.click();
    await expectPaused(page);
    await pauseButton.click();
    await expectResumed(page, 'ready');

    // 一時停止ボタン → RESUME
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

    // 一時停止はプレイ中だけ（タイトルでは出さない）
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
