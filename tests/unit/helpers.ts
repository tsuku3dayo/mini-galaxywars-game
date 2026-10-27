// 単体テストの共通の道具
import { step } from '../../src/core/game';
import type { GameState, StepInput } from '../../src/core/types';

export const NO_INPUT: StepInput = { dir: 0, targetX: null, launch: false, boost: false };

export function input(partial: Partial<StepInput>): StepInput {
  return { ...NO_INPUT, ...partial };
}

/** n ステップ進める */
export function run(state: GameState, n: number, stepInput: StepInput = NO_INPUT): GameState {
  let s = state;
  for (let i = 0; i < n; i++) s = step(s, stepInput);
  return s;
}

/** 発射する（このステップで playing になる） */
export function launch(state: GameState): GameState {
  return step(state, input({ launch: true }));
}
