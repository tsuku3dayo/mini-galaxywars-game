import { describe, expect, it } from 'vitest';
import {
  LAUNCHER_H,
  LAUNCHER_W,
  LAUNCHER_X_MAX,
  LAUNCHER_X_MIN,
  LAUNCHER_Y,
  MISSILE_H,
  MISSILE_W,
} from '../../src/core/config';
import { newGame } from '../../src/core/game';
import { input, launch, run } from './helpers';

describe('発射台', () => {
  it('MGW-TC-0006-01 発射前、ミサイルは発射台の上（中心 y = 596、先端 y = 584）に乗っている', () => {
    const state = newGame(0);
    expect(state.status).toBe('ready');
    expect(state.missile).toEqual({ x: 240, y: 596, isLaunched: false, isBoosting: false });
    expect(state.missile.y - MISSILE_H / 2).toBe(584);
    expect(state.missile.x).toBe(state.launcherX);
    // ミサイルの下の部分が発射台（上端 600）に差し込まれている
    expect(state.missile.y + MISSILE_H / 2).toBeGreaterThan(LAUNCHER_Y - LAUNCHER_H / 2);
  });

  it('MGW-TC-0006-02 キー・マウスの移動で、発射台がミサイルといっしょに横に動き、画面の端で止まる', () => {
    // キー（←→・A D は入力で dir になる）：60 px/秒
    const right = run(newGame(0), 60, input({ dir: 1 }));
    expect(right.launcherX).toBe(270);
    expect(right.missile).toMatchObject({ x: 270, y: 596, isLaunched: false });
    expect(run(right, 1000, input({ dir: 1 })).launcherX).toBe(LAUNCHER_X_MAX);
    const left = run(newGame(0), 1000, input({ dir: -1 }));
    expect(left.launcherX).toBe(LAUNCHER_X_MIN);
    expect(left.missile.x).toBe(LAUNCHER_X_MIN);

    // マウス（指）の x：120 px/秒（1 ステップ 1 px）まで近づき、行き過ぎない
    const towards = run(newGame(0), 10, input({ targetX: 100 }));
    expect(towards.launcherX).toBe(230);
    expect(run(towards, 200, input({ targetX: 100 })).launcherX).toBe(100);
    expect(run(newGame(0), 1000, input({ targetX: 0 })).launcherX).toBe(LAUNCHER_X_MIN);
    expect(run(newGame(0), 1000, input({ targetX: 480 })).launcherX).toBe(LAUNCHER_X_MAX);
  });

  it('MGW-TC-0006-04 Space かクリックで発射し、ミサイルが上昇を始める', () => {
    const launched = launch(newGame(0));
    expect(launched.status).toBe('playing');
    expect(launched.missile.isLaunched).toBe(true);
    const later = run(launched, 10);
    expect(later.missile.y).toBeLessThan(launched.missile.y);
    // 発射台は元の場所に残る
    expect(later.launcherX).toBe(240);
  });

  it('MGW-TC-0006-06 発射台は幅 48 × 高さ 16、ミサイルは幅 12 × 高さ 24', () => {
    expect([LAUNCHER_W, LAUNCHER_H]).toEqual([48, 16]);
    expect([MISSILE_W, MISSILE_H]).toEqual([12, 24]);
  });
});
