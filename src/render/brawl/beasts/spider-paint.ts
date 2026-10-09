import type { Point } from '../../geometry';
import { farOf, type Shade } from '../paint/colors';
import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';
import { OUTLINE } from '../paint/painter';
import { pick, type BeastState } from './beast';
import { paintCircuit, paintNeedle } from './spider-gear';

const LEGS = 4;
// Each leg's knee joint; its foot follows it. The near legs come first.
const near = (i: number): number => 3 + i * 2;
const far = (i: number): number => 3 + (LEGS + i) * 2;
// The eight eyes in the head's frame, in head radii: two large in front, six small behind.
const EYES = [
  [0.55, -0.35, 0.2],
  [0.2, -0.5, 0.2],
  [0.75, -0.05, 0.1],
  [0.45, -0.68, 0.1],
  [-0.05, -0.7, 0.09],
  [0.9, -0.38, 0.08],
  [-0.25, -0.55, 0.08],
  [0.65, -0.62, 0.08],
] as const;

// A jointed leg: a thick femur up to the knee with a knob there, a thin shin down to a claw, a
// pale band near its end, and bristles along the femur.
function leg(
  kit: Kit,
  root: Point,
  knee: Point,
  foot: Point,
  width: number,
  facing: number,
  shade: Shade,
): void {
  const { p } = kit;

  p.bone(root, knee, [width * 1.25, width], shade, facing);
  p.bone(knee, foot, [width * 0.85, width * 0.35], shade, facing);
  p.worldLight();
  p.cel(p.circle(knee.x, knee.y, width * 1.05), shade, width);
  const band = { x: knee.x + (foot.x - knee.x) * 0.62, y: knee.y + (foot.y - knee.y) * 0.62 };
  const dx = foot.x - knee.x;
  const dy = foot.y - knee.y;
  const length = Math.hypot(dx, dy) || 1;

  p.segment(
    band.x - (dy / length) * width * 0.7,
    band.y + (dx / length) * width * 0.7,
    band.x + (dy / length) * width * 0.7,
    band.y - (dx / length) * width * 0.7,
    width * 0.45,
    kit.lit('c'),
  );
  for (let k = 0.25; k < 0.9; k += 0.2) {
    const x = root.x + (knee.x - root.x) * k;
    const y = root.y + (knee.y - root.y) * k;

    p.segment(x, y, x - width * 0.5, y - width * 1.4, Math.max(0.5, width * 0.18), OUTLINE);
  }
}

// The skull a broodmother carries on her back, in the abdomen's light colour.
function skull(kit: Kit, x: number, y: number, r: number): void {
  const { p } = kit;
  const bone = kit.lit('c');

  p.ctx.fillStyle = bone;
  p.ctx.beginPath();
  p.ctx.ellipse(x, y, r, r * 0.85, 0, 0, Math.PI * 2);
  p.ctx.fill();
  p.ctx.fillRect(x - r * 0.55, y + r * 0.5, r * 1.1, r * 0.55);
  p.ctx.fillStyle = OUTLINE;
  for (const side of [-1, 1]) {
    p.ctx.beginPath();
    p.ctx.ellipse(x + side * r * 0.38, y - r * 0.05, r * 0.24, r * 0.28, 0, 0, Math.PI * 2);
    p.ctx.fill();
  }
  for (let i = -1; i <= 1; i += 1)
    p.ctx.fillRect(x + i * r * 0.3 - r * 0.05, y + r * 0.6, r * 0.1, r * 0.4);
}

function abdomen(kit: Kit, at: Point, r: number, facing: number, state: BeastState): void {
  const { p } = kit;
  const tilt = -facing * 0.3;

  p.worldLight();
  p.cel(
    p.ellipse(at.x - facing * r * 1.35, at.y + r * 0.2, r * 0.32, r * 0.22, tilt),
    kit.shade('b'),
    r * 0.3,
  );
  p.cel(p.ellipse(at.x, at.y, r * 1.45, r * 1.12, tilt), kit.shade('a'), r * 1.4);
  for (let i = 0; i < 3; i += 1) {
    const x = at.x - facing * r * (0.7 - i * 0.55);

    p.ctx.strokeStyle = kit.shade('b')[1];
    p.ctx.lineWidth = r * 0.12;
    p.ctx.beginPath();
    p.ctx.ellipse(
      x,
      at.y - r * 0.05,
      r * 0.18,
      r * 0.95 - Math.abs(i - 1) * r * 0.1,
      tilt,
      -2.2,
      -0.9,
    );
    p.ctx.stroke();
  }
  for (let a = -2.8; a < -0.3; a += 0.28) {
    const x = at.x + Math.cos(a) * r * 1.42;
    const y = at.y + Math.sin(a) * r * 1.1;

    p.segment(
      x,
      y,
      x + Math.cos(a) * r * 0.22,
      y + Math.sin(a) * r * 0.22,
      Math.max(0.5, r * 0.06),
      OUTLINE,
    );
  }
  if (state.look.marks) paintCircuit(kit, at, r, facing, kit.lit(state.look.marks));
  else skull(kit, at.x - facing * r * 0.1, at.y - r * 0.25, r * 0.42);
  if (state.look.needle) paintNeedle(kit, at, r, facing, kit.lit(state.look.needle));
}

// The head in its own frame, snout forward: eight glowing eyes, feelers, and fangs that spread
// as it strikes.
function head(kit: Kit, r: number, open: number): void {
  const { p } = kit;

  for (const side of [-1, 1]) {
    p.ctx.save();
    p.ctx.translate(r * 0.7, r * 0.35);
    p.ctx.rotate(side * (0.15 + open * 0.6) - 0.1);
    p.cel(p.ellipse(r * 0.15, r * 0.15, r * 0.32, r * 0.42), kit.shade('b'), r * 0.4);
    p.cel(p.shape('0.05,0.45 0.55,0.75,0.2,1.15 0.1,0.75,-0.1,0.5', r), kit.shade('h'), r * 0.3);
    p.ctx.restore();
  }
  p.bone(
    { x: r * 0.8, y: r * 0.1 },
    { x: r * 1.5, y: -r * 0.2 },
    [r * 0.12, r * 0.09],
    kit.shade('a'),
    1,
  );
  p.bone(
    { x: r * 1.5, y: -r * 0.2 },
    { x: r * 1.75, y: r * 0.35 },
    [r * 0.09, r * 0.06],
    kit.shade('a'),
    1,
  );
  p.worldLight();
  p.cel(p.ellipse(0, 0, r, r * 0.8), kit.shade('a'), r);
  for (const [x, y, size] of EYES) eye(kit, x * r, y * r, size * r, kit.lit('e'));
}

export function paintSpider(
  kit: Kit,
  state: BeastState,
  P: readonly Point[],
  bulk: number,
  legWidth: number,
): void {
  const { p } = kit;
  const f = state.facing;
  const thorax = pick(P, 1);

  for (let i = 0; i < LEGS; i += 1)
    leg(kit, thorax, pick(P, far(i)), pick(P, far(i) + 1), legWidth, f, farOf(kit.shade('b')));
  abdomen(kit, pick(P, 2), bulk * 1.1, f, state);
  p.worldLight();
  p.cel(p.ellipse(thorax.x, thorax.y, bulk * 0.95, bulk * 0.7), kit.shade('a'), bulk);
  p.cel(
    p.ellipse(thorax.x - f * bulk * 0.15, thorax.y - bulk * 0.3, bulk * 0.45, bulk * 0.25),
    kit.shade('b'),
    bulk * 0.4,
  );
  for (let i = 0; i < LEGS; i += 1)
    leg(kit, thorax, pick(P, near(i)), pick(P, near(i) + 1), legWidth * 1.1, f, kit.shade('a'));
  const top = pick(P, 0);

  // The head goes over the near legs, so its eyes and fangs read through them.
  p.ctx.save();
  p.ctx.translate(top.x, top.y);
  p.ctx.scale(f, 1);
  head(kit, bulk * 0.62, Math.max(0, state.strike));
  p.ctx.restore();
}
