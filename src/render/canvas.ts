// 描く順番・倍率（MGW-TD-0003 §1・§2）。GameState を読むだけで、書き換えない
import { EXPLOSION_STEPS, FIELD_HEIGHT, FIELD_WIDTH, LAUNCHER_Y, MISSILE_H, UFO_W } from '../core/config';
import type { GameState } from '../core/types';
import { BACKFIRE, BEAM, bake, EXPLOSION, LAUNCHER, METEOR, MISSILE, UFO, type Sprite } from './sprites';

export interface View {
  mode: 'cellophane' | 'pixel';
  showHud: boolean;
  /** 光線の揺れ・炎の点滅に使う */
  tick: number;
}

export interface Renderer {
  resize(scale: number, dpr: number): void;
  draw(state: GameState | null, view: View): void;
}

interface Baked {
  sprite: Sprite;
  image: HTMLCanvasElement;
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const ctx = canvas.getContext('2d')!;
  const make = (sprite: Sprite): Baked => ({ sprite, image: bake(sprite) });
  const art = {
    ufo: make(UFO),
    missile: make(MISSILE),
    launcher: make(LAUNCHER),
    meteor: make(METEOR),
    beam: BEAM.map(make),
    backfire: make(BACKFIRE),
    explosion: EXPLOSION.map(make),
  };
  let pixelScale = 1;

  /** 中心 (x, y) に絵を置く。ドットの境目がそろうよう、左上を論理 1 px に丸める */
  const put = (b: Baked, x: number, y: number) => {
    ctx.drawImage(b.image, Math.round(x - b.sprite.w / 2), Math.round(y - b.sprite.h / 2));
  };

  return {
    resize(scale, dpr) {
      pixelScale = scale * dpr;
      canvas.width = Math.round(FIELD_WIDTH * pixelScale);
      canvas.height = Math.round(FIELD_HEIGHT * pixelScale);
    },

    draw(state, view) {
      ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = 'source-over';
      // 1. 黒で全体を塗る
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
      if (!state) return;

      // 2. 隕石 → 光線 → UFO → 発射台 → ミサイル → バックファイア → 爆発
      for (const m of state.meteors) put(art.meteor, m.x, m.y);
      const beamFrame = art.beam[Math.floor(view.tick / 8) % art.beam.length]!;
      for (const b of state.beams) put(beamFrame, b.x, b.y);
      for (const u of state.ufos) {
        if (!u.isAlive) continue;
        put(art.ufo, u.x, u.y);
        // 画面の端をまたぐときは、反対の端にも描く
        if (u.x < UFO_W / 2) put(art.ufo, u.x + FIELD_WIDTH, u.y);
        if (u.x > FIELD_WIDTH - UFO_W / 2) put(art.ufo, u.x - FIELD_WIDTH, u.y);
      }
      const onField = state.status === 'ready' || state.status === 'playing' || state.pausedFrom === 'ready' || state.pausedFrom === 'playing';
      if (onField) {
        put(art.launcher, state.launcherX, LAUNCHER_Y);
        put(art.missile, state.missile.x, state.missile.y);
        // 噴射中だけ、ミサイルの下に点滅する炎
        if (state.missile.isBoosting && Math.floor(view.tick / 4) % 2 === 0) {
          put(art.backfire, state.missile.x, state.missile.y + MISSILE_H / 2 + art.backfire.sprite.h / 2);
        }
      }
      if (state.explosion) {
        const frame = state.explosion.steps > EXPLOSION_STEPS / 2 ? 0 : 1;
        put(art.explosion[frame]!, state.explosion.x, state.explosion.y);
      }
      // 3. HUD は MGW-TASK-0011、4. 擬似カラー・5. 被弾フラッシュは MGW-TASK-0020 で足す
    },
  };
}
