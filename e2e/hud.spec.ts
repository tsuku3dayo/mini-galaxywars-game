import { expect, test, type Page } from '@playwright/test';
import { advance, clearField, countRuns, freeze, getState, hasInk, openPlay, setState } from './helpers';

// 残機のアイコンの段（y 32〜38）の真ん中の行で、右半分の塊を数える
const lifeIcons = (page: Page) => countRuns(page, 35, 240, 480);

test.describe('HUD', () => {
  test('MGW-TC-0015-01 HUD 帯（y 0–48）に「SCORE」「HIGH」と残機が出る', async ({ page }) => {
    await openPlay(page);
    await freeze(page, true);
    await clearField(page);
    await advance(page, 0);
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-score', '0');
    await expect(body).toHaveAttribute('data-high', '0');
    await expect(body).toHaveAttribute('data-lives', '3');
    // SCORE（左上 x 12〜188）、HIGH（右上 x 308〜468）は y 8〜24、残機は y 32〜38
    expect(await hasInk(page, 12, 8, 176, 16)).toBe(true);
    expect(await hasInk(page, 308, 8, 160, 16)).toBe(true);
    expect(await hasInk(page, 240, 32, 228, 6)).toBe(true);
    // HUD の文字と残機は HUD 帯の中だけ：真ん中の上の段（x 200〜290）には何もない
    expect(await hasInk(page, 200, 0, 90, 48)).toBe(false);
    // 残機は 3 基（画面に出ている 1 基を含む）
    expect(await lifeIcons(page)).toBe(3);
    // スコアが変わると出し直す
    await setState(page, { score: 150 });
    await expect(body).toHaveAttribute('data-score', '150');
  });

  test('MGW-TC-0019-02 スコアが 1,000 点に届くと、残機が 1 基増え、HUD の発射台のアイコンが 1 つ増える', async ({ page }) => {
    await openPlay(page);
    await freeze(page, true);
    await clearField(page);
    expect(await lifeIcons(page)).toBe(3);
    // 次のステップで下段の UFO（id 5）の下部中央（100 点）に当たるように置く
    const ufo = ((await getState(page)).ufos as { x: number; y: number }[])[5]!;
    await setState(page, { score: 950, status: 'playing', missile: { x: ufo.x, y: ufo.y + 21, isLaunched: true, isBoosting: false } });
    await advance(page, 1);
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-score', '1050');
    await expect(body).toHaveAttribute('data-lives', '4');
    expect(await lifeIcons(page)).toBe(4);
  });
});
