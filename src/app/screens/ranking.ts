// ランキング画面（MGW-GUI-0005）。いまは見出し・記録がないとき・TITLE だけ。一覧と書き出し・読み込みは MGW-WS-0006 で足す
export function createRankingScreen(root: HTMLElement): void {
  root.replaceChildren();

  const heading = document.createElement('h2');
  heading.textContent = 'RANKING';

  const empty = document.createElement('p');
  empty.textContent = 'まだ記録がありません';

  const back = document.createElement('a');
  back.className = 'button';
  back.href = '#/title';
  back.textContent = 'TITLE';

  root.append(heading, empty, back);
}
