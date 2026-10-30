// ランキング登録（名前の入力。MGW-GUI-0004）。プレイ画面の上に重ねて出す
import { pad5 } from '../../render/hud';
import { DEFAULT_NAME, normalizeName } from '../../storage/ranking-store';

export interface EntryOverlay {
  /** 入る順位とスコアを出し、名前の入力欄を初めの値にする */
  show(rank: number, score: number): void;
  hide(): void;
  isOpen(): boolean;
}

/** 1ST・2ND・3RD・4TH〜10TH */
export function ordinal(rank: number): string {
  const suffix = rank === 1 ? 'ST' : rank === 2 ? 'ND' : rank === 3 ? 'RD' : 'TH';
  return `${rank}${suffix}`;
}

export function createEntryOverlay(
  root: HTMLElement,
  handlers: { onSubmit: (name: string) => void; onSkip: () => void },
): EntryOverlay {
  const section = document.createElement('section');
  section.id = 'overlay-entry';
  section.hidden = true;

  const heading = document.createElement('h2');
  heading.textContent = 'NEW RECORD!';
  const rankLine = document.createElement('p');
  rankLine.className = 'entry-rank';

  // 「登録」とキーボードの「完了」（Enter）で送る
  const form = document.createElement('form');
  form.className = 'entry-form';
  const label = document.createElement('label');
  label.htmlFor = 'entry-name';
  label.textContent = '名前を入れてください';
  // 日本語も入れられる（仕様書 v1.7）。maxLength は変換の途中で文字を切ってしまうので付けず、8 文字は normalizeName で守る
  const input = document.createElement('input');
  input.id = 'entry-name';
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocorrect', 'off');
  input.enterKeyHint = 'done';
  /** 日本語の変換の途中（確定する前）は文字を削らない */
  let composing = false;
  const fix = () => {
    const fixed = normalizeName(input.value);
    if (fixed !== input.value) input.value = fixed;
  };
  input.addEventListener('compositionstart', () => {
    composing = true;
  });
  input.addEventListener('compositionend', () => {
    composing = false;
    fix();
  });
  // 制御文字を取り除き、8 文字で切る
  input.addEventListener('input', (e) => {
    if (composing || (e as InputEvent).isComposing) return;
    fix();
  });
  // 触れたら全体を選び、打てば PLAYER を置き換えられるようにする
  input.addEventListener('focus', () => input.select());
  const hint = document.createElement('p');
  hint.className = 'entry-hint';
  hint.textContent = '8 文字まで（日本語も使えます）';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = '登録';
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.textContent = 'スキップ';
  skip.addEventListener('click', () => {
    input.blur();
    handlers.onSkip();
  });
  const buttons = document.createElement('div');
  buttons.className = 'entry-buttons';
  buttons.append(submit, skip);

  form.append(label, input, hint, buttons);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // 変換を確定する Enter では送らない
    if (composing) return;
    input.blur();
    handlers.onSubmit(input.value);
  });

  section.append(heading, rankLine, form);
  root.append(section);

  return {
    show(rank, score) {
      rankLine.textContent = `${ordinal(rank)}  ${pad5(score)}`;
      input.value = DEFAULT_NAME;
      section.hidden = false;
    },
    hide() {
      section.hidden = true;
    },
    isOpen: () => !section.hidden,
  };
}
