// 画面の印（← ‖ スピーカー ⤓ ⤒ ✓ ✕）。インラインの SVG で描く（MGW-GUI-0001 §5.1。Web フォント・画像のファイルは使わない）
const SVG_NS = 'http://www.w3.org/2000/svg';

export type IconName = 'back' | 'pause' | 'download' | 'upload' | 'check' | 'cross' | 'soundOn' | 'soundOff';

/** 16 × 16 の中に描く線（stroke）と、塗る形（fill） */
const SHAPES: Record<IconName, { strokes?: string[]; fills?: string[]; circle?: boolean }> = {
  back: { strokes: ['M14 8H2', 'M7 3L2 8l5 5'] },
  pause: { fills: ['M4 2h2.5v12H4z', 'M9.5 2H12v12H9.5z'] },
  download: { strokes: ['M8 2v8', 'M4 7l4 4 4-4', 'M2 14h12'] },
  upload: { strokes: ['M8 11V3', 'M4 6l4-4 4 4', 'M2 14h12'] },
  check: { circle: true, strokes: ['M5 8.2l2 2 4-4.2'] },
  cross: { circle: true, strokes: ['M5.5 5.5l5 5', 'M10.5 5.5l-5 5'] },
  // スピーカーと音の波（オン）・×（オフ）
  soundOn: { fills: ['M2 6h3l4-3.5v11L5 10H2z'], strokes: ['M11 5.5a3.5 3.5 0 0 1 0 5', 'M12.8 3.5a6.3 6.3 0 0 1 0 9'] },
  soundOff: { fills: ['M2 6h3l4-3.5v11L5 10H2z'], strokes: ['M11 6l4 4', 'M15 6l-4 4'] },
};

export function icon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('icon');
  const shape = SHAPES[name];
  if (shape.circle) {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', '8');
    c.setAttribute('cy', '8');
    c.setAttribute('r', '6.5');
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', 'currentColor');
    c.setAttribute('stroke-width', '1.3');
    svg.append(c);
  }
  for (const d of shape.strokes ?? []) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.6');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.append(p);
  }
  for (const d of shape.fills ?? []) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'currentColor');
    svg.append(p);
  }
  return svg;
}
