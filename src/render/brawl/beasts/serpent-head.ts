import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';
import { OUTLINE } from '../paint/painter';

// The head in its own frame, in units of r: the snout points along +x, the skull's back sits at
// -1. Curves are "cx,cy,x,y".
const SKULL = [
  '-1,-0.15 -0.75,-0.7,-0.05,-0.62 0.35,-0.58,0.62,-0.42 1.2,-0.36,1.72,-0.12',
  '1.95,0,1.74,0.16 0.2,0.2 -0.6,0.34 -1.02,0.18',
].join(' ');
const JAW = '-0.55,0.24 1.5,0.17 1.66,0.36,1.25,0.42 -0.4,0.56';
const MOUTH = '-0.5,0.24 1.55,0.16 1.3,0.5 -0.4,0.5';
const HORN = '0.1,-0.56 -0.55,-0.95,-1.25,-1.02 -0.45,-0.7,-0.25,-0.42';
const FANG_BACK = '0.9,0.17 0.98,0.62 1.06,0.17';
const FANG_FRONT = '1.3,0.15 1.4,0.66 1.48,0.13';
const FINS = [
  '-0.7,-0.2 -1.55,-0.55 -1.05,0.02',
  '-0.75,0.05 -1.7,0.08 -1.0,0.28',
  '-0.65,0.28 -1.45,0.6 -0.85,0.42',
] as const;

// A glowing ring, two of them side by side make the loop the Infinite Loop is named for.
export function rune(
  kit: Kit,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
): void {
  const { p } = kit;

  p.glow(x, y, r * 2.4, color, 0.45 * alpha);
  p.ctx.save();
  p.ctx.globalAlpha *= alpha;
  p.ctx.strokeStyle = color;
  p.ctx.lineWidth = Math.max(0.8, r * 0.34);
  p.ctx.beginPath();
  p.ctx.ellipse(x - r * 0.62, y, r * 0.62, r * 0.42, 0, 0, Math.PI * 2);
  p.ctx.moveTo(x + r * 1.24, y);
  p.ctx.ellipse(x + r * 0.62, y, r * 0.62, r * 0.42, 0, 0, Math.PI * 2);
  p.ctx.stroke();
  p.ctx.restore();
}

// A sea serpent's head: fins fanned behind the skull, a horn off the brow, slit eyes that glow,
// and a jaw that drops to bare the fangs as it strikes.
export function paintSnakeHead(kit: Kit, r: number, open: number, t: number): void {
  const { p } = kit;

  for (const fin of FINS) p.cel(p.shape(fin, r), kit.shade('b'), r * 0.6);
  if (open > 0.05) {
    p.ctx.beginPath();
    p.shape(MOUTH, r)(0, 0);
    p.ctx.fillStyle = '#4a0c10';
    p.ctx.fill();
  }
  p.ctx.save();
  p.ctx.translate(-0.55 * r, 0.24 * r);
  p.ctx.rotate(open);
  p.ctx.translate(0.55 * r, -0.24 * r);
  p.cel(p.shape(JAW, r), kit.shade('c'), r * 0.5);
  p.ctx.restore();
  p.cel(p.shape(FANG_BACK, r), kit.shade('h'), r * 0.2);
  p.cel(p.shape(FANG_FRONT, r), kit.shade('h'), r * 0.2);
  p.cel(p.shape(SKULL, r), kit.shade('a'), r * 1.2);
  p.cel(p.shape(HORN, r), kit.shade('h'), r * 0.4);
  p.segment(-0.05 * r, -0.5 * r, 0.62 * r, -0.4 * r, Math.max(0.8, r * 0.12), kit.shade('b')[1]);
  for (const [x, y] of [
    [0.9, -0.28],
    [1.15, -0.24],
    [-0.4, -0.35],
  ] as const)
    p.dot(x * r, y * r, r * 0.06, kit.shade('b')[1]);
  eye(kit, 0.36 * r, -0.26 * r, r * 0.17, kit.lit('e'));
  if (p.mood !== 'dead') {
    p.ctx.fillStyle = OUTLINE;
    p.ctx.fillRect(0.36 * r - r * 0.035, -0.26 * r - r * 0.13, r * 0.07, r * 0.26);
  }
  p.dot(1.6 * r, -0.1 * r, Math.max(0.6, r * 0.05), OUTLINE);
  if ((t * 1.3) % 1 < 0.22 && open < 0.1) {
    p.polyline(
      Math.max(0.6, r * 0.07),
      '#d8432e',
      1.85 * r,
      0.1 * r,
      2.35 * r,
      0.14 * r,
      2.55 * r,
      0,
      2.35 * r,
      0.14 * r,
      2.55 * r,
      0.26 * r,
    );
  }
}
