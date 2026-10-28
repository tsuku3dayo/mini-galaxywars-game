// 擬似カラーセロハンと被弾フラッシュ（MGW-TD-0003 §5）。描くものを決めるだけで、Canvas に触れない
import { FIELD_HEIGHT, FIELD_WIDTH } from '../core/config';

export type DisplayMode = 'cellophane' | 'pixel';

/** 全体に重ねる四角 1 枚。multiply は白い絵だけに色を乗せる（黒はそのまま黒） */
export interface Overlay {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  op: 'multiply' | 'source-over';
}

/** セロハンの帯（論理 y）。120–580 は重ねない（白のまま） */
export const CELLOPHANE_BANDS: readonly { y0: number; y1: number; color: string }[] = [
  { y0: 0, y1: 120, color: '#FF50D0' },
  { y0: 580, y1: FIELD_HEIGHT, color: '#50FF70' },
];

export const FLASH_COLOR = '#FF0000';

/** 絵と HUD のあとに、この順で重ねる：セロハンの帯（cellophane のとき）→ 被弾フラッシュ（どちらの方式でも） */
export function overlaysFor(mode: DisplayMode, flashSteps: number): Overlay[] {
  const out: Overlay[] = [];
  if (mode === 'cellophane') {
    for (const b of CELLOPHANE_BANDS) out.push({ x: 0, y: b.y0, w: FIELD_WIDTH, h: b.y1 - b.y0, color: b.color, op: 'multiply' });
  }
  if (flashSteps > 0) out.push({ x: 0, y: 0, w: FIELD_WIDTH, h: FIELD_HEIGHT, color: FLASH_COLOR, op: 'source-over' });
  return out;
}
