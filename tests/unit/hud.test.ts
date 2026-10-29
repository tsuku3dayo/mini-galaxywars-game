import { describe, expect, it } from 'vitest';
import { newGame } from '../../src/core/game';
import { hudModel, lifeModel, pad5, timeText } from '../../src/render/hud';
import { LIFE_ICON } from '../../src/render/sprites';

describe('HUD', () => {
  it('MGW-TC-0015-02 スコアは 5 桁のゼロ詰め（例：00150）で出る', () => {
    expect(pad5(150)).toBe('00150');
    expect(pad5(0)).toBe('00000');
    expect(pad5(99_999)).toBe('99999');
    expect(hudModel({ ...newGame(0, 1), score: 150 }).score).toBe('SCORE 00150');
  });

  it('MGW-TC-0015-04 HIGH は、ランキングの 1 位のスコアと、今のスコアの大きい方', () => {
    // ランキングの 1 位 3,000 は、ゲームを始めたときの highScore
    expect(hudModel({ ...newGame(3000, 1), score: 150 }).high).toBe('HIGH 03000');
    expect(hudModel({ ...newGame(3000, 1), score: 3050 }).high).toBe('HIGH 03050');
    expect(hudModel({ ...newGame(0, 1), score: 0 }).high).toBe('HIGH 00000');
  });

  it('MGW-TC-0015-05 残機は、数（画面に出ている 1 基を含む）と、控えの発射台のアイコン（数 − 1 個）で出る', () => {
    // 初めは 3（画面に出ている 1 基を含む）で、控えのアイコンは 2 つ
    expect(lifeModel(newGame(0, 1).lives)).toEqual({ count: '3', icons: 2 });
    expect(lifeModel(4)).toEqual({ count: '4', icons: 3 });
    expect(lifeModel(1)).toEqual({ count: '1', icons: 0 });
    expect(lifeModel(0)).toEqual({ count: '0', icons: 0 });
    // アイコンはミサイルではなく発射台の形（横長の台）
    expect([LIFE_ICON.w, LIFE_ICON.h]).toEqual([16, 6]);
    // HUD の文字には残機を出さない
    expect(Object.keys(hudModel(newGame(0, 1))).sort()).toEqual(['high', 'score']);
  });

  it('MGW-TC-0015-07 左下の残機の行の右に、経過時間が TIME 095（経過秒を切り捨てて 3 桁）で出る。SCORE は UFO の得点だけ', () => {
    expect(timeText(0)).toBe('TIME 000');
    expect(timeText(119)).toBe('TIME 000');
    expect(timeText(95 * 120 + 84)).toBe('TIME 095');
    expect(timeText(180 * 120)).toBe('TIME 180');
    // 999 で止める
    expect(timeText(2000 * 120)).toBe('TIME 999');
    // クリアで時間ボーナスを足しても、SCORE は UFO の得点だけ。HIGH は合計で比べる
    const cleared = { ...newGame(0, 1), status: 'cleared' as const, score: 1575, timeBonus: 425 };
    expect(hudModel(cleared).score).toBe('SCORE 01150');
    expect(hudModel(cleared).high).toBe('HIGH 01575');
  });
});