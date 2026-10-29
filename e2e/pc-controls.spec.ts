import { expect, test, type Page } from '@playwright/test';
import { advance, clearField, freeze, getState, hasInk, openPlay, setState } from './helpers';

// キー・マウスの操作は PC だけ（タッチは MGW-TASK-0013）
test.describe('PC の操作', () => {
  test.skip(({ isMobile }) => isMobile, 'PC だけ');

  const launcherX = async (page: Page) => (await getState(page)).launcherX;

  test('MGW-TC-0006-03 ←→・A D・マウスの移動で、発射台がミサイルといっしょに横に動き、画面の端で止まる', async ({ page }) => {
    await openPlay(page);
    await clearField(page);

    // 横の速さは 60 px/秒なので、端の近くから動かして、端で止まることを見る
    for (const [right, left] of [
      ['ArrowRight', 'ArrowLeft'],
      ['KeyD', 'KeyA'],
    ] as const) {
      await setState(page, { launcherX: 420 });
      await page.keyboard.down(right);
      await expect.poll(() => launcherX(page)).toBe(456);
      await page.keyboard.up(right);
      await setState(page, { launcherX: 60 });
      await page.keyboard.down(left);
      await expect.poll(() => launcherX(page)).toBe(24);
      await page.keyboard.up(left);
    }
    const state = await getState(page);
    expect(state.missile).toMatchObject({ x: 24, y: 596, isLaunched: false });

    // マウスの x を追い、端で止まる
    // 指・マウスへ近づく速さは 120 px/秒
    const box = (await page.locator('#game').boundingBox())!;
    await setState(page, { launcherX: 400 });
    await page.mouse.move(box.x + box.width - 1, box.y + box.height / 2);
    await expect.poll(() => launcherX(page)).toBe(456);
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
    await expect.poll(() => launcherX(page)).toBeCloseTo(360, 0);
    expect((await getState(page)).missile.x).toBe(await launcherX(page));
  });

  test('MGW-TC-0006-09 発射したら、発射台は消える（発射前だけ描く）', async ({ page }) => {
    await openPlay(page);
    await clearField(page);
    await freeze(page, true);
    // 発射台の場所（中心 240, 608、48 × 16。下の地面 616 は含めない）
    const launcherInk = () => hasInk(page, 218, 601, 44, 14);
    await advance(page, 1);
    expect(await launcherInk()).toBe(true);
    // 発射して、ミサイルが発射台の場所から出るまで進める（45 px/秒で 1 秒）
    await advance(page, 1, { launch: true });
    expect((await getState(page)).status).toBe('playing');
    await advance(page, 120);
    expect(await launcherInk()).toBe(false);
  });

  test('MGW-TC-0006-05 Space かクリック（10 px 未満しか動かないもの）で発射し、ミサイルが上昇を始める', async ({ page }) => {
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
    // ボタンを押したまま動かして離したとき（なぞり）は発射しない
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.8);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height * 0.8, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    await expect(page.locator('body')).toHaveAttribute('data-status', 'ready');
    // クリックは発射する
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.8);
    await expect(page.locator('body')).toHaveAttribute('data-status', 'playing');
    expect((await getState(page)).missile.isLaunched).toBe(true);
  });
});
