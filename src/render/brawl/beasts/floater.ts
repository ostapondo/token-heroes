import type { BeastForm } from '@content';
import type { Point } from '../../geometry';
import { darken } from '../paint/colors';
import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';
import { softBody } from '../rig/verlet';
import { lifted, pick, type BeastRig, type BeastState } from './beast';
import { paintEye } from './eye-paint';
import { paintWraith } from './wraith-paint';

interface Float {
  readonly hover: number;
  readonly headUp: number;
  readonly tail: number;
  readonly reach: number;
  readonly head: number;
}

const GHOST: Float = { hover: 22, headUp: 6, tail: 14, reach: 9, head: 7 };
const FLOATS: Readonly<Partial<Record<BeastForm, Float>>> = {
  ghost: GHOST,
  eye: { hover: 30, headUp: 0, tail: 12, reach: 4, head: 8 },
  skull: { hover: 28, headUp: 0, tail: 12, reach: 3, head: 6 },
  wraith: { hover: 20, headUp: 14, tail: 26, reach: 20, head: 9 },
};
const floatOf = (state: BeastState): Float => FLOATS[state.look.form] ?? GHOST;

type Paint = (kit: Kit, P: readonly Point[], s: number, f: number) => void;

const FORMS: Readonly<Partial<Record<BeastForm, Paint>>> = {
  ghost(kit, P, s, f) {
    const { p } = kit;
    const sheet = [kit.lit('h'), darken(kit.lit('h'), 0.6)] as const;
    const head = pick(P, 0);

    p.ctx.globalAlpha *= 0.88;
    p.bone(pick(P, 1), pick(P, 2), [7 * s, 5 * s], sheet, f);
    p.bone(pick(P, 2), pick(P, 3), [5 * s, 1.5 * s], sheet, f);
    p.bone(pick(P, 1), pick(P, 4), [2.2 * s, 1.6 * s], sheet, f);
    p.worldLight();
    p.cel(p.ellipse(head.x, head.y + 3 * s, 8 * s, 9 * s), sheet, 8 * s);
    for (const dx of [1, 4.5]) p.dot(head.x + f * dx * s, head.y + s, 1.6 * s, kit.lit('x'));
    eye(kit, head.x + f * 2.7 * s, head.y + 6 * s, 1.2 * s, kit.lit('e'));
  },
  skull(kit, P, s, f) {
    const { p } = kit;
    const head = pick(P, 0);

    for (let i = 1; i < 4; i += 1) {
      const trail = pick(P, i);

      p.glow(trail.x, trail.y - Math.sin(kit.t * 12 + i) * 2, (9 - i * 2) * s, kit.lit('c'), 0.8);
    }
    p.worldLight();
    p.cel(p.bar(head.x - s, head.x + 4 * s, head.y + 5 * s, 2.4 * s), kit.shade('h'), 2 * s);
    p.cel(p.ellipse(head.x, head.y, 7 * s, 6.5 * s), kit.shade('h'), 7 * s);
    p.dot(head.x + f * 3 * s, head.y, 2.2 * s, '#140c07');
    eye(kit, head.x + f * 3 * s, head.y, s, kit.lit('e'));
  },
};

// Joints: 0 head, 1 core, 2-3 a trailing tail, 4 the reaching hand. Floaters bob above the floor.
export const FLOATER: BeastRig = {
  anchors: { center: 1, top: 0, head: 0, hand: 4 },
  pose(state, t) {
    const q = floatOf(state);
    const s = state.scale;
    const f = state.facing;
    const a = state.strike;
    const sway = Math.sin(t * 2.2 + state.seed);
    const core = {
      x: state.x + f * a * 8 * s,
      y: state.ground - q.hover * s - Math.sin(t * 1.8 + state.seed) * 2.5 * s,
    };
    const head = { x: core.x + f * a * 3 * s, y: core.y - q.headUp * s };
    const tail1 = { x: core.x - f * (q.tail * 0.4 + sway) * s, y: core.y + q.tail * 0.5 * s };
    const tail2 = {
      x: tail1.x - f * (q.tail * 0.4 + sway * 2) * s,
      y: tail1.y + q.tail * 0.35 * s,
    };
    const hand = {
      x: core.x + f * q.reach * (0.6 + a * 0.8) * s,
      y: core.y - q.reach * (0.2 + a * 0.5 - Math.max(0, a) * 0.9) * s,
    };
    const points = [head, core, tail1, tail2, hand].map((point) => ({
      x: point.x,
      y: Math.min(point.y, state.ground - 2 * s),
    }));

    return lifted(points, state.lift);
  },
  ragdoll(points, state) {
    const q = floatOf(state);

    return softBody(
      points,
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [1, 4],
      ],
      [[0, 2, 0.8, 1.05]],
      points.map((_, i) => (i === 0 ? q.head * state.scale : 2 * state.scale)),
      state.look.mass,
    );
  },
  paint(kit, state, P) {
    if (state.look.form === 'wraith') paintWraith(kit, state, P);
    else if (state.look.form === 'eye') paintEye(kit, state, P);
    else FORMS[state.look.form]?.(kit, P, state.scale, state.facing);
  },
};
