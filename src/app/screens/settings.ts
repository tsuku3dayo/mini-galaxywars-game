// 設定（表示方式。MGW-GUI-0006 §1）。タイトル画面の上に重ねて出す
import type { DisplayModeSetting } from '../../storage/settings-store';

export interface SettingsOverlay {
  /** 今の方式に印を付けて出す */
  show(mode: DisplayModeSetting): void;
  hide(): void;
  isOpen(): boolean;
}

const CHOICES: { value: DisplayModeSetting; label: string }[] = [
  { value: 'cellophane', label: '擬似カラーセロハン' },
  { value: 'pixel', label: 'ピクセルパーフェクト' },
];

export function createSettingsOverlay(root: HTMLElement, onChange: (mode: DisplayModeSetting) => void, onClose: () => void): SettingsOverlay {
  const section = document.createElement('section');
  section.id = 'overlay-settings';
  section.hidden = true;

  const heading = document.createElement('h2');
  heading.textContent = 'SETTINGS';

  const group = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = '表示方式';
  group.append(legend);
  const radios = CHOICES.map(({ value, label }) => {
    const wrap = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'display-mode';
    radio.value = value;
    // 選ぶとすぐ保存する
    radio.addEventListener('change', () => {
      if (radio.checked) onChange(value);
    });
    wrap.append(radio, label);
    group.append(wrap);
    return radio;
  });

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '閉じる';
  close.addEventListener('click', () => {
    section.hidden = true;
    onClose();
  });

  section.append(heading, group, close);
  root.append(section);

  return {
    show(mode) {
      for (const r of radios) r.checked = r.value === mode;
      section.hidden = false;
    },
    hide() {
      section.hidden = true;
    },
    isOpen: () => !section.hidden,
  };
}
