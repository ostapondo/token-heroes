import type { Point } from '../../geometry';
import { farOf } from '../paint/colors';
import { softBody } from '../rig/verlet';
import { lifted, pick, type BeastRig, type BeastState } from './beast';
import { paintDragon } from './dragon-paint';
import { QUADS, quadBack, quadHead, type QuadShape } from './quad-forms';

// Joints: 0 head, 1 neck, 2 chest, 3 hip, 4-5 tail, then near and far front and hind legs, each as
// knee and paw.
const WOLF: QuadShape = {
  length: 22,
  leg: 15,
  hip: 0.95,
  neck: 9,
  tail: 13,
  tailUp: 0.35,
  bulk: 6.2,
  legWidth: 2.3,
  tailWidth: 2.6,
  neckWidth: 4.4,
  head: 5,
  wag: 4,
  radius: 10,
};
const shapeOf = (state: BeastState): QuadShape => QUADS[state.look.form] ?? WOLF;
const thin = (r: number): [number, number] => [r, r * 0.8];

function pose(state: BeastState, t: number): Point[] {
  const q = shapeOf(state);
  const s = state.scale;
  const f = state.facing;
  const w = state.walking;
  const a = state.strike;
  const length = q.length * s;
  const leg = q.leg * s;
  const bob = Math.sin(state.phase * 2) * 1.2 * s * w + Math.sin(t * 2 + state.seed) * 0.5 * s;
  const chest = {
    x: state.x + f * (length * 0.5 + a * 4 * s),
    y: state.ground - leg - bob + state.flinch * 2 * s,
  };
  const hip = { x: state.x - f * length * 0.5, y: state.ground - leg * q.hip - bob * 0.5 };
  const neck = {
    x: chest.x + f * q.neck * s * 0.5,
    y: chest.y - q.neck * s * ((q.rear ?? 0.55) - a * 0.45) - state.flinch * 3 * s,
  };
  const head = {
    x: neck.x + f * q.neck * s * (0.6 + a * 0.5),
    y: neck.y + q.neck * s * (0.15 + a * 0.3),
  };
  const wag = Math.sin(t * q.wag + state.seed) * 0.25;
  const tail1 = { x: hip.x - f * q.tail * s * 0.5, y: hip.y - q.tail * s * (0.1 + wag * 0.3) };
  const tail2 = { x: tail1.x - f * q.tail * s * 0.5, y: tail1.y - q.tail * s * (q.tailUp + wag) };
  const limb = (top: Point, offset: number): Point[] => {
    const swing = Math.sin(state.phase + offset) * 0.55 * w;
    const step = Math.max(0, Math.cos(state.phase + offset)) * w;
    const knee = {
      x: top.x + f * Math.sin(swing) * leg * 0.5,
      y: top.y + leg * 0.5 - step * leg * 0.12,
    };

    return [
      knee,
      {
        x: knee.x + f * Math.sin(swing - step * 0.6) * leg * 0.5,
        y: state.ground - step * leg * 0.22,
      },
    ];
  };

  return lifted(
    [
      head,
      neck,
      chest,
      hip,
      tail1,
      tail2,
      ...limb(chest, 0),
      ...limb(chest, Math.PI),
      ...limb(hip, Math.PI),
      ...limb(hip, 0),
    ],
    state.lift,
  );
}

export const QUAD: BeastRig = {
  anchors: { center: 2, top: 1, head: 0, hand: 0 },
  pose,
  ragdoll(points, state) {
    const q = shapeOf(state);
    const s = state.scale;
    const bones: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [2, 6],
      [6, 7],
      [2, 8],
      [8, 9],
      [3, 10],
      [10, 11],
      [3, 12],
      [12, 13],
    ];
    const limits: [number, number, number, number][] = [
      [0, 2, 0.8, 1.05],
      [1, 3, 0.9, 1.05],
      [7, 2, 0.6, 1],
      [9, 2, 0.6, 1],
      [11, 3, 0.6, 1],
      [13, 3, 0.6, 1],
      [2, 4, 0.85, 1.1],
    ];
    const radii = points.map((_, i) => (i === 0 ? q.head * s : i < 4 ? q.bulk * s * 0.7 : 2 * s));

    return softBody(points, bones, limits, radii, state.look.mass);
  },
  paint(kit, state, P) {
    const { p } = kit;
    const q = shapeOf(state);
    const form = state.look.form;

    if (form === 'dragon') {
      paintDragon(kit, state, P, q);

      return;
    }
    const s = state.scale;
    const f = state.facing;
    const body = kit.shade('a');
    const far = farOf(kit.shade('b'));
    const leg = q.legWidth * s;
    const bone = (a: number, b: number, radii: [number, number], shade: typeof body) =>
      p.bone(pick(P, a), pick(P, b), radii, shade, f);

    quadBack(kit, form, pick(P, 2), pick(P, 3), s, true);
    bone(2, 8, thin(leg), far);
    bone(8, 9, [leg * 0.8, leg * 0.6], far);
    bone(3, 12, [leg * 1.25, leg * 0.85], far);
    bone(12, 13, [leg * 0.85, leg * 0.6], far);
    bone(3, 4, [q.tailWidth * s, q.tailWidth * s * 0.7], body);
    bone(4, 5, [q.tailWidth * s * 0.7, q.tailWidth * s * 0.25], body);
    bone(3, 2, [q.bulk * s * 0.9, q.bulk * s], body);
    bone(2, 1, [q.bulk * s * 0.75, q.neckWidth * s], body);
    quadBack(kit, form, pick(P, 2), pick(P, 3), s, false);
    const head = pick(P, 0);
    const neck = pick(P, 1);

    p.ctx.save();
    p.ctx.translate(head.x, head.y);
    p.ctx.scale(f, 1);
    p.ctx.rotate(Math.atan2(head.y - neck.y, (head.x - neck.x) * f));
    p.worldLight();
    quadHead(kit, form, q.head * s);
    p.ctx.restore();
    bone(2, 6, thin(leg), body);
    bone(6, 7, [leg * 0.8, leg * 0.6], body);
    bone(3, 10, [leg * 1.25, leg * 0.85], body);
    bone(10, 11, [leg * 0.85, leg * 0.6], body);
  },
};
