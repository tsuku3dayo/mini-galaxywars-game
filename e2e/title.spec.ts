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
    // アプリ名と START は、スクロールしなくてもゲーム画面の枠の中に見える（下の方は MGW-TC-0014-04）
    const stage = (await page.locator('#stage').boundingBox())!;
    for (const part of [title.locator('h1'), title.getByRole('button', { name: 'START' })]) {
      const box = (await part.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(stage.y - 0.5);
      expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
    }
  });

  test('MGW-TC-0014-06 タイトル画面に、UFO の絵と部位からの線で得点を示す点数の説明と、「4 機目の突起は 600」が出る', async ({ page }) => {
    await page.goto('./#/title');
    const title = page.locator('#screen-title');
    const guide = title.locator('canvas.score-guide');
    await expect(guide).toBeVisible();
    await expect(guide).toHaveAttribute('aria-label', '点数：側面と上 50、下の中央 100、下の突起 150');
    await expect(title.locator('.score-bonus')).toHaveText('4 機目の突起は 600');
    // アプリ名の下、START の上
    const name = (await title.locator('h1').boundingBox())!;
    const box = (await guide.boundingBox())!;
    const start = (await title.getByRole('button', { name: 'START' }).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(name.y + name.height - 0.5);
    expect(box.y + box.height).toBeLessThanOrEqual(start.y + 0.5);
    // 描いた中身：UFO（2 倍、中心 52, 34）は紫・赤、数字（50・100・150 の場所）は白
    const colors = await guide.evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext('2d')!;
      const k = c.width / 200;
      /** 論理の四角の中で、いちばん多い色の画素の [r, g, b] と、塗られた画素があるか */
      const area = (x: number, y: number, w: number, h: number) => {
        const d = ctx.getImageData(Math.floor(x * k), Math.floor(y * k), Math.ceil(w * k), Math.ceil(h * k)).data;
        let ink = 0;
        let pink = 0;
        let white = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3]! < 128) continue;
          ink++;
          if (d[i]! > 200 && d[i + 1]! < 120 && d[i + 2]! > 160) pink++;
          if (d[i]! > 200 && d[i + 1]! > 200 && d[i + 2]! > 200) white++;
        }
        return { ink, pink, white };
      };
      return { ufo: area(20, 10, 64, 48), n50: area(128, 18, 32, 16), n100: area(100, 64, 48, 16), n150: area(6, 78, 48, 16) };
    });
    expect(colors.ufo.pink).toBeGreaterThan(100);
    for (const n of [colors.n50, colors.n100, colors.n150]) {
      expect(n.white).toBeGreaterThan(10);
      expect(n.pink).toBe(0);
    }
  });

  test('MGW-TC-0014-04 START・RANKING・SETTINGS・CREDITS・効果音が同じ大きさで並び、操作の案内の下に小さめのランキング消去が出る。収まらない小さい画面では枠の中でスクロールして全部に届く', async ({ page }, testInfo) => {
    await page.goto('./#/title');
    const title = page.locator('#screen-title');
    const scroll = title.locator('.title-scroll');
    const big = [
      title.getByRole('button', { name: 'START' }),
      title.getByRole('link', { name: 'RANKING' }),
      title.getByRole('button', { name: 'SETTINGS' }),
      title.getByRole('link', { name: 'CREDITS' }),
      title.getByRole('button', { name: '効果音：オン' }),
    ];
    const guide = title.locator('.title-guide');
    const clear = title.getByRole('button', { name: 'ランキング消去' });
    // 上から順に並ぶ（スクロールに左右されないよう、箱の中の位置で比べる）
    const tops = await Promise.all([...big, guide, clear].map((l) => l.evaluate((el) => el.getBoundingClientRect().top + el.closest('.title-scroll')!.scrollTop)));
    for (let i = 1; i < tops.length; i++) expect(tops[i]!).toBeGreaterThan(tops[i - 1]!);
    // 5 つは START と同じ幅・高さ（44 以上）。ランキング消去はそれより小さい
    const startBox = (await big[0]!.boundingBox())!;
    expect(startBox.height).toBeGreaterThanOrEqual(43.5);
    for (const part of big) {
      const box = (await part.boundingBox())!;
      expect(box.width).toBeCloseTo(startBox.width, 0);
      expect(box.height).toBeCloseTo(startBox.height, 0);
    }
    const clearBox = (await clear.boundingBox())!;
    expect(clearBox.width).toBeLessThan(startBox.width);
    expect(clearBox.height).toBeGreaterThanOrEqual(43.5);

    // iPhone 11・PC は枠に収まり、スクロールしない。iPhone SE は枠の中でスクロールできる
    const overflow = await scroll.evaluate((el) => el.scrollHeight - el.clientHeight);
    if (testInfo.project.name === 'iphonese-webkit') expect(overflow).toBeGreaterThanOrEqual(0);
    else expect(overflow).toBeLessThanOrEqual(1);
    // どれも、枠の中でスクロールすれば、ゲーム画面の枠の中に見える
    const stage = (await page.locator('#stage').boundingBox())!;
    for (const part of [...big, guide, clear]) {
      await part.scrollIntoViewIfNeeded();
      const box = (await part.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(stage.y - 0.5);
      expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
      expect(box.x).toBeGreaterThanOrEqual(stage.x - 0.5);
      expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width + 0.5);
    }
    // ページそのものはスクロールしない。Space はゲームを始める（中身をスクロールさせない）
    expect(await page.evaluate(() => [scrollX, scrollY])).toEqual([0, 0]);
    await scroll.evaluate((el) => (el.scrollTop = 0));
    await page.keyboard.press('Space');
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'play');
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
