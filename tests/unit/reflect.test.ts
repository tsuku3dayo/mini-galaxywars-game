import { describe, expect, it } from 'vitest';
import { newGame, step } from '../../src/core/game';
import type { Beam, GameState } from '../../src/core/types';
import { input, NO_INPUT, run } from './helpers';

const falling = (x: number, y: number): Beam => ({ x, y, vy: 90, reflected: false });
/** 光線の下端が、y の先端の 0.5 px 上にある（次のステップで先端に重なる） */
const justAbove = (tipY: number) => tipY - 8 - 0.5;

describe('光線弾き', () => {
  it('MGW-TC-0012-01 ミサイルの先端の中央・横幅 4 px の範囲で、正面の上から光線を受けると、ミスにならずに弾く', () => {
    // 発射前（先端 y 584）。中心から +2 px
    const ready: GameState = { ...newGame(0), meteors: [], beamTimer: 1000, beams: [falling(242, justAbove(584))] };
    const reflected = step(ready, NO_INPUT);
    expect(reflected.status).toBe('ready');
    expect(reflected.lives).toBe(3);
    expect(reflected.beams).toEqual([{ x: 242, y: expect.any(Number), vy: -90, reflected: true }]);
    // 中心から −2 px も弾く
    expect(step({ ...ready, beams: [falling(238, justAbove(584))] }, NO_INPUT).beams[0]!.reflected).toBe(true);

    // 発射後、ミサイルが横に動いていても（やや斜め）弾く。1 ステップで右へ 0.25、上へ 0.375
    const flying: GameState = {
      ...ready,
      status: 'playing',
      missile: { x: 240, y: 400, isLaunched: true, isBoosting: false },
      beams: [falling(242, justAbove(400 - 12))],
    };
    const diagonal = step(flying, input({ dir: 1 }));
    expect(diagonal.status).toBe('playing');
    expect(diagonal.beams[0]!.reflected).toBe(true);
  });

  it('MGW-TC-0012-02 弾いた光線は上へ飛び、画面の上で消える。UFO には当たらない', () => {
    // 下段の UFO（id 5、x 180）の真下から上へ飛ぶ光線
    const state: GameState = {
      ...newGame(0),
      meteors: [],
      beamTimer: 100_000,
      ufos: newGame(0).ufos.map((u) => ({ ...u, x: u.id === 5 ? 180 : u.x })),
      beams: [{ x: 180, y: 200, vy: -90, reflected: true }],
    };
    const later = run(state, 120);
    expect(later.beams[0]!.y).toBeCloseTo(110, 9);
    // UFO の高さを通っても、UFO は壊れない
    expect(later.ufos.every((u) => u.isAlive)).toBe(true);
    expect(later.score).toBe(0);
    // 天井（y 48）を出たら消える
    expect(run(state, 240).beams).toHaveLength(0);
  });

  it('MGW-TC-0012-03 4 px の範囲の外で光線を受けると、ミスになる', () => {
    const ready: GameState = { ...newGame(0), meteors: [], beamTimer: 1000, beams: [falling(243, justAbove(584))] };
    expect(step(ready, NO_INPUT)).toMatchObject({ status: 'respawn', waitReason: 'miss', lives: 2 });
    expect(step({ ...ready, beams: [falling(237, justAbove(584))] }, NO_INPUT).status).toBe('respawn');
    // 中央でも、正面の上から来たのでなければ（前のステップで先端より下にいた）弾かない
    const fromSide: GameState = { ...ready, beams: [falling(240, 584 - 8 + 2)] };
    expect(step(fromSide, NO_INPUT).status).toBe('respawn');
  });
});
