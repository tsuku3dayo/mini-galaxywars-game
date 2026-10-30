// 効果音のボタン（MGW-TD-0004 §2、MGW-GUI-0002・0003）。タイトル画面とボタンの段の 2 か所に置き、同じ設定を見る
import { setData } from './debug';
import { icon } from './icons';

/** ボタンの文言 */
export const soundLabel = (on: boolean) => (on ? '効果音：オン' : '効果音：オフ');

/**
 * places のそれぞれに効果音のボタンを置く。押すたびに切り替え、onChange で保存・音に伝える。
 * 押したらフォーカスを外し、ゲームの入力（発射・移動）にしない
 */
export function createSoundToggle(places: HTMLElement[], initial: boolean, onChange: (on: boolean) => void): void {
  let on = initial;
  const buttons = places.map((place) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sound-toggle';
    // ゲーム画面・操作空間の入力に届かないように
    b.addEventListener('pointerdown', (e) => e.stopPropagation());
    b.addEventListener('click', () => {
      on = !on;
      render();
      onChange(on);
      b.blur();
    });
    place.append(b);
    return b;
  });
  const render = () => {
    for (const b of buttons) {
      b.replaceChildren(icon(on ? 'soundOn' : 'soundOff'), soundLabel(on));
      b.setAttribute('aria-pressed', String(on));
    }
    setData('sound', on ? 'on' : 'off');
  };
  render();
}
