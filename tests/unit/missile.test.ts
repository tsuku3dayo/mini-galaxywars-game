import { describe, expect, it } from 'vitest';
import { EXIT_RESPAWN, MISSILE_X_MAX } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import type { GameState } from '../../src/core/types';
import { input, launch, run } from './helpers';

// 当たり判定はまだないが、念のため隕石と UFO を消して、上昇だけを見る
function launchedAlone(): GameState {
  return launch({ ...newGame(0), meteors: [], ufos: [] });
}

describe('ミサイル', () => {
  it('MGW-TC-0007-01 噴射しないときは、上昇 45 px/秒、横 30 px/秒で動き、バックファイアを描かない', () => {
    const start = launchedAlone();
    const up = run(start, 60);
    expect(start.missile.y - up.missile.y).toBeCloseTo(22.5, 9);
    const side = run(start, 60, input({ dir: 1 }));
    expect(side.missile.x - start.missile.x).toBeCloseTo(15, 9);
    expect(side.missile.isBoosting).toBe(false);
  });

  it('MGW-TC-0007-02 噴射中は、上昇 70 px/秒、横 60 px/秒になる', () => {
    const start = launchedAlone();
    const up = run(start, 60, input({ boost: true }));
    expect(start.missile.y - up.missile.y).toBeCloseTo(35, 9);
    const side = run(start, 60, input({ boost: true, dir: -1 }));
    expect(start.missile.x - side.missile.x).toBeCloseTo(30, 9);
    // マウスの x へ近づくときも、横の速さは同じ
    const towards = run(start, 30, input({ boost: true, targetX: 480 }));
    expect(towards.missile.x - start.missile.x).toBeCloseTo(15, 9);
    // 画面の端で止まる
    expect(run(start, 500, input({ boost: true, dir: 1 })).missile.x).toBe(MISSILE_X_MAX);
  });

  it('MGW-TC-0007-03 噴射中だけ、バックファイアを描く（isBoosting）', () => {
    // 発射前は噴射の入力があっても描かない
    expect(step(newGame(0), input({ boost: true })).missile.isBoosting).toBe(false);
    const start = launchedAlone();
    const boosting = step(start, input({ boost: true }));
    expect(boosting.missile.isBoosting).toBe(true);
    expect(step(boosting, input({ boost: false })).missile.isBoosting).toBe(false);
  });

  it('MGW-TC-0007-05 敵や隕石に触れずに最上部（y < 48）を抜けても、ミスにならない', () => {
    let s = launchedAlone();
    let steps = 0;
    while (s.status === 'playing' && steps < 2000) {
      s = step(s, input({ boost: true }));
      steps += 1;
    }
    // ミサイルの下端（y + 12）が天井 48 より上に出たところで抜ける
    expect(s.status).toBe('respawn');
    expect(s.waitReason).toBe('exit');
    expect(s.missile.y + 12).toBeLessThan(48);
    expect(s.lives).toBe(3);
    expect(s.flashSteps).toBe(0);
    expect(s.explosion).toBeNull();
    // 1 秒の待ちのあと、残機はそのままで発射前に戻る
    const back = run(s, EXIT_RESPAWN);
    expect(back.status).toBe('ready');
    expect(back.lives).toBe(3);
    expect(back.missile).toEqual({ x: 240, y: 596, isLaunched: false, isBoosting: false });
  });
});
