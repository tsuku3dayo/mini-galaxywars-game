import { describe, expect, it } from 'vitest';
import { IDLE_LIMIT_1, IDLE_LIMIT_2 } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import { meteorAt } from '../../src/core/physics';
import type { GameState } from '../../src/core/types';
import { NO_INPUT, run } from './helpers';

// 隕石・光線のない、何も起きない場面
const quiet = (patch: Partial<GameState> = {}): GameState => ({ ...newGame(0, 1), meteors: [], beams: [], beamTimer: 1e9, ...patch });

describe('永久パターン防止', () => {
  it('MGW-TC-0020-01 UFO を 1 機も倒さないまま 90 秒たつと、残機が 1 になる', () => {
    expect(IDLE_LIMIT_1).toBe(90 * 120);
    // 初めから 90 秒（10,800 ステップ）を流す
    const before = run(quiet(), IDLE_LIMIT_1 - 1);
    expect(before.lives).toBe(3);
    const after = step(before, NO_INPUT);
    expect(after.idleSteps).toBe(IDLE_LIMIT_1);
    expect(after.lives).toBe(1);
    expect(after.status).toBe('ready');
    // 残機が 1 のときはそのまま
    expect(step(quiet({ idleSteps: IDLE_LIMIT_1 - 1, lives: 1 }), NO_INPUT).lives).toBe(1);
  });

  it('MGW-TC-0020-02 そのまま 150 秒たつと、ゲームオーバーになる', () => {
    expect(IDLE_LIMIT_2).toBe(150 * 120);
    const before = step(quiet({ idleSteps: IDLE_LIMIT_2 - 2 }), NO_INPUT);
    expect(before.status).toBe('ready');
    expect(step(before, NO_INPUT).status).toBe('gameOver');
    // 発射後に飛んでいる途中でも
    const flying = quiet({ idleSteps: IDLE_LIMIT_2 - 1, status: 'playing', missile: { x: 240, y: 400, isLaunched: true, isBoosting: true } });
    const over = step(flying, { ...NO_INPUT, boost: true });
    expect(over.status).toBe('gameOver');
    expect(over.missile.isBoosting).toBe(false);
  });

  it('MGW-TC-0020-03 タイマーは UFO を倒すと 0 に戻る。ミスしても戻らない', () => {
    // UFO を倒したステップで 0 に戻る（そのステップの分を数えて 1）
    const ufo = newGame(0, 1).ufos[5]!;
    const kill = step(quiet({ idleSteps: 5000, status: 'playing', missile: { x: ufo.x, y: ufo.y + 20, isLaunched: true, isBoosting: false } }), NO_INPUT);
    expect(kill.killCount).toBe(1);
    expect(kill.idleSteps).toBe(1);

    // ミスしても戻らない
    const meteor = meteorAt(100);
    const miss = step(
      quiet({ idleSteps: 5000, status: 'playing', meteors: [meteor], missile: { x: meteor.x, y: meteor.y + 21, isLaunched: true, isBoosting: false } }),
      NO_INPUT,
    );
    expect(miss.status).toBe('respawn');
    expect(miss.idleSteps).toBe(5001);
    // 待ちの間も数える
    expect(run(miss, 100).idleSteps).toBe(5101);
  });
});
