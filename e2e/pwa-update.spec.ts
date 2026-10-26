import { expect, test, type Page } from '@playwright/test';

// 本当の新しい版の代わりに、?debug=1 の __mgw.simulateUpdate() で「新しい版が待っている」状態を作る（MGW-TST-0001 §6.1）
async function simulateUpdate(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as { __mgw: { simulateUpdate(): void } }).__mgw.simulateUpdate());
}

test.describe('更新の案内', () => {
  test('MGW-TC-0003-01 新しい版が届くと、タイトル画面とランキング画面に「更新」ボタンが出る', async ({ page }) => {
    await page.goto('./?debug=1#/title');
    const banner = page.locator('#update-banner');
    await expect(banner).toBeHidden();
    await simulateUpdate(page);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('新しい版があります');
    await expect(banner.getByRole('button', { name: '更新' })).toBeVisible();

    await page.goto('./?debug=1#/ranking');
    await simulateUpdate(page);
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'ranking');
    await expect(banner.getByRole('button', { name: '更新' })).toBeVisible();
  });

  test('MGW-TC-0003-02 「更新」を押すと、新しい版に切り替わって再読み込みされる', async ({ page }) => {
    await page.goto('./?debug=1#/title');
    await simulateUpdate(page);
    await page.locator('#update-banner').getByRole('button', { name: '更新' }).click();
    // ?debug=1 の simulateUpdate では、読み込み直す代わりに data-update=applied になる
    await expect(page.locator('body')).toHaveAttribute('data-update', 'applied');
  });

  test('MGW-TC-0003-03 プレイ中（#/play）は「更新」を出さず、版も切り替わらない', async ({ page }) => {
    await page.goto('./?debug=1#/play');
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'play');
    await simulateUpdate(page);
    await expect(page.locator('body')).toHaveAttribute('data-update', 'waiting');
    await expect(page.locator('#update-banner')).toBeHidden();

    // タイトルに戻ると出る
    await page.evaluate(() => (location.hash = '#/title'));
    await expect(page.locator('#update-banner')).toBeVisible();
  });
});
