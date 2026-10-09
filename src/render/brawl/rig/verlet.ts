import type { Build } from '@content';
import type { Point } from '../../geometry';
import { BONES, FOOT, J } from './skeleton';

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
}

// A stick keeps two joints between min and max apart; a bone has min equal to max.
type Stick = readonly [a: number, b: number, min: number, max: number];

export interface Pin {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
}

export interface Ragdoll {
  readonly points: Particle[];
  readonly sticks: readonly Stick[];
  readonly radii: readonly number[];
  readonly mass: number;
  pin: Pin | null;
  calm: number;
  quiet: number;
}

const GRAVITY = 1500;
const ITERATIONS = 8;

const particle = (point: Point): Particle => ({ ...point, px: point.x, py: point.y, vx: 0, vy: 0 });

// A body of any shape: its sticks keep the lengths they have in the pose it falls from, and the
// extra rules stop it folding flat.
export function softBody(
  points: readonly Point[],
  bones: readonly (readonly [number, number])[],
  limits: readonly (readonly [number, number, number, number])[],
  radii: readonly number[],
  mass: number,
): Ragdoll {
  const distance = (a: number, b: number): number => {
    const from = points[a];
    const to = points[b];

    return from && to ? Math.hypot(to.x - from.x, to.y - from.y) || 1 : 1;
  };
  const sticks: Stick[] = bones.map(([a, b]) => [a, b, distance(a, b), distance(a, b)]);

  for (const [a, b, low, high] of limits)
    sticks.push([a, b, distance(a, b) * low, distance(a, b) * high]);

  return { points: points.map(particle), sticks, radii, mass, pin: null, calm: 1, quiet: 0 };
}

// The two-legged ragdoll: bones keep their length, and soft limits stand in for joint angles so no
// elbow or knee folds flat and no thigh folds into the chest.
export function bipedRagdoll(build: Build, points: readonly Point[], mass: number): Ragdoll {
  const s = build.scale;
  const length = (key: 'neck' | 'torso' | 'upper' | 'fore' | 'thigh' | 'shin'): number =>
    build[key] * s;
  const spine = length('neck') + length('torso');
  const arm = length('upper') + length('fore');
  const leg = length('thigh') + length('shin');
  const sticks: Stick[] = BONES.map(([a, b, key]) => [a, b, length(key), length(key)]);

  sticks.push(
    [J.head, J.pelvis, spine * 0.86, spine],
    [J.handB, J.neck, arm * 0.42, arm],
    [J.handF, J.neck, arm * 0.42, arm],
    [J.footB, J.pelvis, leg * 0.5, leg],
    [J.footF, J.pelvis, leg * 0.5, leg],
    [J.kneeB, J.neck, length('torso') * 0.6, 1e9],
    [J.kneeF, J.neck, length('torso') * 0.6, 1e9],
  );
  const radii = points.map((_, index) => (index === J.head ? build.head * s : FOOT * s));

  return { points: points.map(particle), sticks, radii, mass, pin: null, calm: 1, quiet: 0 };
}

function satisfy(body: Ragdoll): void {
  for (const [a, b, min, max] of body.sticks) {
    const from = body.points[a];
    const to = body.points[b];

    if (!from || !to) continue;
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    const d = Math.hypot(dx, dy) || 1e-4;
    const target = Math.min(max, Math.max(min, d));

    if (target === d) continue;
    const k = ((d - target) / d) * 0.5;

    dx *= k;
    dy *= k;
    from.x += dx;
    from.y += dy;
    to.x -= dx;
    to.y -= dy;
  }
}

export function stepRagdoll(
  body: Ragdoll,
  dt: number,
  ground: number,
  left: number,
  right: number,
): void {
  const fall = GRAVITY * dt * dt;

  for (const p of body.points) {
    p.vx = (p.x - p.px) * 0.997;
    p.vy = (p.y - p.py) * 0.997;
    p.px = p.x;
    p.py = p.y;
    p.x += p.vx;
    p.y += p.vy + fall;
  }
  const pinned = body.pin ? body.points[body.pin.index] : undefined;

  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    satisfy(body);
    body.points.forEach((p, index) => {
      const r = body.radii[index] ?? 2;

      p.y = Math.min(p.y, ground - r);
      p.x = Math.min(right - r, Math.max(left + r, p.x));
    });
    if (pinned && body.pin) {
      pinned.x = body.pin.x;
      pinned.y = body.pin.y;
    }
  }
  if (pinned && body.pin) {
    pinned.px = pinned.x - body.pin.vx * dt;
    pinned.py = pinned.y - body.pin.vy * dt;
  }
  body.points.forEach((p, index) => {
    const r = body.radii[index] ?? 2;

    if (p.y >= ground - r - 0.01) {
      if (p.vy > 0) p.py = p.y + p.vy * 0.28;
      p.px = p.x - (p.x - p.px) * 0.8;
    }
    if (p.x <= left + r + 0.01 || p.x >= right - r - 0.01) p.px = p.x + p.vx * 0.5;
  });
}

export function energy(body: Ragdoll): number {
  const total = body.points.reduce((sum, p) => sum + (p.x - p.px) ** 2 + (p.y - p.py) ** 2, 0);

  return total / Math.max(1, body.points.length);
}

// A blast throws each joint away from its centre, harder the nearer it is, and a little upward so
// bodies leave the ground.
export function blast(
  body: Ragdoll,
  x: number,
  y: number,
  radius: number,
  force: number,
  dt: number,
): void {
  for (const p of body.points) {
    let dx = p.x - x;
    let dy = p.y - y;
    const d = Math.hypot(dx, dy) || 1;
    const fall = Math.max(0, 1 - d / radius);

    if (fall === 0) continue;
    dx /= d;
    dy = dy / d - 0.9;
    const n = Math.hypot(dx, dy);
    const v = (force * fall * (0.75 + Math.random() * 0.5)) / body.mass;

    p.px -= (dx / n) * v * dt;
    p.py -= (dy / n) * v * dt;
  }
}

// Joints of two bodies never overlap; moving them apart is how Verlet bodies bounce off each other.
export function separate(a: Ragdoll, b: Ragdoll, ra: number, rb: number): boolean {
  const wa = b.mass / (a.mass + b.mass);
  let touched = false;

  for (const pa of a.points) {
    for (const pb of b.points) {
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const d2 = dx * dx + dy * dy;
      const reach = ra + rb;

      if (d2 >= reach * reach || d2 < 1e-6) continue;
      const d = Math.sqrt(d2);
      const k = ((reach - d) / d) * 0.5;

      pa.x -= dx * k * wa;
      pa.y -= dy * k * wa;
      pb.x += dx * k * (1 - wa);
      pb.y += dy * k * (1 - wa);
      touched = true;
    }
  }

  return touched;
}
