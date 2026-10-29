import { describe, expect, it } from 'vitest';
import { EXIT_RESPAWN, IDLE_LIMIT_2, INITIAL_LIVES, MISS_RESPAWN } from '../../src/core/config';
import { newGame, step } from '../../src/core/game';
import { meteorAt } from '../../src/core/physics';
import type { GameState } from '../../src/core/types';
import { NO_INPUT, run } from './helpers';

/** 発射後のミサイルが、次のステップで隕石に当たる状態（光線は撃たない） */
function aboutToMiss(patch: Partial<GameState> = {}): GameState {
  const meteor = meteorAt(100);
  return {
    ...newGame(0, 1),
    status: 'playing',
    missile: { x: meteor.x, y: meteor.y + 21, isLaunched: true, isBoosting: false },
    meteors: [meteor],
    beams: [],
    beamTimer: 1e9,
    ...patch,
  };
}

describe('残機と待ち', () => {
  it('MGW-TC-0016-01 ゲームは発射台 3 基（画面に出ている 1 基を含む）で始まる', () => {
    expect(INITIAL_LIVES).toBe(3);
    const state = newGame(0, 1);
    expect(state.lives).toBe(3);
    expect(state.status).toBe('ready');
  });

  it('MGW-TC-0016-02 ミスすると残機が 1 減り、2 秒後に出撃待ちになる', () => {
    const missed = step(aboutToMiss(), NO_INPUT);
    expect(missed.status).toBe('respawn');
    expect(missed.lives).toBe(2);
    // 2 秒（240 ステップ）の 1 ステップ前はまだ待ち
    const almost = run(missed, MISS_RESPAWN - 1);
    expect(almost.status).toBe('respawn');
    const back = step(almost, NO_INPUT);
    expect(back.status).toBe('standby');
    expect(back.lives).toBe(2);
    expect(back.waitReason).toBeNull();
    // タップしなければ、出撃待ちのまま
    expect(run(back, 600).status).toBe('standby');
  });

  it('MGW-TC-0016-03 ミスしても、倒した UFO は戻らず、隕石は動き続ける', () => {
    const base = aboutToMiss();
    const state: GameState = { ...base, ufos: base.ufos.map((u) => ({ ...u, isAlive: u.id >= 3 })), killCount: 3 };
    const missed = step(state, NO_INPUT);
    const waiting = run(missed, 100);
    const back = run(missed, MISS_RESPAWN);
    for (const s of [missed, waiting, back]) expect(s.ufos.filter((u) => u.isAlive)).toHaveLength(5);
    expect(back.killCount).toBe(3);
    // 待ちの間も隕石は動く（右へ 0.375 px／ステップ）
    expect(waiting.meteors[0]!.x - missed.meteors[0]!.x).toBeCloseTo(37.5, 9);
  });

  it('MGW-TC-0016-04 最上部を抜けたとき、または UFO を倒したとき（8 機目を除く）は、1 秒後に出撃待ちになる。残機は減らない', () => {
    // 下端が 48.375 → 1 ステップで 48 より上に出る
    const top: GameState = { ...aboutToMiss(), meteors: [], missile: { x: 240, y: 36, isLaunched: true, isBoosting: false } };
    const exited = step(top, NO_INPUT);
    expect(exited).toMatchObject({ status: 'respawn', waitReason: 'exit', lives: 3 });
    expect(run(exited, EXIT_RESPAWN - 1).status).toBe('respawn');
    const back = run(exited, EXIT_RESPAWN);
    expect(back.status).toBe('standby');
    expect(back.lives).toBe(3);

    // UFO を倒したとき：ミサイルは消え、1 秒後に出撃待ち
    const ufo = newGame(0, 1).ufos[5]!;
    const hit = step({ ...aboutToMiss(), meteors: [], missile: { x: ufo.x, y: ufo.y + 20, isLaunched: true, isBoosting: true } }, NO_INPUT);
    expect(hit).toMatchObject({ status: 'respawn', waitReason: 'kill', lives: 3, killCount: 1 });
    expect(hit.missile.isLaunched).toBe(false);
    expect(hit.missile.isBoosting).toBe(false);
    expect(run(hit, EXIT_RESPAWN - 1).status).toBe('respawn');
    const again = run(hit, EXIT_RESPAWN);
    expect(again.status).toBe('standby');
    expect(again.lives).toBe(3);
  });

  it('MGW-TC-0016-05 残機が 0 になると、ゲームオーバーになる（2 秒待ってから）', () => {
    const missed = step(aboutToMiss({ lives: 1 }), NO_INPUT);
    expect(missed.lives).toBe(0);
    expect(missed.status).toBe('respawn');
    expect(run(missed, MISS_RESPAWN - 1).status).toBe('respawn');
    const over = run(missed, MISS_RESPAWN);
    expect(over.status).toBe('gameOver');
    // ゲームオーバーのあとは進まない（ランキング登録か TITLE かは app が決める。MGW-TC-0016-06）
    expect(step(over, NO_INPUT)).toBe(over);
  });

  it('MGW-TC-0016-07 出撃待ちの間は発射台は出ず、UFO は光線を撃たない。UFO・隕石は動き続け、永久パターン防止のタイマーも進む', () => {
    const missed = step(aboutToMiss({ beamTimer: 1 }), NO_INPUT);
    const standby = run(missed, MISS_RESPAWN);
    expect(standby.status).toBe('standby');
    // 光線を撃つ時が来ても撃たない（タイマーも進めない）
    const later = run({ ...standby, beamTimer: 1, beams: [] }, 300);
    expect(later.status).toBe('standby');
    expect(later.beams).toEqual([]);
    // UFO（下段は左へ）と隕石は動く
    expect(later.ufos[5]!.x).not.toBe(standby.ufos[5]!.x);
    expect(later.meteors[0]!.pos).not.toBe(standby.meteors[0]!.pos);
    // 永久パターン防止のタイマーは進み、150 秒でゲームオーバー
    expect(later.idleSteps - standby.idleSteps).toBe(300);
    const timedOut = run({ ...standby, idleSteps: IDLE_LIMIT_2 - 1 }, 1);
    expect(timedOut.status).toBe('gameOver');
    // 光線にも隕石にも当たらない（発射台がない）
    const crowded = step({ ...standby, meteors: [meteorAt(456 * 10 + 228)], beams: [{ x: 240, y: 600, vy: 90, reflected: false }] }, NO_INPUT);
    expect(crowded.status).toBe('standby');
    expect(crowded.lives).toBe(standby.lives);
  });

  it('MGW-TC-0016-09 出撃待ちで、タップ・クリック・Space を押すと、発射台が出て発射前（Ready）に戻る。出る位置は、タップ・クリックした x（画面の端で止める）。Space のときはマウスの x があればその x、なければ x = 240。このタップでは発射しない', () => {
    const standby = run(step(aboutToMiss(), NO_INPUT), MISS_RESPAWN);
    expect(standby.status).toBe('standby');
    // 左右・噴射だけでは、出撃待ちのままで何も動かない
    expect(step(standby, { dir: 1, targetX: 100, launch: false, boost: true }).status).toBe('standby');
    // タップ・クリックした x（targetX）に出る。このタップでは発射しない
    const deployed = step(standby, { ...NO_INPUT, targetX: 120, launch: true, boost: true });
    expect(deployed.status).toBe('ready');
    expect(deployed.launcherX).toBe(120);
    expect(deployed.missile).toEqual({ x: 120, y: 596, isLaunched: false, isBoosting: false });
    expect(deployed.lives).toBe(2);
    // 画面の端では止める（24〜456）
    expect(step(standby, { ...NO_INPUT, targetX: 3, launch: true }).launcherX).toBe(24);
    expect(step(standby, { ...NO_INPUT, targetX: 479, launch: true }).launcherX).toBe(456);
    // x がない（Space で、マウスの位置がない）ときは真ん中
    expect(step(standby, { ...NO_INPUT, launch: true }).launcherX).toBe(240);
    // 次のタップで発射する
    expect(step(deployed, { ...NO_INPUT, launch: true }).status).toBe('playing');
  });});
