import type { BeastForm } from '@content';
import type { Point } from '../../geometry';
import { eye } from '../paint/faces';
import type { Kit } from '../paint/kit';
import { softBody } from '../rig/verlet';
import { lifted, pick, type BeastRig, type BeastState } from './beast';
import { RIM, rimPath } from './blob-shape';
import { paintShoggoth } from './shoggoth-paint';
import { paintSlime } from './slime-paint';

interface Jelly {
  readonly r: number;
  readonly tall: number;
  readonly hop: number;
  readonly box: boolean;
}

const SLIME: Jelly = { r: 9, tall: 0.8, hop: 8, box: false };
const JELLIES: Readonly<Partial<Record<BeastForm, Jelly>>> = {
  slime: SLIME,
  mushroom: { r: 6.5, tall: 1.2, hop: 5, box: false },
  toad: { r: 9, tall: 0.7, hop: 12, box: false },
  mimic: { r: 9, tall: 0.75, hop: 5, box: true },
  shoggoth: { r: 10, tall: 0.92, hop: 2, box: false },
};
const jellyOf = (state: BeastState): Jelly => JELLIES[state.look.form] ?? SLIME;

type Face = (kit: Kit, P: readonly Point[], s: number, f: number, state: BeastState) => void;

const FACES: Readonly<Partial<Record<BeastForm, Face>>> = {
  mushroom(kit, P, s, f) {
    const { p } = kit;
    const top = pick(P, 0);
    const center = pick(P, RIM);

    p.cel(p.ellipse(top.x, top.y + s, 11 * s, 6 * s), kit.shade('a'), 9 * s);
    for (const [dx, dy] of [
      [-5, 0],
      [1, -3],
      [5, 1],
    ] as const)
      p.dot(top.x + dx * s, top.y + dy * s, 1.6 * s, kit.lit('c'));
    eye(kit, center.x + f * 2 * s, center.y + s, 1.1 * s, kit.lit('e'));
    eye(kit, center.x + f * 5 * s, center.y + s, 1.1 * s, kit.lit('e'));
  },
  toad(kit, P, s, f) {
    const { p } = kit;
    const top = pick(P, 0);
    const center = pick(P, RIM);
    const mouth = pick(P, 2);

    for (const dx of [-1, 4]) {
      const x = top.x + f * dx * s;

      p.cel(p.ellipse(x, top.y + s, 3 * s, 3 * s), kit.shade('a'), 3 * s);
      eye(kit, x + f * 0.8 * s, top.y + 0.5 * s, 1.2 * s, kit.lit('e'));
    }
    p.segment(
      center.x + f * 2 * s,
      center.y + 3 * s,
      mouth.x,
      mouth.y + 2 * s,
      0.9 * s,
      kit.lit('x'),
    );
  },
  mimic(kit, P, s, f, state) {
    const { p } = kit;
    const center = pick(P, RIM);
    const lid = pick(P, 2);

    p.segment(pick(P, 8).x, pick(P, 8).y, lid.x, lid.y, 1.6 * s, kit.lit('h'));
    p.segment(center.x, pick(P, 0).y, center.x, pick(P, 5).y, 1.6 * s, kit.lit('h'));
    if (state.strike > 0.1) {
      for (let i = 0; i < 4; i += 1) {
        const x = lid.x - f * (2 + i * 3) * s;

        p.cel(
          p.polygon(x, lid.y, x - f * 1.5 * s, lid.y + 3 * s, x - f * 3 * s, lid.y),
          kit.shade('h'),
          s,
        );
      }
    }
    eye(kit, center.x + f * 4 * s, center.y - 3 * s, 1.2 * s, kit.lit('e'));
  },
};

// Soft bodies: ten rim points from the top round, then the centre. Springs make them jiggle.
export const BLOB: BeastRig = {
  anchors: { center: RIM, top: 0, head: 0, hand: 2 },
  pose(state, t) {
    const q = jellyOf(state);
    const s = state.scale;
    const f = state.facing;
    const a = state.strike;
    const w = state.walking;
    const r = q.r * s;
    const hopAt = (state.phase * 0.35) % 1;
    const hop = Math.sin(Math.PI * hopAt) * q.hop * s * w;
    const squash =
      Math.sin(t * 3 + state.seed) * 0.05 +
      Math.cos(Math.PI * 2 * hopAt) * 0.08 * w -
      state.flinch * 0.15;
    const rx = r * (1 + squash);
    const ry = r * q.tall * (1 - squash);
    const cy = state.ground - ry - hop;
    const points: Point[] = [];

    for (let i = 0; i < RIM; i += 1) {
      const theta = -Math.PI / 2 + (i * Math.PI * 2) / RIM;
      const cx = Math.cos(theta);
      const sy = Math.sin(theta);
      const bx = q.box ? Math.sign(cx) * Math.abs(cx) ** 0.35 : cx;
      const by = q.box ? Math.sign(sy) * Math.abs(sy) ** 0.35 : sy;
      const reach = bx * f > 0.3 ? a * r * 0.5 : 0;
      const open = q.box && sy < -0.3 && bx > 0 ? Math.max(0, a) * r * 0.6 : 0;

      points.push({
        x: state.x + f * bx * rx + f * reach,
        y: Math.min(state.ground - hop, cy + by * ry - open),
      });
    }
    points.push({ x: state.x, y: cy });

    return lifted(points, state.lift);
  },
  ragdoll(points, state) {
    const bones: [number, number][] = [];
    const limits: [number, number, number, number][] = [];

    for (let i = 0; i < RIM; i += 1) {
      bones.push([i, (i + 1) % RIM]);
      limits.push([RIM, i, 0.7, 1.15], [i, (i + RIM / 2) % RIM, 0.7, 1.1]);
    }
    const radii = points.map((_, i) =>
      i === RIM ? jellyOf(state).r * state.scale * 0.4 : 1.5 * state.scale,
    );

    return softBody(points, bones, limits, radii, state.look.mass);
  },
  paint(kit, state, P) {
    const { p } = kit;

    if (state.look.form === 'slime') {
      paintSlime(kit, state, P);

      return;
    }
    if (state.look.form === 'shoggoth') {
      paintShoggoth(kit, state, P);

      return;
    }
    const s = state.scale;
    const body =
      state.look.form === 'mushroom'
        ? kit.shade('h')
        : state.look.form === 'mimic'
          ? kit.shade('b')
          : kit.shade('a');
    const rim = rimPath(p, P);

    p.worldLight();
    p.cel(rim, body, jellyOf(state).r * s);
    FACES[state.look.form]?.(kit, P, s, state.facing, state);
  },
};
