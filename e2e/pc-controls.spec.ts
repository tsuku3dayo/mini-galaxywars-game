import { expect, test, type Page } from '@playwright/test';
import { clearField, getState, openPlay } from './helpers';

// キー・マウスの操作は PC だけ（タッチは MGW-TASK-0013）
test.describe('PC の操作', () => {
  test.skip(({ isMobile }) => isMobile, 'PC だけ');

  const launcherX = async (page: Page) => (await getState(page)).launcherX;

  test('MGW-TC-0006-03 ←→・A D・マウスの移動で、発射台がミサイルといっしょに横に動き、画面の端で止まる', async ({ page }) => {
    await openPlay(page);
    await clearField(page);

    for (const [right, left] of [
      ['ArrowRight', 'ArrowLeft'],
      ['KeyD', 'KeyA'],
    ] as const) {
      await page.keyboard.down(right);
      await expect.poll(() => launcherX(page)).toBe(456);
      await page.keyboard.up(right);
      await page.keyboard.down(left);
      await expect.poll(() => launcherX(page)).toBe(24);
      await page.keyboard.up(left);
    }
    const state = await getState(page);
    expect(state.missile).toMatchObject({ x: 24, y: 596, isLaunched: false });

    // マウスの x を追い、端で止まる
    const box = (await page.locator('#game').boundingBox())!;
    await page.mouse.move(box.x + box.width - 1, box.y + box.height / 2);
    await expect.poll(() => launcherX(page)).toBe(456);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(() => launcherX(page)).toBeCloseTo(240, 0);
    expect((await getState(page)).missile.x).toBe(await launcherX(page));
  });

  test('MGW-TC-0006-05 Space かクリックで発射し、ミサイルが上昇を始める', async ({ page }) => {
    await openPlay(page);
    await clearField(page);
    await page.keyboard.press('Space');
    await expect(page.locator('body')).toHaveAttribute('data-status', 'playing');
    const y0 = (await getState(page)).missile.y;
    await expect.poll(async () => (await getState(page)).missile.y).toBeLessThan(y0 - 10);

    // クリックでも発射する
    await openPlay(page);
    await clearField(page);
    const box = (await page.locator('#game').boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.8);
    await expect(page.locator('body')).toHaveAttribute('data-status', 'playing');
    expect((await getState(page)).missile.isLaunched).toBe(true);
  });
});
