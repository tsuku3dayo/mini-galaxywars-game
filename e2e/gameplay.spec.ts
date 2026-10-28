import { expect, test } from '@playwright/test';
import { advance, endGame, freeze, FULL_RANKING, getState, openPlay, rankLine, seedRanking, setState } from './helpers';

test.describe('プレイ', () => {
  test('MGW-TC-0017-02 UFO を 8 機すべて倒すと、クリアの表示が出てゲームが終わる', async ({ page }) => {
    await openPlay(page);
    // ランキングに入らないようにしておき、3 秒後は「TITLE」を出す（入るときは MGW-TC-0017-03）
    await seedRanking(page, FULL_RANKING);
    await freeze(page, true);
    // 7 機を倒した状態で、次のステップで 8 機目（下段の id 5）に当たるように置く
    const base = await getState(page);
    const ufos = (base.ufos as { id: number; x: number; y: number; isAlive: boolean }[]).map((u) => ({ ...u, isAlive: u.id === 5 }));
    const last = ufos[5]!;
    await setState(page, {
      ufos,
      killCount: 7,
      status: 'playing',
      missile: { x: last.x, y: last.y + 21, isLaunched: true, isBoosting: false },
      meteors: [],
      beams: [],
      beamTimer: 1e9,
    });
    await advance(page, 1);
    const body = page.locator('body');
    const message = page.locator('#overlay-message');
    // 「TITLE」は 3 秒たつまで出さない（クリアの直後に確かめる）
    const titleButton = message.getByRole('link', { name: 'TITLE' });
    await expect(titleButton).toBeHidden({ timeout: 1000 });
    await expect(body).toHaveAttribute('data-status', 'cleared');
    await expect(body).toHaveAttribute('data-overlay', 'clear');
    await expect(message.locator('.message-main')).toHaveText('GOOD!!');
    await expect(message.locator('.message-sub')).toHaveText('STAGE CLEAR');
    // ゲームは終わり、もう進まない
    const stepCount = (await getState(page)).stepCount;
    await advance(page, 10);
    expect((await getState(page)).stepCount).toBe(stepCount);
    // 3 秒たつと「TITLE」が出て、タイトルに戻れる
    await expect(titleButton).toBeVisible({ timeout: 6000 });
    await titleButton.click();
    await expect(body).toHaveAttribute('data-screen', 'title');
  });

  for (const [id, kind, text] of [
    ['MGW-TC-0017-03', 'clear', 'クリアのあと'],
    ['MGW-TC-0016-06', 'gameOver', '残機が 0 になってゲームオーバーの表示が出たあと'],
  ] as const) {
    test(`${id} ${text}、スコアが上位 10 件に入るときはランキング登録に進み、入らないときは「TITLE」でタイトルに戻る`, async ({ page }) => {
      const body = page.locator('body');
      const entry = page.locator('#overlay-entry');
      const titleButton = page.locator('#overlay-message').getByRole('link', { name: 'TITLE' });

      // 入るとき：記録が 9 件で、3 位に入る（クリアは 8 機目の点が足される）
      await openPlay(page);
      await seedRanking(page, [
        { score: 1650, name: 'A', date: '2026-10-01T12:00:00+09:00' },
        { score: 1400, name: 'B', date: '2026-10-02T12:00:00+09:00' },
        ...Array.from({ length: 7 }, () => ({ score: 400, name: 'C', date: '2026-10-03T12:00:00+09:00' })),
      ]);
      const score = await endGame(page, kind, 1150);
      expect(score).toBeLessThan(1400);
      await expect(body).toHaveAttribute('data-overlay', kind === 'clear' ? 'clear' : 'gameover');
      await expect(entry).toBeHidden();
      // 3 秒たつと、名前の入力に進む。「TITLE」は出さない
      await expect(entry).toBeVisible({ timeout: 6000 });
      await expect(body).toHaveAttribute('data-overlay', 'entry');
      await expect(entry.locator('h2')).toHaveText('NEW RECORD!');
      await expect(entry.locator('.entry-rank')).toHaveText(rankLine('3RD', score));
      await expect(titleButton).toBeHidden();

      // 入らないとき：10 件うまっている（タイトルを通って、新しいゲームを始める）
      await page.goto('./?debug=1#/title');
      await openPlay(page);
      await seedRanking(page, FULL_RANKING);
      await endGame(page, kind, 1150);
      await expect(titleButton).toBeVisible({ timeout: 6000 });
      await expect(entry).toBeHidden();
      await expect(body).toHaveAttribute('data-overlay', kind === 'clear' ? 'clear' : 'gameover');
      await titleButton.click();
      await expect(body).toHaveAttribute('data-screen', 'title');
    });
  }

  test('ゲームオーバーの表示と、最初の READY', async ({ page }) => {
    await openPlay(page);
    // 始めの 1 秒は READY を出し、そのあと消す
    const message = page.locator('#overlay-message');
    await freeze(page, true);
    // 開いてから止めるまでの時間に頼らないよう、最初の状態に戻してから見る
    await setState(page, { stepCount: 0 });
    await expect(message.locator('.message-main')).toHaveText('READY');
    await advance(page, 120);
    await expect(message).toBeHidden();

    await setState(page, { lives: 0, status: 'respawn', waitReason: 'miss', waitSteps: 1 });
    await advance(page, 2);
    await expect(page.locator('body')).toHaveAttribute('data-status', 'gameOver');
    await expect(page.locator('body')).toHaveAttribute('data-overlay', 'gameover');
    await expect(message.locator('.message-main')).toHaveText('GAME OVER');
    await expect(message.locator('.message-sub')).toBeHidden();
  });
});
