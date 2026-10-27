import { expect, test } from '@playwright/test';
import { advance, freeze, getState, openPlay, setState } from './helpers';

test.describe('プレイ', () => {
  test('MGW-TC-0011-03 発射前のミサイルの先端に隕石が触れてもミスになる', async ({ page }) => {
    await openPlay(page);
    await freeze(page, true);
    // 最下段（y 576）の隕石を、発射台の上のミサイル（x 240）の真上に置く
    await setState(page, {
      meteors: [{ pos: 456 * 11 + 228, x: 240, y: 576, lane: 11, direction: -1 }],
      beams: [],
      beamTimer: 1e9,
    });
    await advance(page, 1);
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-status', 'respawn');
    await expect(body).toHaveAttribute('data-lives', '2');
    expect((await getState(page)).waitReason).toBe('miss');
  });

  test('MGW-TC-0017-02 UFO を 8 機すべて倒すと、クリアの表示が出てゲームが終わる', async ({ page }) => {
    await openPlay(page);
    await freeze(page, true);
    // 7 機を倒した状態で、次のステップで 8 機目（下段の id 5）に当たるように置く
    const base = await getState(page);
    const ufos = (base.ufos as { id: number; x: number; y: number; isAlive: boolean }[]).map((u) => ({ ...u, isAlive: u.id === 5 }));
    const last = ufos[5]!;
    await setState(page, {
      ufos,
      killCount: 7,
      status: 'playing',
      missile: { x: last.x, y: last.y + 21, isLaunched: true, isBoosting: false },
      meteors: [],
      beams: [],
      beamTimer: 1e9,
    });
    await advance(page, 1);
    const body = page.locator('body');
    const message = page.locator('#overlay-message');
    await expect(body).toHaveAttribute('data-status', 'cleared');
    await expect(body).toHaveAttribute('data-overlay', 'clear');
    await expect(message.locator('.message-main')).toHaveText('GOOD!!');
    await expect(message.locator('.message-sub')).toHaveText('STAGE CLEAR');
    // ゲームは終わり、もう進まない
    const stepCount = (await getState(page)).stepCount;
    await advance(page, 10);
    expect((await getState(page)).stepCount).toBe(stepCount);
    // 3 秒たつと「TITLE」が出て、タイトルに戻れる（ランキング登録への分かれ道は MGW-TASK-0018）
    const titleButton = message.getByRole('link', { name: 'TITLE' });
    await expect(titleButton).toBeHidden();
    await expect(titleButton).toBeVisible({ timeout: 6000 });
    await titleButton.click();
    await expect(body).toHaveAttribute('data-screen', 'title');
  });

  test('ゲームオーバーの表示と、最初の READY', async ({ page }) => {
    await openPlay(page);
    // 始めの 1 秒は READY を出し、そのあと消す
    const message = page.locator('#overlay-message');
    await freeze(page, true);
    await advance(page, 0);
    await expect(message.locator('.message-main')).toHaveText('READY');
    await advance(page, 120);
    await expect(message).toBeHidden();

    await setState(page, { lives: 0, status: 'respawn', waitReason: 'miss', waitSteps: 1 });
    await advance(page, 2);
    await expect(page.locator('body')).toHaveAttribute('data-status', 'gameOver');
    await expect(page.locator('body')).toHaveAttribute('data-overlay', 'gameover');
    await expect(message.locator('.message-main')).toHaveText('GAME OVER');
    await expect(message.locator('.message-sub')).toBeHidden();
  });
});
