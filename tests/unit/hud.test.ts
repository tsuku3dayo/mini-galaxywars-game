import { describe, expect, it } from 'vitest';
import { newGame } from '../../src/core/game';
import { hudModel, pad5 } from '../../src/render/hud';

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

  it('残機のアイコンは、画面に出ている 1 基を含む残機の数だけ並べる', () => {
    expect(hudModel(newGame(0)).lifeIcons).toBe(3);
    expect(hudModel({ ...newGame(0), lives: 4 }).lifeIcons).toBe(4);
    expect(hudModel({ ...newGame(0), lives: 0 }).lifeIcons).toBe(0);
  });
});
