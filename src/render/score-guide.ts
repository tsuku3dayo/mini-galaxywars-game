// タイトル画面の点数の説明（MGW-TD-0003 §7。仕様書 v1.8）。UFO を 2 倍で描き、部位から線を引いて得点を書く
import type { UfoPart } from '../core/types';
import { bake, FONT, GLYPH_CELL, UFO } from './sprites';

/** 論理の大きさ（描くときは GUIDE_PIXEL 倍の画素にする） */
export const GUIDE_W = 200;
export const GUIDE_H = 96;
const GUIDE_PIXEL = 2;
/** UFO の中心と倍率 */
export const GUIDE_UFO = { x: 52, y: 34, scale: 2 } as const;
/** 数字の倍率（ドットの文字 8 × 8 を 16 × 16 に） */
const DIGIT_SCALE = 2;
/** UFO の色（ゲームのセロハンの上の帯と同じ。MGW-TD-0003 §5） */
const UFO_COLOR = '#FF50D0';

export interface GuideLine {
  part: UfoPart;
  points: number;
  /** 線の始まり（部位の中）と終わり。論理座標 */
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** 数字の左上と大きさ */
  label: { text: string; x: number; y: number; w: number; h: number };
}

const label = (text: string, x: number, y: number) => ({ text, x, y, w: text.length * GLYPH_CELL * DIGIT_SCALE, h: GLYPH_CELL * DIGIT_SCALE });

/** 線と数字の場所（Canvas に触れない。単体テストで部位の中から引いていることを確かめる） */
export function scoreGuideModel(): GuideLine[] {
  return [
    // 側面・上部から右へ水平に
    { part: 'body', points: 50, from: { x: 82, y: 26 }, to: { x: 122, y: 26 }, label: label('50', 128, 18) },
    // 下部中央から右下へ斜めに
    { part: 'bottom', points: 100, from: { x: 62, y: 46 }, to: { x: 96, y: 70 }, label: label('100', 100, 64) },
    // 左の突起から真下へ
    { part: 'prong', points: 150, from: { x: 30, y: 56 }, to: { x: 30, y: 74 }, label: label('150', 6, 78) },
  ];
}

/** 論理座標を UFO の中心からの座標（UFO の 1 ドット単位）にする */
export function toUfoLocal(p: { x: number; y: number }): { x: number; y: number } {
  return { x: (p.x - GUIDE_UFO.x) / GUIDE_UFO.scale, y: (p.y - GUIDE_UFO.y) / GUIDE_UFO.scale };
}

/** 白いドット絵を色に染めた画像 */
function tinted(color: string): HTMLCanvasElement {
  const image = bake(UFO);
  const ctx = image.getContext('2d')!;
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, image.width, image.height);
  return image;
}

/** 点数の説明の Canvas を作って描く。表示の大きさは CSS で決める（ぼやけないよう image-rendering: pixelated） */
export function createScoreGuide(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = 'score-guide';
  canvas.width = GUIDE_W * GUIDE_PIXEL;
  canvas.height = GUIDE_H * GUIDE_PIXEL;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '点数：側面と上 50、下の中央 100、下の突起 150');
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(GUIDE_PIXEL, GUIDE_PIXEL);

  const ufo = tinted(UFO_COLOR);
  const w = ufo.width * GUIDE_UFO.scale;
  const h = ufo.height * GUIDE_UFO.scale;
  ctx.drawImage(ufo, GUIDE_UFO.x - w / 2, GUIDE_UFO.y - h / 2, w, h);

  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  for (const line of scoreGuideModel()) {
    ctx.beginPath();
    ctx.moveTo(line.from.x, line.from.y);
    ctx.lineTo(line.to.x, line.to.y);
    ctx.stroke();
    // 数字はゲーム画面と同じドットの文字
    [...line.label.text].forEach((ch, i) => {
      const glyph = FONT[ch];
      if (!glyph) return;
      const x0 = line.label.x + i * GLYPH_CELL * DIGIT_SCALE;
      glyph.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] === '#') ctx.fillRect(x0 + x * DIGIT_SCALE, line.label.y + y * DIGIT_SCALE, DIGIT_SCALE, DIGIT_SCALE);
        }
      });
    });
  }
  return canvas;
}
