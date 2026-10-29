import { describe, expect, it } from 'vitest';
import { MISS_RESPAWN, TIME_BONUS_BASE, TIME_BONUS_PER_SEC } from '../../src/core/config';
import { newGame, step, togglePause } from '../../src/core/game';
import { meteorAt } from '../../src/core/physics';
import { clearTimeMs, timeBonusOf } from '../../src/core/scoring';
import type { GameState } from '../../src/core/types';
import { input, launch, NO_INPUT, run } from './helpers';

/** 7 機を倒した状態で、次のステップで 8 機目（下段の id 5）の下部中央（100 点）に当たる。経過時間と点数は決めて渡す */
function aboutToClear(patch: Partial<GameState>): GameState {
  const base = newGame(0, 1);
  const last = base.ufos[5]!;
  return {
    ...base,
    status: 'playing',
    ufos: base.ufos.map((u) => ({ ...u, isAlive: u.id === 5 })),
    killCount: 7,
    missile: { x: last.x, y: last.y + 20, isLaunched: true, isBoosting: false },
    meteors: [],
    beams: [],
    beamTimer: 1e9,
    ...patch,
  };
}

/** 発射して、隕石・光線のない所を n ステップ飛ぶ */
const flying = (n: number) => run(launch({ ...newGame(0, 1), meteors: [], beams: [], beamTimer: 1e9 }), n);

describe('時間ボーナス（仕様書 v1.9 §6.4、MGW-TD-0002 §7.3）', () => {
  it('MGW-TC-0013-06 クリアしたとき、時間ボーナス max(0, 180 − 経過秒（切り捨て）) × 5 が UFO の得点に足され、合計がスコアになる。ゲームオーバーでは 0', () => {
    expect([TIME_BONUS_BASE, TIME_BONUS_PER_SEC]).toEqual([180, 5]);
    // 式：秒は切り捨て。180 秒以上は 0
    expect(timeBonusOf(0)).toBe(900);
    expect(timeBonusOf(119)).toBe(900);
    expect(timeBonusOf(120)).toBe(895);
    expect(timeBonusOf(95 * 120 + 84)).toBe(425); // 95.7 秒
    expect(timeBonusOf(180 * 120 - 1)).toBe(5); // 179.99 秒
    expect(timeBonusOf(180 * 120)).toBe(0);
    expect(timeBonusOf(10_000 * 120)).toBe(0);
    // タイムは 0.1 秒単位で切り捨てたミリ秒
    expect(clearTimeMs(95 * 120 + 84)).toBe(95_700);
    expect(clearTimeMs(11)).toBe(0);
    expect(clearTimeMs(12)).toBe(100);

    // 95.7 秒（11,484 ステップ）飛んで、UFO 1,050 点のところで 8 機目（100 点）を倒す → UFO 1,150 ＋ 425 ＝ 1,575
    const cleared = step(aboutToClear({ score: 1050, playSteps: 95 * 120 + 83, extended: true }), NO_INPUT);
    expect(cleared.status).toBe('cleared');
    expect(cleared.playSteps).toBe(95 * 120 + 84);
    expect(cleared.timeBonus).toBe(425);
    expect(cleared.score).toBe(1575);
    // 合計は 99,999 で止める
    expect(step(aboutToClear({ score: 99_800, playSteps: 0, extended: true }), NO_INPUT).score).toBe(99_999);
    // 時間ボーナスは増機に使わない（UFO 850 ＋ 100 ＝ 950 で 1,000 に届かない。ボーナスで 1,000 を超えても増えない）
    const noExtend = step(aboutToClear({ score: 850, playSteps: 0, lives: 2 }), NO_INPUT);
    expect(noExtend.score).toBe(950 + 900);
    expect(noExtend.lives).toBe(2);
    expect(noExtend.extended).toBe(false);

    // ゲームオーバーでは足さない
    const meteor = meteorAt(100);
    const lastMiss: GameState = { ...aboutToClear({ score: 700, lives: 1, playSteps: 600 }), ufos: newGame(0, 1).ufos, killCount: 0, missile: { x: meteor.x, y: meteor.y + 20, isLaunched: true, isBoosting: false }, meteors: [meteor] };
    const over = run(step(lastMiss, NO_INPUT), MISS_RESPAWN);
    expect(over.status).toBe('gameOver');
    expect(over.timeBonus).toBe(0);
    expect(over.score).toBe(700);
  });

  it('MGW-TC-0013-07 経過時間は、ミサイルが飛んでいる間（Playing）だけ数える。発射前・待ち・出撃待ち・一時停止の間は数えない', () => {
    // 発射前（Ready）は数えない
    const ready = run({ ...newGame(0, 1), meteors: [], beams: [], beamTimer: 1e9 }, 600);
    expect(ready.status).toBe('ready');
    expect(ready.playSteps).toBe(0);
    // 発射したステップの次から、飛んでいる 1 ステップごとに 1 つ
    const flown = flying(240);
    expect(flown.status).toBe('playing');
    expect(flown.playSteps).toBe(240);
    // 一時停止の間は数えない
    const paused = run(togglePause(flown), 600);
    expect(paused.playSteps).toBe(240);
    const resumed = run(togglePause(paused), 10);
    expect(resumed.playSteps).toBe(250);
    // 待ち（Respawn）と出撃待ち（Standby）は数えない
    const top: GameState = { ...flown, missile: { x: 240, y: 36, isLaunched: true, isBoosting: false } };
    const exited = step(top, NO_INPUT);
    expect(exited.status).toBe('respawn');
    expect(exited.playSteps).toBe(241);
    const standby = run(exited, 600);
    expect(standby.status).toBe('standby');
    expect(standby.playSteps).toBe(241);
    // 出撃して発射前に戻っても数えず、また発射すると数える
    const deployed = run(step(standby, input({ launch: true })), 100);
    expect(deployed.status).toBe('ready');
    expect(deployed.playSteps).toBe(241);
    expect(run(launch(deployed), 120).playSteps).toBe(361);
    // 噴射しても 1 ステップは 1 つ（速く飛べば、同じ距離を少ないステップで行ける）
    expect(run(launch({ ...newGame(0, 1), meteors: [], beams: [], beamTimer: 1e9 }), 60, input({ boost: true })).playSteps).toBe(60);
  });
});
