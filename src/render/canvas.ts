// 描く順番・倍率（MGW-TD-0003 §1・§2）。GameState を読むだけで、書き換えない
import { EXPLOSION_STEPS, FIELD_HEIGHT, FIELD_WIDTH, KILL_EFFECT_STEPS, LAUNCHER_Y, MISSILE_H, UFO_W } from '../core/config';
import type { GameState } from '../core/types';
import { overlaysFor, type DisplayMode } from './color-palette';
import {
  GROUND_H,
  GROUND_Y,
  HUD_CHAR,
  HUD_LEFT,
  HUD_RIGHT,
  HUD_TEXT_Y,
  hudModel,
  LIFE_ICON_STEP,
  LIFE_ICON_Y,
  LIFE_ICONS_X,
  lifeModel,
  LIVES_X,
  LIVES_Y,
} from './hud';
import { killEffectView } from './kill-effect';
import { showsLauncher, showsMissile } from './view';
import {
  BACKFIRE,
  BEAM,
  bake,
  beamFrame,
  EXPLOSION,
  FONT,
  GLYPH_CELL,
  LAUNCHER,
  LIFE_ICON,
  METEOR,
  METEOR_TRAIL,
  meteorTrailX,
  MISSILE,
  type Sprite,
  UFO_FRAMES,
  ufoFrame,
} from './sprites';

export interface View {
  mode: DisplayMode;
  showHud: boolean;
  /** UFO・光線のコマ、炎の点滅に使う（ステップの数） */
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
    ufo: UFO_FRAMES.map(make),
    missile: make(MISSILE),
    launcher: make(LAUNCHER),
    meteor: make(METEOR),
    meteorTrail: make(METEOR_TRAIL),
    beam: BEAM.map(make),
    backfire: make(BACKFIRE),
    explosion: EXPLOSION.map(make),
    lifeIcon: make(LIFE_ICON),
  };
  const glyphs = new Map(Object.entries(FONT).map(([ch, rows]) => [ch, bake({ w: rows[0]!.length, h: rows.length, rows })]));
  let pixelScale = 1;

  /** HUD の文字（5 × 7 のドット文字を 2 倍。1 文字 16 × 16） */
  const text = (s: string, x: number, y: number) => {
    const scale = HUD_CHAR / GLYPH_CELL;
    [...s].forEach((ch, i) => {
      const glyph = glyphs.get(ch);
      if (glyph) ctx.drawImage(glyph, x + i * HUD_CHAR, y, glyph.width * scale, glyph.height * scale);
    });
  };

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

      // 2. 隕石（尾つき）→ 光線（2 コマ）→ UFO（2 コマ）→ 発射台（発射前だけ）→ ミサイル → バックファイア → 爆発 → UFO を倒したときの爆発・得点
      for (const m of state.meteors) {
        put(art.meteor, m.x, m.y);
        put(art.meteorTrail, meteorTrailX(m), m.y);
      }
      // 光線も UFO と同じ時にコマを切り替える
      const beamArt = art.beam[beamFrame(view.tick)]!;
      for (const b of state.beams) put(beamArt, b.x, b.y);
      // 8 機とも同じコマ（0.25 秒ごとに切り替える）
      const ufoArt = art.ufo[ufoFrame(view.tick)]!;
      for (const u of state.ufos) {
        if (!u.isAlive) continue;
        put(ufoArt, u.x, u.y);
        // 画面の端をまたぐときは、反対の端にも描く
        if (u.x < UFO_W / 2) put(ufoArt, u.x + FIELD_WIDTH, u.y);
        if (u.x > FIELD_WIDTH - UFO_W / 2) put(ufoArt, u.x - FIELD_WIDTH, u.y);
      }
      if (showsLauncher(state)) put(art.launcher, state.launcherX, LAUNCHER_Y);
      if (showsMissile(state)) {
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
      const effect = killEffectView(state.killEffect);
      if (effect?.kind === 'explosion') {
        // 倒してからの前半・後半で 2 枚を切り替える
        const elapsed = KILL_EFFECT_STEPS - state.killEffect!.steps;
        put(art.explosion[elapsed < EXPLOSION_STEPS / 2 ? 0 : 1]!, effect.x, effect.y);
      } else if (effect?.kind === 'points') {
        const label = String(effect.points);
        text(label, Math.round(effect.x - (label.length * HUD_CHAR) / 2), Math.round(effect.y - HUD_CHAR / 2));
      }
      // 3. 地面と左下の残機（数と控えの発射台のアイコン）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, GROUND_Y, FIELD_WIDTH, GROUND_H);
      if (view.showHud) {
        const lives = lifeModel(state.lives);
        text(lives.count, LIVES_X, LIVES_Y);
        for (let i = 0; i < lives.icons; i++) ctx.drawImage(art.lifeIcon.image, LIFE_ICONS_X + i * LIFE_ICON_STEP, LIFE_ICON_Y);
      }
      // 4. HUD（SCORE・HIGH）
      if (view.showHud) {
        const hud = hudModel(state);
        text(hud.score, HUD_LEFT, HUD_TEXT_Y);
        text(hud.high, HUD_RIGHT - hud.high.length * HUD_CHAR, HUD_TEXT_Y);
      }
      // 5. 擬似カラー・6. 被弾フラッシュ
      for (const o of overlaysFor(view.mode, state.flashSteps)) {
        ctx.globalCompositeOperation = o.op;
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.w, o.h);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
