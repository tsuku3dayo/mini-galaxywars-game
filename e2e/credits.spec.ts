import { expect, test } from '@playwright/test';

// クレジット画面（MGW-US-0033、MGW-GUI-0008）
test.describe('クレジット', () => {
  test('MGW-TC-0033-01 タイトル画面の「CREDITS」で #/credits のクレジット画面に移る', async ({ page }) => {
    await page.goto('./#/title');
    const credits = page.locator('#screen-title').getByRole('link', { name: 'CREDITS' });
    await expect(credits).toBeVisible();
    await credits.click();
    await expect(page).toHaveURL(/#\/credits$/);
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'credits');
    await expect(page.locator('#screen-credits')).toBeVisible();
  });

  test('MGW-TC-0033-02 上に「← BACK」とタイトル「クレジット」があり、BACK でタイトルに戻る', async ({ page }) => {
    await page.goto('./#/credits');
    const screen = page.locator('#screen-credits');
    await expect(screen.locator('h2')).toHaveText('クレジット');
    const back = screen.getByRole('link', { name: 'BACK' });
    await expect(back).toBeVisible();
    // BACK は左上、タイトルは同じ段の中央
    const stage = (await page.locator('#stage').boundingBox())!;
    const b = (await back.boundingBox())!;
    const h = (await screen.locator('h2').boundingBox())!;
    expect(b.x).toBeLessThan(stage.x + stage.width / 4);
    expect(Math.abs(h.x + h.width / 2 - (stage.x + stage.width / 2))).toBeLessThan(2);
    expect(Math.abs(b.y + b.height / 2 - (h.y + h.height / 2))).toBeLessThan(4);
    await back.click();
    await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
  });

  test('MGW-TC-0033-03 役割と名前が縦に並ぶ', async ({ page }) => {
    await page.goto('./#/credits');
    const roles = await page.locator('#screen-credits dt').allTextContents();
    const names = await page.locator('#screen-credits dd').allTextContents();
    expect(roles).toEqual(['PRODUCER', 'DIRECTOR', 'GAME DESIGNER', 'GRAPHIC DESIGNER', 'SOUND CREATOR', 'PROGRAMMER']);
    expect(names).toEqual(['つくだ よしはる', 'つくだ よしはる', 'つくだ よしはる', 'CLAUDE CODE', 'CLAUDE CODE', 'CLAUDE CODE']);
    // 上から 役割 → 名前 → 次の役割 … の順に縦に並ぶ（スクロールに左右されないよう、一覧の中の位置で比べる）
    const tops = await page.locator('#screen-credits dl').evaluate((dl) => [...dl.children].map((c) => (c as HTMLElement).offsetTop));
    expect(tops).toHaveLength(12);
    for (let i = 1; i < tops.length; i++) expect(tops[i]!).toBeGreaterThan(tops[i - 1]!);
    // 役割は小さくうすい字、名前は太字
    const look = await page.locator('#screen-credits').evaluate((el) => {
      const dt = getComputedStyle(el.querySelector('dt')!);
      const dd = getComputedStyle(el.querySelector('dd')!);
      return { dtSize: parseFloat(dt.fontSize), ddSize: parseFloat(dd.fontSize), ddWeight: Number(dd.fontWeight), bg: getComputedStyle(el).backgroundColor };
    });
    expect(look.dtSize).toBeLessThan(look.ddSize);
    expect(look.ddWeight).toBeGreaterThanOrEqual(600);
    // 紺の画面
    expect(look.bg).toBe('rgb(11, 16, 32)');
  });
});
