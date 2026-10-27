import { describe, expect, it } from 'vitest';
import { newGame, step } from '../../src/core/game';
import type { GameState } from '../../src/core/types';
import { NO_INPUT } from './helpers';

describe('クリア', () => {
  it('MGW-TC-0017-01 UFO を 8 機すべて倒すと、クリアの表示が出てゲームが終わる', () => {
    const base = newGame(0);
    const last = base.ufos[5]!; // 下段、x 180
    const state: GameState = {
      ...base,
      status: 'playing',
      ufos: base.ufos.map((u) => ({ ...u, isAlive: u.id === 5 })),
      killCount: 7,
      missile: { x: last.x, y: last.y + 21, isLaunched: true, isBoosting: true },
      meteors: [],
      beams: [],
      beamTimer: 1e9,
    };
    // 前提：7 機は倒れていて、次のステップで 8 機目に当たる
    expect(state.ufos.filter((u) => u.isAlive)).toHaveLength(1);
    const cleared = step(state, { ...NO_INPUT, boost: true });
    expect(cleared.status).toBe('cleared');
    expect(cleared.killCount).toBe(8);
    expect(cleared.ufos.every((u) => !u.isAlive)).toBe(true);
    expect(cleared.missile.isBoosting).toBe(false);
    // ゲームは終わり、もう進まない
    expect(step(cleared, NO_INPUT)).toBe(cleared);
  });
});
