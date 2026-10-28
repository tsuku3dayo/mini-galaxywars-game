// UFO を倒したときの表示（MGW-TD-0003 §6）。初めの 0.4 秒は爆発、そのあとは得点。Canvas に触れない
import { EXPLOSION_STEPS, KILL_EFFECT_STEPS } from '../core/config';
import type { GameState } from '../core/types';

export type KillEffectView = { kind: 'explosion' | 'points'; x: number; y: number; points: number } | null;

/** 倒してからのステップで、爆発か得点かを決める（steps は残り。KILL_EFFECT_STEPS から減る） */
export function killEffectView(effect: GameState['killEffect']): KillEffectView {
  if (!effect || effect.steps <= 0) return null;
  const elapsed = KILL_EFFECT_STEPS - effect.steps;
  return { kind: elapsed < EXPLOSION_STEPS ? 'explosion' : 'points', x: effect.x, y: effect.y, points: effect.points };
}
