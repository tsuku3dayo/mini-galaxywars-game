// HUD の中身（MGW-TD-0003 §4、MGW-GUI-0003 §2）。何を出すかだけを決め、描くのは canvas.ts
import { displayHighScore } from '../core/game';
import type { GameState } from '../core/types';

/** HUD の文字は 2 倍（1 文字 16 × 16 論理 px） */
export const HUD_CHAR = 16;
export const HUD_LEFT = 12;
export const HUD_RIGHT = 468;
export const HUD_TEXT_Y = 8;
export const HUD_LIVES_Y = 32;
export const LIFE_ICON_GAP = 4;

/** 5 桁のゼロ詰め（例：00150） */
export function pad5(n: number): string {
  return String(Math.max(0, Math.min(99_999, Math.floor(n)))).padStart(5, '0');
}

export interface HudModel {
  score: string;
  high: string;
  /** 並べる発射台のアイコンの数（画面に出ている 1 基を含む残機） */
  lifeIcons: number;
}

/** HIGH は、ランキングの 1 位（ゲームを始めたときの highScore）と今のスコアの大きい方 */
export function hudModel(state: GameState): HudModel {
  return {
    score: `SCORE ${pad5(state.score)}`,
    high: `HIGH ${pad5(displayHighScore(state))}`,
    lifeIcons: Math.max(0, state.lives),
  };
}
