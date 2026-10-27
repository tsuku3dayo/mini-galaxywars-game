import { describe, expect, it } from 'vitest';
import { BEAM_H, BEAM_W, LAUNCHER_H, LAUNCHER_W, METEOR_SIZE, MISSILE_H, MISSILE_W, UFO_H, UFO_W } from '../../src/core/config';
import { BACKFIRE, BEAM, EXPLOSION, FONT, LAUNCHER, LIFE_ICON, METEOR, MISSILE, UFO, type Sprite } from '../../src/render/sprites';

/** 行の数・どの行の長さも、決めた大きさと同じ */
function expectSize(sprite: Sprite, w: number, h: number) {
  expect([sprite.w, sprite.h]).toEqual([w, h]);
  expect(sprite.rows).toHaveLength(h);
  for (const row of sprite.rows) expect(row).toMatch(new RegExp(`^[#.]{${w}}$`));
}

describe('ドット絵とフォント（MGW-TD-0003 §3・§4）', () => {
  it('MGW-TC-0006-06 発射台は幅 48 × 高さ 16、ミサイルは幅 12 × 高さ 24（絵の大きさ）', () => {
    expectSize(LAUNCHER, LAUNCHER_W, LAUNCHER_H);
    expectSize(MISSILE, MISSILE_W, MISSILE_H);
  });

  it('ほかの絵の大きさが設計どおり', () => {
    expectSize(UFO, UFO_W, UFO_H);
    expectSize(METEOR, METEOR_SIZE, METEOR_SIZE);
    expect(BEAM).toHaveLength(2);
    for (const frame of BEAM) expectSize(frame, BEAM_W, BEAM_H);
    // 2 枚の光線は形が違う（揺れて見える）
    expect(BEAM[0]!.rows).not.toEqual(BEAM[1]!.rows);
    expectSize(BACKFIRE, 8, 12);
    expect(EXPLOSION).toHaveLength(2);
    for (const frame of EXPLOSION) expectSize(frame, 32, 32);
    expectSize(LIFE_ICON, 16, 6);
  });

  it('UFO の絵の形が、部位の四角（MGW-TD-0002 §7.1）とそろう', () => {
    // 絵の行 r は UFO の中心から y = r − 12、列 c は x = c − 16
    const dot = (x: number, y: number) => UFO.rows[y + 12]![x + 16] === '#';
    // 本体（y −12〜4）の真ん中の段は横いっぱい
    expect(dot(-16, -3) && dot(15, -3)).toBe(true);
    // 本体より下では、中央のふくらみ（x −6〜6）と突起（x ±8〜14）の外には点がない
    for (let y = 4; y < 12; y++) {
      for (let x = -16; x < 16; x++) {
        const inBottom = x >= -6 && x < 6 && y < 8;
        const inProng = (x >= -14 && x < -8) || (x >= 8 && x < 14);
        if (dot(x, y)) expect(inBottom || inProng).toBe(true);
      }
    }
  });

  it('フォントは 0-9・A-Z・空白と ! ? : . - / ( ) の 45 文字を、5 × 7 で持つ', () => {
    const expected = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', ' ', '!', '?', ':', '.', '-', '/', '(', ')'];
    expect(Object.keys(FONT).sort()).toEqual(expected.sort());
    for (const rows of Object.values(FONT)) {
      expect(rows).toHaveLength(7);
      for (const row of rows) expect(row).toMatch(/^[#.]{5}$/);
    }
  });
});
