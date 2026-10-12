import type { Point } from '../../geometry';
import { darken, farOf } from '../paint/colors';
import type { Kit } from '../paint/kit';
import { OUTLINE } from '../paint/painter';
import type { BeastState } from './beast';
import { extent, rimPath } from './blob-shape';
import { paintTube, tube } from './tube';

const EYES = 15;
const GOLDEN = 2.399963;
const MASK = ['#ffd84a', '#c99a1a'] as const;

// A tentacle from the mass's foot, curling out along the floor and back up at its tip.
function tentacle(
  kit: Kit,
  root: Point,
  out: number,
  length: number,
  width: number,
  t: number,
  phase: number,
  far: boolean,
): void {
  const joints: Point[] = [root];

  for (let i = 1; i <= 4; i += 1) {
    const k = i / 4;
    const curl = Math.sin(t * 1.6 + phase + k * 2.4) * length * 0.18 * k;

    joints.push({
      x: root.x + out * length * k,
      y: root.y + length * 0.12 * Math.sin(k * Math.PI) - curl - k * k * length * 0.25,
    });
  }
  const line = tube(joints, (u) => width * (1 - u * 0.85), { x: 0, y: 1 });

  paintTube(kit, line, far ? farOf(kit.shade('b')) : kit.shade('b'), width);
  for (let i = 3; i < line.length - 3; i += 3) {
    const each = line[i];

    if (each)
      kit.p.dot(
        each.x + each.nx * each.r * 0.4,
        each.y + each.ny * each.r * 0.4,
        each.r * 0.25,
        kit.lit('c'),
      );
  }
}

function eyes(kit: Kit, cx: number, cy: number, w: number, h: number, t: number): void {
  const { p } = kit;

  for (let i = 0; i < EYES; i += 1) {
    const reach = Math.sqrt((i + 0.5) / EYES) * 0.42;
    const angle = i * GOLDEN;
    const x = cx + Math.cos(angle) * w * reach;
    const y = cy - h * 0.05 + Math.sin(angle) * h * reach * 0.85;
    const r = w * (0.022 + ((i * 7) % 5) * 0.009);
    const blink = (t * 0.6 + i * 0.37) % 4 < 0.12;

    p.cel(p.circle(x, y, r * 1.25), kit.shade('a'), r);
    if (blink) {
      p.segment(x - r, y, x + r, y, Math.max(0.6, r * 0.25), OUTLINE);
      continue;
    }
    p.dot(x, y, r, '#f2ecd8');
    p.glow(x, y, r * 2, kit.lit('e'), 0.3);
    p.dot(x + Math.sin(t + i) * r * 0.2, y, r * 0.6, kit.lit('e'));
    p.dot(x + Math.sin(t + i) * r * 0.2, y, r * 0.28, OUTLINE);
  }
}

function mouth(kit: Kit, x: number, y: number, w: number, open: number): void {
  const { p } = kit;
  const h = w * (0.18 + open * 0.35);

  p.ctx.fillStyle = '#2a0608';
  p.ctx.beginPath();
  p.ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  p.ctx.fill();
  p.ctx.strokeStyle = OUTLINE;
  p.ctx.lineWidth = Math.max(0.8, w * 0.06);
  p.ctx.stroke();
  p.ctx.fillStyle = '#efe6d4';
  p.ctx.beginPath();
  for (let k = -0.8; k <= 0.8; k += 0.32) {
    p.ctx.moveTo(x + k * w - w * 0.1, y - h * 0.85);
    p.ctx.lineTo(x + k * w, y - h * 0.35);
    p.ctx.lineTo(x + k * w + w * 0.1, y - h * 0.85);
    p.ctx.moveTo(x + k * w - w * 0.1, y + h * 0.85);
    p.ctx.lineTo(x + k * w, y + h * 0.35);
    p.ctx.lineTo(x + k * w + w * 0.1, y + h * 0.85);
  }
  p.ctx.fill();
}

// The little smiling mask it wears over a sliver of itself, tied on with a strap.
function mask(kit: Kit, x: number, y: number, r: number, tilt: number): void {
  const { p } = kit;

  p.segment(
    x - r * 1.6,
    y - r * 0.2,
    x + r * 1.6,
    y - r * 0.4,
    Math.max(0.8, r * 0.12),
    darken(kit.lit('b'), 0.6),
  );
  p.ctx.save();
  p.ctx.translate(x, y);
  p.ctx.rotate(tilt);
  p.worldLight();
  p.cel(p.circle(0, 0, r), MASK, r);
  for (const dx of [-0.35, 0.35])
    p.cel(p.ellipse(dx * r, -0.2 * r, r * 0.1, r * 0.18), [OUTLINE, OUTLINE], r * 0.1);
  p.ctx.strokeStyle = OUTLINE;
  p.ctx.lineWidth = Math.max(0.8, r * 0.1);
  p.ctx.lineCap = 'round';
  p.ctx.beginPath();
  p.ctx.arc(0, 0.05 * r, r * 0.5, 0.35, Math.PI - 0.35);
  p.ctx.stroke();
  p.ctx.restore();
}

// A shoggoth: a heaving mass of eyes and mouths on a nest of tentacles, wearing a small smiling
// mask as if that made it friendly.
export function paintShoggoth(kit: Kit, state: BeastState, P: readonly Point[]): void {
  const { p } = kit;
  const { cx, cy, w, h } = extent(P);
  const t = kit.t;
  const f = state.facing;
  const foot = cy + h * 0.42;
  const reach = w * 0.55;

  for (const [out, phase] of [
    [-1, 0],
    [1, 1.3],
    [-0.6, 2.2],
  ] as const)
    tentacle(kit, { x: cx + out * w * 0.25, y: foot }, out, reach, w * 0.06, t, phase, true);
  for (let i = 0; i < 6; i += 1) {
    const a = -Math.PI * 0.95 + (i * Math.PI * 0.9) / 5;

    p.worldLight();
    p.cel(
      p.circle(
        cx + Math.cos(a) * w * 0.44,
        cy + Math.sin(a) * h * 0.42,
        w * (0.09 + (i % 3) * 0.025),
      ),
      kit.shade('a'),
      w * 0.1,
    );
  }
  p.cel(rimPath(p, P), kit.shade('a'), Math.max(w, h) * 0.5);
  eyes(kit, cx, cy, w, h, t);
  mouth(kit, cx - f * w * 0.18, cy + h * 0.22, w * 0.12, 0);
  mouth(kit, cx + f * w * 0.2, cy + h * 0.12, w * 0.16, Math.max(0, state.strike));
  for (const [out, phase] of [
    [1, 0.6],
    [0.55, 3.1],
    [-0.9, 4.2],
  ] as const)
    tentacle(
      kit,
      { x: cx + out * w * 0.3, y: foot },
      out * f,
      reach * 0.9,
      w * 0.07,
      t,
      phase,
      false,
    );
  mask(kit, cx + f * w * 0.12, cy - h * 0.18, w * 0.13, -0.15 * f + Math.sin(t * 1.2) * 0.05);
}
