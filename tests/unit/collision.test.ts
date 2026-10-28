import { describe, expect, it } from 'vitest';
import { EXPLOSION_STEPS, FLASH_STEPS, MISS_RESPAWN } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import { meteorAt, missileBox } from '../../src/core/physics';
import { hitPart } from '../../src/core/scoring';
import type { Beam, GameState } from '../../src/core/types';
import { NO_INPUT } from './helpers';

/** 発射後のミサイルを (x, y) に置いた状態。ほかの物は引数で決める */
function playing(x: number, y: number, rest: Partial<GameState> = {}): GameState {
  return {
    ...newGame(0),
    status: 'playing',
    missile: { x, y, isLaunched: true, isBoosting: false },
    meteors: [],
    beams: [],
    beamTimer: 1000,
    ...rest,
  };
}
const falling = (x: number, y: number): Beam => ({ x, y, vy: 180, reflected: false });

describe('当たり判定', () => {
  it('MGW-TC-0011-01 ミサイルが隕石に触れるとミスになり、爆発を描く', () => {
    const meteor = meteorAt(100); // 段 0（y 136）、x 112
    const state = playing(meteor.x, meteor.y + 21, { meteors: [meteor] });
    const next = step(state, NO_INPUT);
    expect(next.status).toBe('respawn');
    expect(next.waitReason).toBe('miss');
    expect(next.lives).toBe(2);
    expect(next.flashSteps).toBe(FLASH_STEPS);
    expect(next.explosion).toEqual({ x: next.missile.x, y: next.missile.y, steps: EXPLOSION_STEPS });
    // 待ちは次のステップから数える
    expect(next.waitSteps).toBe(MISS_RESPAWN);
    // 触れていなければミスにならない
    expect(step(playing(meteor.x + 40, meteor.y + 21, { meteors: [meteor] }), NO_INPUT).status).toBe('playing');
  });

  it('MGW-TC-0011-04 ミサイルが UFO に当たると、UFO が壊れ、得点が入り、ミサイルは消える', () => {
    const ufo = newGame(0).ufos[5]!; // 下段、x 180、y 108
    // 先端が下部中央の下端に接している。1 ステップ上がると、先端が下部中央に入る
    const next = step(playing(ufo.x, ufo.y + 20), NO_INPUT);
    expect(next.ufos[5]!.isAlive).toBe(false);
    expect(next.score).toBe(100);
    expect(next.killCount).toBe(1);
    expect(next.lastKill).toEqual({ part: 'bottom', points: 100 });
    // ミスではない。ミサイルは消え、1 秒後に発射台が出るのを待つ（残機は減らない）
    expect(next.status).toBe('respawn');
    expect(next.waitReason).toBe('kill');
    expect(next.missile.isLaunched).toBe(false);
    expect(next.lives).toBe(3);

    // 1 回の発射で倒せるのは 1 機：上段の UFO（id 1）を下段の UFO と同じ場所に重ねても（次のステップで両方に当たる位置）、倒れるのは先に調べる下段の 1 機だけ
    const upper = newGame(0).ufos[1]!;
    const both = playing(ufo.x, ufo.y + 20, { ufos: newGame(0).ufos.map((u) => (u.id === upper.id ? { ...u, x: ufo.x, y: ufo.y } : u)) });
    expect(hitPart(missileBox({ ...both.missile, y: both.missile.y - 0.375 }), { ...both.ufos[upper.id]!, x: ufo.x + 20 / 120 })).not.toBeNull();
    const one = step(both, NO_INPUT);
    expect(one.killCount).toBe(1);
    expect(one.ufos[5]!.isAlive).toBe(false);
    expect(one.ufos[upper.id]!.isAlive).toBe(true);
  });

  it('MGW-TC-0011-05 ミサイルが光線に当たると、弾く範囲の外ならミスになる', () => {
    // ミサイルの中心から右へ 5 px ずれた光線が、先端に上から当たる
    const state = playing(240, 400, { beams: [falling(245, 400 - 12 - 8 - 0.5)] });
    const next = step(state, NO_INPUT);
    expect(next.status).toBe('respawn');
    expect(next.waitReason).toBe('miss');
    expect(next.lives).toBe(2);
    // 当たった光線は消える
    expect(next.beams).toHaveLength(0);
    // 発射前の発射台（上端 600、x 216〜264）に当たってもミス。ミサイル（x 234〜246）には当たらない位置
    const ready: GameState = { ...newGame(0), meteors: [], beamTimer: 1000, beams: [falling(225, 600 - 8 - 0.5)] };
    expect(step(ready, NO_INPUT)).toMatchObject({ status: 'respawn', waitReason: 'miss', lives: 2 });
  });

  it('MGW-TC-0011-06 同じステップで複数に当たったときは、隕石 → UFO → 光線の順に判定する', () => {
    // x 300 に、下段の UFO（id 6）・段 0 の隕石・ミサイルが重なる
    const meteor = meteorAt(288);
    expect(meteor.x).toBe(300);
    const both = playing(300, 123.5, { meteors: [meteor] });
    const missByMeteor = step(both, NO_INPUT);
    // 隕石でミスが決まり、UFO は壊れない
    expect(missByMeteor.status).toBe('respawn');
    expect(missByMeteor.ufos[6]!.isAlive).toBe(true);
    expect(missByMeteor.score).toBe(0);

    // UFO と光線：UFO の得点が入ってから、光線でミスになる
    const ufoAndBeam = playing(300, 123.5, { beams: [falling(305, 123.5 - 12 - 8 - 0.5)] });
    const missAfterKill = step(ufoAndBeam, NO_INPUT);
    expect(missAfterKill.ufos[6]!.isAlive).toBe(false);
    expect(missAfterKill.score).toBeGreaterThan(0);
    expect(missAfterKill.status).toBe('respawn');

    // 8 機目でクリアが決まったら、光線は調べない
    const lastOne: GameState = {
      ...ufoAndBeam,
      ufos: ufoAndBeam.ufos.map((u) => ({ ...u, isAlive: u.id === 6 })),
      killCount: 7,
    };
    const cleared = step(lastOne, NO_INPUT);
    expect(cleared.status).toBe('cleared');
    expect(cleared.lives).toBe(3);
    expect(cleared.beams).toHaveLength(1);
  });
});
