// 部位の得点・600 点ボーナス・増機（MGW-TD-0002 §7、仕様書 §6）
import { EXTEND_SCORE, FIELD_WIDTH, SCORE_MAX } from './config';
import type { Box } from './physics';
import type { GameState, UFO, UfoPart } from './types';

interface PartRect {
  part: UfoPart;
  points: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** UFO の中心からの部位の四角（MGW-TD-0002 §7.1） */
const PARTS: PartRect[] = [
  { part: 'prong', points: 150, x0: -14, x1: -8, y0: 4, y1: 12 },
  { part: 'prong', points: 150, x0: 8, x1: 14, y0: 4, y1: 12 },
  { part: 'bottom', points: 100, x0: -6, x1: 6, y0: 0, y1: 8 },
  { part: 'body', points: 50, x0: -16, x1: 16, y0: -12, y1: 4 },
];

export const BONUS_POINTS = 600;
const BONUS_KILL_INDEX = 3; // 3 機を倒したあとの 4 機目

/** UFO の画面の端での回り込みを考えた、x の差（−240〜240） */
function wrappedDx(x: number, ufoX: number): number {
  const half = FIELD_WIDTH / 2;
  return ((((x - ufoX + half) % FIELD_WIDTH) + FIELD_WIDTH) % FIELD_WIDTH) - half;
}

/** ミサイルの四角が重なった部位のうち、得点のいちばん高いもの。重ならなければ null */
export function hitPart(missile: Box, ufo: UFO): { part: UfoPart; points: number } | null {
  const dx = wrappedDx(missile.x, ufo.x);
  const dy = missile.y - ufo.y;
  const left = dx - missile.w / 2;
  const right = dx + missile.w / 2;
  const top = dy - missile.h / 2;
  const bottom = dy + missile.h / 2;
  let best: PartRect | null = null;
  for (const p of PARTS) {
    const hit = left < p.x1 && right > p.x0 && top < p.y1 && bottom > p.y0;
    if (hit && (best === null || p.points > best.points)) best = p;
  }
  return best && { part: best.part, points: best.points };
}

/** 倒したときの得点。4 機目の突起は 150 点の代わりに 600 点 */
export function killPoints(part: UfoPart, basePoints: number, killCount: number): number {
  return part === 'prong' && killCount === BONUS_KILL_INDEX ? BONUS_POINTS : basePoints;
}

/** 得点を足し、3,000 点に届いたら 1 回だけ増機する。スコアは 99,999 で止める */
export function addScore(state: GameState, points: number): Pick<GameState, 'score' | 'lives' | 'extended'> {
  const score = Math.min(SCORE_MAX, state.score + points);
  const extend = !state.extended && score >= EXTEND_SCORE;
  return { score, lives: state.lives + (extend ? 1 : 0), extended: state.extended || extend };
}
