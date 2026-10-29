import { expect, test, type Locator, type Page } from '@playwright/test';
import { clearField, getState, openPlay } from './helpers';

// タッチの操作（MGW-GUI-0003 §3）。なぞる動きは Playwright のタッチでは作れないので、指（pointerType: touch）の
// ポインターイベントを送る。タップは page.touchscreen.tap を使う

/** 論理 x（0〜480）を、ゲーム画面の左右を基準にした画面の x にする */
async function clientX(page: Page, x: number): Promise<number> {
  const box = (await page.locator('#game').boundingBox())!;
  return box.x + (x / 480) * box.width;
}

async function centerY(target: Locator): Promise<number> {
  const box = (await target.boundingBox())!;
  return box.y + box.height / 2;
}

/** 指のポインターイベントを送る */
async function finger(target: Locator, type: 'pointerdown' | 'pointermove' | 'pointerup', x: number, y: number): Promise<void> {
  await target.dispatchEvent(type, { pointerType: 'touch', pointerId: 7, isPrimary: true, clientX: x, clientY: y, bubbles: true });
}

const control = (page: Page) => page.locator('#control-area');
const field = (page: Page) => page.locator('#game');

test.describe('タッチ操作と操作空間', () => {
  test('MGW-TC-0021-01 タッチ端末では、フィールドの下に高さ 96 の操作空間が、角の丸い枠に囲まれて出る。中に「ここをなぞって移動・タップで発射」と出る', async ({ page, isMobile }) => {
    await openPlay(page);
    if (!isMobile) {
      // PC では出さない
      await expect(control(page)).toBeHidden();
      return;
    }
    await expect(control(page)).toBeVisible();
    await expect(control(page)).toHaveText('ここをなぞって移動・タップで発射');
    // 角の丸い枠（線と背景）で囲む
    const box = await control(page)
      .locator('.control-box')
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { radius: parseFloat(s.borderTopLeftRadius), border: parseFloat(s.borderTopWidth), bg: s.backgroundColor };
      });
    expect(box.radius).toBeGreaterThan(0);
    expect(box.border).toBeGreaterThan(0);
    expect(box.bg).not.toBe('rgba(0, 0, 0, 0)');
    const stage = (await field(page).boundingBox())!;
    const area = (await control(page).boundingBox())!;
    // ゲーム画面のすぐ下に、同じ幅で、論理 96（ゲーム画面の 640 に対して）の高さ
    expect(area.y).toBeCloseTo(stage.y + stage.height, 0);
    expect(area.width).toBeCloseTo(stage.width, 0);
    expect(area.x).toBeCloseTo(stage.x, 0);
    expect(area.height).toBeCloseTo((stage.height * 96) / 640, 0);
  });

  test.describe('タッチ端末', () => {
    test.skip(({ isMobile }) => !isMobile, 'タッチ端末だけ');

    test('MGW-TC-0021-02 操作空間かプレイ空間をなぞると、発射台（発射後はミサイル）が指の x を追う', async ({ page }) => {
      await openPlay(page);
      await clearField(page);
      for (const target of [control(page), field(page)]) {
        const y = await centerY(target);
        // 前提：発射前で、発射台は真ん中
        await expect(page.locator('body')).toHaveAttribute('data-status', 'ready');
        await finger(target, 'pointerdown', await clientX(page, 240), y);
        await finger(target, 'pointermove', await clientX(page, 100), y);
        await expect.poll(async () => (await getState(page)).launcherX).toBeCloseTo(100, 0);
        await finger(target, 'pointermove', await clientX(page, 400), y);
        await expect.poll(async () => (await getState(page)).launcherX).toBeCloseTo(400, 0);
        // 発射台を真ん中に戻してから離す。なぞって離したときは発射しない（MGW-TC-0021-06）ので、タップで発射する
        await finger(target, 'pointermove', await clientX(page, 240), y);
        await expect.poll(async () => (await getState(page)).launcherX).toBeCloseTo(240, 0);
        await finger(target, 'pointerup', await clientX(page, 240), y);
        await finger(target, 'pointerdown', await clientX(page, 240), y);
        await finger(target, 'pointerup', await clientX(page, 240), y);
        await expect(page.locator('body')).toHaveAttribute('data-status', 'playing');
        // 発射後はミサイルが指の x を追う
        await finger(target, 'pointerdown', await clientX(page, 240), y);
        await finger(target, 'pointermove', await clientX(page, 160), y);
        await expect.poll(async () => (await getState(page)).missile.x).toBeCloseTo(160, 0);
        await finger(target, 'pointerup', await clientX(page, 160), y);
        // 次の場所で確かめるため、新しいゲームにする
        await openPlay(page);
        await clearField(page);
      }
    });

    test('MGW-TC-0021-06 操作空間かプレイ空間をなぞって動かしてから離しても、発射しない', async ({ page }) => {
      for (const target of [control(page), field(page)]) {
        await openPlay(page);
        await clearField(page);
        const y = await centerY(target);
        await finger(target, 'pointerdown', await clientX(page, 240), y);
        await finger(target, 'pointermove', await clientX(page, 300), y);
        await expect.poll(async () => (await getState(page)).launcherX).toBeGreaterThan(260);
        await finger(target, 'pointerup', await clientX(page, 300), y);
        // 離しても発射前のまま（しばらく待っても）
        await page.waitForTimeout(300);
        await expect(page.locator('body')).toHaveAttribute('data-status', 'ready');
        expect((await getState(page)).missile.isLaunched).toBe(false);
        // 戻ってきて同じ場所で離しても（動いた距離で決める）発射しない
        await finger(target, 'pointerdown', await clientX(page, 300), y);
        await finger(target, 'pointermove', await clientX(page, 200), y);
        await finger(target, 'pointermove', await clientX(page, 300), y);
        await finger(target, 'pointerup', await clientX(page, 300), y);
        await page.waitForTimeout(300);
        await expect(page.locator('body')).toHaveAttribute('data-status', 'ready');
        // 少しのぶれ（10 px 未満）はタップとして発射する
        await finger(target, 'pointerdown', await clientX(page, 300), y);
        await finger(target, 'pointermove', (await clientX(page, 300)) + 4, y + 3);
        await finger(target, 'pointerup', (await clientX(page, 300)) + 4, y + 3);
        await expect(page.locator('body')).toHaveAttribute('data-status', 'playing');
      }
    });

    test('MGW-TC-0021-03 操作空間かプレイ空間をタップ（10 px 未満しか動かないもの）すると発射する', async ({ page }) => {
      for (const target of [control, field]) {
        await openPlay(page);
        await clearField(page);
        const box = (await target(page).boundingBox())!;
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.8);
        await expect(page.locator('body')).toHaveAttribute('data-status', 'playing');
        expect((await getState(page)).missile.isLaunched).toBe(true);
      }
    });

    test('MGW-TC-0022-05 指を触れたときの標準の動き（長押しの虫めがね・メニュー、2 回タップの拡大）を止めている', async ({ page }) => {
      await openPlay(page);
      // iPhone の虫めがねそのものは E2E では出せないので、touchstart の既定の動きが止められていることを見る
      // （WebKit では Touch を作れないので、同じ名前のイベントを送る。止める処理は指の中身を見ない）
      for (const selector of ['#control-area', '#control-area span', '#game']) {
        const prevented = await page.locator(selector).first().evaluate((el) => {
          const event = new Event('touchstart', { bubbles: true, cancelable: true });
          el.dispatchEvent(event);
          return event.defaultPrevented;
        });
        expect(prevented, selector).toBe(true);
      }
      // 2 本指の拡大（Safari の gesturestart）も止める
      const pinch = await page.evaluate(() => {
        const event = new Event('gesturestart', { bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);
        return event.defaultPrevented;
      });
      expect(pinch).toBe(true);
    });

    test('MGW-TC-0021-04 指を触れ続けている間は、加速噴射になる', async ({ page }) => {
      await openPlay(page);
      await clearField(page);
      const y = await centerY(control(page));
      const x = await clientX(page, 240);
      // タップで発射
      await finger(control(page), 'pointerdown', x, y);
      await finger(control(page), 'pointerup', x, y);
      await expect(page.locator('body')).toHaveAttribute('data-status', 'playing');
      expect((await getState(page)).missile.isBoosting).toBe(false);
      // 触れている間は噴射、離すと止まる
      await finger(control(page), 'pointerdown', x, y);
      await expect.poll(async () => (await getState(page)).missile.isBoosting).toBe(true);
      await finger(control(page), 'pointerup', x, y);
      await expect.poll(async () => (await getState(page)).missile.isBoosting).toBe(false);
    });
  });
});
