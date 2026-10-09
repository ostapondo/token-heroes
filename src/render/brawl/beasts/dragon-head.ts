import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';
import { OUTLINE } from '../paint/painter';

// A dragon's head in its own frame, in units of r: snout along +x. Curves are "cx,cy,x,y".
const SKULL = [
  '-0.95,-0.1 -0.8,-0.72,-0.1,-0.7 0.3,-0.72,0.55,-0.5 1.4,-0.45,2.05,-0.3',
  '2.3,-0.25,2.3,0 2.25,0.18 0.4,0.22 -0.55,0.42 -1,0.25',
].join(' ');
const JAW = '-0.6,0.22 2,0.2 2.08,0.42,1.6,0.5 0.2,0.52 -0.5,0.62';
const MOUTH = '-0.5,0.22 2.1,0.18 1.8,0.62 -0.4,0.55';
const HORN_NEAR = '-0.1,-0.62 -0.9,-1.2,-1.95,-1.45 -0.95,-0.85,-0.55,-0.3';
const HORN_FAR = '0.2,-0.66 -0.4,-1.3,-1.25,-1.75 -0.45,-1,-0.2,-0.45';
const BROW = '0.05,-0.72 0.7,-0.66 0.6,-0.45 0.1,-0.52';
const FRILL = [
  '-0.7,0.05 -1.55,-0.15 -0.95,0.3',
  '-0.65,0.32 -1.45,0.55 -0.75,0.5',
  '0.2,0.55 0.05,0.95 0.45,0.55',
] as const;

function teeth(kit: Kit, r: number, from: number, to: number, y: number, down: number): void {
  const { p } = kit;

  p.ctx.beginPath();
  for (let x = from; x < to; x += 0.24) {
    p.ctx.moveTo(x * r, y * r);
    p.ctx.lineTo((x + 0.07) * r, (y + down) * r);
    p.ctx.lineTo((x + 0.14) * r, y * r);
  }
  p.ctx.fillStyle = kit.lit('h');
  p.ctx.fill();
}

// Horns swept back, a frill of spines at the jaw, a brow over a glowing eye; the jaw drops on a
// strike and the throat glows with the fire behind it.
export function paintDragonHead(kit: Kit, r: number, open: number): void {
  const { p } = kit;

  p.cel(p.shape(HORN_FAR, r), kit.shade('b'), r * 0.4);
  for (const spike of FRILL) p.cel(p.shape(spike, r), kit.shade('b'), r * 0.5);
  if (open > 0.05) {
    p.ctx.beginPath();
    p.shape(MOUTH, r)(0, 0);
    p.ctx.fillStyle = '#3a0a06';
    p.ctx.fill();
    p.glow(1.1 * r, 0.4 * r, r * 1.6, kit.lit('e'), Math.min(1, open * 1.6));
  }
  p.ctx.save();
  p.ctx.translate(-0.6 * r, 0.22 * r);
  p.ctx.rotate(open);
  p.ctx.translate(0.6 * r, -0.22 * r);
  p.cel(p.shape(JAW, r), kit.shade('c'), r * 0.6);
  teeth(kit, r, 0.4, 1.9, 0.24, -0.16);
  p.ctx.restore();
  teeth(kit, r, 0.3, 2.0, 0.2, 0.18);
  p.cel(p.shape(SKULL, r), kit.shade('a'), r * 1.4);
  p.cel(p.shape(BROW, r), kit.shade('b'), r * 0.4);
  p.cel(p.shape(HORN_NEAR, r), kit.shade('h'), r * 0.5);
  for (const x of [0.9, 1.25, 1.6]) p.dot(x * r, -0.38 * r, r * 0.06, kit.shade('b')[1]);
  eye(kit, 0.42 * r, -0.36 * r, r * 0.16, kit.lit('e'));
  if (p.mood !== 'dead') {
    p.ctx.fillStyle = OUTLINE;
    p.ctx.fillRect(0.42 * r - r * 0.035, -0.36 * r - r * 0.12, r * 0.07, r * 0.24);
  }
  p.dot(2.05 * r, -0.12 * r, Math.max(0.6, r * 0.07), OUTLINE);
}
