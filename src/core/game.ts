// newGame・step・togglePause（MGW-TD-0002 §4〜§6）
import {
  BEAM_INTERVAL,
  INITIAL_LIVES,
  LAUNCHER_START_X,
  METEOR_COUNT,
  METEOR_PATH_LENGTH,
  MISSILE_READY_Y,
  UFO_ROW_Y,
  UFO_START_X,
} from './config';
import { meteorAt } from './physics';
import type { GameState, StepInput, UFO } from './types';

/** 1 面の初めの状態（MGW-TD-0002 §5） */
export function newGame(highScore: number): GameState {
  const ufos: UFO[] = [];
  for (const row of [0, 1] as const) {
    UFO_START_X.forEach((x, i) => ufos.push({ id: row * UFO_START_X.length + i, x, y: UFO_ROW_Y[row], row, isAlive: true }));
  }
  const meteors = [];
  for (let k = 0; k < METEOR_COUNT; k++) meteors.push(meteorAt((k * METEOR_PATH_LENGTH) / METEOR_COUNT));

  return {
    status: 'ready',
    pausedFrom: null,
    stepCount: 0,
    score: 0,
    highScore,
    lives: INITIAL_LIVES,
    extended: false,
    launcherX: LAUNCHER_START_X,
    missile: { x: LAUNCHER_START_X, y: MISSILE_READY_Y, isLaunched: false, isBoosting: false },
    ufos,
    killCount: 0,
    meteors,
    beams: [],
    beamTimer: BEAM_INTERVAL,
    idleSteps: 0,
    waitSteps: 0,
    waitReason: null,
    flashSteps: 0,
    explosion: null,
    lastKill: null,
  };
}

/** 1 ステップ進める。新しいオブジェクトを返し、引数は変えない（MGW-TD-0002 §6） */
export function step(state: GameState, _input: StepInput): GameState {
  if (state.status === 'paused' || state.status === 'cleared' || state.status === 'gameOver') return state;

  // 1. ステップの数とタイマー
  const next: GameState = {
    ...state,
    stepCount: state.stepCount + 1,
    flashSteps: Math.max(0, state.flashSteps - 1),
    explosion: state.explosion && state.explosion.steps > 1 ? { ...state.explosion, steps: state.explosion.steps - 1 } : null,
  };
  // 2〜10（動き・当たり判定・光線・待ち・永久パターン防止）は MGW-TASK-0006 以降で足す
  return next;
}

/** ready・playing・respawn ⇔ paused。cleared・gameOver では何もしない */
export function togglePause(state: GameState): GameState {
  if (state.status === 'paused') {
    return { ...state, status: state.pausedFrom ?? 'playing', pausedFrom: null };
  }
  if (state.status === 'ready' || state.status === 'playing' || state.status === 'respawn') {
    return { ...state, status: 'paused', pausedFrom: state.status };
  }
  return state;
}

/** 表示する HIGH：max(highScore, score) */
export function displayHighScore(state: GameState): number {
  return Math.max(state.highScore, state.score);
}
