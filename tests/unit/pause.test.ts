import { describe, expect, it } from 'vitest';
import { newGame, step, togglePause } from '../../src/core/game';
import type { GameState } from '../../src/core/types';
import { input, launch, NO_INPUT, run } from './helpers';

describe('一時停止', () => {
  it('MGW-TC-0018-03 再開すると、発射前に止めたときは Ready、上昇中に止めたときは Playing、出撃待ちで止めたときは出撃待ちに戻る', () => {
    const ready = newGame(0, 1);
    const pausedReady = togglePause(ready);
    expect(pausedReady).toMatchObject({ status: 'paused', pausedFrom: 'ready' });
    expect(togglePause(pausedReady)).toMatchObject({ status: 'ready', pausedFrom: null });

    const playing = launch({ ...newGame(0, 1), meteors: [] });
    const pausedPlaying = togglePause(playing);
    expect(pausedPlaying).toMatchObject({ status: 'paused', pausedFrom: 'playing' });
    expect(togglePause(pausedPlaying)).toMatchObject({ status: 'playing', pausedFrom: null });

    // 待ちの間に止めたときは、待ちに戻る
    const respawn: GameState = { ...newGame(0, 1), status: 'respawn', waitReason: 'exit', waitSteps: 60 };
    expect(togglePause(togglePause(respawn))).toMatchObject({ status: 'respawn', waitSteps: 60 });

    // 出撃待ちで止めたときは、出撃待ちに戻る
    const standby: GameState = { ...newGame(0, 1), status: 'standby' };
    const pausedStandby = togglePause(standby);
    expect(pausedStandby).toMatchObject({ status: 'paused', pausedFrom: 'standby' });
    expect(togglePause(pausedStandby)).toMatchObject({ status: 'standby', pausedFrom: null });
    // 止めている間は、タップしても出撃しない
    expect(step(pausedStandby, { ...NO_INPUT, launch: true })).toBe(pausedStandby);

    // 終わったあとは止めない
    for (const status of ['cleared', 'gameOver'] as const) {
      const ended: GameState = { ...newGame(0, 1), status };
      expect(togglePause(ended)).toBe(ended);
    }
  });

  it('MGW-TC-0018-04 一時停止の間は、ゲームの時間（永久パターン防止のタイマーを含む）が進まない', () => {
    const playing = run(launch({ ...newGame(0, 1), meteors: [] }), 10, input({ boost: true }));
    const paused = togglePause({ ...playing, idleSteps: 5000 });
    // どんな入力でも、何ステップ進めても変わらない
    const after = run(paused, 600, input({ dir: 1, boost: true, launch: true }));
    expect(after).toBe(paused);
    expect(after.stepCount).toBe(paused.stepCount);
    expect(after.idleSteps).toBe(5000);
    expect(after.ufos).toEqual(paused.ufos);
    expect(after.missile).toEqual(paused.missile);
    // 再開すると、続きから進む
    const resumed = step(togglePause(after), NO_INPUT);
    expect(resumed.stepCount).toBe(paused.stepCount + 1);
    expect(resumed.idleSteps).toBe(5001);
  });
});
