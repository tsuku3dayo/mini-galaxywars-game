// 発射台・ミサイルを描くかどうか（MGW-TD-0003 §2・§6）。Canvas に触れない
import type { GameState } from '../core/types';

/** 今の状態（一時停止中は止めた前の状態） */
const shown = (state: GameState) => (state.status === 'paused' ? state.pausedFrom : state.status);

/** 発射台は発射前だけ描く。発射したら消す（仕様書 v1.7。土台に当たるとミスだと思わせないため） */
export function showsLauncher(state: GameState): boolean {
  return shown(state) === 'ready';
}

/** ミサイルは発射前と上昇中に描く。待ち・出撃待ちの間は描かない */
export function showsMissile(state: GameState): boolean {
  const s = shown(state);
  return s === 'ready' || s === 'playing';
}
