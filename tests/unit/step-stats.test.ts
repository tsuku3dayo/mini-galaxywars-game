import { describe, expect, it } from 'vitest';
import { createStepStats } from '../../src/app/step-stats';
import { planSteps } from '../../src/core/timestep';

/** 描画の時刻に揺れのある 60 Hz・120 Hz の描画を、ループと同じ planSteps で流す */
function simulate(hz: number, seconds: number, jitterMs: number) {
  const stats = createStepStats();
  let acc = 0;
  let last = 0;
  const frames = hz * seconds;
  for (let k = 1; k <= frames; k++) {
    // 決まった揺れ（乱数は使わない）
    const now = (k * 1000) / hz + jitterMs * Math.sin(k * 1.7);
    const plan = planSteps(acc, now - last);
    acc = plan.acc;
    last = now;
    stats.frame(now, plan.steps);
  }
  return stats;
}

describe('デバッグ表示の fps と steps/s（MGW-TC-0030-05 の手動の確認に使う）', () => {
  it('描画の時刻が揺れても、steps/s は 120 ± 1 に収まる', () => {
    for (const hz of [60, 120]) {
      const stats = simulate(hz, 10, 0.8);
      expect(Math.abs(stats.stepsPerSecond() - 120)).toBeLessThanOrEqual(1);
      expect(Math.abs(stats.fps() - hz)).toBeLessThanOrEqual(1);
    }
  });

  it('描画が 1 回以下のときは 0', () => {
    const stats = createStepStats();
    expect(stats.stepsPerSecond()).toBe(0);
    stats.frame(100, 2);
    expect(stats.stepsPerSecond()).toBe(0);
  });
});
