// newGame・step・togglePause（MGW-TD-0002 §4〜§6）
import {
  BEAM_INTERVAL,
  CEILING_Y,
  EXIT_RESPAWN,
  INITIAL_LIVES,
  LAUNCHER_START_X,
  METEOR_COUNT,
  METEOR_PATH_LENGTH,
  MISSILE_H,
  MISSILE_READY_Y,
  UFO_ROW_Y,
  UFO_START_X,
} from './config';
import { beamLimit, meteorAt, moveBeams, moveLauncher, moveMeteor, moveMissile, moveUfos, newBeam, pickShooter } from './physics';
import type { GameState, Missile, StepInput, UFO } from './types';

const readyMissile = (x: number): Missile => ({ x, y: MISSILE_READY_Y, isLaunched: false, isBoosting: false });

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
    missile: readyMissile(LAUNCHER_START_X),
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
export function step(state: GameState, input: StepInput): GameState {
  if (state.status === 'paused' || state.status === 'cleared' || state.status === 'gameOver') return state;

  // 1. ステップの数とタイマー
  const s: GameState = {
    ...state,
    stepCount: state.stepCount + 1,
    flashSteps: Math.max(0, state.flashSteps - 1),
    explosion: state.explosion && state.explosion.steps > 1 ? { ...state.explosion, steps: state.explosion.steps - 1 } : null,
  };

  // 2〜4. UFO・隕石・光線
  s.ufos = moveUfos(s.ufos);
  s.meteors = s.meteors.map(moveMeteor);
  s.beams = moveBeams(s.beams, s.meteors);

  // 5. 発射台・ミサイル
  if (s.status === 'ready') {
    s.launcherX = moveLauncher(s.launcherX, input);
    s.missile = readyMissile(s.launcherX);
    if (input.launch) {
      s.status = 'playing';
      s.missile = { ...s.missile, isLaunched: true };
    }
  } else if (s.status === 'playing') {
    s.missile = { ...s.missile, ...moveMissile(s.missile.x, s.missile.y, input), isBoosting: input.boost };
  }

  // 6. 当たり判定は MGW-TASK-0007 で足す

  // 7. 最上部を抜けた（ミスではない）
  if (s.status === 'playing' && s.missile.y + MISSILE_H / 2 < CEILING_Y) {
    s.status = 'respawn';
    s.waitReason = 'exit';
    s.waitSteps = EXIT_RESPAWN;
    s.missile = { ...s.missile, isBoosting: false };
  }

  // 8. 光線を撃つ
  if (s.status === 'ready' || s.status === 'playing') {
    s.beamTimer -= 1;
    if (s.beamTimer <= 0) {
      s.beamTimer = BEAM_INTERVAL;
      const falling = s.beams.filter((b) => !b.reflected).length;
      const shooter = pickShooter(s.ufos, s.status === 'ready' ? s.launcherX : s.missile.x);
      if (shooter && falling < beamLimit(s.ufos)) s.beams = [...s.beams, newBeam(shooter)];
    }
  }

  // 9. 待ち（遊べるように先に作った。確認は MGW-TASK-0009）
  if (s.status === 'respawn') {
    s.waitSteps -= 1;
    if (s.waitSteps <= 0) {
      s.waitSteps = 0;
      s.waitReason = null;
      if (s.lives <= 0) {
        s.status = 'gameOver';
      } else {
        s.status = 'ready';
        s.launcherX = LAUNCHER_START_X;
        s.missile = readyMissile(LAUNCHER_START_X);
      }
    }
  }

  // 10. 永久パターン防止は MGW-TASK-0009 で足す
  return s;
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
