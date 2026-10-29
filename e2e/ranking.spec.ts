import { expect, test, type Page } from '@playwright/test';
import { endGame, openPlay, rankLine, seedRanking, type RankingRow } from './helpers';

/** 一覧の各行の [順位, 名前, 名前の下の行（結果・日時）, スコア] */
function rows(page: Page): Promise<string[][]> {
  return page.locator('#screen-ranking tbody tr').evaluateAll((trs) =>
    trs.map((tr) => {
      const td = [...tr.querySelectorAll('td')];
      return [
        td[0]?.textContent ?? '',
        td[1]?.querySelector('.ranking-name')?.textContent ?? '',
        td[1]?.querySelector('.ranking-meta')?.textContent ?? '',
        td[2]?.textContent ?? '',
      ];
    }),
  );
}

/** [順位, 名前, スコア] だけ */
const short = (r: string[]) => [r[0], r[1], r[3]];

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
    // 大文字には直さず、8 文字まで（仕様書 v1.7）。A・D・空白・P もゲームの操作にならずに打てる
    await name.fill('');
    await name.pressSequentially('da p-2026xyz');
    await expect(name).toHaveValue('da p-202');
    await expect(body).toHaveAttribute('data-status', 'cleared');
    await entry.getByRole('button', { name: '登録' }).click();
    await expect(body).toHaveAttribute('data-screen', 'ranking');
    const first = ['1st', 'da p-202', (await rows(page))[0]![3]!];
    expect(first[2]).toBe(cleared.toLocaleString('en-US'));
    expect(short((await rows(page))[0]!)).toEqual(['1st', 'da p-202（あなた）', first[2]]);

    // ゲームオーバー：2 位。キーボードの「完了」（Enter）でも登録できる。空にしたら PLAYER
    await page.goto('./?debug=1#/title');
    await openPlay(page);
    await endGame(page, 'gameOver', 900);
    await expect(entry).toBeVisible({ timeout: 6000 });
    await expect(entry.locator('.entry-rank')).toHaveText('2ND  00900');
    await name.fill('');
    await name.press('Enter');
    await expect(body).toHaveAttribute('data-screen', 'ranking');
    expect((await rows(page)).map(short)).toEqual([first, ['2nd', 'PLAYER（あなた）', '900']]);

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

  test('MGW-TC-0025-06 名前は 1〜8 文字で、ひらがな・カタカナ・漢字・英数字を入れられる。日本語の変換の途中で文字が消えない', async ({ page }) => {
    const entry = page.locator('#overlay-entry');
    const name = page.locator('#entry-name');
    await openPlay(page);
    await endGame(page, 'clear', 1150);
    await expect(entry).toBeVisible({ timeout: 6000 });
    await expect(entry).toContainText('8 文字まで（日本語も使えます）');
    // 日本語をそのまま入れられる（8 文字で切る）
    await name.fill('銀河戦争ミニのはる');
    await expect(name).toHaveValue('銀河戦争ミニのは');
    // 変換の途中（compositionstart〜compositionend）は削らない。確定したら 8 文字で切る
    await name.fill('');
    await name.evaluate((el: HTMLInputElement) => {
      el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      el.value = 'ぎんがせんそうみにのはる';
      el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    });
    await expect(name).toHaveValue('ぎんがせんそうみにのはる');
    // 変換を確定する Enter では送らない
    await name.press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'play');
    await name.evaluate((el: HTMLInputElement) => {
      el.value = '銀河のはる';
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '銀河のはる' }));
    });
    await expect(name).toHaveValue('銀河のはる');
    await entry.getByRole('button', { name: '登録' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'ranking');
    expect(short((await rows(page))[0]!)).toEqual(['1st', '銀河のはる（あなた）', expect.any(String)]);
  });

  test('MGW-TC-0025-08 登録すると、ランキング画面に移る', async ({ page }) => {
    await openPlay(page);
    await endGame(page, 'gameOver', 700);
    await expect(page.locator('#overlay-entry')).toBeVisible({ timeout: 6000 });
    await page.locator('#overlay-entry').getByRole('button', { name: '登録' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'ranking');
    await expect(page.locator('#screen-ranking h2')).toHaveText('ハイスコアランキング');
  });

  test('MGW-TC-0026-04 登録したあとに開いたときは、今登録した記録の行が目立ち、名前に「（あなた）」が付く', async ({ page }) => {
    await openPlay(page);
    await seedRanking(page, TEN.slice(0, 4));
    await endGame(page, 'gameOver', 1200);
    await expect(page.locator('#overlay-entry')).toBeVisible({ timeout: 6000 });
    await page.locator('#entry-name').fill('たあ');
    await page.locator('#overlay-entry').getByRole('button', { name: '登録' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'ranking');
    // 4 位に入る（1300 と 1250 のあと、1100 の前）
    const mine = page.locator('#screen-ranking tr.mine');
    await expect(mine).toHaveCount(1);
    expect((await rows(page)).map((r) => r[1])).toEqual(['ABCDEFGH', 'PLAYER', 'A B', 'たあ（あなた）', 'HARU']);
    await expect(mine.locator('td').first()).toHaveText('4');
    await expect(mine.locator('.ranking-meta')).toContainText('GAME OVER · ');
    // 黄色の線と、ほかの行と違う背景
    const look = await mine.locator('td').first().evaluate((td) => getComputedStyle(td).boxShadow);
    expect(look).toContain('255, 213, 74');
    // ほかから開いたときは目立たせない
    await page.locator('#screen-ranking').getByRole('link', { name: 'BACK' }).click();
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    await expect(page.locator('#screen-ranking tr.mine')).toHaveCount(0);
    await expect(page.getByText('（あなた）')).toHaveCount(0);
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
    expect((await rows(page)).map(short)).toEqual([['1st', 'KEEP', '700']]);
    // タイトルの HIGH も、ランキングの 1 位
    await page.locator('#screen-ranking').getByRole('link', { name: 'BACK' }).click();
    await expect(page.locator('.title-high')).toHaveText('HIGH 00700');
  });

  test('MGW-TC-0026-01 #/ranking に、上位 10 件の順位・名前・スコアと、名前の下に結果と日時が出る。クリアの記録はタイムも出る。1〜3 位は 1st・2nd・3rd', async ({ page }) => {
    await page.goto('./#/title');
    // 1 位はクリア、2 位はゲームオーバー、ほかは前からの記録（結果なし）
    await seedRanking(page, [{ ...TEN[0]!, result: 'clear', time: 95_700 }, { ...TEN[1]!, result: 'gameOver' }, { ...TEN[2]!, result: 'clear' }, ...TEN.slice(3)]);
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    await expect(page.locator('#screen-ranking table')).toBeVisible();
    await expect(page.locator('#screen-ranking h2')).toHaveText('ハイスコアランキング');
    await expect(page.locator('#screen-ranking thead')).toHaveText(/順位\s*名前\s*スコア/);
    const all = await rows(page);
    expect(all).toHaveLength(10);
    // 日時は端末の時刻で YYYY/MM/DD HH:MM（CI は UTC なので、時刻の部分は形だけを見る）
    const date = (d: string) => new RegExp(`^${d}\\s\\d{2}:\\d{2}$`);
    expect(short(all[0]!)).toEqual(['1st', 'ABCDEFGH', '1,650']);
    // クリアの記録はタイムも出る（仕様書 v1.9）
    expect(all[0]![2]).toMatch(/^CLEAR · 95\.7 秒 · 2026\/10\/26 \d{2}:\d{2}$/);
    expect(short(all[1]!)).toEqual(['2nd', 'PLAYER', '1,300']);
    expect(all[1]![2]).toMatch(/^GAME OVER · 2026\/10\/25 \d{2}:\d{2}$/);
    expect(short(all[2]!)).toEqual(['3rd', 'A B', '1,250']);
    // タイムのない前からのクリアの記録は、結果と日時だけ
    expect(all[2]![2]).toMatch(/^CLEAR · 2026\/10\/24 \d{2}:\d{2}$/);
    expect(all[3]![2]).toMatch(date('2026/10/23'));
    expect(short(all[3]!)).toEqual(['4', 'HARU', '1,100']);
    expect(short(all[9]!)).toEqual(['10', 'GALAXY', '350']);
    // 結果の印（✓・✕）は、結果のある記録だけ
    await expect(page.locator('#screen-ranking tbody tr').nth(0).locator('.ranking-meta svg')).toHaveCount(1);
    await expect(page.locator('#screen-ranking tbody tr').nth(3).locator('.ranking-meta svg')).toHaveCount(0);
    // 1〜3 位は黄色
    const color = await page.locator('#screen-ranking tbody tr').nth(0).locator('td').first().evaluate((td) => getComputedStyle(td).color);
    expect(color).toBe('rgb(255, 213, 74)');
    await expect(page.getByText('まだ記録がありません')).toBeHidden();
  });

  test('MGW-TC-0026-02 記録がないときは、記録がないことが分かる表示が出る', async ({ page }) => {
    await page.goto('./#/ranking');
    await expect(page.getByText('まだ記録がありません')).toBeVisible();
    await expect(page.locator('#screen-ranking table')).toBeHidden();
  });

  test('MGW-TC-0026-03 「← BACK」でタイトルに戻る', async ({ page }) => {
    await page.goto('./#/ranking');
    await page.locator('#screen-ranking').getByRole('link', { name: 'BACK' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
    await expect(page.locator('#screen-title')).toBeVisible();
  });

  test('HIGH は、ランキングの 1 位から始める', async ({ page }) => {
    await page.goto('./?debug=1#/title');
    await seedRanking(page, TEN);
    // タイトルに入り直すと読み直す
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    await page.locator('#screen-ranking').getByRole('link', { name: 'BACK' }).click();
    await expect(page.locator('.title-high')).toHaveText('HIGH 01650');
    await openPlay(page);
    await expect(page.locator('body')).toHaveAttribute('data-high', '1650');
  });
});
