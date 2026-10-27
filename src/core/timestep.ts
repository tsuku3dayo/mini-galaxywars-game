// 1/120 秒の積み上げ（MGW-TD-0002 §4、仕様書 §5.1）
import { MAX_STEPS_PER_FRAME, STEPS_PER_SECOND } from './config';

export const STEP_MS = 1000 / STEPS_PER_SECOND;
// 60 Hz（16.67 ms）と 120 Hz（8.33 ms）の足し算の誤差で、1 ステップ足りなくならないようにする
const EPSILON_MS = 1e-6;

/** 積み上げた時間に経過時間を足し、進めるステップ数と残りの時間を返す。最大 12 ステップで、超えた分は捨てる */
export function planSteps(acc: number, elapsedMs: number): { steps: number; acc: number } {
  let total = acc + Math.max(0, elapsedMs);
  let steps = 0;
  while (total + EPSILON_MS >= STEP_MS && steps < MAX_STEPS_PER_FRAME) {
    total -= STEP_MS;
    steps += 1;
  }
  if (steps === MAX_STEPS_PER_FRAME && total + EPSILON_MS >= STEP_MS) total = 0;
  return { steps, acc: Math.max(0, total) };
}
