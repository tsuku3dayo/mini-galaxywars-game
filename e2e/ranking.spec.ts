import { expect, test, type Page } from '@playwright/test';
import { endGame, openPlay, rankLine, seedRanking, type RankingRow } from './helpers';

/** 一覧の各行のセルの文字 */
function rows(page: Page): Promise<string[][]> {
  return page
    .locator('#screen-ranking tbody tr')
    .evaluateAll((trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent ?? '')));
}

// 日時は日本の昼にしておき、CI（UTC）でも手元でも同じ日付になるようにする
const TEN: RankingRow[] = [
  { score: 1650, name: 'ABCDEFGH', date: '2026-10-26T12:00:00+09:00' },
  { score: 1300, name: 'PLAYER', date: '2026-10-25T12:00:00+09:00' },
  { score: 1250, name: 'A B', date: '2026-10-24T12:00:00+09:00' },
  { score: 1100, name: 'HARU', date: '2026-10-23T12:00:00+09:00' },
  { score: 900, name: 'X1', date: '2026-10-22T12:00:00+09:00' },
  { score: 800, name: 'X2', date: '2026-10-21T12:00:00+09:00' },
  { score: 700, name: 'X3', date: '2026-10-20T12:00:00+09:00' },
  { score: 600, name: 'X4', date: '2026-10-19T12:00:00+09:00' },
  { score: 500, name: 'X5', date: '2026-10-18T12:00:00+09:00' },
  { score: 350, name: 'GALAXY', date: '2026-10-01T12:00:00+09:00' },
];

test.describe('ランキング', () => {
  test('MGW-TC-0025-01 クリアかゲームオーバーでゲームが終わり、スコアが上位 10 件に入るとき、名前を入れて登録できる', async ({ page }) => {
    const body = page.locator('body');
    const entry = page.locator('#overlay-entry');
    const name = page.locator('#entry-name');

    // クリア：記録がないので 1 位。名前を打って「登録」
    await openPlay(page);
    const cleared = await endGame(page, 'clear', 1150);
    await expect(entry).toBeVisible({ timeout: 6000 });
    await expect(entry.locator('.entry-rank')).toHaveText(rankLine('1ST', cleared));
    await expect(name).toHaveValue('PLAYER');
    // 小文字は大文字に、英数字と空白以外は入れず、8 文字まで。A・D・空白・P もゲームの操作にならずに打てる
    await name.fill('');
    await name.pressSequentially('da p-2026xyz');
    await expect(name).toHaveValue('DA P2026');
    await expect(body).toHaveAttribute('data-status', 'cleared');
    await entry.getByRole('button', { name: '登録' }).click();
    await expect(body).toHaveAttribute('data-screen', 'ranking');
    const first = ['1ST', String(cleared).padStart(5, '0'), 'DA P2026'];
    expect((await rows(page))[0]!.slice(0, 3)).toEqual(first);

    // ゲームオーバー：2 位。キーボードの「完了」（Enter）でも登録できる。空にしたら PLAYER
    await page.goto('./?debug=1#/title');
    await openPlay(page);
    await endGame(page, 'gameOver', 900);
    await expect(entry).toBeVisible({ timeout: 6000 });
    await expect(entry.locator('.entry-rank')).toHaveText('2ND  00900');
    await name.fill('');
    await name.press('Enter');
    await expect(body).toHaveAttribute('data-screen', 'ranking');
    expect((await rows(page)).map((r) => r.slice(0, 3))).toEqual([first, ['2ND', '00900', 'PLAYER']]);

    // 「スキップ」は保存せずにタイトルへ
    await page.goto('./?debug=1#/title');
    await openPlay(page);
    await endGame(page, 'gameOver', 500);
    await expect(entry).toBeVisible({ timeout: 6000 });
    await entry.getByRole('button', { name: 'スキップ' }).click();
    await expect(body).toHaveAttribute('data-screen', 'title');
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    expect(await rows(page)).toHaveLength(2);
  });

  test('MGW-TC-0025-04 ページを読み込み直しても、記録が残っている', async ({ page }) => {
    await openPlay(page);
    await endGame(page, 'gameOver', 700);
    await expect(page.locator('#overlay-entry')).toBeVisible({ timeout: 6000 });
    await page.locator('#entry-name').fill('KEEP');
    await page.locator('#overlay-entry').getByRole('button', { name: '登録' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'ranking');

    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'ranking');
    expect((await rows(page)).map((r) => r.slice(0, 3))).toEqual([['1ST', '00700', 'KEEP']]);
    // タイトルの HIGH も、ランキングの 1 位
    await page.locator('#screen-ranking').getByRole('link', { name: 'TITLE' }).click();
    await expect(page.locator('.title-high')).toHaveText('HIGH 00700');
  });

  test('MGW-TC-0026-01 #/ranking に、上位 10 件の順位・スコア・名前・日時が出る', async ({ page }) => {
    await page.goto('./#/title');
    await seedRanking(page, TEN);
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    await expect(page.locator('#screen-ranking table')).toBeVisible();
    await expect(page.locator('#screen-ranking thead')).toHaveText(/RANK\s*SCORE\s*NAME\s*DATE/);
    const all = await rows(page);
    expect(all).toHaveLength(10);
    expect(all[0]).toEqual(['1ST', '01650', 'ABCDEFGH', '2026-10-26']);
    expect(all[1]).toEqual(['2ND', '01300', 'PLAYER', '2026-10-25']);
    expect(all[2]).toEqual(['3RD', '01250', 'A B', '2026-10-24']);
    expect(all[3]).toEqual(['4TH', '01100', 'HARU', '2026-10-23']);
    expect(all[9]).toEqual(['10TH', '00350', 'GALAXY', '2026-10-01']);
    await expect(page.getByText('まだ記録がありません')).toBeHidden();
  });

  test('MGW-TC-0026-02 記録がないときは、記録がないことが分かる表示が出る', async ({ page }) => {
    await page.goto('./#/ranking');
    await expect(page.getByText('まだ記録がありません')).toBeVisible();
    await expect(page.locator('#screen-ranking table')).toBeHidden();
  });

  test('MGW-TC-0026-03 「TITLE」でタイトルに戻る', async ({ page }) => {
    await page.goto('./#/ranking');
    await page.locator('#screen-ranking').getByRole('link', { name: 'TITLE' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
    await expect(page.locator('#screen-title')).toBeVisible();
  });

  test('HIGH は、ランキングの 1 位から始める', async ({ page }) => {
    await page.goto('./?debug=1#/title');
    await seedRanking(page, TEN);
    // タイトルに入り直すと読み直す
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    await page.locator('#screen-ranking').getByRole('link', { name: 'TITLE' }).click();
    await expect(page.locator('.title-high')).toHaveText('HIGH 01650');
    await openPlay(page);
    await expect(page.locator('body')).toHaveAttribute('data-high', '1650');
  });
});
