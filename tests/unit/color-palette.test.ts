import { describe, expect, it } from 'vitest';
import { FIELD_HEIGHT, FIELD_WIDTH, STEPS_PER_SECOND } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import { meteorAt } from '../../src/core/physics';
import type { GameState } from '../../src/core/types';
import { CELLOPHANE_BANDS, FLASH_COLOR, overlaysFor } from '../../src/render/color-palette';
import { NO_INPUT } from './helpers';

const FULL = { x: 0, y: 0, w: FIELD_WIDTH, h: FIELD_HEIGHT };

describe('擬似カラーと被弾フラッシュ', () => {
  it('セロハンの帯：上（0–120）が紫・赤系、下（580–640）が緑系。中央は重ねない。ピクセルパーフェクトでは重ねない', () => {
    expect(CELLOPHANE_BANDS).toEqual([
      { y0: 0, y1: 120, color: '#FF50D0' },
      { y0: 580, y1: 640, color: '#50FF70' },
    ]);
    const bands = overlaysFor('cellophane', 0);
    expect(bands).toEqual([
      { x: 0, y: 0, w: FIELD_WIDTH, h: 120, color: '#FF50D0', op: 'multiply' },
      { x: 0, y: 580, w: FIELD_WIDTH, h: 60, color: '#50FF70', op: 'multiply' },
    ]);
    // 中央（隕石域）はどの帯にも入らない
    for (const b of bands) expect(b.y + b.h <= 120 || b.y >= 580).toBe(true);
    expect(overlaysFor('pixel', 0)).toEqual([]);
  });

  it('MGW-TC-0028-02 ミスすると、画面全体が #FF0000（赤）で 100 ms フラッシュする', () => {
    // 隕石に当ててミスにする
    const meteor = meteorAt(100);
    let state: GameState = {
      ...newGame(0),
      status: 'playing',
      missile: { x: meteor.x, y: meteor.y + 21, isLaunched: true, isBoosting: false },
      meteors: [meteor],
      beams: [],
      beamTimer: 1000,
    };
    expect(overlaysFor('cellophane', state.flashSteps).some((o) => o.color === FLASH_COLOR)).toBe(false);
    state = step(state, NO_INPUT);
    expect(state.waitReason).toBe('miss');

    // 赤は全体に、セロハンの帯のあとに重ねる（どちらの方式でも）
    const flash = { ...FULL, color: '#FF0000', op: 'source-over' };
    expect(overlaysFor('cellophane', state.flashSteps).at(-1)).toEqual(flash);
    expect(overlaysFor('pixel', state.flashSteps)).toEqual([flash]);

    // 出ている間を数える：120 ステップ/秒で 12 ステップ = 100 ms
    let shown = 0;
    while (overlaysFor('pixel', state.flashSteps).length > 0) {
      shown++;
      state = step(state, NO_INPUT);
    }
    expect(shown).toBe(12);
    expect((shown / STEPS_PER_SECOND) * 1000).toBe(100);
  });
});
