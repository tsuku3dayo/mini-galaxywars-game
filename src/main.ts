// 起動（MGW-TD-0001）。画面とゲームを組み立てる
import './style.css';
import { displayHighScore, newGame, step } from './core/game';
import type { GameState, StepInput } from './core/types';
import { createDebugPanel, exposeDebug, isDebug, setData } from './app/debug';
import { createInputEngine } from './app/input';
import { watchLayout } from './app/layout';
import { createLoop } from './app/loop';
import { createStepStats } from './app/step-stats';
import { setupPwa } from './app/pwa';
import { watchRoute, type Screen } from './app/router';
import { createPlayOverlay } from './app/screens/play';
import { createRankingScreen } from './app/screens/ranking';
import { createTitleScreen } from './app/screens/title';
import { createUpdateBanner } from './app/screens/update-banner';
import { createRenderer } from './render/canvas';

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
const input = createInputEngine(canvas);
const touch = matchMedia('(pointer: coarse)').matches;
setData('touch', String(touch));

// タイトル（MGW-GUI-0002）。「START」か Space で #/play へ
const start = () => {
  location.hash = '#/play';
};
const title = createTitleScreen(document.getElementById('screen-title')!, touch, start);
// ランキングの 1 位は MGW-TASK-0017 のあとで読む。それまでは 0
title.refresh(0);
createRankingScreen(document.getElementById('screen-ranking')!);
addEventListener('keydown', (e) => {
  if (screen === 'title' && e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    start();
  }
});
const overlay = createPlayOverlay(stage);
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

function runSteps(count: number, fixed?: StepInput): number {
  let done = 0;
  for (; done < count && state; done++) state = step(state, fixed ?? input.takeStepInput(state.status));
  return done;
}

/** 描いて、状態を body の data 属性に出す（MGW-TD-0004 §6.1） */
function draw(): void {
  renderer.draw(state, { mode: 'cellophane', showHud: true, tick: state?.stepCount ?? 0 });
  setData('status', state?.status ?? '');
  setData('score', state?.score ?? 0);
  setData('high', state ? displayHighScore(state) : 0);
  setData('lives', state?.lives ?? 0);
  overlay.update(state);
  panel?.update(stats, state?.status ?? '');
}

const loop = createLoop((steps, now) => {
  stats.frame(now, frozen ? 0 : runSteps(steps));
  draw();
});

watchLayout(app, stage, (layout) => {
  renderer.resize(layout.scale, devicePixelRatio || 1);
  draw();
});

setData('update', 'none');
watchRoute((next) => {
  screen = next;
  setData('screen', screen);
  banner.refresh(screen, updateWaiting);
  if (screen === 'play') {
    // ランキングの 1 位は MGW-TASK-0017 のあとで読む。それまでは 0
    state = newGame(0);
    input.reset();
    loop.start();
  } else {
    loop.stop();
    state = null;
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
