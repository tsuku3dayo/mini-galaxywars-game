import { describe, expect, it } from 'vitest';
import { METEOR_COUNT, METEOR_LANE_COUNT, MISSILE_H, MISSILE_READY_Y, MISSILE_W } from '../../src/core/config';
import { newGame } from '../../src/core/game';
import { meteorAt, meteorBox, moveMeteor, overlaps } from '../../src/core/physics';

describe('隕石', () => {
  it('MGW-TC-0010-01 隕石は 5 個', () => {
    expect(METEOR_COUNT).toBe(5);
    const meteors = newGame(0).meteors;
    expect(meteors).toHaveLength(5);
    // 道のりの上に等しい間をあけて並ぶ
    meteors.forEach((m, k) => expect(m.pos).toBeCloseTo((k * 5016) / 5, 9));
  });

  it('MGW-TC-0010-02 隕石は画面の端で向きを変えて 1 段下がり、最下段のあとは最上段から出てくる', () => {
    // 段 0 の右端の手前 → 段 1 の右端から左へ
    const turned = moveMeteor(meteorAt(456 - 0.1));
    expect(turned).toMatchObject({ lane: 1, direction: -1, y: 176 });
    expect(turned.x).toBeGreaterThan(467);
    // 段 1 の左端 → 段 2 を右へ
    expect(moveMeteor(meteorAt(456 * 2 - 0.1))).toMatchObject({ lane: 2, direction: 1, y: 216 });
    // 最下段（段 10、右へ進む）の右端の次は、最上段（段 0）の左端
    const last = meteorAt(456 * 11 - 0.1);
    expect(last).toMatchObject({ lane: 10, direction: 1, y: 536 });
    const wrapped = moveMeteor(last);
    expect(wrapped).toMatchObject({ lane: 0, direction: 1, y: 136 });
    expect(wrapped.x).toBeLessThan(13);
  });

  it('MGW-TC-0010-03 右へは 45 px/秒、左へは 30 px/秒で動く', () => {
    const right = meteorAt(100);
    expect(moveMeteor(right).x - right.x).toBeCloseTo(0.375, 9);
    const left = meteorAt(456 + 100);
    expect(moveMeteor(left).x - left.x).toBeCloseTo(-0.25, 9);
    // 1 秒でそれぞれ 45・30
    let r = right;
    let l = left;
    for (let i = 0; i < 120; i++) {
      r = moveMeteor(r);
      l = moveMeteor(l);
    }
    expect(r.x - right.x).toBeCloseTo(45, 9);
    expect(l.x - left.x).toBeCloseTo(-30, 9);
  });

  it('MGW-TC-0010-04 隕石は 11 段で、最下段（y = 536）は発射前のミサイルの先端（y = 584）より上を通る', () => {
    expect(METEOR_LANE_COUNT).toBe(11);
    const bottom = meteorAt(456 * 10 + 228);
    expect(bottom).toMatchObject({ lane: 10, y: 536 });
    const box = meteorBox(bottom);
    // 当たりの下端（546）は、発射前のミサイルの先端（584）より上
    expect(box.y + box.h / 2).toBeLessThan(MISSILE_READY_Y - MISSILE_H / 2);
    // 真下に発射前のミサイルがあっても重ならない
    expect(overlaps(box, { x: bottom.x, y: MISSILE_READY_Y, w: MISSILE_W, h: MISSILE_H })).toBe(false);
    // 道のりのどこにいても、いちばん下は y = 536
    for (let pos = 0; pos < 456 * 11; pos += 7) expect(meteorAt(pos).y).toBeLessThanOrEqual(536);
  });
});
