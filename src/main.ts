// 起動（MGW-TD-0001）。画面とゲームを組み立てる
import './style.css';
import { displayHighScore, newGame, step, togglePause } from './core/game';
import type { GameState, StepInput } from './core/types';
import { createDebugPanel, exposeDebug, isDebug, newSeed, setData } from './app/debug';
import { createInputEngine } from './app/input';
import { watchLayout } from './app/layout';
import { createLoop } from './app/loop';
import { createStepStats } from './app/step-stats';
import { setupPwa } from './app/pwa';
import { watchRoute, type Screen } from './app/router';
import { createEntryOverlay } from './app/screens/entry';
import { createPauseButton, createPlayOverlay } from './app/screens/play';
import { createRankingScreen } from './app/screens/ranking';
import { createSettingsOverlay } from './app/screens/settings';
import { createClearRankingOverlay } from './app/screens/clear-ranking';
import { createCreditsScreen } from './app/screens/credits';
import { createSoundToggle } from './app/sound-toggle';
import { createRankingStore, type RankingResult } from './storage/ranking-store';
import { createSettingsStore } from './storage/settings-store';
import { createTitleScreen } from './app/screens/title';
import { createUpdateBanner } from './app/screens/update-banner';
import { createRenderer } from './render/canvas';
import { createSynthesizer } from './audio/synthesizer';
import { planSounds, type SoundCommand } from './core/sound-plan';

declare global {
  interface Window {
    /** public/boot.js が用意する。起動を知らせる */
    __mgwBooted?: () => void;
  }
}

const app = document.getElementById('app')!;
const stage = document.getElementById('stage')!;
const canvas = document.getElementById('game') as HTMLCanvasElement;
let screen: Screen = 'title';
let updateWaiting = false;
let state: GameState | null = null;
let frozen = false;

const renderer = createRenderer(canvas);
// 音（MGW-TD-0005）
const synth = createSynthesizer();
/** 音を有効にする（MGW-TD-0004 §7）。iPhone ではタッチ・クリック・キーの中で呼ばないと有効にならない */
const unlockAudio = () => {
  if (synth.state() !== 'suspended') return;
  void synth.unlock().then(() => setData('audio', synth.state()));
};
setData('audio', synth.state());
// プレイ中に触れたとき・キーを押したときも、止まっていれば有効にし直す（iPhone で裏に回したあとなど）
for (const type of ['pointerdown', 'keydown'] as const) {
  addEventListener(type, () => {
    if (screen === 'play') unlockAudio();
  });
}
const control = document.getElementById('control-area')!;
// 操作空間とゲーム画面のどちらでも操作できる（MGW-GUI-0003 §3）
const input = createInputEngine(canvas, [control]);
const touch = matchMedia('(pointer: coarse)').matches;
setData('touch', String(touch));

// タイトル（MGW-GUI-0002）。「START」か Space で #/play へ
const start = () => {
  // 「START」の click・Space の中で音を有効にする（MGW-GUI-0002 §2）
  unlockAudio();
  location.hash = '#/play';
};
// 設定（表示方式。MGW-GUI-0006、MGW-TD-0006 §2）。タイトルの上に重ねる
const settingsStore = createSettingsStore(localStorage);
const savedSettings = settingsStore.load();
let displayMode = savedSettings.displayMode;
setData('displayMode', displayMode);
// 効果音のオン・オフ（MGW-TD-0005・0006）。オフで始めても、音の準備（unlock）はしておく
synth.setEnabled(savedSettings.sound);
const settings = createSettingsOverlay(
  stage,
  (mode) => {
    displayMode = mode;
    try {
      settingsStore.save({ displayMode: mode });
    } catch {
      // 保存できなくても、今回は選んだ方式で描く
    }
    setData('displayMode', mode);
  },
  () => setData('overlay', 'none'),
);
// ランキング（MGW-TD-0006）
const ranking = createRankingStore(localStorage, () => new Date());
const topScore = () => ranking.load()[0]?.score ?? 0;
const rankingScreen = createRankingScreen(document.getElementById('screen-ranking')!, ranking);
// クレジット（MGW-GUI-0008）。中身は変わらないので、一度だけ作る
createCreditsScreen(document.getElementById('screen-credits')!);
// ランキング消去の確認（MGW-GUI-0002 §2）。タイトルの上に重ねる
const clearRanking = createClearRankingOverlay(
  stage,
  () => {
    try {
      ranking.clearAll();
    } catch {
      // 保存できなくても、画面は出し直す
    }
    title.refresh(topScore());
  },
  () => setData('overlay', 'none'),
);
const title = createTitleScreen(
  document.getElementById('screen-title')!,
  touch,
  start,
  () => {
    settings.show(displayMode);
    setData('overlay', 'settings');
  },
  () => {
    clearRanking.show(ranking.load().length > 0);
    setData('overlay', 'clear-ranking');
  },
);
/** 名前の入力欄で打っているときは、ゲームのキー（Space・P など）として扱わない */
const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement;
addEventListener('keydown', (e) => {
  if (typing(e)) return;
  // 設定・消去の確認を開いている間は、Space で始めない
  if (screen === 'title' && !settings.isOpen() && !clearRanking.isOpen() && e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    start();
  }
});
// 一時停止（MGW-GUI-0003 §4）。Pause・RESUME・P・Esc、タブが隠れたとき
const toggle = () => {
  if (!state) return;
  const next = togglePause(state);
  // 止めたら噴射音も止め、再開して噴射していればまた鳴らす
  synth.play(planSounds(state, next));
  state = next;
  // 押していたキー・指を忘れる（再開したとたんに噴射し続けないように）
  input.reset();
  draw();
};
const playButtons = document.getElementById('play-buttons')!;
createPauseButton(playButtons, toggle);
// 効果音のボタン：タイトル画面とボタンの段の右（MGW-GUI-0002・0003）。押してもゲームは止めない
createSoundToggle([title.soundSlot, playButtons], savedSettings.sound, (on) => {
  try {
    settingsStore.save({ sound: on });
  } catch {
    // 保存できなくても、今回は選んだとおりにする
  }
  synth.setEnabled(on);
  // ボタンの click の中で音を有効にしておく（iPhone。MGW-TD-0004 §7）
  unlockAudio();
});
// ランキング登録（MGW-GUI-0004）。終わって 3 秒たち、上位 10 件に入るときに重ねて出す
let entryScore = 0;
let entryResult: RankingResult = 'gameOver';
/** 登録した記録の順位。ランキング画面で目立たせる（MGW-TD-0004 §1） */
let mine: number | null = null;
const entry = createEntryOverlay(stage, {
  onSubmit(name) {
    try {
      mine = ranking.add(entryScore, name, entryResult);
    } catch {
      // 保存できなくても（容量・設定など）、ランキング画面へは進む
    }
    location.hash = '#/ranking';
  },
  onSkip() {
    location.hash = '#/title';
  },
});
const overlay = createPlayOverlay(stage, document.getElementById('standby-hint')!, touch, toggle, (score) => {
  const rank = ranking.rankOf(score);
  if (rank === null) return false;
  entryScore = score;
  entryResult = state?.status === 'cleared' ? 'clear' : 'gameOver';
  entry.show(rank, score);
  return true;
});
addEventListener('keydown', (e) => {
  if (typing(e)) return;
  if (screen === 'play' && (e.code === 'KeyP' || e.code === 'Escape') && !e.repeat) {
    e.preventDefault();
    toggle();
  }
});
document.addEventListener('visibilitychange', () => {
  const s = state?.status;
  if (document.visibilityState === 'hidden' && (s === 'ready' || s === 'playing' || s === 'respawn' || s === 'standby')) toggle();
});
const stats = createStepStats();
const panel = isDebug ? createDebugPanel(stage) : null;

const updater = setupPwa(() => {
  updateWaiting = true;
  setData('update', 'waiting');
  banner.refresh(screen, updateWaiting);
});

const banner = createUpdateBanner(stage, () => {
  if (isDebug && !updater.isWaiting()) {
    // simulateUpdate のときは読み込み直さず、押されたことだけを残す（MGW-TD-0004 §6.2）
    setData('update', 'applied');
    return;
  }
  updater.apply();
});

/** ステップを進め、ステップごとに決めた音をまとめて鳴らす（MGW-TD-0001 §2） */
function runSteps(count: number, fixed?: StepInput): number {
  let done = 0;
  const sounds: SoundCommand[] = [];
  for (; done < count && state; done++) {
    const next = step(state, fixed ?? input.takeStepInput(state.status));
    sounds.push(...planSounds(state, next));
    state = next;
  }
  if (sounds.length > 0) synth.play(sounds);
  return done;
}

/** 描いて、状態を body の data 属性に出す（MGW-TD-0004 §6.1） */
function draw(): void {
  renderer.draw(state, { mode: displayMode, showHud: true, tick: state?.stepCount ?? 0 });
  setData('status', state?.status ?? '');
  setData('score', state?.score ?? 0);
  setData('high', state ? displayHighScore(state) : 0);
  setData('lives', state?.lives ?? 0);
  setData('audio', synth.state());
  overlay.update(state);
  if (settings.isOpen()) setData('overlay', 'settings');
  if (clearRanking.isOpen()) setData('overlay', 'clear-ranking');
  panel?.update(stats, state?.status ?? '');
}

const loop = createLoop((steps, now) => {
  stats.frame(now, frozen ? 0 : runSteps(steps));
  draw();
});

watchLayout(app, stage, control, playButtons, touch, (layout) => {
  renderer.resize(layout.scale, devicePixelRatio || 1);
  draw();
});

setData('update', 'none');
watchRoute((next) => {
  screen = next;
  setData('screen', screen);
  banner.refresh(screen, updateWaiting);
  entry.hide();
  settings.hide();
  clearRanking.hide();
  if (screen === 'play') {
    // HIGH はランキングの 1 位から始める。隕石の初めの並びは、ゲームごとに決める種で変える（MGW-TD-0004 §1）
    const seed = newSeed();
    state = newGame(topScore(), seed);
    setData('seed', seed);
    input.reset();
    loop.start();
  } else {
    loop.stop();
    synth.stopAll();
    state = null;
    setData('seed', '');
    if (screen === 'title') title.refresh(topScore());
    if (screen === 'ranking') rankingScreen.refresh(mine);
    mine = null;
  }
  draw();
});

// 画面を出したので、boot.js の復旧のタイマーを止める（MGW-TD-0007 §3）
window.__mgwBooted?.();

exposeDebug({
  simulateUpdate() {
    updateWaiting = true;
    setData('update', 'waiting');
    banner.refresh(screen, updateWaiting);
  },
  getState: () => (state ? structuredClone(state) : null),
  setState(patch) {
    if (state) state = { ...state, ...patch };
    draw();
  },
  freeze(on) {
    frozen = on;
  },
  advance(steps, fixed) {
    runSteps(steps, { dir: 0, targetX: null, launch: false, boost: false, ...fixed });
    draw();
  },
});
