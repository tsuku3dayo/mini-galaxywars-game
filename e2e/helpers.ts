import { expect, type Page } from '@playwright/test';

// E2E の共通の道具。?debug=1 の window.__mgw を使う（MGW-TD-0004 §6.2）
export interface MgwState {
  status: string;
  lives: number;
  launcherX: number;
  missile: { x: number; y: number; isLaunched: boolean; isBoosting: boolean };
  waitReason: string | null;
  [key: string]: unknown;
}

type Mgw = {
  getState(): MgwState | null;
  setState(patch: Record<string, unknown>): void;
  freeze(on: boolean): void;
  advance(steps: number, input?: Record<string, unknown>): void;
};

/** プレイ画面を ?debug=1 で開き、発射前（ready）になるまで待つ */
export async function openPlay(page: Page): Promise<void> {
  await page.goto('./?debug=1#/play');
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'play');
  await expect(page.locator('body')).toHaveAttribute('data-status', 'ready');
}

export function getState(page: Page): Promise<MgwState> {
  return page.evaluate(() => (window as unknown as { __mgw: Mgw }).__mgw.getState()!);
}

export function setState(page: Page, patch: Record<string, unknown>): Promise<void> {
  return page.evaluate((p) => (window as unknown as { __mgw: Mgw }).__mgw.setState(p), patch);
}

export function freeze(page: Page, on: boolean): Promise<void> {
  return page.evaluate((v) => (window as unknown as { __mgw: Mgw }).__mgw.freeze(v), on);
}

export function advance(page: Page, steps: number, input?: Record<string, unknown>): Promise<void> {
  return page.evaluate(([n, i]) => (window as unknown as { __mgw: Mgw }).__mgw.advance(n as number, i as Record<string, unknown> | undefined), [steps, input] as const);
}

/**
 * Canvas の論理座標 y の 1 行を読み、x0〜x1 の間で白い（明るい）部分がいくつの塊になっているかを数える。
 * 描いた中身は E2E から読めないので、HUD のように場所の決まったものだけを画素で確かめる
 */
export function countRuns(page: Page, y: number, x0: number, x1: number): Promise<number> {
  return page.locator('#game').evaluate(
    (canvas: HTMLCanvasElement, [ly, lx0, lx1]) => {
      const scale = canvas.width / 480;
      const ctx = canvas.getContext('2d')!;
      const row = ctx.getImageData(Math.floor(lx0 * scale), Math.floor((ly + 0.5) * scale), Math.floor((lx1 - lx0) * scale), 1).data;
      let runs = 0;
      let inRun = false;
      for (let i = 0; i < row.length; i += 4) {
        const bright = row[i]! + row[i + 1]! + row[i + 2]! > 384;
        if (bright && !inRun) runs++;
        inRun = bright;
      }
      return runs;
    },
    [y, x0, x1] as const,
  );
}

/** Canvas の論理座標の四角に、白い（明るい）画素があるか */
export function hasInk(page: Page, x: number, y: number, w: number, h: number): Promise<boolean> {
  return page.locator('#game').evaluate(
    (canvas: HTMLCanvasElement, [lx, ly, lw, lh]) => {
      const scale = canvas.width / 480;
      const data = canvas.getContext('2d')!.getImageData(Math.floor(lx * scale), Math.floor(ly * scale), Math.ceil(lw * scale), Math.ceil(lh * scale)).data;
      for (let i = 0; i < data.length; i += 4) if (data[i]! + data[i + 1]! + data[i + 2]! > 384) return true;
      return false;
    },
    [x, y, w, h] as const,
  );
}

/** 隕石・光線を消し、光線も撃たないようにする（移動や発射だけを見るため） */
export function clearField(page: Page): Promise<void> {
  return setState(page, { meteors: [], beams: [], beamTimer: 1e9 });
}
