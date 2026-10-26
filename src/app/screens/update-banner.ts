// 更新の案内（MGW-GUI-0007 §1）。新しい版が待っていて、画面がタイトルかランキングのときだけ出す
import type { Screen } from '../router';

export interface UpdateBanner {
  /** 状態が変わったら呼ぶ */
  refresh(screen: Screen, waiting: boolean): void;
}

export function createUpdateBanner(root: HTMLElement, onApply: () => void): UpdateBanner {
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.hidden = true;
  const text = document.createElement('span');
  text.textContent = '新しい版があります';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '更新';
  button.addEventListener('click', onApply);
  banner.append(text, button);
  root.append(banner);
  return {
    refresh(screen, waiting) {
      banner.hidden = !(waiting && screen !== 'play');
    },
  };
}
