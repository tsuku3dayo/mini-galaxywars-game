// タイトル画面（MGW-GUI-0002）。原作の表記はタイトル画面に出さず、README に書く（仕様書 v1.6、MGW-ADR-0007）
import { pad5 } from '../../render/hud';
import { createScoreGuide } from '../../render/score-guide';

export interface TitleScreen {
  /** HIGH（ランキングの 1 位。記録がなければ 0）を出し直す */
  refresh(high: number): void;
  /** 効果音のボタンを置く場所（MGW-GUI-0002 §1。CREDITS の下に、同じ大きさで並べる） */
  soundSlot: HTMLElement;
}

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

  // 版（仕様書 v1.11、MGW-TD-0004 §2.1）。HIGH と同じ行の右端。ビルドで package.json の version を埋め込む
  const version = document.createElement('p');
  version.className = 'title-version';
  version.textContent = `v${__APP_VERSION__}`;
  version.setAttribute('aria-label', `バージョン ${__APP_VERSION__}`);

  // 中身は、枠に収まらない小さい画面では枠の中でスクロールする（仕様書 v1.8、MGW-TD-0004 §2.1）
  const scroll = document.createElement('div');
  scroll.className = 'title-scroll';

  const name = document.createElement('h1');
  name.className = 'app-name';
  name.textContent = '銀河戦争ミニ';

  // 点数の説明（UFO から線で 50・100・150）と 600 点のヒント（MGW-GUI-0002 §1）
  const guideBox = document.createElement('div');
  guideBox.className = 'title-score';
  const bonus = document.createElement('p');
  bonus.className = 'score-bonus';
  bonus.textContent = '4 機目の突起は 600';
  guideBox.append(createScoreGuide(), bonus);

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

  const credits = document.createElement('a');
  credits.className = 'button';
  credits.href = '#/credits';
  credits.textContent = 'CREDITS';

  // START・RANKING・SETTINGS・CREDITS・効果音は同じ大きさ（効果音のボタンは main.ts が soundSlot に足す）
  const menu = document.createElement('div');
  menu.className = 'title-menu';
  menu.append(start, ranking, settings, credits);

  const guide = document.createElement('p');
  guide.className = 'title-guide';
  guide.textContent = touch ? 'なぞって移動 タップで発射' : '←→/マウスで移動 SPACEで発射';

  // 小さめのボタン。操作の案内の下に置く。押したらフォーカスを外し、Space で始めてしまわないようにする
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

  scroll.append(name, guideBox, menu, guide, sub);
  root.append(high, version, scroll);

  return {
    refresh(value) {
      high.textContent = `HIGH ${pad5(value)}`;
      scroll.scrollTop = 0;
    },
    soundSlot: menu,
  };
}
