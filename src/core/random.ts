// 種から作る擬似乱数と、隕石の初めの並び（MGW-TD-0002 §5・§10。仕様書 v1.7）。種は app が渡す
import { METEOR_COUNT, METEOR_MIN_GAP, METEOR_PATH_LENGTH } from './config';

/** mulberry32。呼ぶたびに 0 以上 1 未満の数を返す。同じ種なら、どの端末でも同じ数の列になる */
export function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 隕石の初めの道のりの位置。間の合計はちょうど 1 周で、どの間も METEOR_MIN_GAP 以上 */
export function meteorStartPositions(seed: number): number[] {
  const r = createRandom(seed);
  const base = r() * METEOR_PATH_LENGTH;
  const weights = Array.from({ length: METEOR_COUNT }, () => r() + 0.001);
  const total = weights.reduce((a, b) => a + b, 0);
  const free = METEOR_PATH_LENGTH - METEOR_COUNT * METEOR_MIN_GAP;
  const positions = [base];
  for (let k = 1; k < METEOR_COUNT; k++) {
    const gap = METEOR_MIN_GAP + (free * weights[k - 1]!) / total;
    positions.push((positions[k - 1]! + gap) % METEOR_PATH_LENGTH);
  }
  return positions;
}
