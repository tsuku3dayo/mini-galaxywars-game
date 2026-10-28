import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { seedRanking, type RankingRow } from './helpers';

const SAVED: RankingRow[] = [
  { score: 1650, name: 'ABCDEFGH', date: '2026-10-26T12:00:00+09:00' },
  { score: 900, name: 'A B', date: '2026-10-25T12:00:00+09:00' },
];

/** タイトルで記録を入れてから、ランキング画面に入る（入るときに読み直す） */
async function openRanking(page: Page, entries: RankingRow[]): Promise<void> {
  await page.goto('./#/title');
  await seedRanking(page, entries);
  await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'ranking');
}

function names(page: Page): Promise<string[]> {
  return page.locator('#screen-ranking tbody tr td:nth-child(3)').allTextContents();
}

/** 「読み込み」を押してファイルを選ぶ */
async function chooseFile(page: Page, text: string): Promise<void> {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '読み込み' }).click();
  await (await chooser).setFiles({ name: 'ranking.json', mimeType: 'application/json', buffer: Buffer.from(text) });
}

/** 書き出したファイルの中身 */
async function exportText(page: Page): Promise<{ name: string; text: string }> {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '書き出し' }).click();
  const d = await download;
  return { name: d.suggestedFilename(), text: await readFile((await d.path())!, 'utf8') };
}

test.describe('ランキングの書き出し・読み込み', () => {
  test('MGW-TC-0027-01 「書き出し」で、ランキングを JSON のファイルとして保存できる', async ({ page }) => {
    await openRanking(page, SAVED);
    const { name, text } = await exportText(page);
    expect(name).toMatch(/^mini-galaxywars-ranking-\d{8}\.json$/);
    expect(JSON.parse(text)).toEqual({ app: 'mini-galaxywars', version: 1, entries: SAVED });
    // 2 文字の字下げ
    expect(text).toContain('\n  "app": "mini-galaxywars"');
  });

  test('MGW-TC-0027-02 「読み込み」で、書き出した JSON からランキングを戻せる', async ({ page }) => {
    await openRanking(page, SAVED);
    const { text } = await exportText(page);

    // 別の記録になったあとで、書き出したファイルを読み込む
    await openRanking(page, [{ score: 300, name: 'OTHER', date: '2026-10-27T12:00:00+09:00' }]);
    expect(await names(page)).toEqual(['OTHER']);
    const confirm = page.getByRole('dialog');

    // 「やめる」なら変えない
    await chooseFile(page, text);
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText('今のランキングを置き換えます。よろしいですか？');
    await confirm.getByRole('button', { name: 'やめる' }).click();
    await expect(confirm).toBeHidden();
    expect(await names(page)).toEqual(['OTHER']);

    // 「置き換える」で戻る。読み込み直しても残っている
    await chooseFile(page, text);
    await confirm.getByRole('button', { name: '置き換える' }).click();
    await expect(confirm).toBeHidden();
    expect(await names(page)).toEqual(['ABCDEFGH', 'A B']);
    await page.reload();
    expect(await names(page)).toEqual(['ABCDEFGH', 'A B']);
  });

  test('MGW-TC-0027-04 形の違う JSON や、ほかのアプリの JSON は読み込まず、今の記録を変えない', async ({ page }) => {
    await openRanking(page, SAVED);
    const message = page.getByRole('alert');
    for (const text of [
      'not json',
      JSON.stringify({ app: 'other-app', version: 1, entries: [] }),
      JSON.stringify({ app: 'mini-galaxywars', version: 1, entries: [{ score: 100, name: 'lower', date: '2026-10-01' }] }),
    ]) {
      await chooseFile(page, text);
      await expect(message).toBeVisible();
      await expect(message).toHaveText('このファイルは読み込めません');
      await expect(page.getByRole('dialog')).toBeHidden();
      expect(await names(page)).toEqual(['ABCDEFGH', 'A B']);
    }
    // 保存の中身も変わっていない
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('galaxy-wars-scores')!).entries);
    expect(saved).toEqual(SAVED);
  });

  test('知らせが出ても、10 件・書き出し・読み込み・TITLE がゲーム画面の枠に収まる（iPhone SE の高さでも）', async ({ page }) => {
    await openRanking(page, Array.from({ length: 10 }, () => SAVED[0]!));
    await chooseFile(page, 'not json');
    await expect(page.getByRole('alert')).toBeVisible();
    const stage = (await page.locator('#stage').boundingBox())!;
    const title = (await page.locator('#screen-ranking').getByRole('link', { name: 'TITLE' }).boundingBox())!;
    expect(title.y + title.height).toBeLessThanOrEqual(stage.y + stage.height);
  });
});
