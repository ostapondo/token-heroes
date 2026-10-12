import type { Point } from '../../geometry';
import { darken, type Shade } from '../paint/colors';
import type { Kit } from '../paint/kit';
import { pick } from './beast';

const STEPS = 5;

// A point along a smooth body: where it is, which way its side faces, how thick it is there, and
// which side of the centre line its belly is on (plus or minus the normal).
export interface Sample extends Point {
  readonly nx: number;
  readonly ny: number;
  readonly r: number;
  readonly belly: number;
}

// A Catmull-Rom curve through the joints, so a body made of a few joints bends as one smooth tube.
function curve(P: readonly Point[]): Point[] {
  const out: Point[] = [];
  const last = P.length - 1;

  for (let i = 0; i < last; i += 1) {
    const a = pick(P, Math.max(0, i - 1));
    const b = pick(P, i);
    const c = pick(P, i + 1);
    const d = pick(P, Math.min(last, i + 2));

    for (let k = 0; k < STEPS; k += 1) {
      const t = k / STEPS;
      const t2 = t * t;
      const t3 = t2 * t;
      const at = (p0: number, p1: number, p2: number, p3: number) =>
        0.5 *
        (2 * p1 +
          (p2 - p0) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
          (3 * p1 - p0 - 3 * p2 + p3) * t3);

      out.push({ x: at(a.x, b.x, c.x, d.x), y: at(a.y, b.y, c.y, d.y) });
    }
  }
  out.push(pick(P, last));

  return out;
}

// Samples a body along its joints; `radius` gives the thickness from 0 at the first joint to 1 at
// the last, and the belly is the side that faces `down`.
export function tube(P: readonly Point[], radius: (u: number) => number, down: Point): Sample[] {
  const line = curve(P);

  return line.map((point, i) => {
    const before = line[Math.max(0, i - 1)] ?? point;
    const after = line[Math.min(line.length - 1, i + 1)] ?? point;
    const tx = after.x - before.x;
    const ty = after.y - before.y;
    const length = Math.hypot(tx, ty) || 1;
    const nx = -ty / length;
    const ny = tx / length;

    return {
      ...point,
      nx,
      ny,
      r: radius(i / Math.max(1, line.length - 1)),
      belly: nx * down.x + ny * down.y >= 0 ? 1 : -1,
    };
  });
}

export const edge = (sample: Sample, side: number, k = 1): Point => ({
  x: sample.x + sample.nx * sample.r * side * k,
  y: sample.y + sample.ny * sample.r * side * k,
});

const flat = (points: readonly Point[]): number[] => points.flatMap((point) => [point.x, point.y]);

export function paintTube(kit: Kit, line: readonly Sample[], shade: Shade, size: number): void {
  const outline = flat([
    ...line.map((each) => edge(each, 1)),
    ...line.toReversed().map((each) => edge(each, -1)),
  ]);

  kit.p.worldLight();
  kit.p.cel(kit.p.polygon(...outline), shade, size);
}

// Pale plates down the belly between two shares of the body's length.
export function paintBelly(kit: Kit, line: readonly Sample[], from: number, to: number): void {
  const { p } = kit;
  const belly = line.slice(Math.floor(line.length * from), Math.floor(line.length * to));
  const pale = kit.lit('c');

  if (belly.length < 2) return;
  p.ctx.save();
  p.ctx.beginPath();
  p.polygon(
    ...flat([
      ...belly.map((each) => edge(each, each.belly, 0.9)),
      ...belly.toReversed().map((each) => edge(each, each.belly, 0.22)),
    ]),
  )(0, 0);
  p.ctx.fillStyle = pale;
  p.ctx.globalAlpha *= 0.92;
  p.ctx.fill();
  p.ctx.restore();
  belly.forEach((each, i) => {
    if (i % 2) return;
    const a = edge(each, each.belly, 0.88);
    const b = edge(each, each.belly, 0.25);

    p.segment(a.x, a.y, b.x, b.y, Math.max(0.6, each.r * 0.08), darken(pale, 0.7));
  });
}

// Fins along the spine, leaning toward the end of the line, `height` times the body's thickness.
export function paintSpines(
  kit: Kit,
  line: readonly Sample[],
  range: readonly [number, number],
  every: number,
  height: number,
  shade: Shade,
): void {
  const { p } = kit;

  for (let i = Math.floor(line.length * range[0]); i < line.length * range[1]; i += every) {
    const each = line[i];

    if (!each) continue;
    const back = -each.belly;
    const tx = each.ny;
    const ty = -each.nx;
    const size = each.r * 0.85;
    const base = edge(each, back, 0.72);
    const tip = edge(each, back, 1 + height);

    p.cel(
      p.polygon(
        base.x - tx * size * 0.55,
        base.y - ty * size * 0.55,
        tip.x + tx * size * 0.55,
        tip.y + ty * size * 0.55,
        base.x + tx * size * 0.55,
        base.y + ty * size * 0.55,
      ),
      shade,
      size,
    );
  }
}

// Diamond scales along the back, alternating dark and light.
export function paintScales(kit: Kit, line: readonly Sample[], from: number, to: number): void {
  const { ctx } = kit.p;

  for (let i = Math.floor(line.length * from); i < line.length * to; i += 3) {
    const each = line[i];

    if (!each) continue;
    const at = edge(each, -each.belly, 0.35);
    const size = each.r * 0.4;
    const ax = each.ny * size;
    const ay = -each.nx * size;

    ctx.beginPath();
    ctx.moveTo(at.x + ax, at.y + ay);
    ctx.lineTo(at.x + each.nx * size * 0.6, at.y + each.ny * size * 0.6);
    ctx.lineTo(at.x - ax, at.y - ay);
    ctx.lineTo(at.x - each.nx * size * 0.6, at.y - each.ny * size * 0.6);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? kit.shade('b')[1] : kit.lit('b');
    ctx.fill();
  }
}
