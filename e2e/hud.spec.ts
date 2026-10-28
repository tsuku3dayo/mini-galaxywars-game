import { expect, test, type Page } from '@playwright/test';
import { advance, clearField, countRuns, freeze, getState, hasInk, openPlay, setState } from './helpers';

// 左下の控えの発射台のアイコン（y 625〜631）の、横いっぱいに塗った行で、数字（x 12〜28）より右の塊を数える
const lifeIcons = (page: Page) => countRuns(page, 628, 34, 480);

test.describe('HUD', () => {
  test('MGW-TC-0015-01 HUD 帯（y 0–48）に「SCORE」「HIGH」が出て、残機は画面の左下（地面の下）に出る', async ({ page }) => {
    await openPlay(page);
    await freeze(page, true);
    await clearField(page);
    await advance(page, 0);
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-score', '0');
    await expect(body).toHaveAttribute('data-high', '0');
    await expect(body).toHaveAttribute('data-lives', '3');
    // SCORE（左上 x 12〜188）、HIGH（右上 x 308〜468）は y 8〜24
    expect(await hasInk(page, 12, 8, 176, 16)).toBe(true);
    expect(await hasInk(page, 308, 8, 160, 16)).toBe(true);
    // HUD 帯には残機を出さない（前の場所 y 32〜38 の右半分には何もない）。真ん中の上の段（x 200〜290）にも何もない
    expect(await hasInk(page, 240, 32, 228, 6)).toBe(false);
    expect(await hasInk(page, 200, 0, 90, 48)).toBe(false);
    // 左下：地面（y 616〜618）の下に、残機の数（x 12〜28）と控えのアイコン
    expect(await hasInk(page, 0, 616, 480, 2)).toBe(true);
    expect(await hasInk(page, 12, 620, 16, 16)).toBe(true);
    // 残機は 3 基（画面に出ている 1 基を含む）なので、控えのアイコンは 2 つ
    expect(await lifeIcons(page)).toBe(2);
    // スコアが変わると出し直す
    await setState(page, { score: 150 });
    await expect(body).toHaveAttribute('data-score', '150');
  });

  test('MGW-TC-0019-02 スコアが 1,000 点に届くと、残機が 1 基増え、左下の残機の数とアイコンが 1 つ増える', async ({ page }) => {
    await openPlay(page);
    await freeze(page, true);
    await clearField(page);
    expect(await lifeIcons(page)).toBe(2);
    // 次のステップで下段の UFO（id 5）の下部中央（100 点）に当たるように置く
    const ufo = ((await getState(page)).ufos as { x: number; y: number }[])[5]!;
    await setState(page, { score: 950, status: 'playing', missile: { x: ufo.x, y: ufo.y + 20, isLaunched: true, isBoosting: false } });
    await advance(page, 1);
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-score', '1050');
    await expect(body).toHaveAttribute('data-lives', '4');
    expect(await lifeIcons(page)).toBe(3);
  });
});
