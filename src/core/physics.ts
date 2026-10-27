// 動きと当たり判定（MGW-TD-0002 §6）。当たり判定は MGW-TASK-0007 で足す
import {
  BEAM_H,
  BEAM_MAX,
  BEAM_SPEED,
  BEAM_W,
  CEILING_Y,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  LAUNCHER_KEY_SPEED,
  LAUNCHER_POINTER_SPEED,
  LAUNCHER_X_MAX,
  LAUNCHER_X_MIN,
  METEOR_HIT,
  METEOR_LANE_COUNT,
  METEOR_LANE_GAP,
  METEOR_LANE_LENGTH,
  METEOR_LANE_TOP_Y,
  METEOR_PATH_LENGTH,
  METEOR_SPEED_LEFT,
  METEOR_SPEED_RIGHT,
  METEOR_X_MAX,
  METEOR_X_MIN,
  MISSILE_LATERAL_HIGH,
  MISSILE_LATERAL_LOW,
  MISSILE_SPEED_BOOST,
  MISSILE_SPEED_NORMAL,
  MISSILE_X_MAX,
  MISSILE_X_MIN,
  STEPS_PER_SECOND,
  UFO_H,
  UFO_SPEEDS,
} from './config';
import type { Beam, Meteor, StepInput, UFO } from './types';

/** 軸にそろった四角（中心と幅・高さ） */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 四角が重なるか。辺が接しただけ（重なりの幅 0）は当たりにしない（MGW-TD-0002 §1） */
export function overlaps(a: Box, b: Box): boolean {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** x を目標へ、1 ステップに maxStep まで近づける */
function approach(x: number, target: number, maxStep: number): number {
  const d = target - x;
  return Math.abs(d) <= maxStep ? target : x + Math.sign(d) * maxStep;
}

/** 入力から横の位置を決める。キーがあればキーを、なければ指・マウスの x を使う */
function moveX(x: number, input: StepInput, keySpeed: number, pointerSpeed: number): number {
  if (input.dir !== 0) return x + (input.dir * keySpeed) / STEPS_PER_SECOND;
  if (input.targetX !== null) return approach(x, input.targetX, pointerSpeed / STEPS_PER_SECOND);
  return x;
}

/** 発射前：発射台の x（MGW-TD-0002 §6 の 5） */
export function moveLauncher(x: number, input: StepInput): number {
  return clamp(moveX(x, input, LAUNCHER_KEY_SPEED, LAUNCHER_POINTER_SPEED), LAUNCHER_X_MIN, LAUNCHER_X_MAX);
}

/** 発射後：ミサイルの位置。噴射中は上昇 280・横 240、そうでなければ上昇 180・横 120 */
export function moveMissile(x: number, y: number, input: StepInput): { x: number; y: number } {
  const up = input.boost ? MISSILE_SPEED_BOOST : MISSILE_SPEED_NORMAL;
  const lateral = input.boost ? MISSILE_LATERAL_HIGH : MISSILE_LATERAL_LOW;
  return {
    x: clamp(moveX(x, input, lateral, lateral), MISSILE_X_MIN, MISSILE_X_MAX),
    y: y - up / STEPS_PER_SECOND,
  };
}

/** UFO：残りの機数で速さを引き、上段は右、下段は左へ。画面の端を出たら反対の端から出る */
export function moveUfos(ufos: UFO[]): UFO[] {
  const alive = ufos.filter((u) => u.isAlive).length;
  const v = (UFO_SPEEDS[alive] ?? 0) / STEPS_PER_SECOND;
  return ufos.map((u) => {
    if (!u.isAlive) return u;
    const x = u.x + (u.row === 0 ? v : -v);
    return { ...u, x: ((x % FIELD_WIDTH) + FIELD_WIDTH) % FIELD_WIDTH };
  });
}

/** 隕石の道のりの位置から、x・y・段・向きを決める（MGW-TD-0002 §5。偶数の段は右へ、奇数の段は左へ） */
export function meteorAt(pos: number): Meteor {
  const p = ((pos % METEOR_PATH_LENGTH) + METEOR_PATH_LENGTH) % METEOR_PATH_LENGTH;
  const lane = Math.min(Math.floor(p / METEOR_LANE_LENGTH), METEOR_LANE_COUNT - 1);
  const offset = p - lane * METEOR_LANE_LENGTH;
  const direction = lane % 2 === 0 ? 1 : -1;
  return {
    pos: p,
    x: direction === 1 ? METEOR_X_MIN + offset : METEOR_X_MAX - offset,
    y: METEOR_LANE_TOP_Y + METEOR_LANE_GAP * lane,
    lane,
    direction,
  };
}

/** 隕石を 1 ステップ進める。段の途中で端に着いたら、残りの時間は次の段の速さで進む */
export function moveMeteor(m: Meteor): Meteor {
  let pos = m.pos;
  let time = 1 / STEPS_PER_SECOND;
  while (time > 0) {
    const current = meteorAt(pos);
    const speed = current.direction === 1 ? METEOR_SPEED_RIGHT : METEOR_SPEED_LEFT;
    const toLaneEnd = (current.lane + 1) * METEOR_LANE_LENGTH - current.pos;
    if (speed * time < toLaneEnd) {
      pos = current.pos + speed * time;
      time = 0;
    } else {
      pos = current.pos + toLaneEnd;
      time -= toLaneEnd / speed;
    }
  }
  return meteorAt(pos);
}

export const meteorBox = (m: Meteor): Box => ({ x: m.x, y: m.y, w: METEOR_HIT, h: METEOR_HIT });
export const beamBox = (b: Beam): Box => ({ x: b.x, y: b.y, w: BEAM_W, h: BEAM_H });

/** 光線を動かす。画面の外に出たもの、弾いていないのに隕石に重なったもの（盾）は消す */
export function moveBeams(beams: Beam[], meteors: Meteor[]): Beam[] {
  const out: Beam[] = [];
  for (const b of beams) {
    const moved = { ...b, y: b.y + b.vy / STEPS_PER_SECOND };
    if (moved.reflected ? moved.y < CEILING_Y : moved.y > FIELD_HEIGHT) continue;
    if (!moved.reflected && meteors.some((m) => overlaps(beamBox(moved), meteorBox(m)))) continue;
    out.push(moved);
  }
  return out;
}

/** 画面に出せる光線の数 */
export function beamLimit(ufos: UFO[]): number {
  return ufos.filter((u) => u.isAlive).length >= 5 ? BEAM_MAX.atLeast5 : BEAM_MAX.atMost4;
}

/** 光線を撃つ UFO：x の差がいちばん小さいもの。同じなら下段、それでも同じなら id の小さい方（MGW-TD-0002 §6.2） */
export function pickShooter(ufos: UFO[], targetX: number): UFO | null {
  let best: UFO | null = null;
  for (const u of ufos) {
    if (!u.isAlive) continue;
    if (best === null) {
      best = u;
      continue;
    }
    const d = Math.abs(u.x - targetX);
    const bd = Math.abs(best.x - targetX);
    if (d < bd || (d === bd && (u.row > best.row || (u.row === best.row && u.id < best.id)))) best = u;
  }
  return best;
}

/** UFO の真下から落ちる光線 */
export function newBeam(ufo: UFO): Beam {
  return { x: ufo.x, y: ufo.y + UFO_H / 2 + BEAM_H / 2, vy: BEAM_SPEED, reflected: false };
}
