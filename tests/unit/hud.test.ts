import { describe, expect, it } from 'vitest';
import { newGame } from '../../src/core/game';
import { hudModel, lifeModel, pad5 } from '../../src/render/hud';
import { LIFE_ICON } from '../../src/render/sprites';

describe('HUD', () => {
  it('MGW-TC-0015-02 スコアは 5 桁のゼロ詰め（例：00150）で出る', () => {
    expect(pad5(150)).toBe('00150');
    expect(pad5(0)).toBe('00000');
    expect(pad5(99_999)).toBe('99999');
    expect(hudModel({ ...newGame(0), score: 150 }).score).toBe('SCORE 00150');
  });

  it('MGW-TC-0015-04 HIGH は、ランキングの 1 位のスコアと、今のスコアの大きい方', () => {
    // ランキングの 1 位 3,000 は、ゲームを始めたときの highScore
    expect(hudModel({ ...newGame(3000), score: 150 }).high).toBe('HIGH 03000');
    expect(hudModel({ ...newGame(3000), score: 3050 }).high).toBe('HIGH 03050');
    expect(hudModel({ ...newGame(0), score: 0 }).high).toBe('HIGH 00000');
  });

  it('MGW-TC-0015-05 残機は、数（画面に出ている 1 基を含む）と、控えの発射台のアイコン（数 − 1 個）で出る', () => {
    // 初めは 3（画面に出ている 1 基を含む）で、控えのアイコンは 2 つ
    expect(lifeModel(newGame(0).lives)).toEqual({ count: '3', icons: 2 });
    expect(lifeModel(4)).toEqual({ count: '4', icons: 3 });
    expect(lifeModel(1)).toEqual({ count: '1', icons: 0 });
    expect(lifeModel(0)).toEqual({ count: '0', icons: 0 });
    // アイコンはミサイルではなく発射台の形（横長の台）
    expect([LIFE_ICON.w, LIFE_ICON.h]).toEqual([16, 6]);
    // HUD の文字には残機を出さない
    expect(Object.keys(hudModel(newGame(0))).sort()).toEqual(['high', 'score']);
  });
});
