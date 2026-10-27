import { describe, expect, it } from 'vitest';
import { METEOR_COUNT, MISSILE_H, MISSILE_READY_Y, MISSILE_W } from '../../src/core/config';
import { newGame } from '../../src/core/game';
import { meteorAt, meteorBox, moveMeteor, overlaps } from '../../src/core/physics';

describe('隕石', () => {
  it('MGW-TC-0010-01 隕石は 5 個', () => {
    expect(METEOR_COUNT).toBe(5);
    const meteors = newGame(0).meteors;
    expect(meteors).toHaveLength(5);
    // 道のりの上に等しい間をあけて並ぶ
    meteors.forEach((m, k) => expect(m.pos).toBeCloseTo((k * 5472) / 5, 9));
  });

  it('MGW-TC-0010-02 隕石は画面の端で向きを変えて 1 段下がり、最下段のあとは最上段から出てくる', () => {
    // 段 0 の右端の手前 → 段 1 の右端から左へ
    const turned = moveMeteor(meteorAt(455));
    expect(turned).toMatchObject({ lane: 1, direction: -1, y: 176 });
    expect(turned.x).toBeGreaterThan(467);
    // 段 1 の左端 → 段 2 を右へ
    expect(moveMeteor(meteorAt(456 * 2 - 0.5))).toMatchObject({ lane: 2, direction: 1, y: 216 });
    // 最下段（段 11）の左端の次は、最上段（段 0）の左端
    const last = meteorAt(456 * 12 - 0.5);
    expect(last).toMatchObject({ lane: 11, direction: -1, y: 576 });
    const wrapped = moveMeteor(last);
    expect(wrapped).toMatchObject({ lane: 0, direction: 1, y: 136 });
    expect(wrapped.x).toBeLessThan(13);
  });

  it('MGW-TC-0010-03 右へは 180 px/秒、左へは 120 px/秒で動く', () => {
    const right = meteorAt(100);
    expect(moveMeteor(right).x - right.x).toBeCloseTo(1.5, 9);
    const left = meteorAt(456 + 100);
    expect(moveMeteor(left).x - left.x).toBeCloseTo(-1, 9);
    // 1 秒でそれぞれ 180・120
    let r = right;
    let l = left;
    for (let i = 0; i < 120; i++) {
      r = moveMeteor(r);
      l = moveMeteor(l);
    }
    expect(r.x - right.x).toBeCloseTo(180, 9);
    expect(l.x - left.x).toBeCloseTo(-120, 9);
  });

  it('MGW-TC-0010-04 最下段の隕石は、発射前のミサイルの先端（y = 584）の高さを通る', () => {
    const bottom = meteorAt(456 * 11 + 228);
    expect(bottom.y).toBe(576);
    const box = meteorBox(bottom);
    expect(box.y + box.h / 2).toBeGreaterThan(MISSILE_READY_Y - MISSILE_H / 2);
    // 真下に発射前のミサイルがあれば重なる
    expect(overlaps(box, { x: bottom.x, y: MISSILE_READY_Y, w: MISSILE_W, h: MISSILE_H })).toBe(true);
  });
});
