// ハッシュルーティング（MGW-TD-0004 §1）。画面の中身は WS-0002 以降で足す
export type Screen = 'title' | 'play' | 'ranking';

export function screenOf(hash: string): Screen {
  if (hash === '#/play') return 'play';
  if (hash === '#/ranking') return 'ranking';
  return 'title';
}

export function watchRoute(onChange: (screen: Screen) => void): void {
  const apply = () => onChange(screenOf(location.hash));
  addEventListener('hashchange', apply);
  apply();
}
