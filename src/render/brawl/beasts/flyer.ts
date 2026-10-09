import type { Point } from '../../geometry';
import { farOf } from '../paint/colors';
import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';
import { softBody } from '../rig/verlet';
import { lifted, pick, type BeastRig, type BeastState } from './beast';

interface Wings {
  readonly hover: number;
  readonly flap: number;
  readonly span: number;
  readonly head: number;
  readonly tail: number;
  readonly bulk: number;
}

const BAT: Wings = { hover: 34, flap: 15, span: 18, head: 4, tail: 3, bulk: 4 };
const CROW: Wings = { hover: 40, flap: 9, span: 20, head: 5, tail: 7, bulk: 4.5 };
const wingsOf = (state: BeastState): Wings => (state.look.form === 'crow' ? CROW : BAT);

function wing(
  kit: Kit,
  state: BeastState,
  root: Point,
  elbow: Point,
  tip: Point,
  far: boolean,
): void {
  const { p } = kit;
  const s = state.scale;
  const f = state.facing;

  p.worldLight();
  if (state.look.form === 'crow') {
    const color = kit.shade('x');
    const feathers: number[] = [root.x, root.y, elbow.x, elbow.y, tip.x, tip.y];

    for (let i = 1; i <= 3; i += 1) {
      const k = i / 4;

      feathers.push(tip.x + (root.x - tip.x) * k - f * 2 * s, tip.y + (root.y - tip.y) * k + 4 * s);
      feathers.push(
        tip.x + (root.x - tip.x) * (k + 0.12),
        tip.y + (root.y - tip.y) * (k + 0.12) + s,
      );
    }
    p.cel(p.polygon(...feathers), far ? farOf(color) : color, 6 * s);

    return;
  }
  const membrane = far ? kit.shade('x') : kit.shade('b');
  const mid = { x: (tip.x + root.x) / 2, y: (tip.y + root.y) / 2 + 2 * s };

  p.cel(
    p.polygon(
      root.x,
      root.y,
      elbow.x,
      elbow.y,
      tip.x,
      tip.y,
      mid.x,
      mid.y,
      root.x - f * 2 * s,
      root.y + 4 * s,
    ),
    membrane,
    6 * s,
  );
}

// Joints: 0 head, 1 body, 2 tail, then the near wing's elbow and tip and the far wing's.
export const FLYER: BeastRig = {
  anchors: { center: 1, top: 1, head: 0, hand: 0 },
  pose(state, t) {
    const q = wingsOf(state);
    const s = state.scale;
    const f = state.facing;
    const a = state.strike;
    const beat = t * q.flap + state.seed;
    const body = {
      x: state.x + f * a * 10 * s,
      y:
        state.ground - q.hover * s - Math.sin(t * 3 + state.seed) * 2 * s + Math.max(0, a) * 10 * s,
    };
    const wingAt = (lag: number, k: number): Point[] => {
      const lift = Math.sin(beat - lag);

      return [
        { x: body.x - f * q.span * 0.18 * s * k, y: body.y - q.span * 0.42 * s * lift },
        {
          x: body.x - f * q.span * 0.5 * s * k,
          y: body.y - q.span * 0.7 * s * lift - q.span * 0.08 * s,
        },
      ];
    };

    return lifted(
      [
        { x: body.x + f * q.head * s, y: body.y - 1.5 * s },
        body,
        { x: body.x - f * q.tail * s, y: body.y + 1.5 * s },
        ...wingAt(0, 1),
        ...wingAt(0.5, 0.85),
      ],
      state.lift,
    );
  },
  ragdoll(points, state) {
    const bones: [number, number][] = [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [1, 5],
      [5, 6],
    ];

    return softBody(
      points,
      bones,
      [
        [0, 2, 0.8, 1.05],
        [4, 1, 0.5, 1.05],
        [6, 1, 0.5, 1.05],
      ],
      points.map(() => 2 * state.scale),
      state.look.mass,
    );
  },
  paint(kit, state, P) {
    const { p } = kit;
    const q = wingsOf(state);
    const s = state.scale;
    const f = state.facing;
    const crow = state.look.form === 'crow';
    const body = crow ? kit.shade('x') : kit.shade('b');
    const center = pick(P, 1);
    const head = pick(P, 0);
    const r = q.bulk * s * 0.7;

    wing(kit, state, center, pick(P, 5), pick(P, 6), true);
    p.worldLight();
    p.cel(p.ellipse(center.x, center.y, q.bulk * s, q.bulk * s * 0.75), body, q.bulk * s);
    p.bone(center, pick(P, 2), [q.bulk * s * 0.5, s * 0.8], body, f);
    p.ctx.save();
    p.ctx.translate(head.x, head.y);
    p.ctx.scale(f, 1);
    if (crow) p.cel(p.shape('0.7,-0.3 2,0.1 0.7,0.4', r), kit.shade('h'), r * 0.3);
    else p.cel(p.shape('-0.4,-0.6 -0.2,-1.8 0.3,-0.7', r), body, r * 0.3);
    p.cel(p.ellipse(0, 0, r, r * 0.85), body, r);
    eye(kit, r * 0.4, -r * 0.2, r * 0.17, kit.lit('e'));
    p.ctx.restore();
    wing(kit, state, center, pick(P, 3), pick(P, 4), false);
  },
};
