import { describe, expect, it } from 'vitest';
import { MAX_STEPS_PER_FRAME, STEPS_PER_SECOND } from '../../src/core/config';
import { newGame, step, togglePause } from '../../src/core/game';
import { planSteps, STEP_MS } from '../../src/core/timestep';
import type { GameState, StepInput } from '../../src/core/types';

// テストの入力の列を作る（種から決まる簡単な乱数。ゲームのルールには使わない）
function makeInputs(count: number, seed: number): StepInput[] {
  let s = seed >>> 0;
  const next = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  const inputs: StepInput[] = [];
  for (let i = 0; i < count; i++) {
    const r = next();
    inputs.push({
      dir: r < 0.3 ? -1 : r < 0.6 ? 1 : 0,
      targetX: next() < 0.2 ? Math.floor(next() * 480) : null,
      launch: next() < 0.01,
      boost: next() < 0.4,
    });
  }
  return inputs;
}

// 一時停止を挟む位置（入力の列の一部として扱う）
const PAUSE_AT = new Set([300, 310, 1500, 1620]);

function applyStep(state: GameState, inputs: StepInput[], index: number): GameState {
  const paused = PAUSE_AT.has(index) ? togglePause(state) : state;
  return step(paused, inputs[index] ?? { dir: 0, targetX: null, launch: false, boost: false });
}

/** 描画 1 回ごとに planSteps でステップ数を決めて進める */
function runFrames(frameMs: number, seconds: number, inputs: StepInput[]): GameState {
  let state = newGame(3000);
  let acc = 0;
  let index = 0;
  const frames = Math.round((seconds * 1000) / frameMs);
  for (let f = 0; f < frames; f++) {
    const plan = planSteps(acc, frameMs);
    acc = plan.acc;
    for (let i = 0; i < plan.steps; i++) state = applyStep(state, inputs, index++);
  }
  return state;
}

describe('決定性', () => {
  it('MGW-TC-0030-01 同じ入力の列を 2 回流すと、状態とスコアが毎回まったく同じになる', () => {
    const inputs = makeInputs(3600, 42);
    const run = () => {
      let state = newGame(3000);
      for (let i = 0; i < inputs.length; i++) state = applyStep(state, inputs, i);
      return state;
    };
    const a = run();
    const b = run();
    expect(b).toEqual(a);
    expect(b.score).toBe(a.score);
    expect(a.stepCount).toBeGreaterThan(0);
  });

  it('MGW-TC-0030-01 step は引数の状態を変えない', () => {
    const state = newGame(0);
    const before = structuredClone(state);
    step(state, { dir: 1, targetX: 100, launch: true, boost: true });
    expect(state).toEqual(before);
  });

  it('MGW-TC-0030-02 物理は 1/120 秒の固定ステップで進み、1 回の描画で進めるのは最大 12 ステップ', () => {
    expect(STEPS_PER_SECOND).toBe(120);
    expect(STEP_MS).toBeCloseTo(1000 / 120, 12);
    expect(MAX_STEPS_PER_FRAME).toBe(12);

    // 1/120 秒で 1 ステップ、1/60 秒で 2 ステップ
    expect(planSteps(0, 1000 / 120).steps).toBe(1);
    expect(planSteps(0, 1000 / 60).steps).toBe(2);
    // 足りない分は積み上げて、次の描画に回す
    const first = planSteps(0, 5);
    expect(first.steps).toBe(0);
    expect(planSteps(first.acc, 5).steps).toBe(1);
    // 長く止まったあとでも最大 12 ステップ。超えた分は捨てる
    const long = planSteps(0, 1000);
    expect(long.steps).toBe(12);
    expect(long.acc).toBeLessThan(STEP_MS);
    expect(planSteps(long.acc, 0).steps).toBe(0);
    // 時間が戻っても進めない
    expect(planSteps(0, -50)).toEqual({ steps: 0, acc: 0 });

    // 60 Hz で 1 秒描くと、ちょうど 120 ステップ
    expect(runFrames(1000 / 60, 1, []).stepCount).toBe(120);
  });

  it('MGW-TC-0030-03 画面の更新が 60 Hz でも 120 Hz でも、同じ入力の列なら同じ結果になる', () => {
    const inputs = makeInputs(120 * 30, 7);
    const at60 = runFrames(1000 / 60, 30, inputs);
    const at120 = runFrames(1000 / 120, 30, inputs);
    expect(at60.stepCount).toBe(120 * 30 - countPausedSteps(inputs.length));
    expect(at120).toEqual(at60);
  });
});

// 一時停止のあいだは step が進まないので、そのぶん stepCount は少なくなる
function countPausedSteps(total: number): number {
  const marks = [...PAUSE_AT].filter((i) => i < total).sort((a, b) => a - b);
  let paused = 0;
  for (let i = 0; i + 1 < marks.length; i += 2) paused += marks[i + 1]! - marks[i]!;
  return paused;
}
