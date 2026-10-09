import type { Point } from '../../geometry';
import type { Kit } from '../paint/kit';
import { OUTLINE, type PathFn } from '../paint/painter';
import { pick, type BeastState } from './beast';
import { paintTube, tube } from './tube';

const VEINS = 7;
const HALO = 6;

// Nerves trail from the back of the eye like roots, swaying as it floats.
function nerves(kit: Kit, ball: Point, tail: Point, r: number, f: number, t: number): void {
  for (let i = 0; i < 3; i += 1) {
    const spread = (i - 1) * 0.5;
    const joints = [
      { x: ball.x - f * r * 0.7, y: ball.y + r * spread * 0.4 },
      { x: ball.x - f * r * 1.4, y: ball.y + r * (0.3 + spread) + Math.sin(t * 2 + i) * r * 0.15 },
      { x: tail.x - f * r * 0.3 * i, y: tail.y + r * spread + Math.sin(t * 2.5 + i) * r * 0.25 },
    ];
    const line = tube(joints, (u) => r * 0.16 * (1 - u * 0.8), { x: 0, y: 1 });

    paintTube(kit, line, kit.shade('a'), r * 0.2);
  }
}

function veins(kit: Kit, r: number): void {
  const { ctx } = kit.p;

  ctx.strokeStyle = 'rgba(200,40,40,0.55)';
  ctx.lineWidth = Math.max(0.5, r * 0.03);
  for (let i = 0; i < VEINS; i += 1) {
    const a = (i / VEINS) * Math.PI * 2 + 0.3;
    const x0 = Math.cos(a) * r * 0.97;
    const y0 = Math.sin(a) * r * 0.97;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(
      x0 * 0.75 + Math.sin(a * 3) * r * 0.1,
      y0 * 0.75,
      x0 * 0.55,
      y0 * 0.55 + r * 0.05,
    );
    ctx.stroke();
  }
}

// The iris in rings, its colour drifting through the rainbow on an eye that makes you see things.
function iris(kit: Kit, r: number, t: number, dazzling: boolean): void {
  const { p } = kit;
  const color = dazzling ? `hsl(${(t * 70) % 360} 90% 60%)` : kit.lit('e');
  const look = r * 0.12;

  p.glow(look + r * 0.4, 0, r * 0.8, color, 0.4);
  for (const [k, alpha] of [
    [0.55, 1],
    [0.42, 0.55],
    [0.3, 0.35],
  ] as const) {
    p.ctx.globalAlpha *= alpha;
    p.dot(look + r * 0.32, 0, r * k, color);
    p.ctx.globalAlpha /= alpha;
  }
  p.ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  p.ctx.lineWidth = Math.max(0.5, r * 0.02);
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;

    p.ctx.beginPath();
    p.ctx.moveTo(look + r * 0.32 + Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
    p.ctx.lineTo(look + r * 0.32 + Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52);
    p.ctx.stroke();
  }
  p.ctx.fillStyle = OUTLINE;
  p.ctx.beginPath();
  p.ctx.ellipse(
    look + r * 0.32,
    0,
    r * (0.09 + 0.05 * Math.sin(t * 1.3)),
    r * 0.38,
    0,
    0,
    Math.PI * 2,
  );
  p.ctx.fill();
  p.dot(look + r * 0.2, -r * 0.2, r * 0.08, '#ffffff');
}

// A lid over the top (side -1) or bottom (side 1) of the ball, its edge as far in as `open` says.
function lid(kit: Kit, r: number, open: number, side: number): void {
  const { p } = kit;
  const edge = side * (1 - open * 1.6) * r;
  const mid = side * (1 - open * 1.2) * r;
  const path: PathFn = (ox, oy) => {
    const c = p.ctx;

    c.moveTo(ox - 1.05 * r, oy);
    c.quadraticCurveTo(ox - 1.05 * r, oy + side * 1.25 * r, ox, oy + side * 1.2 * r);
    c.quadraticCurveTo(ox + 1.05 * r, oy + side * 1.25 * r, ox + 1.05 * r, oy + edge);
    c.quadraticCurveTo(ox, oy + mid, ox - 1.05 * r, oy);
    c.closePath();
  };

  p.cel(path, kit.shade('a'), r);
}

// Heavy lids close in a blink now and then, and never quite open all the way.
function lids(kit: Kit, r: number, t: number): void {
  const blink = (t * 0.45) % 5 < 0.15 ? 1 : 0;

  lid(kit, r, 0.35 + blink * 0.65, -1);
  lid(kit, r, 0.2 + blink * 0.5, 1);
}

function halo(kit: Kit, ball: Point, r: number, t: number): void {
  for (let i = 0; i < HALO; i += 1) {
    const a = t * 0.6 + (i / HALO) * Math.PI * 2;
    const x = ball.x + Math.cos(a) * r * 1.9;
    const y = ball.y + Math.sin(a) * r * 1.3;
    const size = r * 0.22;

    kit.p.glow(x, y, size * 2.2, `hsl(${(t * 70 + i * 60) % 360} 90% 60%)`, 0.45);
    kit.p.cel(kit.p.circle(x, y, size), kit.shade('h'), size);
    kit.p.dot(
      x + Math.cos(a + Math.PI) * size * 0.3,
      y,
      size * 0.45,
      `hsl(${(t * 70 + i * 60) % 360} 90% 55%)`,
    );
    kit.p.dot(x + Math.cos(a + Math.PI) * size * 0.3, y, size * 0.2, OUTLINE);
  }
}

// A floating eye: nerves trailing behind, red veins across a white ball, a ringed iris with a
// slit pupil, and heavy lids. One that makes you hallucinate wears a halo of smaller eyes.
export function paintEye(kit: Kit, state: BeastState, P: readonly Point[]): void {
  const { p } = kit;
  const s = state.scale;
  const f = state.facing;
  const r = 9 * s;
  const ball = pick(P, 0);
  const t = kit.t;
  const dazzling = state.look.marks !== undefined;

  nerves(kit, ball, pick(P, 3), r, f, t);
  if (dazzling) halo(kit, ball, r, t);
  p.ctx.save();
  p.ctx.translate(ball.x, ball.y);
  p.ctx.scale(f, 1);
  p.worldLight();
  p.cel(p.circle(0, 0, r), kit.shade('h'), r);
  veins(kit, r);
  if (p.mood === 'dead') {
    p.dot(r * 0.4, 0, r * 0.3, OUTLINE);
  } else iris(kit, r, t, dazzling);
  lids(kit, r, t);
  p.ctx.restore();
}
