import { expect, test, type Page } from '@playwright/test';

// 起動の失敗は、アプリ本体（assets の JS）の読み込みを止めて作る。8 秒は page.clock で進める（MGW-TST-0001）
// Service Worker が受け持つと page.route を通らないので、この spec では Service Worker を使わない
test.use({ serviceWorkers: 'block' });

async function breakBoot(page: Page): Promise<void> {
  await page.route('**/assets/*.js', (route) => route.abort());
}

// 時計を止めておき、runFor で進めた分だけ進むようにする（実時間では進まない）
async function pauseClock(page: Page): Promise<void> {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
}

const recovery = (page: Page) => page.locator('#boot-recovery');

test.describe('起動の復旧', () => {
  test('MGW-TC-0004-01 8 秒たってもアプリが起動しないと、復旧の画面が出る', async ({ page }) => {
    await breakBoot(page);
    await pauseClock(page);
    await page.goto('./');
    await page.clock.runFor(7900);
    await expect(recovery(page)).toBeHidden();
    await page.clock.runFor(200);
    await expect(recovery(page)).toBeVisible();
    await expect(recovery(page)).toContainText('起動できませんでした');
    await expect(recovery(page)).toContainText('ランキングは消えません');
    // アプリの画面の代わりに出す
    await expect(page.locator('#app')).toBeHidden();
  });

  test('MGW-TC-0004-01 アプリが起動したときは、8 秒たっても復旧の画面は出ない', async ({ page }) => {
    await pauseClock(page);
    await page.goto('./');
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
    await page.clock.runFor(10000);
    await expect(recovery(page)).toHaveCount(0);
    await expect(page.locator('.app-name')).toBeVisible();
  });

  test('MGW-TC-0004-02 復旧の画面に「再読み込み」と「キャッシュを消して再読み込み」がある', async ({ page }) => {
    await breakBoot(page);
    await pauseClock(page);
    await page.goto('./');
    await page.clock.runFor(8000);
    const reload = recovery(page).getByRole('button', { name: '再読み込み', exact: true });
    await expect(reload).toBeVisible();
    await expect(recovery(page).getByRole('button', { name: 'キャッシュを消して再読み込み' })).toBeVisible();

    // 「再読み込み」で読み込み直す
    await page.evaluate(() => ((window as unknown as { __beforeReload: boolean }).__beforeReload = true));
    await Promise.all([page.waitForEvent('load'), reload.click()]);
    expect(await page.evaluate(() => '__beforeReload' in window)).toBe(false);
  });

  test('MGW-TC-0004-03 「キャッシュを消して再読み込み」をしても、ランキング（galaxy-wars-scores）は消えない', async ({ page }) => {
    const scores = JSON.stringify([{ name: 'AAA', score: 12340 }]);
    await breakBoot(page);
    await pauseClock(page);
    await page.goto('./');
    const hasCaches = await page.evaluate(() => 'caches' in window);
    await page.evaluate(
      async ({ scores, hasCaches }) => {
        localStorage.setItem('galaxy-wars-scores', scores);
        if (hasCaches) {
          await caches.open('mini-galaxywars-precache-v2-test');
          await caches.open('other-app-cache');
        }
      },
      { scores, hasCaches },
    );
    await page.clock.runFor(8000);

    await Promise.all([
      page.waitForEvent('load'),
      recovery(page).getByRole('button', { name: 'キャッシュを消して再読み込み' }).click(),
    ]);
    expect(await page.evaluate(() => localStorage.getItem('galaxy-wars-scores'))).toBe(scores);
    if (hasCaches) {
      // 消すのはこのアプリのキャッシュ（mini-galaxywars で始まるもの）だけ
      expect(await page.evaluate(() => caches.keys())).toEqual(['other-app-cache']);
    }
  });
});
