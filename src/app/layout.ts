// 大きさの合わせ方・スクロールを 0 に戻す（MGW-TD-0004 §3、MGW-GUI-0001 §3・§4）
import { FIELD_HEIGHT, FIELD_WIDTH } from '../core/config';

export const TOP_BAR_H = 44;
export const CONTROL_AREA_H = 96;

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
}

/** 倍率 = min(使える幅 ÷ 480, 使える高さ ÷ (640 + 操作空間 96))。DOM に触れない */
export function computeLayout(p: { innerWidth: number; innerHeight: number; insets: Insets; touch: boolean }): Layout {
  const availW = Math.max(0, p.innerWidth - p.insets.left - p.insets.right);
  const availH = Math.max(0, p.innerHeight - p.insets.top - p.insets.bottom - TOP_BAR_H);
  const controlLogical = p.touch ? CONTROL_AREA_H : 0;
  const scale = Math.min(availW / FIELD_WIDTH, availH / (FIELD_HEIGHT + controlLogical));
  return { scale, stageW: FIELD_WIDTH * scale, stageH: FIELD_HEIGHT * scale, controlH: controlLogical * scale };
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
 * 画面の大きさに合わせて #stage と操作空間（タッチ端末だけ）の大きさを決め、変わるたびに onLayout を呼ぶ。
 * スクロールしたら 0 に戻す
 */
export function watchLayout(
  app: HTMLElement,
  stage: HTMLElement,
  control: HTMLElement,
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
  apply();
}
