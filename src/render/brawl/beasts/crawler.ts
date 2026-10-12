import type { BeastForm } from '@content';
import type { Point } from '../../geometry';
import { farOf } from '../paint/colors';
import { eye } from '../paint/faces';
import { softBody } from '../rig/verlet';
import { lifted, pick, type BeastRig, type BeastState } from './beast';
import { CRAWL_BODIES, CRAWL_HEADS } from './crawler-forms';
import { paintSpider } from './spider-paint';

interface CrawlShape {
  readonly legs: number;
  readonly high: number;
  readonly abdomen: number;
  readonly reach: number;
  readonly knee: number;
  readonly span: number;
  readonly stride: number;
  readonly bulk: number;
  readonly legWidth: number;
  readonly tail: number;
}

const SPIDER: CrawlShape = {
  legs: 4,
  high: 7,
  abdomen: 9,
  reach: 6,
  knee: 8,
  span: 14,
  stride: 6,
  bulk: 5.5,
  legWidth: 1.1,
  tail: 0,
};
const SHAPES: Readonly<Partial<Record<BeastForm, CrawlShape>>> = {
  spider: SPIDER,
  scorpion: {
    legs: 4,
    high: 5,
    abdomen: 9,
    reach: 7,
    knee: 4,
    span: 8,
    stride: 5,
    bulk: 5.5,
    legWidth: 1.2,
    tail: 5.5,
  },
  beetle: {
    legs: 3,
    high: 5,
    abdomen: 6,
    reach: 8,
    knee: 3,
    span: 8,
    stride: 4,
    bulk: 6.5,
    legWidth: 1.3,
    tail: 0,
  },
};
const shapeOf = (state: BeastState): CrawlShape => SHAPES[state.look.form] ?? SPIDER;

// The tail climbs back and up, arches over the body and hangs its sting forward.
const ARCH = [0.6, 1.4, 2.3, 3.4];

// Joints: 0 head, 1 thorax, 2 abdomen, each leg as knee and foot (near side first), then the tail.
function pose(state: BeastState, t: number): Point[] {
  const q = shapeOf(state);
  const s = state.scale;
  const f = state.facing;
  const a = state.strike;
  const h = q.high * s + Math.sin(t * 3 + state.seed) * 0.5 * s;
  const thorax = { x: state.x, y: state.ground - h };
  const abdomen = {
    x: state.x - f * q.abdomen * s,
    y: state.ground - h * 0.95 - Math.sin(t * 2) * 0.6 * s,
  };
  const head = { x: state.x + f * (q.reach + a * 4) * s, y: state.ground - h * (0.9 - a * 0.15) };
  const points: Point[] = [head, thorax, abdomen];

  for (const side of [0, 1]) {
    for (let i = 0; i < q.legs; i += 1) {
      const spread = i - (q.legs - 1) / 2;
      const offset = i * Math.PI + side * Math.PI * 0.5;
      const phase = state.phase * 1.6 + offset;
      const swing = Math.sin(phase) * 0.35 * state.walking * q.stride * s;
      const step = Math.max(0, Math.cos(phase)) * state.walking * 2.5 * s;
      const out = (side ? 0.8 : 1) * q.span * s;

      points.push(
        {
          x: state.x + f * (spread * out * 0.55 + swing * 0.5),
          y: state.ground - h - q.knee * s - step * 0.5,
        },
        { x: state.x + f * (spread * out + swing), y: state.ground - step },
      );
    }
  }
  if (q.tail) {
    let joint = abdomen;

    for (const [i, arch] of ARCH.entries()) {
      const angle = arch + a * 0.5 + Math.sin(t * 2 + i) * 0.05;

      joint = {
        x: joint.x - f * Math.cos(angle) * q.tail * s,
        y: joint.y - Math.sin(angle) * q.tail * s,
      };
      points.push(joint);
    }
  }

  return lifted(points, state.lift);
}

export const CRAWLER: BeastRig = {
  anchors: { center: 1, top: 1, head: 0, hand: 0 },
  pose,
  ragdoll(points, state) {
    const q = shapeOf(state);
    const bones: [number, number][] = [
      [0, 1],
      [1, 2],
    ];
    const limits: [number, number, number, number][] = [[0, 2, 0.85, 1.05]];

    for (let i = 0; i < q.legs * 2; i += 1) {
      const knee = 3 + i * 2;

      bones.push([1, knee], [knee, knee + 1]);
      limits.push([1, knee + 1, 0.5, 1.05]);
    }
    if (q.tail) {
      const first = 3 + q.legs * 4;

      bones.push([2, first], [first, first + 1], [first + 1, first + 2], [first + 2, first + 3]);
    }
    const radii = points.map((_, i) => (i < 3 ? q.bulk * state.scale * 0.8 : 1.5 * state.scale));

    return softBody(points, bones, limits, radii, state.look.mass);
  },
  paint(kit, state, P) {
    const { p } = kit;
    const q = shapeOf(state);
    const s = state.scale;
    const f = state.facing;
    const width = q.legWidth * s;

    if (state.look.form === 'spider') {
      paintSpider(kit, state, P, q.bulk * s, width);

      return;
    }
    const leg = (side: number, i: number, shade: readonly [string, string]) => {
      const knee = 3 + (side * q.legs + i) * 2;

      p.bone(pick(P, 1), pick(P, knee), [width, width * 0.8], shade, f);
      p.bone(pick(P, knee), pick(P, knee + 1), [width * 0.8, width * 0.4], shade, f);
    };

    for (let i = 0; i < q.legs; i += 1) leg(1, i, farOf(kit.shade('b')));
    if (q.tail) {
      const first = 3 + q.legs * 4;

      for (let i = 0; i < 4; i += 1) {
        const r = q.bulk * s * (0.55 - i * 0.08);

        p.bone(
          pick(P, i ? first + i - 1 : 2),
          pick(P, first + i),
          [r, r * 0.88],
          kit.shade('a'),
          f,
        );
      }
      const sting = pick(P, first + 3);

      p.worldLight();
      p.cel(
        p.polygon(
          sting.x,
          sting.y,
          sting.x + f * 4 * s,
          sting.y + 3 * s,
          sting.x + f * s,
          sting.y + 6 * s,
        ),
        kit.shade('h'),
        2 * s,
      );
      eye(kit, sting.x + f * 2 * s, sting.y + 3 * s, 1.2 * s, kit.lit('e'));
    }
    p.worldLight();
    CRAWL_BODIES[state.look.form]?.(kit, pick(P, 2), pick(P, 1), s);
    p.cel(
      p.ellipse(pick(P, 1).x, pick(P, 1).y, q.bulk * s * 0.8, q.bulk * s * 0.6),
      kit.shade('a'),
      q.bulk * s,
    );
    const head = pick(P, 0);

    p.ctx.save();
    p.ctx.translate(head.x, head.y);
    p.ctx.scale(f, 1);
    CRAWL_HEADS[state.look.form]?.(kit, q.bulk * s * 0.6);
    p.ctx.restore();
    for (let i = 0; i < q.legs; i += 1) leg(0, i, kit.shade('a'));
  },
};
