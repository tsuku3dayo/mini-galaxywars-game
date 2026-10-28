import { expect, test, type Page } from '@playwright/test';
import { advance, clearField, freeze, openPlay } from './helpers';

/** HUD の SCORE の文字（x 12〜188, y 8〜24）の中で、いちばん明るい画素の色 */
function hudColor(page: Page): Promise<[number, number, number]> {
  return page.locator('#game').evaluate((canvas: HTMLCanvasElement) => {
    const scale = canvas.width / 480;
    const data = canvas.getContext('2d')!.getImageData(Math.floor(12 * scale), Math.floor(8 * scale), Math.floor(176 * scale), Math.floor(16 * scale)).data;
    let best: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < data.length; i += 4) {
      if (data[i]! + data[i + 1]! + data[i + 2]! > best[0] + best[1] + best[2]) best = [data[i]!, data[i + 1]!, data[i + 2]!];
    }
    return best;
  });
}

/** プレイ画面で HUD を描き直して、その色を読む */
async function playHudColor(page: Page): Promise<[number, number, number]> {
  await openPlay(page);
  await freeze(page, true);
  await clearField(page);
  await advance(page, 0);
  return hudColor(page);
}

async function openSettings(page: Page): Promise<void> {
  await page.locator('#screen-title').getByRole('button', { name: 'SETTINGS' }).click();
  await expect(page.locator('#overlay-settings')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-overlay', 'settings');
}

test.describe('表示方式の設定', () => {
  test('MGW-TC-0029-01 設定で「擬似カラーセロハン」と「ピクセルパーフェクト」を切り替えられる', async ({ page }) => {
    const body = page.locator('body');
    await page.goto('./?debug=1#/title');
    // 初めは擬似カラーセロハン。HUD（上の帯）は紫・赤系（緑が弱い）
    await expect(body).toHaveAttribute('data-display-mode', 'cellophane');
    const [r1, g1] = await playHudColor(page);
    expect(r1).toBeGreaterThan(200);
    expect(g1).toBeLessThan(128);

    await page.goto('./?debug=1#/title');
    await openSettings(page);
    const settings = page.locator('#overlay-settings');
    await expect(settings.locator('h2')).toHaveText('SETTINGS');
    await expect(settings.getByRole('radio', { name: '擬似カラーセロハン' })).toBeChecked();
    await settings.getByRole('radio', { name: 'ピクセルパーフェクト' }).check();
    await expect(body).toHaveAttribute('data-display-mode', 'pixel');
    // 開いている間は、Space でゲームを始めない
    await page.keyboard.press('Space');
    await expect(body).toHaveAttribute('data-screen', 'title');
    await settings.getByRole('button', { name: '閉じる' }).click();
    await expect(settings).toBeHidden();
    await expect(body).toHaveAttribute('data-overlay', 'none');

    // ピクセルパーフェクトでは色を重ねない（HUD は白）
    const [r2, g2, b2] = await playHudColor(page);
    expect(Math.min(r2, g2, b2)).toBeGreaterThan(200);

    // 擬似カラーセロハンに戻せる
    await page.goto('./?debug=1#/title');
    await openSettings(page);
    await settings.getByRole('radio', { name: '擬似カラーセロハン' }).check();
    await expect(body).toHaveAttribute('data-display-mode', 'cellophane');
  });

  test('MGW-TC-0029-03 選んだ方式は mini-galaxywars-settings に残り、次に開いても同じ方式になる', async ({ page }) => {
    await page.goto('./#/title');
    await openSettings(page);
    await page.locator('#overlay-settings').getByRole('radio', { name: 'ピクセルパーフェクト' }).check();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mini-galaxywars-settings')!));
    expect(saved).toEqual({ app: 'mini-galaxywars', version: 1, displayMode: 'pixel' });

    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-display-mode', 'pixel');
    await openSettings(page);
    await expect(page.locator('#overlay-settings').getByRole('radio', { name: 'ピクセルパーフェクト' })).toBeChecked();
  });
});
