// テスト用の入口とデバッグ表示（MGW-TD-0004 §6）
import type { GameState, StepInput } from '../core/types';
import type { StepStats } from './step-stats';

export type DataKey = 'screen' | 'overlay' | 'status' | 'score' | 'high' | 'lives' | 'displayMode' | 'touch' | 'update' | 'audio' | 'seed' | 'sound';

/** body の data 属性（いつも付ける） */
export function setData(key: DataKey, value: string | number): void {
  document.body.dataset[key] = String(value);
}

const params = new URLSearchParams(location.search);
export const isDebug = params.get('debug') === '1';

/**
 * ゲームを始めるときの種（MGW-TD-0004 §1）。?debug=1&seed=<整数> ならその値、
 * そうでなければ crypto.getRandomValues（使えなければ時刻）で決める
 */
export function newSeed(): number {
  const fixed = isDebug ? params.get('seed') : null;
  if (fixed !== null && /^\d+$/.test(fixed)) return Number(fixed) >>> 0;
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0]!;
  } catch {
    return Date.now() >>> 0;
  }
}

export interface DebugApi {
  simulateUpdate?: () => void;
  /** 今の GameState の写し（プレイ以外は null） */
  getState?: () => GameState | null;
  /** 今の状態に値を上書きする */
  setState?: (patch: Partial<GameState>) => void;
  /** ループを止める・動かす */
  freeze?: (on: boolean) => void;
  /** ループを止めたまま、決まった入力で steps だけ進めて描く */
  advance?: (steps: number, input?: Partial<StepInput>) => void;
}

/** `?debug=1` のときだけ window.__mgw に関数を足す */
export function exposeDebug(api: DebugApi): void {
  if (!isDebug) return;
  const w = window as unknown as { __mgw?: DebugApi };
  w.__mgw = { ...w.__mgw, ...api };
}

/** 画面の左下に fps・1 秒あたりのステップ数・状態を出す（MGW-GUI-0003 §5） */
export function createDebugPanel(root: HTMLElement): { update(stats: StepStats, status: string): void } {
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  root.append(panel);
  return {
    update(stats, status) {
      panel.textContent = `fps ${Math.round(stats.fps())}  steps/s ${stats.stepsPerSecond().toFixed(1)}  ${status || '-'}`;
    },
  };
}
