// 定数（MGW-TD-0002 §2）。座標は論理座標、速さは px/秒、時間はステップ（1/120 秒）

export const FIELD_WIDTH = 480;
export const FIELD_HEIGHT = 640;
/** HUD 帯の下端（天井） */
export const CEILING_Y = 48;

/** 縦の領域（仕様書 §2.1）。[上端, 下端] */
export const REGIONS = {
  hud: [0, 48],
  ufo: [48, 120],
  meteor: [120, 580],
  launcher: [580, 612],
} as const satisfies Record<string, readonly [number, number]>;

export const STEPS_PER_SECOND = 120;
export const MAX_STEPS_PER_FRAME = 12;

export const LAUNCHER_W = 48;
export const LAUNCHER_H = 16;
export const LAUNCHER_Y = 608;
export const LAUNCHER_X_MIN = 24;
export const LAUNCHER_X_MAX = 456;
export const LAUNCHER_START_X = 240;
export const LAUNCHER_KEY_SPEED = 240;
export const LAUNCHER_POINTER_SPEED = 480;

export const MISSILE_W = 12;
export const MISSILE_H = 24;
export const MISSILE_READY_Y = 596;
export const MISSILE_SPEED_NORMAL = 180;
export const MISSILE_SPEED_BOOST = 280;
export const MISSILE_LATERAL_LOW = 120;
export const MISSILE_LATERAL_HIGH = 240;
export const MISSILE_X_MIN = 6;
export const MISSILE_X_MAX = 474;

export const UFO_W = 32;
export const UFO_H = 24;
/** 上段（右へ）・下段（左へ）の中心の y */
export const UFO_ROW_Y = [76, 108] as const;
export const UFO_START_X = [60, 180, 300, 420] as const;
/** 残り機数（添字）→ 速さ */
export const UFO_SPEEDS = [0, 320, 240, 180, 160, 140, 120, 100, 80] as const;

export const BEAM_W = 4;
export const BEAM_H = 16;
export const BEAM_SPEED = 180;
export const BEAM_INTERVAL = 90;
/** 画面に出せる光線の数（UFO が 5 機以上・4 機以下） */
export const BEAM_MAX = { atLeast5: 3, atMost4: 4 } as const;
/** 光線を弾く範囲：先端の中央 ±2 px */
export const REFLECT_HALF_W = 2;

export const METEOR_SIZE = 24;
export const METEOR_HIT = 20;
export const METEOR_LANE_COUNT = 12;
export const METEOR_LANE_TOP_Y = 136;
export const METEOR_LANE_GAP = 40;
export const METEOR_X_MIN = 12;
export const METEOR_X_MAX = 468;
export const METEOR_SPEED_RIGHT = 180;
export const METEOR_SPEED_LEFT = 120;
export const METEOR_COUNT = 5;
/** 1 段の道のり・1 周の道のり */
export const METEOR_LANE_LENGTH = METEOR_X_MAX - METEOR_X_MIN;
export const METEOR_PATH_LENGTH = METEOR_LANE_LENGTH * METEOR_LANE_COUNT;

export const INITIAL_LIVES = 3;
export const EXTEND_SCORE = 1000;
export const MISS_RESPAWN = 240;
export const EXIT_RESPAWN = 120;
export const IDLE_LIMIT_1 = 10_800;
export const IDLE_LIMIT_2 = 18_000;
export const FLASH_STEPS = 12;
export const EXPLOSION_STEPS = 48;
export const SCORE_MAX = 99_999;
