import { describe, expect, it } from 'vitest';
import { EXIT_RESPAWN, INITIAL_LIVES, MISS_RESPAWN } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import { meteorAt } from '../../src/core/physics';
import type { GameState } from '../../src/core/types';
import { NO_INPUT, run } from './helpers';

/** 発射後のミサイルが、次のステップで隕石に当たる状態（光線は撃たない） */
function aboutToMiss(patch: Partial<GameState> = {}): GameState {
  const meteor = meteorAt(100);
  return {
    ...newGame(0),
    status: 'playing',
    missile: { x: meteor.x, y: meteor.y + 21, isLaunched: true, isBoosting: false },
    meteors: [meteor],
    beams: [],
    beamTimer: 1e9,
    ...patch,
  };
}

describe('残機と待ち', () => {
  it('MGW-TC-0016-01 ゲームは発射台 3 基（画面に出ている 1 基を含む）で始まる', () => {
    expect(INITIAL_LIVES).toBe(3);
    const state = newGame(0);
    expect(state.lives).toBe(3);
    expect(state.status).toBe('ready');
  });

  it('MGW-TC-0016-02 ミスすると残機が 1 減り、2 秒後に次の発射台が出て、発射前（Ready）に戻る', () => {
    const missed = step(aboutToMiss(), NO_INPUT);
    expect(missed.status).toBe('respawn');
    expect(missed.lives).toBe(2);
    // 2 秒（240 ステップ）の 1 ステップ前はまだ待ち
    const almost = run(missed, MISS_RESPAWN - 1);
    expect(almost.status).toBe('respawn');
    const back = step(almost, NO_INPUT);
    expect(back.status).toBe('ready');
    expect(back.lives).toBe(2);
    expect(back.launcherX).toBe(240);
    expect(back.missile).toEqual({ x: 240, y: 596, isLaunched: false, isBoosting: false });
    expect(back.waitReason).toBeNull();
  });

  it('MGW-TC-0016-03 ミスしても、倒した UFO は戻らず、隕石は動き続ける', () => {
    const base = aboutToMiss();
    const state: GameState = { ...base, ufos: base.ufos.map((u) => ({ ...u, isAlive: u.id >= 3 })), killCount: 3 };
    const missed = step(state, NO_INPUT);
    const waiting = run(missed, 100);
    const back = run(missed, MISS_RESPAWN);
    for (const s of [missed, waiting, back]) expect(s.ufos.filter((u) => u.isAlive)).toHaveLength(5);
    expect(back.killCount).toBe(3);
    // 待ちの間も隕石は動く（右へ 1.5 px／ステップ）
    expect(waiting.meteors[0]!.x - missed.meteors[0]!.x).toBeCloseTo(150, 9);
  });

  it('MGW-TC-0016-04 最上部を抜けたときは、1 秒後に発射台が出て Ready に戻る。残機は減らない', () => {
    const top: GameState = { ...aboutToMiss(), meteors: [], missile: { x: 240, y: 37, isLaunched: true, isBoosting: false } };
    const exited = step(top, NO_INPUT);
    expect(exited).toMatchObject({ status: 'respawn', waitReason: 'exit', lives: 3 });
    expect(run(exited, EXIT_RESPAWN - 1).status).toBe('respawn');
    const back = run(exited, EXIT_RESPAWN);
    expect(back.status).toBe('ready');
    expect(back.lives).toBe(3);
  });

  it('MGW-TC-0016-05 残機が 0 になると、ゲームオーバーになる（2 秒待ってから）', () => {
    const missed = step(aboutToMiss({ lives: 1 }), NO_INPUT);
    expect(missed.lives).toBe(0);
    expect(missed.status).toBe('respawn');
    expect(run(missed, MISS_RESPAWN - 1).status).toBe('respawn');
    const over = run(missed, MISS_RESPAWN);
    expect(over.status).toBe('gameOver');
    // ゲームオーバーのあとは進まない（ランキング登録か TITLE かは app が決める。MGW-TC-0016-06）
    expect(step(over, NO_INPUT)).toBe(over);
  });
});
