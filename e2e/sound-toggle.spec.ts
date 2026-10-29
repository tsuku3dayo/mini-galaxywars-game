import { expect, test, type Page } from '@playwright/test';
import { clearField, getState, openPlay } from './helpers';

// 効果音のオン・オフ（MGW-US-0034、MGW-GUI-0002・0003）
const titleSound = (page: Page) => page.locator('#screen-title .sound-toggle');
const playSound = (page: Page) => page.locator('#play-buttons .sound-toggle');
const body = (page: Page) => page.locator('body');

test.describe('効果音のオン・オフ', () => {
  test('MGW-TC-0034-01 タイトル画面とプレイ画面に、効果音のボタンがある。プレイ画面では、操作空間の下の右', async ({ page, isMobile }) => {
    await page.goto('./#/title');
    await expect(titleSound(page)).toBeVisible();
    await expect(titleSound(page)).toHaveText('効果音：オン');
    await expect(titleSound(page).locator('svg')).toHaveCount(1);

    await openPlay(page);
    await expect(playSound(page)).toBeVisible();
    await expect(playSound(page)).toHaveText('効果音：オン');
    // ゲーム画面（タッチ端末は操作空間）より下の、右の端。左は一時停止
    const game = (await page.locator('#game').boundingBox())!;
    const above = isMobile ? (await page.locator('#control-area').boundingBox())! : game;
    const sound = (await playSound(page).boundingBox())!;
    const pause = (await page.locator('#pause-button').boundingBox())!;
    expect(sound.y).toBeGreaterThanOrEqual(above.y + above.height - 0.5);
    expect(sound.x + sound.width).toBeCloseTo(game.x + game.width, 0);
    expect(pause.x).toBeLessThan(sound.x);
    expect(Math.abs(pause.y - sound.y)).toBeLessThan(1);
  });

  test('MGW-TC-0034-02 押すたびにオンとオフが入れ替わり、タイトル画面とプレイ画面のボタンの表示がそろう', async ({ page }) => {
    await page.goto('./#/title');
    await titleSound(page).click();
    await expect(titleSound(page)).toHaveText('効果音：オフ');
    await expect(titleSound(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(body(page)).toHaveAttribute('data-sound', 'off');
    // 押したあとの Space でゲームは始まる（ボタンにフォーカスが残って押し直されない）
    await openPlay(page);
    await expect(playSound(page)).toHaveText('効果音：オフ');
    await playSound(page).click();
    await expect(playSound(page)).toHaveText('効果音：オン');
    await expect(body(page)).toHaveAttribute('data-sound', 'on');
    await page.evaluate(() => (location.hash = '#/title'));
    await expect(titleSound(page)).toHaveText('効果音：オン');
    await expect(titleSound(page)).toHaveAttribute('aria-pressed', 'true');
  });

  test('MGW-TC-0034-06 設定は端末に保存され、開き直しても同じ。初めはオン。前からある設定はオンとして読み、表示方式は変わらない', async ({ page }) => {
    await page.goto('./#/title');
    await expect(body(page)).toHaveAttribute('data-sound', 'on');
    await titleSound(page).click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mini-galaxywars-settings')!));
    expect(saved).toEqual({ app: 'mini-galaxywars', version: 1, displayMode: 'cellophane', sound: false });
    await page.reload();
    await expect(body(page)).toHaveAttribute('data-sound', 'off');
    await expect(titleSound(page)).toHaveText('効果音：オフ');

    // 仕様書 v1.6 までの設定（sound がない）はオン。表示方式はそのまま
    await page.evaluate(() => localStorage.setItem('mini-galaxywars-settings', JSON.stringify({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel' })));
    await page.reload();
    await expect(body(page)).toHaveAttribute('data-sound', 'on');
    await expect(body(page)).toHaveAttribute('data-display-mode', 'pixel');
  });

  test('MGW-TC-0034-07 プレイ中に押しても、ゲームは止まらず、発射・移動にもならない', async ({ page, isMobile }) => {
    await openPlay(page);
    await clearField(page);
    const before = await getState(page);
    await playSound(page).click();
    await expect(body(page)).toHaveAttribute('data-sound', 'off');
    // 発射も一時停止もしない。発射台も動かない
    await page.waitForTimeout(300);
    const after = await getState(page);
    expect(after.status).toBe('ready');
    expect(after.launcherX).toBe(before.launcherX);
    expect(after.stepCount as number).toBeGreaterThan(before.stepCount as number);
    // 上昇中に押しても止まらず、上昇を続ける（発射は PC は Space、iPhone はタップ。状態が変わるのを待ってから見る）
    if (isMobile) {
      const b = (await page.locator('#game').boundingBox())!;
      await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height * 0.8);
    } else {
      await page.keyboard.press('Space');
    }
    await expect(body(page)).toHaveAttribute('data-status', 'playing');
    const y0 = (await getState(page)).missile.y;
    await playSound(page).click();
    await expect(body(page)).toHaveAttribute('data-status', 'playing');
    await expect.poll(async () => (await getState(page)).missile.y).toBeLessThan(y0 - 5);
  });
});
