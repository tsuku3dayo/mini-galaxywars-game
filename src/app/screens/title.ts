// タイトル画面（MGW-GUI-0002）。原作の表記はタイトル画面に出さず、README に書く（仕様書 v1.6、MGW-ADR-0007）
import { bake, UFO } from '../../render/sprites';

export interface TitleScreen {
  /** HIGH（ランキングの 1 位。記録がなければ 0）を出し直す */
  refresh(high: number): void;
}

const pad5 = (n: number) => String(n).padStart(5, '0');

export function createTitleScreen(
  root: HTMLElement,
  touch: boolean,
  onStart: () => void,
  onSettings: () => void,
  onClearRanking: () => void,
): TitleScreen {
  root.replaceChildren();

  const high = document.createElement('p');
  high.className = 'title-high';

  const name = document.createElement('h1');
  name.className = 'app-name';
  name.textContent = '銀河戦争ミニ';

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

  // 小さめのボタン（MGW-GUI-0002 §1）。押したらフォーカスを外し、Space で始めてしまわないようにする
  const clearRanking = document.createElement('button');
  clearRanking.type = 'button';
  clearRanking.textContent = 'ランキング消去';
  clearRanking.addEventListener('click', () => {
    clearRanking.blur();
    onClearRanking();
  });
  const sub = document.createElement('div');
  sub.className = 'title-sub';
  sub.append(clearRanking);

  const guide = document.createElement('p');
  guide.className = 'title-guide';
  guide.textContent = touch ? 'なぞって移動 タップで発射' : '←→/マウスで移動 SPACEで発射';

  root.append(high, name, ufos, menu, sub, guide);

  return {
    refresh(value) {
      high.textContent = `HIGH ${pad5(value)}`;
    },
  };
}
