import { describe, expect, it } from 'vitest';
import { EXPLOSION_STEPS, KILL_EFFECT_STEPS, STEPS_PER_SECOND } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import type { GameState } from '../../src/core/types';
import { killEffectView } from '../../src/render/kill-effect';
import { NO_INPUT } from './helpers';

/** 次のステップで下段の UFO（id 5）の下部中央（100 点）に当たる状態 */
function aboutToKill(patch: Partial<GameState> = {}): GameState {
  const base = newGame(0);
  const ufo = base.ufos[5]!;
  return {
    ...base,
    status: 'playing',
    missile: { x: ufo.x, y: ufo.y + 20, isLaunched: true, isBoosting: false },
    meteors: [],
    beams: [],
    beamTimer: 1e9,
    ...patch,
  };
}

describe('UFO を倒したときの表示', () => {
  it('MGW-TC-0013-04 倒した UFO の位置に爆発が 0.4 秒出て、そのあと同じ位置に入った得点が、倒してから 1 秒まで出る', () => {
    expect(EXPLOSION_STEPS / STEPS_PER_SECOND).toBe(0.4);
    expect(KILL_EFFECT_STEPS / STEPS_PER_SECOND).toBe(1);

    let s = step(aboutToKill(), NO_INPUT);
    const ufo = s.ufos[5]!;
    // 倒した UFO の位置（倒したステップで動いたあとの位置）に、入った得点を持つ
    expect(s.killEffect).toEqual({ x: ufo.x, y: ufo.y, points: 100, steps: KILL_EFFECT_STEPS });

    // 何ステップ目に何を出すかを数える（倒したステップを 1 ステップ目とする）
    const kinds: string[] = [];
    while (killEffectView(s.killEffect)) {
      kinds.push(killEffectView(s.killEffect)!.kind);
      s = step(s, NO_INPUT);
    }
    expect(kinds).toHaveLength(KILL_EFFECT_STEPS);
    expect(kinds.filter((k) => k === 'explosion')).toHaveLength(EXPLOSION_STEPS);
    // 爆発が先、得点があと
    expect(kinds.indexOf('points')).toBe(EXPLOSION_STEPS);
    expect(killEffectView({ x: 1, y: 2, points: 600, steps: 1 })).toEqual({ kind: 'points', x: 1, y: 2, points: 600 });
    // 消えるのは、次の発射台が出るのと同じとき
    expect(s.status).toBe('ready');
    expect(s.killEffect).toBeNull();

    // 8 機目（クリア）のときは出さない（クリアの表示を出す）
    const last = aboutToKill({ killCount: 7, ufos: newGame(0).ufos.map((u) => ({ ...u, isAlive: u.id === 5 })) });
    const cleared = step(last, NO_INPUT);
    expect(cleared.status).toBe('cleared');
    expect(cleared.killEffect).toBeNull();
  });
});
