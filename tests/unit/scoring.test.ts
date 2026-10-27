import { describe, expect, it } from 'vitest';
import { newGame, step } from '../../src/core/game';
import { hitPart, killPoints } from '../../src/core/scoring';
import type { GameState, UFO } from '../../src/core/types';
import { NO_INPUT } from './helpers';

const ufo: UFO = { id: 0, x: 200, y: 100, row: 0, isAlive: true };
/** UFO の中心から (dx, dy) にあるミサイルの四角 */
const missileAt = (dx: number, dy: number) => ({ x: ufo.x + dx, y: ufo.y + dy, w: 12, h: 24 });

/** 下段の UFO（id 4）の突起に、次のステップで当たる状態。killCount を決められる */
function aboutToHitProng(killCount: number): GameState {
  const base = newGame(0);
  const target = base.ufos[4]!; // 下段、x 60、y 108
  return {
    ...base,
    status: 'playing',
    killCount,
    ufos: base.ufos.map((u) => (u.id < 4 && u.id >= 4 - killCount ? { ...u, isAlive: false } : u)),
    // 右の突起（x +8〜14、y +4〜12）の下。1 ステップで UFO は左へ 0.67、ミサイルは上へ 1.5
    missile: { x: target.x + 11, y: target.y + 12 + 12 + 1, isLaunched: true, isBoosting: false },
    meteors: [],
    beams: [],
    beamTimer: 1000,
  };
}

describe('得点', () => {
  it('MGW-TC-0013-01 側面・上部は 50 点、下部中央は 100 点、下部の突起（2 か所）は 150 点', () => {
    expect(hitPart(missileAt(0, -20), ufo)).toEqual({ part: 'body', points: 50 });
    // 側面（突起・下部中央には届かない高さ）
    expect(hitPart(missileAt(18, -10), ufo)).toEqual({ part: 'body', points: 50 });
    expect(hitPart(missileAt(0, 18), ufo)).toEqual({ part: 'bottom', points: 100 });
    expect(hitPart(missileAt(-11, 20), ufo)).toEqual({ part: 'prong', points: 150 });
    expect(hitPart(missileAt(11, 20), ufo)).toEqual({ part: 'prong', points: 150 });
    // 重なった部位のうち、得点の高い方
    expect(hitPart(missileAt(0, 10), ufo)).toEqual({ part: 'bottom', points: 100 });
    expect(hitPart(missileAt(6, 18), ufo)).toEqual({ part: 'prong', points: 150 });
    // 辺が接しただけは当たりにしない
    expect(hitPart(missileAt(0, 24), ufo)).toBeNull();
    expect(hitPart(missileAt(22, 0), ufo)).toBeNull();
    // 画面の端で回り込んだ UFO にも当たる
    expect(hitPart({ x: 2, y: 80, w: 12, h: 24 }, { ...ufo, x: 478 })).toEqual({ part: 'body', points: 50 });

    // 動かしたときも、突起に当てると 150 点（1 機目）
    const first = step(aboutToHitProng(0), NO_INPUT);
    expect(first.ufos[4]!.isAlive).toBe(false);
    expect(first.score).toBe(150);
  });

  it('MGW-TC-0013-02 3 機を倒したあと、4 機目の突起に当てると 600 点', () => {
    expect(killPoints('prong', 150, 3)).toBe(600);
    const fourth = step(aboutToHitProng(3), NO_INPUT);
    expect(fourth.lastKill).toEqual({ part: 'prong', points: 600 });
    expect(fourth.score).toBe(600);
    expect(fourth.killCount).toBe(4);
  });

  it('MGW-TC-0013-03 4 機目でも、突起以外に当てたときは通常の得点', () => {
    expect(killPoints('body', 50, 3)).toBe(50);
    expect(killPoints('bottom', 100, 3)).toBe(100);
    // 4 機目以外の突起は 150 点
    expect(killPoints('prong', 150, 2)).toBe(150);
    expect(killPoints('prong', 150, 4)).toBe(150);
    // 動かしたとき：4 機目の下部中央は 100 点
    const state = aboutToHitProng(3);
    const target = state.ufos[4]!;
    const bottom = step({ ...state, missile: { ...state.missile, x: target.x, y: target.y + 21 } }, NO_INPUT);
    expect(bottom.lastKill).toEqual({ part: 'bottom', points: 100 });
  });
});
