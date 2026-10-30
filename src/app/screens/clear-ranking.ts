// ランキング消去の確認（MGW-GUI-0002 §2。仕様書 v1.7）。タイトル画面の上に重ねて出す
import { button } from '../button';

export interface ClearRankingOverlay {
  /** 記録があれば確認を、なければ「記録がありません」を出す */
  show(hasRecords: boolean): void;
  hide(): void;
  isOpen(): boolean;
}

export function createClearRankingOverlay(root: HTMLElement, onClear: () => void, onClose: () => void): ClearRankingOverlay {
  const section = document.createElement('section');
  section.id = 'overlay-clear';
  section.setAttribute('role', 'dialog');
  section.hidden = true;

  const question = document.createElement('p');
  question.append('ランキングをすべて消します。', document.createElement('br'), '元に戻せません。よろしいですか？');
  const none = document.createElement('p');
  none.textContent = '記録がありません';

  const close = () => {
    section.hidden = true;
    onClose();
  };
  const clear = button('消す', () => {
    onClear();
    close();
  });
  const cancel = button('やめる', close);
  const ok = button('閉じる', close);
  const buttons = document.createElement('div');
  buttons.className = 'ranking-buttons';
  buttons.append(clear, cancel, ok);

  section.append(question, none, buttons);
  root.append(section);

  return {
    show(hasRecords) {
      question.hidden = !hasRecords;
      clear.hidden = !hasRecords;
      cancel.hidden = !hasRecords;
      none.hidden = hasRecords;
      ok.hidden = hasRecords;
      section.hidden = false;
    },
    hide() {
      section.hidden = true;
    },
    isOpen: () => !section.hidden,
  };
}
