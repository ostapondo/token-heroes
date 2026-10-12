import type { Point } from '../../geometry';
import { darken } from '../paint/colors';
import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';
import { pick, type BeastState } from './beast';
import { paintLantern, paintScythe } from './wraith-gear';

const TEETH = 7;

// The cloak from the hood's peak down its back, along a ragged hem that trails and flutters,
// and up its front to the chin.
function cloak(head: Point, core: Point, tail: Point, R: number, f: number, t: number): number[] {
  const back = -f;
  const front = { x: core.x + f * R * 0.75, y: core.y + R * 1.7 };
  const points = [
    head.x + back * R * 0.15,
    head.y - R * 1.15,
    head.x + back * R * 0.95,
    head.y - R * 0.1,
    core.x + back * R * 1.15,
    core.y - R * 0.2,
    tail.x + back * R * 0.2,
    tail.y,
  ];

  for (let i = 1; i <= TEETH; i += 1) {
    const k = i / (TEETH + 1);
    const x = tail.x + (front.x - tail.x) * k;
    const y = tail.y + (front.y - tail.y) * k;
    const flutter = Math.sin(t * 6 + i * 1.7) * R * 0.12;

    points.push(x + back * R * 0.08, y + (i % 2 ? R * 0.42 : -R * 0.08) + flutter);
  }
  points.push(
    front.x,
    front.y,
    core.x + f * R * 0.95,
    core.y + R * 0.1,
    head.x + f * R * 0.75,
    head.y + R * 0.55,
  );

  return points;
}

function wisps(kit: Kit, tail: Point, front: Point, R: number, t: number): void {
  for (let i = 0; i < 4; i += 1) {
    const k = (i + 0.5) / 4;
    const x = tail.x + (front.x - tail.x) * k;
    const y = tail.y + (front.y - tail.y) * k + R * 0.5 + Math.sin(t * 5 + i * 2) * R * 0.15;

    kit.p.glow(x, y, R * 0.55, kit.lit('e'), 0.35 + 0.15 * Math.sin(t * 7 + i));
  }
}

// Letters of a stolen context drift glowing across the cloak.
function glyphs(kit: Kit, core: Point, R: number, f: number, color: string, t: number): void {
  const { ctx } = kit.p;
  const text = '{ctx}<·>';

  ctx.save();
  ctx.font = `${Math.round(R * 0.32)}px monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  for (let i = 0; i < text.length; i += 1) {
    const x = core.x - f * R * (0.9 - i * 0.22);
    const y = core.y + R * (0.3 + Math.sin(i * 1.3 + t * 2) * 0.25 + (i % 3) * 0.25);

    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 3 + i);
    ctx.fillText(text[i] ?? '', x, y);
  }
  ctx.restore();
}

function hood(kit: Kit, head: Point, R: number, f: number, t: number): void {
  const { p } = kit;

  p.worldLight();
  p.cel(
    p.ellipse(head.x + f * R * 0.25, head.y + R * 0.05, R * 0.5, R * 0.58, f * 0.2),
    [kit.lit('x'), darken(kit.lit('x'), 0.5)],
    R * 0.4,
  );
  const glow = 0.8 + 0.2 * Math.sin(t * 4);

  p.glow(head.x + f * R * 0.3, head.y, R * 0.8, kit.lit('e'), 0.5 * glow);
  eye(kit, head.x + f * R * 0.12, head.y - R * 0.02, R * 0.09, kit.lit('e'));
  eye(kit, head.x + f * R * 0.45, head.y, R * 0.08, kit.lit('e'));
}

function hand(kit: Kit, at: Point, R: number, f: number): void {
  const { p } = kit;

  for (let i = 0; i < 4; i += 1) {
    const x = at.x + f * R * 0.05 * (i - 1);

    p.segment(
      x,
      at.y,
      x + f * R * 0.12,
      at.y + R * (0.2 + i * 0.03),
      Math.max(0.6, R * 0.05),
      kit.lit('h'),
    );
  }
  p.cel(p.circle(at.x, at.y, R * 0.12), kit.shade('h'), R * 0.1);
}

// A reaper: a hood over darkness and two burning eyes, a cloak with a ragged hem that never
// touches the floor, chains at the waist, and a bony hand on a scythe.
export function paintWraith(kit: Kit, state: BeastState, P: readonly Point[]): void {
  const { p } = kit;
  const s = state.scale;
  const f = state.facing;
  const R = 9 * s;
  const head = pick(P, 0);
  const core = pick(P, 1);
  const tail = pick(P, 3);
  const grip = pick(P, 4);
  const t = kit.t;
  const robe = kit.shade('b');

  wisps(kit, tail, { x: core.x + f * R * 0.75, y: core.y + R * 1.7 }, R, t);
  paintScythe(kit, grip, R, f, state.strike);
  p.worldLight();
  p.cel(p.polygon(...cloak(head, core, tail, R, f, t)), robe, R * 1.5);
  for (const k of [-0.4, 0.1, 0.55]) {
    p.segment(
      core.x + f * R * k,
      core.y - R * 0.1,
      core.x + f * R * (k - 0.25),
      core.y + R * 1.3,
      Math.max(0.6, R * 0.06),
      darken(robe[1], 0.75),
    );
  }
  if (state.look.marks) glyphs(kit, core, R, f, kit.lit(state.look.marks), t);
  for (let i = 0; i < 4; i += 1) {
    p.ctx.strokeStyle = kit.lit('h');
    p.ctx.lineWidth = Math.max(0.6, R * 0.05);
    p.ctx.beginPath();
    p.ctx.ellipse(
      core.x + f * R * (0.5 - i * 0.12),
      core.y + R * (0.55 + i * 0.16),
      R * 0.08,
      R * 0.05,
      0.6,
      0,
      Math.PI * 2,
    );
    p.ctx.stroke();
  }
  if (state.look.lantern)
    paintLantern(
      kit,
      { x: core.x + f * R * 0.15, y: core.y + R * 1.25 },
      R,
      kit.lit(state.look.lantern),
      t,
    );
  hood(kit, head, R, f, t);
  p.bone({ x: core.x + f * R * 0.6, y: core.y - R * 0.15 }, grip, [R * 0.3, R * 0.2], robe, f);
  hand(kit, grip, R, f);
}
