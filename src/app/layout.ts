// 大きさの合わせ方・スクロールを 0 に戻す（MGW-TD-0004 §3、MGW-GUI-0001 §3・§4）
import { FIELD_HEIGHT, FIELD_WIDTH } from '../core/config';

/** まわりの余白（上下左右。CSS px） */
export const MARGIN = 8;
export const CONTROL_AREA_H = 96;
/** ボタンの段（一時停止・効果音）の論理の高さ（仕様書 v1.7。上のバーの代わり） */
export const BUTTONS_H = 64;
/** ボタンの段の高さの下限（CSS px）。小さい画面でも、ボタン（44 以上）が段からはみ出さないように */
export const BUTTONS_MIN_H = 48;

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Layout {
  scale: number;
  stageW: number;
  stageH: number;
  controlH: number;
  buttonsH: number;
}

/**
 * 倍率 = min(使える幅 ÷ 480, 使える高さ ÷ (640 + 操作空間 96 + ボタンの段 64))。PC は操作空間を足さない。
 * 使える広さは、安全領域とまわりの余白を引いたもの。ボタンの段が BUTTONS_MIN_H より低くなるときは、
 * 段を BUTTONS_MIN_H にして、残りの高さでゲーム画面と操作空間の倍率を決める。DOM に触れない
 */
export function computeLayout(p: { innerWidth: number; innerHeight: number; insets: Insets; touch: boolean }): Layout {
  const availW = Math.max(0, p.innerWidth - p.insets.left - p.insets.right - MARGIN * 2);
  const availH = Math.max(0, p.innerHeight - p.insets.top - p.insets.bottom - MARGIN * 2);
  const controlLogical = p.touch ? CONTROL_AREA_H : 0;
  let scale = Math.min(availW / FIELD_WIDTH, availH / (FIELD_HEIGHT + controlLogical + BUTTONS_H));
  let buttonsH = BUTTONS_H * scale;
  if (buttonsH < BUTTONS_MIN_H) {
    buttonsH = BUTTONS_MIN_H;
    scale = Math.max(0, Math.min(availW / FIELD_WIDTH, (availH - BUTTONS_MIN_H) / (FIELD_HEIGHT + controlLogical)));
  }
  return { scale, stageW: FIELD_WIDTH * scale, stageH: FIELD_HEIGHT * scale, controlH: controlLogical * scale, buttonsH };
}

/** #app の余白（env(safe-area-inset-*)）から安全領域を読む */
function readInsets(app: HTMLElement): Insets {
  const s = getComputedStyle(app);
  return {
    top: parseFloat(s.paddingTop) || 0,
    right: parseFloat(s.paddingRight) || 0,
    bottom: parseFloat(s.paddingBottom) || 0,
    left: parseFloat(s.paddingLeft) || 0,
  };
}

const typing = () => document.activeElement instanceof HTMLInputElement;

/**
 * 画面の大きさに合わせて #stage・操作空間（タッチ端末だけ）・ボタンの段の大きさを決め、変わるたびに onLayout を呼ぶ。
 * スクロールしたら 0 に戻す
 */
export function watchLayout(
  app: HTMLElement,
  stage: HTMLElement,
  control: HTMLElement,
  buttons: HTMLElement,
  touch: boolean,
  onLayout: (layout: Layout) => void,
): void {
  control.hidden = !touch;
  const apply = () => {
    if (typing()) return;
    const layout = computeLayout({ innerWidth, innerHeight, insets: readInsets(app), touch });
    stage.style.width = `${layout.stageW}px`;
    stage.style.height = `${layout.stageH}px`;
    control.style.width = `${layout.stageW}px`;
    control.style.height = `${layout.controlH}px`;
    buttons.style.width = `${layout.stageW}px`;
    buttons.style.height = `${layout.buttonsH}px`;
    onLayout(layout);
  };
  const resetScroll = () => {
    if (typing()) return;
    if (scrollX !== 0 || scrollY !== 0) scrollTo(0, 0);
  };
  // iPhone の Safari は user-scalable=no でも 2 本指で拡大できるので、拡大の動きを止める（MGW-GUI-0001 §4）
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  addEventListener('resize', apply);
  addEventListener('orientationchange', apply);
  addEventListener('scroll', resetScroll);
  visualViewport?.addEventListener('scroll', resetScroll);
  visualViewport?.addEventListener('resize', resetScroll);
  // 名前の入力のあと（キーボードが閉じたあと）に、大きさとスクロールを戻す（MGW-TD-0004 §3）
  document.addEventListener('focusout', () =>
    setTimeout(() => {
      apply();
      resetScroll();
    }, 0),
  );
  apply();
}
