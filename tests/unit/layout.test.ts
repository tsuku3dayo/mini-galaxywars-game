import { describe, expect, it } from 'vitest';
import { CEILING_Y, FIELD_HEIGHT, LAUNCHER_Y, MISSILE_READY_Y, REGIONS, UFO_ROW_Y } from '../../src/core/config';
import { newGame } from '../../src/core/game';

describe('フィールドの領域', () => {
  it('MGW-TC-0005-02 領域が HUD 帯 0–48、UFO 通過領域 48–120、隕石往復領域 120–580、発射台待機領域 580–616 になっている', () => {
    expect(REGIONS.hud).toEqual([0, 48]);
    expect(REGIONS.ufo).toEqual([48, 120]);
    expect(REGIONS.meteor).toEqual([120, 580]);
    expect(REGIONS.launcher).toEqual([580, 616]);
    // 地面と残機は発射台の下（仕様書 v1.6）
    expect(REGIONS.ground).toEqual([616, 618]);
    expect(REGIONS.lives).toEqual([620, 636]);
    // 隙間なく上から並び、天井は HUD 帯の下端
    expect(REGIONS.hud[1]).toBe(REGIONS.ufo[0]);
    expect(REGIONS.ufo[1]).toBe(REGIONS.meteor[0]);
    expect(REGIONS.meteor[1]).toBe(REGIONS.launcher[0]);
    expect(REGIONS.launcher[1]).toBe(REGIONS.ground[0]);
    expect(REGIONS.lives[1]).toBeLessThanOrEqual(FIELD_HEIGHT);
    expect(CEILING_Y).toBe(REGIONS.hud[1]);

    // 初めの状態の物が、それぞれの領域にある（中心で見る）
    const inside = (y: number, [top, bottom]: readonly [number, number]) => y > top && y < bottom;
    const state = newGame(0, 1);
    for (const y of UFO_ROW_Y) expect(inside(y, REGIONS.ufo)).toBe(true);
    for (const ufo of state.ufos) expect(inside(ufo.y, REGIONS.ufo)).toBe(true);
    for (const meteor of state.meteors) expect(inside(meteor.y, REGIONS.meteor)).toBe(true);
    expect(inside(LAUNCHER_Y, REGIONS.launcher)).toBe(true);
    expect(inside(MISSILE_READY_Y, REGIONS.launcher)).toBe(true);
  });
});
