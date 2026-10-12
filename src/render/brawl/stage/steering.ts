import type { Point } from '../../geometry';
import { separate } from '../rig/verlet';
import type { Body } from './body';
import { hitMark } from './blows';
import { FIELD } from './field';
import type { World } from './world';

export interface Goal {
  readonly x: number;
  readonly z: number;
}

const SPEED = { hero: 70, foe: 52, boss: 62 } as const;
// A flying body this fast staggers a standing one it passes through.
const STAGGER_SPEED = 260;
const STAGGER_GAP = 0.4;
const SAME_DEPTH = 0.16;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

// How far a body hangs past the floor's edges: a serpent's tail or a dragon's wing can, even
// while its feet stand inside.
function inside(body: Body, left: number): number {
  const xs = body.points.map((point) => point.x);
  const over = Math.max(...xs) - (FIELD.width - 4);
  const under = left + 4 - Math.min(...xs);

  return over > 0 ? over : under > 0 ? -under : 0;
}

// Walks a standing body toward its goal, keeps it out of its neighbours, and turns it to face
// what it fights. Facing turns only past a few units, so a body does not flicker under its target.
export function steer(
  body: Body,
  goal: Goal | null,
  faceX: number | null,
  others: readonly Body[],
  dt: number,
  left: number,
): void {
  const speed = body.boss ? SPEED.boss : body.hero ? SPEED.hero : SPEED.foe;
  let vx = 0;
  let vz = 0;

  if (goal) {
    const ax = goal.x - body.x;
    const az = (goal.z - body.z) * FIELD.depth;
    const d = Math.hypot(ax, az);

    if (d > 4) {
      const k = speed * Math.min(1, d / 24);

      vx = (ax / d) * k;
      vz = (az / d) * k;
    }
  }
  for (const other of others) {
    if (other === body || other.state !== 'stand' || other.alpha <= 0) continue;
    const dx = body.x - other.x;
    const dz = (body.z - other.z) * FIELD.depth * 1.5;
    const d = Math.hypot(dx, dz);
    const min = 6.5 * (body.scale + other.scale);

    if (d < min && d > 0.01) {
      const k = ((min - d) / min) * 80;

      vx += (dx / d) * k;
      vz += (dz / d / 1.5) * k;
    }
  }
  if (body.move) {
    vx *= 0.15;
    vz *= 0.15;
  }
  const ease = Math.min(1, dt * 6);

  body.vx += (vx - body.vx) * ease;
  body.vz += (vz - body.vz) * ease;
  body.x = clamp(body.x + (body.vx + body.kx) * dt, left + 12, FIELD.width - 12);
  body.x -= inside(body, left) * Math.min(1, dt * 4);
  body.z = clamp(body.z + (body.vz / FIELD.depth) * dt, 0, 1);
  body.kx *= Math.exp(-8 * dt);
  const pace = Math.hypot(body.vx, body.vz);

  body.walking += ((pace > 12 ? 1 : 0) - body.walking) * ease;
  if (faceX !== null && Math.abs(faceX - body.x) > 6) body.facing = faceX > body.x ? 1 : -1;
  else if (Math.abs(body.vx) > 10) body.facing = Math.sign(body.vx);
  body.phase += dt * pace * 0.17 * (body.vx * body.facing < -5 ? -1 : 1);
}

interface Box {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

function boxOf(points: readonly Point[], pad: number): Box {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    x0: Math.min(...xs) - pad,
    y0: Math.min(...ys) - pad,
    x1: Math.max(...xs) + pad,
    y1: Math.max(...ys) + pad,
  };
}

const overlap = (a: Box, b: Box): boolean =>
  a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

// Loose bodies push each other apart and pile up; a flying body only staggers a standing one,
// because only the rules may put a fighter on the ground.
export class Collisions {
  readonly #staggered = new WeakMap<Body, number>();

  step(world: World): void {
    const bodies = world.cast.all.filter((body) => body.alpha > 0);
    const boxes = new Map(bodies.map((body) => [body, boxOf(body.points, body.ragdoll ? 5 : 2)]));

    for (const a of bodies) {
      const rag = a.ragdoll;
      const box = boxes.get(a);

      if (!rag || a.asleep || !box) continue;
      const fast = Math.max(
        ...rag.points.map((p) => Math.hypot(p.x - p.px, p.y - p.py) / FIELD.step),
      );

      for (const b of bodies) {
        const other = boxes.get(b);

        if (b === a || !other || Math.abs(b.z - a.z) > SAME_DEPTH || !overlap(box, other)) continue;
        if (b.ragdoll) {
          if (separate(rag, b.ragdoll, 3 * a.scale, 3 * b.scale)) b.asleep = false;
          continue;
        }
        if (
          fast < STAGGER_SPEED ||
          b.state !== 'stand' ||
          (this.#staggered.get(b) ?? -9) > world.now
        )
          continue;
        this.#staggered.set(b, world.now + STAGGER_GAP);
        const dir = Math.sign(b.center.x - a.center.x) || 1;

        hitMark(world, b, dir, false, false);
        b.kx += (dir * 160) / b.look.mass;
        for (const p of rag.points) {
          p.px = p.x - (p.x - p.px) * 0.6;
          p.py = p.y - (p.y - p.py) * 0.6;
        }
      }
    }
  }
}
