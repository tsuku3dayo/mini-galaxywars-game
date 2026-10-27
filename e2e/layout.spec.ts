import { expect, test } from '@playwright/test';
import { openPlay } from './helpers';

test.describe('大きさ', () => {
  test('MGW-TC-0005-01 論理座標 480 × 640 で計算し、画面には縦横比 3:4 を保って拡大・縮小して表示する', async ({ page }) => {
    await openPlay(page);
    const canvas = page.locator('#game');
    await expect(canvas).toBeVisible();

    const check = async () => {
      const box = (await canvas.boundingBox())!;
      const viewport = page.viewportSize()!;
      // 3:4 を保つ
      expect(box.width / box.height).toBeCloseTo(3 / 4, 2);
      // 上のバー（44）の下に置き、画面からはみ出さない。左右は中央
      expect(box.y).toBeCloseTo(44, 0);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 0.5);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
      expect(Math.abs(box.x - (viewport.width - box.x - box.width))).toBeLessThan(1);
      // どちらかの辺が使える広さいっぱい
      const fillsWidth = Math.abs(box.width - viewport.width) < 1;
      const fillsHeight = Math.abs(box.y + box.height - viewport.height) < 1;
      expect(fillsWidth || fillsHeight).toBe(true);
      // Canvas の画素も 3:4 で、表示の大きさ × devicePixelRatio
      const pixels = await canvas.evaluate((c: HTMLCanvasElement) => ({ w: c.width, h: c.height, dpr: devicePixelRatio }));
      expect(pixels.w / pixels.h).toBeCloseTo(3 / 4, 2);
      expect(Math.abs(pixels.w - box.width * pixels.dpr)).toBeLessThanOrEqual(1);
    };
    await check();

    // 窓の大きさが変わっても、3:4 を保って合わせ直す
    await page.setViewportSize({ width: 600, height: 500 });
    await expect.poll(async () => (await canvas.boundingBox())!.height).toBeCloseTo(456, 0);
    await check();
  });
});
