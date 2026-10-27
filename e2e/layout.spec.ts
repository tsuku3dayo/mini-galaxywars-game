import { expect, test, type Page } from '@playwright/test';
import { openPlay } from './helpers';

/** 上のバー・ゲーム画面・操作空間の箱 */
async function frame(page: Page) {
  const bar = (await page.locator('#topbar').boundingBox())!;
  const game = (await page.locator('#game').boundingBox())!;
  const control = (await page.locator('#control-area').boundingBox())!;
  return { bar, game, control, viewport: page.viewportSize()! };
}

/** iPhone の縦画面で、上のバー・ゲーム画面・操作空間が 1 画面に収まり、3:4 を保つ */
async function expectFitsOnIphone(page: Page) {
  const { bar, game, control, viewport } = await frame(page);
  // 前提：タッチ端末として操作空間が出ている
  await expect(page.locator('#control-area')).toBeVisible();
  expect(game.width / game.height).toBeCloseTo(3 / 4, 2);
  // 上から 上のバー → ゲーム画面 → 操作空間 の順に、すき間も重なりもなく並ぶ
  expect(game.y).toBeCloseTo(bar.y + bar.height, 0);
  expect(control.y).toBeCloseTo(game.y + game.height, 0);
  // 画面からはみ出さない
  expect(bar.y).toBeGreaterThanOrEqual(-0.5);
  expect(control.y + control.height).toBeLessThanOrEqual(viewport.height + 0.5);
  expect(game.x).toBeGreaterThanOrEqual(-0.5);
  expect(game.x + game.width).toBeLessThanOrEqual(viewport.width + 0.5);
  // ページはスクロールしない
  expect(await page.evaluate(() => [scrollX, scrollY, document.documentElement.scrollHeight <= innerHeight])).toEqual([0, 0, true]);
}

test.describe('大きさ', () => {
  test('MGW-TC-0005-01 論理座標 480 × 640 で計算し、画面には縦横比 3:4 を保って拡大・縮小して表示する', async ({ page }) => {
    await openPlay(page);
    const canvas = page.locator('#game');
    await expect(canvas).toBeVisible();

    const check = async () => {
      const box = (await canvas.boundingBox())!;
      const viewport = page.viewportSize()!;
      // タッチ端末では、ゲーム画面の下に操作空間（論理 96）がある
      const control = await page.locator('#control-area').boundingBox();
      const bottom = control ? control.y + control.height : box.y + box.height;
      // 3:4 を保つ
      expect(box.width / box.height).toBeCloseTo(3 / 4, 2);
      // 上のバー（44）の下に置き、画面からはみ出さない。左右は中央
      expect(box.y).toBeCloseTo(44, 0);
      expect(bottom).toBeLessThanOrEqual(viewport.height + 0.5);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
      expect(Math.abs(box.x - (viewport.width - box.x - box.width))).toBeLessThan(1);
      // どちらかの辺が使える広さいっぱい
      const fillsWidth = Math.abs(box.width - viewport.width) < 1;
      const fillsHeight = Math.abs(bottom - viewport.height) < 1;
      expect(fillsWidth || fillsHeight).toBe(true);
      // Canvas の画素も 3:4 で、表示の大きさ × devicePixelRatio
      const pixels = await canvas.evaluate((c: HTMLCanvasElement) => ({ w: c.width, h: c.height, dpr: devicePixelRatio }));
      expect(pixels.w / pixels.h).toBeCloseTo(3 / 4, 2);
      expect(Math.abs(pixels.w - box.width * pixels.dpr)).toBeLessThanOrEqual(1);
    };
    await check();

    // 窓の大きさが変わっても、3:4 を保って合わせ直す
    await page.setViewportSize({ width: 600, height: 500 });
    // 使える高さ 500 − 44 = 456 を、ゲーム画面 640（タッチ端末は操作空間 96 を足して 736）で分ける
    const touch = (await page.locator('body').getAttribute('data-touch')) === 'true';
    await expect.poll(async () => (await canvas.boundingBox())!.height).toBeCloseTo(touch ? (456 * 640) / 736 : 456, 0);
    await check();
  });

  test('MGW-TC-0022-01 iPhone の縦画面で、フィールドと操作空間が 1 画面に収まり、3:4 の比率を保つ', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'iphone11-webkit', 'iPhone 11 で確かめる（SE は MGW-TC-0022-03）');
    await openPlay(page);
    await expectFitsOnIphone(page);
    // iPhone 11 の Safari（414 × 715）は高さで決まり、幅には余りが出る
    const { game } = await frame(page);
    expect(game.width).toBeLessThanOrEqual(414);
  });

  test('MGW-TC-0022-03 iPhone SE 相当の画面でもはみ出さない', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'iphonese-webkit', 'iPhone SE で確かめる');
    await openPlay(page);
    await expectFitsOnIphone(page);
    // タイトル画面の中身も、ゲーム画面の枠からはみ出さない
    await page.evaluate(() => (location.hash = '#/title'));
    const stage = (await page.locator('#stage').boundingBox())!;
    for (const part of await page.locator('#screen-title').locator('h1, button, a, p').all()) {
      const box = (await part.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 0.5);
      expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width + 0.5);
    }
  });

  test('安全領域（ノッチ・ホームバー）の余白を引いて合わせる', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'iPhone で確かめる');
    await openPlay(page);
    // E2E の WebKit には安全領域がないので、iPhone 11 のホーム画面のアプリと同じ余白（上 48・下 34）をまねる
    await page.addStyleTag({ content: '#app { padding: 48px 0 34px 0 !important; }' });
    await page.evaluate(() => dispatchEvent(new Event('resize')));
    await expect.poll(async () => (await frame(page)).bar.y).toBeCloseTo(48, 0);
    const { control, viewport } = await frame(page);
    // ホームバーの余白に入り込まない
    expect(control.y + control.height).toBeLessThanOrEqual(viewport.height - 34 + 0.5);
    await expectFitsOnIphone(page);
  });
});
