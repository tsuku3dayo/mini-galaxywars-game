// クレジット画面（MGW-GUI-0008）。「ブロック崩しミニ」と同じ形の紺の画面：BACK とタイトル、役割と名前
import { icon } from '../icons';

/** 役割と名前（MGW-US-0033） */
export const CREDITS: readonly { role: string; name: string }[] = [
  { role: 'PRODUCER', name: 'つくだ よしはる' },
  { role: 'DIRECTOR', name: 'つくだ よしはる' },
  { role: 'GAME DESIGNER', name: 'つくだ よしはる' },
  { role: 'GRAPHIC DESIGNER', name: 'CLAUDE CODE' },
  { role: 'SOUND CREATOR', name: 'CLAUDE CODE' },
  { role: 'PROGRAMMER', name: 'CLAUDE CODE' },
];

export function createCreditsScreen(root: HTMLElement): void {
  root.replaceChildren();
  root.classList.add('navy');

  const header = document.createElement('header');
  header.className = 'navy-header credits-header';
  const back = document.createElement('a');
  back.className = 'back-button';
  back.href = '#/title';
  back.append(icon('back'), 'BACK');
  const heading = document.createElement('h2');
  heading.textContent = 'クレジット';
  header.append(back, heading);

  // 収まらないときは、枠の中でスクロールする
  const scroll = document.createElement('div');
  scroll.className = 'navy-scroll';
  const list = document.createElement('dl');
  list.className = 'credits-list';
  for (const { role, name } of CREDITS) {
    const dt = document.createElement('dt');
    dt.textContent = role;
    const dd = document.createElement('dd');
    dd.textContent = name;
    list.append(dt, dd);
  }
  scroll.append(list);
  root.append(header, scroll);
}
