// newGame・step・togglePause（MGW-TD-0002 §4〜§6）
import {
  BEAM_INTERVAL,
  BEAM_SPEED,
  CEILING_Y,
  EXIT_RESPAWN,
  EXPLOSION_STEPS,
  FLASH_STEPS,
  IDLE_LIMIT_1,
  IDLE_LIMIT_2,
  INITIAL_LIVES,
  KILL_EFFECT_STEPS,
  LAUNCHER_START_X,
  METEOR_COUNT,
  METEOR_PATH_LENGTH,
  MISS_RESPAWN,
  MISSILE_H,
  MISSILE_READY_Y,
  STEPS_PER_SECOND,
  UFO_ROW_Y,
  UFO_START_X,
} from './config';
import {
  beamBox,
  beamLimit,
  canReflect,
  launcherBox,
  meteorAt,
  meteorBox,
  missileBox,
  moveBeams,
  moveLauncher,
  moveMeteor,
  moveMissile,
  moveUfos,
  newBeam,
  overlaps,
  pickShooter,
} from './physics';
import { addScore, hitPart, killPoints } from './scoring';
import type { Beam, GameState, Missile, StepInput, UFO } from './types';

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
    killEffect: null,
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
    killEffect: state.killEffect && state.killEffect.steps > 1 ? { ...state.killEffect, steps: state.killEffect.steps - 1 } : null,
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

  // 6. 当たり判定（隕石 → UFO → 光線。ミス・UFO を倒した・クリアが決まったら、残りは調べない）
  if (s.status === 'ready' || s.status === 'playing') {
    const result = checkHits(s, state.missile.y);
    if (result === 'miss') miss(s);
    if (result === 'kill') kill(s);
    if (result === 'clear') s.status = 'cleared';
    if (result !== null) s.missile = { ...s.missile, isBoosting: false };
  }

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

  // 9. 待ち（ミス・最上部・UFO を倒したあと）。このステップで待ちに入ったときは減らさず、次のステップから数える（ちょうど 2 秒・1 秒で戻る）
  if (s.status === 'respawn' && state.status === 'respawn') {
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

  // 10. 永久パターン防止（仕様書 §3.5）。0 に戻すのは UFO を倒したときだけ（checkHits）
  s.idleSteps += 1;
  if (s.status !== 'cleared' && s.status !== 'gameOver') {
    if (s.idleSteps === IDLE_LIMIT_1 && s.lives >= 2) s.lives = 1;
    if (s.idleSteps >= IDLE_LIMIT_2) {
      s.status = 'gameOver';
      s.missile = { ...s.missile, isBoosting: false };
    }
  }
  return s;
}

/** 当たり判定（MGW-TD-0002 §6 の 6、§6.3、§7）。s を書き換え、ミス・クリアを返す */
function checkHits(s: GameState, prevMissileY: number): 'miss' | 'kill' | 'clear' | null {
  const mBox = missileBox(s.missile);

  // 1. ミサイル × 隕石（発射前も）
  if (s.meteors.some((m) => overlaps(mBox, meteorBox(m)))) return 'miss';

  // 2. ミサイル × UFO。下から当たるので、下段を先に調べる。ミサイルは当たったところで消えるので、倒せるのは 1 機だけ
  const targets = s.ufos.filter((u) => u.isAlive).sort((a, b) => b.row - a.row || a.id - b.id);
  for (const ufo of targets) {
    const hit = hitPart(mBox, ufo);
    if (!hit) continue;
    const points = killPoints(hit.part, hit.points, s.killCount);
    s.ufos = s.ufos.map((u) => (u.id === ufo.id ? { ...u, isAlive: false } : u));
    Object.assign(s, addScore(s, points));
    s.killCount += 1;
    s.idleSteps = 0;
    s.lastKill = { part: hit.part, points };
    if (s.killCount === s.ufos.length) return 'clear';
    s.killEffect = { x: ufo.x, y: ufo.y, points, steps: KILL_EFFECT_STEPS };
    return 'kill';
  }

  // 3. ミサイル・発射前の発射台 × 光線（弾いていないもの）
  const beams: Beam[] = [];
  for (let i = 0; i < s.beams.length; i++) {
    const beam = s.beams[i]!;
    const bBox = beamBox(beam);
    const onMissile = !beam.reflected && overlaps(bBox, mBox);
    const onLauncher = !beam.reflected && s.status === 'ready' && overlaps(bBox, launcherBox(s.launcherX));
    if (!onMissile && !onLauncher) {
      beams.push(beam);
    } else if (onMissile && canReflect(beam, s.missile, beam.y - beam.vy / STEPS_PER_SECOND, prevMissileY)) {
      beams.push({ ...beam, vy: -BEAM_SPEED, reflected: true });
    } else {
      // 当たった光線は消える
      s.beams = [...beams, ...s.beams.slice(i + 1)];
      return 'miss';
    }
  }
  s.beams = beams;
  return null;
}

/** ミスのとき（MGW-TD-0002 §6.1） */
function miss(s: GameState): void {
  s.lives -= 1;
  s.status = 'respawn';
  s.waitReason = 'miss';
  s.waitSteps = MISS_RESPAWN;
  s.flashSteps = FLASH_STEPS;
  s.explosion = { x: s.missile.x, y: s.missile.y, steps: EXPLOSION_STEPS };
}

/** UFO を倒したとき（MGW-TD-0002 §6.4）。ミサイルを消し、1 秒後に発射台を出す。残機は減らさない */
function kill(s: GameState): void {
  s.status = 'respawn';
  s.waitReason = 'kill';
  s.waitSteps = EXIT_RESPAWN;
  s.missile = { ...s.missile, isLaunched: false };
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
