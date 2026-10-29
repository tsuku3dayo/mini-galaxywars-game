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

/**
 * プレイ画面を ?debug=1 で開き、発射前（ready）になるまで待つ。
 * すでにプレイ画面にいても新しいゲームから始めるよう、タイトルを通ってから開く。
 * 隕石の並びは種で変わるので、決めた種で始める（MGW-TST-0001 §1.1）
 */
export async function openPlay(page: Page, seed = 1): Promise<void> {
  await page.goto(`./?debug=1&seed=${seed}#/title`);
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'title');
  await page.goto(`./?debug=1&seed=${seed}#/play`);
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

export interface RankingRow {
  score: number;
  name: string;
  date: string;
  /** 仕様書 v1.7 から。前からの記録にはない */
  result?: 'clear' | 'gameOver';
}

/** localStorage のランキング（MGW-TD-0006 §1.1）を入れる。読むのは、終わったとき・画面に入ったとき */
export function seedRanking(page: Page, entries: RankingRow[]): Promise<void> {
  return page.evaluate(
    (e) => localStorage.setItem('galaxy-wars-scores', JSON.stringify({ app: 'mini-galaxywars', version: 1, entries: e })),
    entries,
  );
}

/** 99,999 点で 10 件うまったランキング（どのスコアも入らない） */
export const FULL_RANKING: RankingRow[] = Array.from({ length: 10 }, () => ({ score: 99_999, name: 'TOP', date: '2026-10-01T12:00:00+09:00' }));

/**
 * プレイ画面を開き、決めたスコアでゲームを終わらせる。
 * clear：7 機を倒した状態で、8 機目（下段の id 5）に当てる。gameOver：残り 0 機でミスの待ちを終える。
 * 終わったときのスコアを返す（クリアは当たった部位の点が足される）
 */
export async function endGame(page: Page, kind: 'clear' | 'gameOver', scoreBefore: number): Promise<number> {
  await freeze(page, true);
  if (kind === 'clear') {
    const base = await getState(page);
    const ufos = (base.ufos as { id: number; x: number; y: number; isAlive: boolean }[]).map((u) => ({ ...u, isAlive: u.id === 5 }));
    const last = ufos[5]!;
    await setState(page, {
      ufos,
      killCount: 7,
      score: scoreBefore,
      status: 'playing',
      missile: { x: last.x, y: last.y + 20, isLaunched: true, isBoosting: false },
      meteors: [],
      beams: [],
      beamTimer: 1e9,
    });
    await advance(page, 1);
    await expect(page.locator('body')).toHaveAttribute('data-status', 'cleared');
  } else {
    await setState(page, { score: scoreBefore, lives: 0, status: 'respawn', waitReason: 'miss', waitSteps: 1, meteors: [], beams: [], beamTimer: 1e9 });
    await advance(page, 2);
    await expect(page.locator('body')).toHaveAttribute('data-status', 'gameOver');
  }
  return (await getState(page)).score as number;
}

/** 名前の入力の「順位とスコア」の行の文字（例：3RD  01250） */
export function rankLine(rank: string, score: number): string {
  return `${rank}  ${String(score).padStart(5, '0')}`;
}
