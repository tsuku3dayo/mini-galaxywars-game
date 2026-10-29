// 型（MGW-TD-0002 §3。仕様書 §17 を元にする）

export type GameStatus = 'ready' | 'playing' | 'respawn' | 'standby' | 'paused' | 'cleared' | 'gameOver';
// respawn：ミスのあと・最上部を抜けたあと・UFO を倒したあとの待ち（仕様書 §7 の「2 秒」「1 秒」）
// standby：出撃待ち（respawn のあと。タップで ready へ。仕様書 v1.7）

export type UfoPart = 'body' | 'bottom' | 'prong'; // 側面・上部 / 下部中央 / 突起

export interface Missile {
  x: number;
  y: number;
  isLaunched: boolean;
  isBoosting: boolean;
}

export interface UFO {
  id: number;
  x: number;
  y: number;
  row: 0 | 1;
  isAlive: boolean;
}

export interface Meteor {
  pos: number;
  x: number;
  y: number;
  lane: number;
  direction: 1 | -1;
}

export interface Beam {
  x: number;
  y: number;
  vy: number;
  reflected: boolean;
}

export interface GameState {
  status: GameStatus;
  pausedFrom: 'ready' | 'playing' | 'respawn' | 'standby' | null;
  stepCount: number;
  score: number;
  /** 始めたときのランキング 1 位。表示は max(highScore, score) */
  highScore: number;
  /** 画面に出ている発射台を含む */
  lives: number;
  extended: boolean;
  launcherX: number;
  missile: Missile;
  ufos: UFO[];
  killCount: number;
  meteors: Meteor[];
  beams: Beam[];
  /** 次の光線までのステップ */
  beamTimer: number;
  /** 永久パターン防止のタイマー */
  idleSteps: number;
  /** respawn の残り */
  waitSteps: number;
  waitReason: 'miss' | 'exit' | 'kill' | null;
  flashSteps: number;
  explosion: { x: number; y: number; steps: number } | null;
  lastKill: { part: UfoPart; points: number } | null;
  /** 倒した UFO の位置の爆発と得点（MGW-TD-0002 §6.4）。steps は残り */
  killEffect: { x: number; y: number; points: number; steps: number } | null;
  /** 時間ボーナスの経過時間。ステップの始まりが playing のときだけ 1 足す（仕様書 v1.9 §6.4） */
  playSteps: number;
  /** クリアしたときの時間ボーナス（それまでは 0。MGW-TD-0002 §7.3） */
  timeBonus: number;
}

export interface StepInput {
  /** キー（←→・A D） */
  dir: -1 | 0 | 1;
  /** 指・マウスの x（なければ null） */
  targetX: number | null;
  /** このステップでタップした（ready なら発射、standby なら出撃。その瞬間だけ true） */
  launch: boolean;
  /** 加速噴射を続けている */
  boost: boolean;
}
