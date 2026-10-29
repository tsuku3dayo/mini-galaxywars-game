import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { seedRanking, type RankingRow } from './helpers';

const SAVED: RankingRow[] = [
  { score: 1650, name: 'たあ', date: '2026-10-26T12:00:00+09:00', result: 'clear' },
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
  return page.locator('#screen-ranking tbody .ranking-name').allTextContents();
}

/** 「記録を読み込む」を押してファイルを選ぶ */
async function chooseFile(page: Page, text: string): Promise<void> {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '記録を読み込む' }).click();
  await (await chooser).setFiles({ name: 'ranking.json', mimeType: 'application/json', buffer: Buffer.from(text) });
}

/** 書き出したファイルの中身 */
async function exportText(page: Page): Promise<{ name: string; text: string }> {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '記録を書き出す' }).click();
  const d = await download;
  return { name: d.suggestedFilename(), text: await readFile((await d.path())!, 'utf8') };
}

test.describe('ランキングの書き出し・読み込み', () => {
  test('MGW-TC-0027-01 「記録を書き出す」で、ランキングを JSON のファイルとして保存できる', async ({ page }) => {
    await openRanking(page, SAVED);
    const { name, text } = await exportText(page);
    expect(name).toMatch(/^mini-galaxywars-ranking-\d{8}\.json$/);
    expect(JSON.parse(text)).toEqual({ app: 'mini-galaxywars', version: 1, entries: SAVED });
    // 2 文字の字下げ
    expect(text).toContain('\n  "app": "mini-galaxywars"');
  });

  test('MGW-TC-0027-02 「記録を読み込む」で、書き出した JSON からランキングを戻せる（日本語の名前・結果も戻る）', async ({ page }) => {
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
    expect(await names(page)).toEqual(['たあ', 'A B']);
    await page.reload();
    expect(await names(page)).toEqual(['たあ', 'A B']);
  });

  test('MGW-TC-0027-04 形の違う JSON や、ほかのアプリの JSON は読み込まず、今の記録を変えない', async ({ page }) => {
    await openRanking(page, SAVED);
    const message = page.getByRole('alert');
    for (const text of [
      'not json',
      JSON.stringify({ app: 'other-app', version: 1, entries: [] }),
      JSON.stringify({ app: 'mini-galaxywars', version: 1, entries: [{ score: 100, name: 'ここのつのもじです', date: '2026-10-01' }] }),
    ]) {
      await chooseFile(page, text);
      await expect(message).toBeVisible();
      await expect(message).toHaveText('このファイルは読み込めません');
      await expect(page.getByRole('dialog')).toBeHidden();
      expect(await names(page)).toEqual(['たあ', 'A B']);
    }
    // 保存の中身も変わっていない
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('galaxy-wars-scores')!).entries);
    expect(saved).toEqual(SAVED);
  });

  test('10 件あっても、BACK とタイトルは上に残り、記録のバックアップまでゲーム画面の枠の中でスクロールして届く（iPhone SE の高さでも）', async ({ page }) => {
    await openRanking(page, Array.from({ length: 10 }, () => SAVED[0]!));
    const stage = (await page.locator('#stage').boundingBox())!;
    const inside = async (selector: string) => {
      const box = (await page.locator(selector).first().boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(stage.y - 0.5);
      expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
    };
    // 一番下（記録のバックアップの枠と知らせ）まで、枠の中でスクロールする
    const toBottom = () => page.locator('#screen-ranking .navy-scroll').evaluate((el) => (el.scrollTop = el.scrollHeight));
    await toBottom();
    await chooseFile(page, 'not json');
    await expect(page.getByRole('alert')).toBeVisible();
    await toBottom();
    await inside('.ranking-backup');
    // スクロールしても、BACK とタイトルは上に残る
    await inside('#screen-ranking .back-button');
    await inside('#screen-ranking h2');
    // ページそのものはスクロールしない
    expect(await page.evaluate(() => [scrollX, scrollY])).toEqual([0, 0]);
  });
});
