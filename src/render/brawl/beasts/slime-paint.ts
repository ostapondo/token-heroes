import type { Point } from '../../geometry';
import { darken } from '../paint/colors';
import type { Kit } from '../paint/kit';
import { OUTLINE } from '../paint/painter';
import type { BeastState } from './beast';
import { extent, rimPath } from './blob-shape';

const BONE = ['#efe6d4', '#a89a84'] as const;
const STEEL = ['#dfe6ee', '#7d8794'] as const;
const GOLD = ['#f2c14e', '#9a6a14'] as const;

// What a slime has swallowed, floating in it: a skull, a sword, a bone and a few coins.
function insides(kit: Kit, cx: number, cy: number, w: number, h: number, t: number): void {
  const { p } = kit;
  const bob = Math.sin(t * 1.5) * h * 0.03;

  p.ctx.save();
  p.ctx.globalAlpha *= 0.55;
  p.ctx.translate(cx - w * 0.18, cy + h * 0.12 + bob);
  p.ctx.rotate(0.5);
  p.cel(p.bar(-w * 0.22, w * 0.18, 0, h * 0.035), STEEL, h * 0.04);
  p.cel(p.bar(-w * 0.27, -w * 0.21, 0, h * 0.07), GOLD, h * 0.05);
  p.ctx.restore();
  p.ctx.save();
  p.ctx.globalAlpha *= 0.6;
  p.cel(p.ellipse(cx + w * 0.16, cy + h * 0.18 - bob, w * 0.09, h * 0.1), BONE, w * 0.09);
  p.ctx.fillStyle = OUTLINE;
  for (const dx of [-0.035, 0.035])
    p.dot(cx + w * (0.16 + dx), cy + h * 0.17 - bob, w * 0.025, OUTLINE);
  p.cel(p.bar(cx - w * 0.05, cx + w * 0.08, cy + h * 0.33, h * 0.025), BONE, h * 0.03);
  for (const [dx, dy] of [
    [0.02, 0.28],
    [0.3, 0.05],
    [-0.32, 0.22],
  ] as const)
    p.cel(p.ellipse(cx + w * dx, cy + h * dy + bob, w * 0.035, h * 0.025), GOLD, w * 0.03);
  p.ctx.restore();
}

function bubbles(kit: Kit, cx: number, cy: number, w: number, h: number, t: number): void {
  const { ctx } = kit.p;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = Math.max(0.5, w * 0.008);
  for (let i = 0; i < 7; i += 1) {
    const rise = (t * 0.25 + i * 0.37) % 1;
    const x = cx + w * (((i * 0.29) % 0.7) - 0.35) + Math.sin(t * 2 + i) * w * 0.02;
    const y = cy + h * (0.4 - rise * 0.75);

    ctx.globalAlpha = Math.sin(rise * Math.PI);
    ctx.beginPath();
    ctx.arc(x, y, w * (0.012 + (i % 3) * 0.008), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function face(
  kit: Kit,
  cx: number,
  cy: number,
  w: number,
  h: number,
  f: number,
  open: number,
): void {
  const { p } = kit;
  const look = f * w * 0.025;

  for (const dx of [0.02, 0.24]) {
    const x = cx + f * w * dx;
    const y = cy - h * 0.12;

    p.cel(p.ellipse(x, y, w * 0.075, h * 0.1), ['#f8f3e6', '#c9c0ad'], w * 0.07);
    p.dot(x + look, y + h * 0.015, w * 0.04, OUTLINE);
    p.dot(x + look - w * 0.012, y - h * 0.01, w * 0.012, '#ffffff');
    p.segment(
      x - w * 0.07,
      y - h * 0.15 + (dx > 0.1 ? h * 0.03 : 0),
      x + w * 0.07,
      y - h * 0.12 - (dx > 0.1 ? 0 : h * 0.03),
      Math.max(0.8, w * 0.02),
      darken(kit.lit('a'), 0.4),
    );
  }
  const mx = cx + f * w * 0.13;
  const my = cy + h * 0.06;

  p.ctx.fillStyle = '#3a0c10';
  p.ctx.beginPath();
  p.ctx.ellipse(mx, my, w * 0.12, h * (0.03 + open * 0.09), 0, 0, Math.PI);
  p.ctx.fill();
  p.ctx.strokeStyle = OUTLINE;
  p.ctx.lineWidth = Math.max(0.8, w * 0.012);
  p.ctx.stroke();
}

function crown(
  kit: Kit,
  cx: number,
  top: number,
  w: number,
  paint: Parameters<Kit['shade']>[0],
): void {
  const { p } = kit;
  const s = w * 0.11;
  const points = [-1.6, 0, -1.8, -1.6, -0.9, -0.7, 0, -2, 0.9, -0.7, 1.8, -1.6, 1.6, 0];

  p.ctx.save();
  p.ctx.translate(cx + s * 0.6, top + s * 0.5);
  p.ctx.rotate(0.12);
  p.cel(p.polygon(...points.map((v) => v * s)), kit.shade(paint), s * 1.4);
  p.cel(p.bar(-1.65 * s, 1.65 * s, 0, s * 0.3), kit.shade(paint), s * 0.4);
  for (const [x, y] of [
    [-1.8, -1.6],
    [0, -2],
    [1.8, -1.6],
  ] as const)
    p.cel(p.circle(x * s, y * s, s * 0.22), kit.shade(paint), s * 0.2);
  for (const [x, color] of [
    [-0.9, '#d8432e'],
    [0, '#5fb0ff'],
    [0.9, '#7cc35b'],
  ] as const)
    p.dot(x * s, 0, s * 0.18, color);
  p.ctx.restore();
}

// A slime: a jelly you can see into, what it has eaten floating inside, bubbles rising, a gloss
// on top and drips off its sides, angry eyes, and a crown if it rules its kind.
export function paintSlime(kit: Kit, state: BeastState, P: readonly Point[]): void {
  const { p } = kit;
  const { cx, cy, w, h } = extent(P);
  const rim = rimPath(p, P);
  const t = kit.t;
  const body = kit.shade('a');

  for (const dx of [-0.36, 0.3]) {
    const drip = (Math.sin(t * 1.3 + dx * 9) + 1) * 0.5;

    p.cel(
      p.ellipse(cx + w * dx, cy + h * 0.42 + drip * h * 0.06, w * 0.035, h * (0.05 + drip * 0.05)),
      body,
      w * 0.04,
    );
  }
  p.worldLight();
  p.cel(rim, body, Math.max(w, h) * 0.5);
  p.ctx.save();
  p.ctx.beginPath();
  rim(0, 0);
  p.ctx.clip();
  const depth = p.ctx.createRadialGradient(cx - w * 0.15, cy - h * 0.2, w * 0.05, cx, cy, w * 0.6);

  depth.addColorStop(0, 'rgba(255,255,255,0.25)');
  depth.addColorStop(1, 'rgba(0,0,0,0.25)');
  p.ctx.fillStyle = depth;
  p.ctx.fillRect(cx - w, cy - h, w * 2, h * 2);
  insides(kit, cx, cy, w, h, t);
  bubbles(kit, cx, cy, w, h, t);
  p.ctx.restore();
  p.ctx.fillStyle = 'rgba(255,255,255,0.45)';
  p.ctx.beginPath();
  p.ctx.ellipse(
    cx - state.facing * w * 0.22,
    cy - h * 0.3,
    w * 0.12,
    h * 0.06,
    -0.5 * state.facing,
    0,
    Math.PI * 2,
  );
  p.ctx.fill();
  face(kit, cx, cy, w, h, state.facing, Math.max(0, state.strike));
  if (state.look.crown) crown(kit, cx, cy - h * 0.5, w, state.look.crown);
}
