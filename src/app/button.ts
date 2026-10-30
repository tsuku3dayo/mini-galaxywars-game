// 画面のボタン（MGW-TD-0004 §2）
import { icon } from './icons';

/**
 * 押したらすぐフォーカスを外すボタン。押したあとに枠が残ると、Space でもう一度押されてしまうため。
 * iconName があれば、文言の前に印を付ける
 */
export function button(label: string, onClick: () => void, iconName?: Parameters<typeof icon>[0]): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  if (iconName) b.prepend(icon(iconName));
  b.addEventListener('click', () => {
    onClick();
    b.blur();
  });
  return b;
}
