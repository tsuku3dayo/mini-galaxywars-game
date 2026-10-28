// タイトル画面（MGW-GUI-0002）
import { bake, UFO } from '../../render/sprites';

export interface TitleScreen {
  /** HIGH（ランキングの 1 位。記録がなければ 0）を出し直す */
  refresh(high: number): void;
}

const pad5 = (n: number) => String(n).padStart(5, '0');

export function createTitleScreen(root: HTMLElement, touch: boolean, onStart: () => void, onSettings: () => void): TitleScreen {
  root.replaceChildren();

  const high = document.createElement('p');
  high.className = 'title-high';

  const name = document.createElement('h1');
  name.className = 'app-name';
  name.textContent = 'ギャラクシーウォーズミニ';

  // 飾りの UFO 3 機（ドット絵をそのまま拡大）
  const ufos = document.createElement('div');
  ufos.className = 'title-ufos';
  ufos.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++) ufos.append(bake(UFO));

  const start = document.createElement('button');
  start.type = 'button';
  start.textContent = 'START';
  start.addEventListener('click', onStart);

  const ranking = document.createElement('a');
  ranking.className = 'button';
  ranking.href = '#/ranking';
  ranking.textContent = 'RANKING';

  const settings = document.createElement('button');
  settings.type = 'button';
  settings.textContent = 'SETTINGS';
  settings.addEventListener('click', onSettings);

  const menu = document.createElement('div');
  menu.className = 'title-menu';
  menu.append(start, ranking, settings);

  const guide = document.createElement('p');
  guide.className = 'title-guide';
  guide.textContent = touch ? 'なぞって移動 タップで発射' : '←→/マウスで移動 SPACEで発射';

  const credit = document.createElement('p');
  credit.className = 'title-credit';
  credit.append('原作 1979 ユニバーサル／タイトー', document.createElement('br'), '非公式の再現作品');

  root.append(high, name, ufos, menu, guide, credit);

  return {
    refresh(value) {
      high.textContent = `HIGH ${pad5(value)}`;
    },
  };
}
