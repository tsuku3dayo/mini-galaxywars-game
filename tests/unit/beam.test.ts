import { describe, expect, it } from 'vitest';
import { BEAM_INTERVAL } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import { meteorAt, pickShooter } from '../../src/core/physics';
import type { Beam, GameState } from '../../src/core/types';
import { NO_INPUT, run } from './helpers';

// 隕石が盾にならないよう、隕石を消した状態
const noMeteors = (): GameState => ({ ...newGame(0), meteors: [] });
const falling = (x: number, y: number): Beam => ({ x, y, vy: 90, reflected: false });

describe('光線', () => {
  it('MGW-TC-0009-01 0.75 秒ごとに、ミサイル（発射前は発射台）との横の距離がいちばん近い UFO が、真下へ光線を 1 発撃つ', () => {
    expect(BEAM_INTERVAL).toBe(90);
    const before = run(noMeteors(), 89);
    expect(before.beams).toHaveLength(0);
    const fired = step(before, NO_INPUT);
    expect(fired.beams).toHaveLength(1);
    // 撃ったのは、発射台（x = 240）との横の距離がいちばん近い UFO。その真下（UFO の下端の下）から落ちる
    const beam = fired.beams[0]!;
    const shooter = fired.ufos.find((u) => u.x === beam.x && u.y + 12 + 8 === beam.y)!;
    expect(shooter).toBeDefined();
    const nearest = Math.min(...fired.ufos.map((u) => Math.abs(u.x - 240)));
    expect(Math.abs(shooter.x - 240)).toBe(nearest);
    expect(beam).toMatchObject({ vy: 90, reflected: false });
    // 次の光線も 0.75 秒あと
    expect(run(fired, 89).beams).toHaveLength(1);
    expect(run(fired, 90).beams).toHaveLength(2);

    // 発射前は発射台、発射後はミサイルの x に近い UFO
    const ufos = newGame(0).ufos;
    // 同じ距離なら下段（初めは上段と下段が同じ x に並ぶ）
    expect(pickShooter(ufos, 60)!.id).toBe(4);
    expect(pickShooter(ufos, 70)!.id).toBe(4);
    expect(pickShooter(ufos, 410)!.id).toBe(7);
    expect(pickShooter(ufos.map((u) => (u.row === 1 ? { ...u, isAlive: false } : u)), 410)!.id).toBe(3);
    // 同じ距離・同じ段なら id の小さい方
    expect(pickShooter(ufos.filter((u) => u.row === 0), 120)!.id).toBe(0);
  });

  it('MGW-TC-0009-02 画面内の光線は、UFO が 5 機以上なら 3 発まで、4 機以下なら 4 発まで。上限のときは撃たない', () => {
    const three = [falling(20, 300), falling(40, 300), falling(60, 300)];
    const full: GameState = { ...noMeteors(), beams: three, beamTimer: 1 };
    expect(step(full, NO_INPUT).beams).toHaveLength(3);
    // 弾いた光線は数えない
    const withReflected: GameState = { ...full, beams: [...three.slice(0, 2), { x: 60, y: 300, vy: -90, reflected: true }] };
    expect(step(withReflected, NO_INPUT).beams).toHaveLength(4);
    // 4 機以下なら 4 発まで
    const four: GameState = { ...full, ufos: full.ufos.map((u) => ({ ...u, isAlive: u.id < 4 })) };
    expect(step(four, NO_INPUT).beams).toHaveLength(4);
    const fourFull: GameState = { ...four, beams: [...three, falling(80, 300)] };
    expect(step(fourFull, NO_INPUT).beams).toHaveLength(4);
  });

  it('MGW-TC-0009-03 光線は 90 px/秒で落ちる', () => {
    const state: GameState = { ...noMeteors(), beams: [falling(20, 200)], beamTimer: 1000 };
    expect(step(state, NO_INPUT).beams[0]!.y).toBeCloseTo(200.75, 9);
    expect(run(state, 120).beams[0]!.y).toBeCloseTo(290, 9);
    // 画面の下を出たら消える
    expect(run({ ...state, beams: [falling(20, 639.5)] }, 1).beams).toHaveLength(0);
  });

  it('MGW-TC-0009-04 光線は隕石に当たると消える（隕石が盾になる）', () => {
    // 段 0（y 136）の左端の隕石の真上に光線を置く
    const meteor = meteorAt(0);
    const state: GameState = { ...newGame(0), meteors: [meteor], beams: [falling(meteor.x, meteor.y - 18.5)], beamTimer: 1000 };
    // 1 ステップで隕石は右へ 0.375、光線は下へ 0.75 進んで重なる（縦の中心どうしの間が 18.5 → 17.75。18 より近いと重なる）
    expect(step(state, NO_INPUT).beams).toHaveLength(0);
    // 横にずれていれば消えない
    const apart: GameState = { ...state, beams: [falling(meteor.x + 40, meteor.y - 18.5)] };
    expect(step(apart, NO_INPUT).beams).toHaveLength(1);
  });
});
