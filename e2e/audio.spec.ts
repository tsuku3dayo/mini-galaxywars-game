import { expect, test, type Page } from '@playwright/test';
import { advance, freeze, getState, setState } from './helpers';

/** タイトルの START で始め、UFO を 1 機倒すところまで進める（音を鳴らす場面を通る） */
async function startAndScore(page: Page) {
  await page.goto('./?debug=1#/title');
  await page.locator('#screen-title').getByRole('button', { name: 'START' }).click();
  const body = page.locator('body');
  await expect(body).toHaveAttribute('data-screen', 'play');
  await expect(body).toHaveAttribute('data-status', 'ready');
  await freeze(page, true);
  const ufo = ((await getState(page)).ufos as { x: number; y: number }[])[5]!;
  await setState(page, {
    status: 'playing',
    meteors: [],
    beams: [],
    beamTimer: 1e9,
    missile: { x: ufo.x, y: ufo.y + 21, isLaunched: true, isBoosting: true },
  });
  // 噴射（ジェット音）と UFO の破壊音の場面を通る
  await advance(page, 1, { boost: true });
  await advance(page, 30, { boost: true });
  await expect(body).toHaveAttribute('data-score', '100');
  await freeze(page, false);
  // 止めていたループを戻すと、ゲームは進み続ける
  const before = Number((await getState(page)).stepCount);
  await expect.poll(async () => Number((await getState(page)).stepCount)).toBeGreaterThan(before);
}

test.describe('音を有効にする', () => {
  test('MGW-TC-0024-02 音が鳴らせない状態でも、ゲームは止まらずに動く', async ({ page }) => {
    // Web Audio がない端末のまね
    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>;
      delete w.AudioContext;
      delete w.webkitAudioContext;
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await startAndScore(page);
    await expect(page.locator('body')).toHaveAttribute('data-audio', 'unavailable');
    expect(errors).toEqual([]);
  });

  test('MGW-TC-0024-02 音を有効にできない（resume が失敗する）ときも、ゲームは止まらずに動く', async ({ page }) => {
    // E2E の WebKit（Windows）には AudioContext がないので、あるときだけまねる
    await page.addInitScript(() => {
      if ('AudioContext' in window) AudioContext.prototype.resume = () => Promise.reject(new Error('not allowed'));
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await startAndScore(page);
    await expect(page.locator('body')).toHaveAttribute('data-audio', 'unavailable');
    expect(errors).toEqual([]);
  });
});
