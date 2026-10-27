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

/** 隕石・光線を消し、光線も撃たないようにする（移動や発射だけを見るため） */
export function clearField(page: Page): Promise<void> {
  return setState(page, { meteors: [], beams: [], beamTimer: 1e9 });
}
