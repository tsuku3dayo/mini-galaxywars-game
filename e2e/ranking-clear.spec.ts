import { expect, test, type Page } from '@playwright/test';
import { seedRanking, type RankingRow } from './helpers';

// ランキングの全消去（MGW-US-0032、MGW-GUI-0002 §2）
const SAVED: RankingRow[] = [
  { score: 1520, name: 'たあ', date: '2026-10-25T21:13:00+09:00', result: 'clear' },
  { score: 390, name: 'はる', date: '2026-10-26T09:50:00+09:00', result: 'gameOver' },
];

/** タイトルで記録を入れ、タイトルに入り直す（入るときに HIGH を読み直す） */
async function openTitle(page: Page, entries: RankingRow[] | null): Promise<void> {
  await page.goto('./#/ranking');
  if (entries) await seedRanking(page, entries);
  await page.locator('#screen-ranking').getByRole('link', { name: 'BACK' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
}

const clearButton = (page: Page) => page.locator('#screen-title').getByRole('button', { name: 'ランキング消去' });
const dialog = (page: Page) => page.locator('#overlay-clear');

test.describe('ランキングの全消去', () => {
  test('MGW-TC-0032-01 タイトル画面に「ランキング消去」のボタンがある', async ({ page }) => {
    await openTitle(page, null);
    // 操作の案内の下（小さい画面では、枠の中でスクロールすると出る）
    await clearButton(page).scrollIntoViewIfNeeded();
    await expect(clearButton(page)).toBeVisible();
    // ゲーム画面の枠の中にある
    const stage = (await page.locator('#stage').boundingBox())!;
    const box = (await clearButton(page).boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
  });

  test('MGW-TC-0032-03 押すと確認が出て、「消す」で全部消え、「やめる」では何も変わらない', async ({ page }) => {
    await openTitle(page, SAVED);
    await expect(page.locator('.title-high')).toHaveText('HIGH 01520');

    // 「やめる」：何も変わらない
    await clearButton(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-overlay', 'clear-ranking');
    await expect(dialog(page)).toContainText('ランキングをすべて消します。元に戻せません。よろしいですか？');
    // 確認を開いている間は、Space でゲームを始めない
    await page.keyboard.press('Space');
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
    await dialog(page).getByRole('button', { name: 'やめる' }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page.locator('body')).toHaveAttribute('data-overlay', 'none');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('galaxy-wars-scores')!).entries.length)).toBe(2);

    // 「消す」：全部消える
    await clearButton(page).click();
    await dialog(page).getByRole('button', { name: '消す' }).click();
    await expect(dialog(page)).toBeHidden();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('galaxy-wars-scores')!).entries)).toEqual([]);
  });

  test('MGW-TC-0032-04 消したあと、タイトルの HIGH は 00000 になり、ランキング画面は記録がないときの表示になる', async ({ page }) => {
    await openTitle(page, SAVED);
    await clearButton(page).click();
    await dialog(page).getByRole('button', { name: '消す' }).click();
    await expect(page.locator('.title-high')).toHaveText('HIGH 00000');
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    await expect(page.getByText('まだ記録がありません')).toBeVisible();
    await expect(page.locator('#screen-ranking table')).toBeHidden();
    // 読み込み直しても空のまま
    await page.reload();
    await expect(page.getByText('まだ記録がありません')).toBeVisible();
  });

  test('MGW-TC-0032-05 記録がないときに押すと、「記録がありません」と出る', async ({ page }) => {
    await openTitle(page, null);
    await clearButton(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).toContainText('記録がありません');
    await expect(dialog(page).getByRole('button', { name: '消す' })).toBeHidden();
    await dialog(page).getByRole('button', { name: '閉じる' }).click();
    await expect(dialog(page)).toBeHidden();
  });
});
