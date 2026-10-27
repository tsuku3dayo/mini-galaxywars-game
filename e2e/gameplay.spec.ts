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
});
