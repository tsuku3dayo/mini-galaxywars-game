import { describe, expect, it } from 'vitest';
import { newGame, step } from '../../src/core/game';
import { addScore } from '../../src/core/scoring';
import { planSounds } from '../../src/core/sound-plan';
import type { GameState } from '../../src/core/types';
import { NO_INPUT } from './helpers';

/** 次のステップで下段の UFO（id 5）の下部中央（100 点）に当たる状態 */
function aboutToScore100(patch: Partial<GameState>): GameState {
  const base = newGame(0);
  const ufo = base.ufos[5]!;
  return {
    ...base,
    status: 'playing',
    missile: { x: ufo.x, y: ufo.y + 20, isLaunched: true, isBoosting: false },
    meteors: [],
    beams: [],
    beamTimer: 1e9,
    ...patch,
  };
}

describe('増機', () => {
  it('MGW-TC-0019-01 スコアが 1,000 点に届くと、残機が 1 基増える', () => {
    const next = step(aboutToScore100({ score: 950 }), NO_INPUT);
    expect(next.lastKill?.points).toBe(100);
    expect(next.score).toBe(1050);
    expect(next.lives).toBe(4);
    expect(next.extended).toBe(true);
    // ちょうど 1,000 でも増える。届かなければ増えない
    expect(addScore({ ...newGame(0), score: 900 }, 100)).toEqual({ score: 1000, lives: 4, extended: true });
    expect(addScore({ ...newGame(0), score: 850 }, 100)).toEqual({ score: 950, lives: 3, extended: false });
  });

  it('MGW-TC-0019-04 増えたときに増機音が鳴る', () => {
    const prev = aboutToScore100({ score: 950 });
    const next = step(prev, NO_INPUT);
    expect(next.lives).toBe(4);
    expect(planSounds(prev, next)).toContain('extend');
    // 増えないときは鳴らない
    const quiet = aboutToScore100({ score: 100 });
    expect(planSounds(quiet, step(quiet, NO_INPUT))).not.toContain('extend');
  });

  it('MGW-TC-0019-03 増機は 1 回だけ', () => {
    const once = step(aboutToScore100({ score: 950 }), NO_INPUT);
    expect(once.lives).toBe(4);
    // 増機のあと、さらに点を取っても増えない
    const again = step(aboutToScore100({ score: 5950, lives: 4, extended: true }), NO_INPUT);
    expect(again.score).toBe(6050);
    expect(again.lives).toBe(4);
    // スコアは 99,999 で止まる
    expect(addScore({ ...newGame(0), score: 99_950, extended: true }, 100).score).toBe(99_999);
  });
});
