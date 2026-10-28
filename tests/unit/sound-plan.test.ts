import { describe, expect, it } from 'vitest';
import { newGame, step } from '../../src/core/game';
import { meteorAt } from '../../src/core/physics';
import { planSounds } from '../../src/core/sound-plan';
import type { GameState } from '../../src/core/types';
import { input, launch, NO_INPUT } from './helpers';

/** 前の状態から 1 ステップ進めて、鳴らす音を決める */
function soundsOf(prev: GameState, stepInput = NO_INPUT) {
  const next = step(prev, stepInput);
  return { next, sounds: planSounds(prev, next) };
}

const flying = (): GameState => launch({ ...newGame(0), meteors: [], beams: [], beamTimer: 1e9 });

describe('音の計画', () => {
  it('MGW-TC-0023-01 加速噴射の間、ミサイルの上昇音（ジェット音）が鳴る。噴射しないときは鳴らない', () => {
    const start = flying();
    // 前提：発射後で、噴射していない
    expect(start).toMatchObject({ status: 'playing', missile: { isBoosting: false } });
    expect(soundsOf(start).sounds).toEqual([]);
    // 噴射を始めると jetOn、続けている間は何も足さない、やめると jetOff
    const on = soundsOf(start, input({ boost: true }));
    expect(on.sounds).toEqual(['jetOn']);
    const keep = soundsOf(on.next, input({ boost: true }));
    expect(keep.sounds).toEqual([]);
    expect(soundsOf(keep.next, NO_INPUT).sounds).toEqual(['jetOff']);
    // 発射前は噴射の入力があっても鳴らさない
    expect(soundsOf(newGame(0), input({ boost: true })).sounds).toEqual([]);
    // 噴射したまま playing でなくなった（最上部を抜けた）ときも止める
    const top: GameState = { ...on.next, missile: { ...on.next.missile, y: 37 } };
    expect(soundsOf(top, input({ boost: true })).sounds).toEqual(['jetOff']);
  });

  it('MGW-TC-0023-03 UFO を壊すと破壊音が鳴る', () => {
    const ufo = newGame(0).ufos[5]!;
    const prev: GameState = { ...flying(), missile: { x: ufo.x, y: ufo.y + 21, isLaunched: true, isBoosting: false } };
    const { next, sounds } = soundsOf(prev);
    // 前提：このステップで 1 機倒れた
    expect(next.killCount).toBe(1);
    expect(sounds).toEqual(['ufoDestroyed']);
  });

  it('MGW-TC-0023-05 増機すると増機音が鳴る', () => {
    const ufo = newGame(0).ufos[5]!;
    const prev: GameState = { ...flying(), score: 950, missile: { x: ufo.x, y: ufo.y + 21, isLaunched: true, isBoosting: false } };
    const { next, sounds } = soundsOf(prev);
    expect(next.extended).toBe(true);
    expect(sounds).toEqual(['ufoDestroyed', 'extend']);
  });

  it('MGW-TC-0023-07 ミスすると爆発音が鳴る', () => {
    const meteor = meteorAt(100);
    const prev: GameState = { ...flying(), meteors: [meteor], missile: { x: meteor.x, y: meteor.y + 21, isLaunched: true, isBoosting: true } };
    const { next, sounds } = soundsOf(prev, input({ boost: true }));
    expect(next.waitReason).toBe('miss');
    // 噴射していたらジェット音も止める
    expect(sounds).toEqual(['jetOff', 'miss']);
    // 待ちの間は鳴らし続けない
    expect(soundsOf(next).sounds).toEqual([]);
    // 最上部を抜けたとき（ミスではない）は鳴らさない
    const top: GameState = { ...flying(), missile: { x: 240, y: 37, isLaunched: true, isBoosting: false } };
    expect(soundsOf(top).sounds).toEqual([]);
  });
});
