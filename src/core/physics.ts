// 動きと当たり判定（MGW-TD-0002 §6）。動きは MGW-TASK-0006、当たり判定は MGW-TASK-0007 で足す
import {
  METEOR_LANE_COUNT,
  METEOR_LANE_GAP,
  METEOR_LANE_LENGTH,
  METEOR_LANE_TOP_Y,
  METEOR_PATH_LENGTH,
  METEOR_X_MAX,
  METEOR_X_MIN,
} from './config';
import type { Meteor } from './types';

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
