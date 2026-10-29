// HUD・地面・残機の中身（MGW-TD-0003 §4・§6、MGW-GUI-0003 §2）。何を出すかだけを決め、描くのは canvas.ts
import { STEPS_PER_SECOND } from '../core/config';
import { displayHighScore } from '../core/game';
import type { GameState } from '../core/types';

/** HUD の文字は 2 倍（1 文字 16 × 16 論理 px） */
export const HUD_CHAR = 16;
export const HUD_LEFT = 12;
export const HUD_RIGHT = 468;
export const HUD_TEXT_Y = 8;
/** 地面（発射台の下の横線） */
export const GROUND_Y = 616;
export const GROUND_H = 2;
/** 左下の残機：数（2 倍の文字）と、その右の控えの発射台のアイコン */
export const LIVES_X = 12;
export const LIVES_Y = 620;
export const LIFE_ICONS_X = 36;
export const LIFE_ICON_STEP = 20;
export const LIFE_ICON_Y = 625;

/** 5 桁のゼロ詰め（例：00150） */
export function pad5(n: number): string {
  return String(Math.max(0, Math.min(99_999, Math.floor(n)))).padStart(5, '0');
}

export interface HudModel {
  score: string;
  high: string;
}

/**
 * SCORE は UFO の得点だけ（クリアで足した時間ボーナスは入れない。仕様書 v1.9）。
 * HIGH は、ランキングの 1 位（ゲームを始めたときの highScore）と今のスコア（合計）の大きい方
 */
export function hudModel(state: GameState): HudModel {
  return {
    score: `SCORE ${pad5(state.score - state.timeBonus)}`,
    high: `HIGH ${pad5(displayHighScore(state))}`,
  };
}

/** 経過時間（MGW-TD-0003 §6）：TIME と、経過秒を切り捨てた 3 桁（999 で止める） */
export function timeText(playSteps: number): string {
  const seconds = Math.min(999, Math.floor(playSteps / STEPS_PER_SECOND));
  return `TIME ${String(seconds).padStart(3, '0')}`;
}

/** 左下の残機（MGW-TD-0003 §6）：数は画面に出ている 1 基を含む残機、アイコンは控えの数（残機 − 1） */
export function lifeModel(lives: number): { count: string; icons: number } {
  const n = Math.max(0, Math.min(9, Math.floor(lives)));
  return { count: String(n), icons: Math.max(0, n - 1) };
}
