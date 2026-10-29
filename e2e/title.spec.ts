import { expect, test } from '@playwright/test';

test.describe('タイトル画面とルーティング', () => {
  test('MGW-TC-0014-01 起動すると #/title のタイトル画面に、アプリ名「銀河戦争ミニ」と「START」が出る', async ({ page, isMobile }) => {
    await page.goto('./');
    const title = page.locator('#screen-title');
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
    await expect(title.locator('.app-name')).toHaveText('銀河戦争ミニ');
    await expect(title.getByRole('button', { name: 'START' })).toBeVisible();
    await expect(title.getByRole('link', { name: 'RANKING' })).toBeVisible();
    await expect(title).toContainText('HIGH 00000');
    // 原作の表記はタイトル画面に出さない（README に書く。仕様書 v1.6）
    await expect(title).not.toContainText('原作');
    await expect(title).not.toContainText('非公式');
    await expect(page).toHaveTitle('銀河戦争ミニ');
    // 操作の案内は端末に合わせる
    await expect(title).toContainText(isMobile ? 'なぞって移動 タップで発射' : '←→/マウスで移動 SPACEで発射');
    // ゲーム画面の枠の中に収まる
    const stage = (await page.locator('#stage').boundingBox())!;
    for (const part of await title.locator('h1, button, a, p').all()) {
      const box = (await part.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(stage.y - 0.5);
      expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
    }
  });

  test('MGW-TC-0014-04 タイトル画面に、START・RANKING・SETTINGS のほか、CREDITS・ランキング消去・効果音のボタンが出て、iPhone SE の高さでもゲーム画面の枠に収まる', async ({ page }) => {
    await page.goto('./#/title');
    const title = page.locator('#screen-title');
    const parts = [
      title.getByRole('button', { name: 'START' }),
      title.getByRole('link', { name: 'RANKING' }),
      title.getByRole('button', { name: 'SETTINGS' }),
      title.getByRole('link', { name: 'CREDITS' }),
      title.getByRole('button', { name: 'ランキング消去' }),
      title.getByRole('button', { name: '効果音：オン' }),
    ];
    const stage = (await page.locator('#stage').boundingBox())!;
    const boxes = [];
    for (const part of parts) {
      await expect(part).toBeVisible();
      const box = (await part.boundingBox())!;
      // ゲーム画面の枠の中
      expect(box.y).toBeGreaterThanOrEqual(stage.y - 0.5);
      expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
      expect(box.x).toBeGreaterThanOrEqual(stage.x - 0.5);
      expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width + 0.5);
      // 押せる大きさ（高さ 44 以上）
      expect(box.height).toBeGreaterThanOrEqual(43.5);
      boxes.push(box);
    }
    // ボタンどうしは重ならない
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i]!, boxes[j]!];
        const overlap = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlap, `${i} と ${j}`).toBe(false);
      }
    // ほかの文字（HIGH・アプリ名・操作の案内）も枠に収まる
    for (const part of await title.locator('h1, p').all()) {
      const box = (await part.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
    }
  });

  test('MGW-TC-0014-02 「START」（または Space）で #/play に移り、発射前（Ready）から始まる', async ({ page, isMobile }) => {
    await page.goto('./');
    await page.locator('#screen-title').getByRole('button', { name: 'START' }).click();
    await expect(page).toHaveURL(/#\/play$/);
    const body = page.locator('body');
    await expect(body).toHaveAttribute('data-screen', 'play');
    await expect(body).toHaveAttribute('data-status', 'ready');

    if (!isMobile) {
      // Space でも始まる。同じ Space で発射はしない
      await page.goto('./#/title');
      await expect(body).toHaveAttribute('data-screen', 'title');
      await page.keyboard.press('Space');
      await expect(body).toHaveAttribute('data-screen', 'play');
      await expect(body).toHaveAttribute('data-status', 'ready');
      await page.waitForTimeout(300);
      await expect(body).toHaveAttribute('data-status', 'ready');
    }
  });

  test('MGW-TC-0014-03 #/title・#/play・#/ranking・#/credits のハッシュで画面が切り替わる', async ({ page }) => {
    const body = page.locator('body');
    await page.goto('./#/ranking');
    await expect(body).toHaveAttribute('data-screen', 'ranking');
    await expect(page.locator('#screen-ranking h2')).toHaveText('ハイスコアランキング');
    await expect(page.locator('#screen-ranking')).toContainText('まだ記録がありません');
    await expect(page.locator('#screen-title')).toBeHidden();
    await expect(page.locator('#game')).toBeHidden();

    await page.evaluate(() => (location.hash = '#/play'));
    await expect(body).toHaveAttribute('data-screen', 'play');
    await expect(page.locator('#game')).toBeVisible();
    await expect(page.locator('#screen-ranking')).toBeHidden();

    await page.evaluate(() => (location.hash = '#/title'));
    await expect(body).toHaveAttribute('data-screen', 'title');
    await expect(page.locator('#screen-title')).toBeVisible();
    await expect(page.locator('#game')).toBeHidden();
    // プレイを離れたら、状態はなくなる
    await expect(body).toHaveAttribute('data-status', '');

    await page.evaluate(() => (location.hash = '#/credits'));
    await expect(body).toHaveAttribute('data-screen', 'credits');
    await expect(page.locator('#screen-credits')).toBeVisible();
    for (const other of ['#screen-title', '#screen-ranking', '#game']) await expect(page.locator(other)).toBeHidden();
    await page.evaluate(() => (location.hash = '#/title'));
    await expect(page.locator('#screen-credits')).toBeHidden();

    // タイトルの RANKING とランキングの BACK でも行き来できる。知らないハッシュはタイトル
    await page.locator('#screen-title').getByRole('link', { name: 'RANKING' }).click();
    await expect(body).toHaveAttribute('data-screen', 'ranking');
    await page.locator('#screen-ranking').getByRole('link', { name: 'BACK' }).click();
    await expect(body).toHaveAttribute('data-screen', 'title');
    await page.evaluate(() => (location.hash = '#/unknown'));
    await expect(body).toHaveAttribute('data-screen', 'title');
  });
});
