import type { Point } from '../../geometry';
import { softBody } from '../rig/verlet';
import { lifted, type BeastRig } from './beast';
import { paintSerpent } from './serpent-paint';

const LINKS = 9;
const LINK = 4.5;
const THICK = 8;
// How far back each neck link leans from the base: the neck rears in an S, head forward.
const NECK = [-0.45, 0.2, -0.05] as const;

// The serpent: 0 head, then eight links to the tail. The front third rears in an S over the
// rest, which ripples along the floor.
export const CHAIN: BeastRig = {
  anchors: { center: 3, top: 1, head: 0, hand: 0 },
  pose(state, t) {
    const s = state.scale;
    const f = state.facing;
    const a = state.strike;
    const points: Point[] = [];

    for (let i = 0; i < LINKS; i += 1) {
      const along = (i < 3 ? (NECK[i] ?? 0) : i - 3) * LINK * s;
      const rise = i < 3 ? (3 - i) * LINK * s * (1.5 - a * 0.35) : 0;
      const ripple =
        i >= 3 ? Math.max(0, Math.sin(i * 0.9 - t * 7 * (0.4 + state.walking))) * 3 * s : 0;
      const lunge = i < 3 ? f * a * (3 - i) * 4 * s : 0;

      points.push({
        x: state.x - f * along + lunge,
        y: state.ground - THICK * s * 0.5 - rise - ripple + Math.sin(t * 2 + i) * 0.5 * s,
      });
    }

    return lifted(points, state.lift);
  },
  ragdoll(points, state) {
    const bones: [number, number][] = [];
    const limits: [number, number, number, number][] = [];

    for (let i = 0; i < LINKS - 1; i += 1) bones.push([i, i + 1]);
    for (let i = 0; i < LINKS - 2; i += 1) limits.push([i, i + 2, 0.6, 1.05]);

    return softBody(
      points,
      bones,
      limits,
      points.map(() => THICK * state.scale * 0.5),
      state.look.mass,
    );
  },
  paint: paintSerpent,
};
