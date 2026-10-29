import { describe, expect, it } from 'vitest';
import { UFO_H } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import type { GameState } from '../../src/core/types';
import { NO_INPUT } from './helpers';

// x の変化（画面の端で回るので、-240〜240 に直す）
const dx = (before: number, after: number) => ((after - before + 240 + 480) % 480) - 240;

describe('UFO', () => {
  it('MGW-TC-0008-01 上段の 4 機（y 64–88）は右へ、下段の 4 機（y 96–120）は左へ動く', () => {
    const before = newGame(0, 1);
    const after = step(before, NO_INPUT);
    const top = before.ufos.filter((u) => u.row === 0);
    const bottom = before.ufos.filter((u) => u.row === 1);
    expect(top).toHaveLength(4);
    expect(bottom).toHaveLength(4);
    for (const u of top) {
      expect([u.y - UFO_H / 2, u.y + UFO_H / 2]).toEqual([64, 88]);
      expect(dx(u.x, after.ufos[u.id]!.x)).toBeGreaterThan(0);
    }
    for (const u of bottom) {
      expect([u.y - UFO_H / 2, u.y + UFO_H / 2]).toEqual([96, 120]);
      expect(dx(u.x, after.ufos[u.id]!.x)).toBeLessThan(0);
    }
    // 画面の端を出たら反対の端から出る
    const edge: GameState = { ...before, ufos: before.ufos.map((u) => (u.id === 3 ? { ...u, x: 479.9 } : u)) };
    expect(step(edge, NO_INPUT).ufos[3]!.x).toBeLessThan(1);
  });

  it('MGW-TC-0008-02 速さは残りの機数で変わる：8 機 20 … 1 機 80 px/秒', () => {
    const table: [number, number][] = [
      [8, 20],
      [7, 25],
      [6, 30],
      [5, 35],
      [4, 40],
      [3, 45],
      [2, 60],
      [1, 80],
    ];
    for (const [alive, speed] of table) {
      const base = newGame(0, 1);
      // id の大きいものから倒して、上段の id 0 は残す
      const state: GameState = { ...base, ufos: base.ufos.map((u) => ({ ...u, isAlive: u.id < alive })) };
      const next = step(state, NO_INPUT);
      expect(dx(state.ufos[0]!.x, next.ufos[0]!.x)).toBeCloseTo(speed / 120, 9);
    }
  });
});
