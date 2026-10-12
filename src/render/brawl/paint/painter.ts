import type { Point } from '../../geometry';
import type { Shade } from './colors';

export const OUTLINE = '#140c07';
export type PathFn = (ox: number, oy: number) => void;
export type Mood = 'idle' | 'shout' | 'hurt' | 'happy' | 'dead';

const SHAPES = new Map<string, number[][]>();

function parse(points: string): number[][] {
  let parsed = SHAPES.get(points);

  if (!parsed) {
    parsed = points.split(' ').map((point) => point.split(',').map(Number));
    SHAPES.set(points, parsed);
  }

  return parsed;
}

// Draws cel-shaded parts: an outline, the shade on the far side from the light, the lit body and
// a warm rim toward the light. Each part is drawn in the frame of its bone.
export class Painter {
  ctx: CanvasRenderingContext2D;
  outline = 2.6;
  mood: Mood = 'idle';
  readonly #light = { x: -0.3, y: -0.45 };

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // Local +y runs along the bone from a to b, local +x the way the body faces. Call restore after.
  frame(a: Point, b: Point, facing: number): number {
    const theta = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2;
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    this.ctx.save();
    this.ctx.translate(a.x, a.y);
    this.ctx.rotate(theta);
    this.ctx.scale(facing, 1);
    this.#light.x = (-0.3 * c - 0.45 * s) * facing;
    this.#light.y = 0.3 * s - 0.45 * c;

    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  restore(): void {
    this.ctx.restore();
  }

  worldLight(): void {
    this.#light.x = -0.3;
    this.#light.y = -0.45;
  }

  cel(path: PathFn, shade: Shade, size: number): void {
    const { ctx } = this;
    const light = this.#light;

    ctx.beginPath();
    path(0, 0);
    ctx.lineJoin = 'round';
    ctx.lineWidth = this.outline;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = shade[1];
    ctx.fill();
    ctx.beginPath();
    path(light.x * size * 0.7, light.y * size * 0.7);
    ctx.fillStyle = shade[0];
    ctx.fill();
    ctx.beginPath();
    path(0, 0);
    path(-light.x * size * 0.32, -light.y * size * 0.32);
    ctx.fillStyle = 'rgba(255,236,210,.24)';
    ctx.fill('evenodd');
    ctx.restore();
  }

  circle(cx: number, cy: number, r: number): PathFn {
    return (ox, oy) => {
      this.ctx.moveTo(ox + cx + r, oy + cy);
      this.ctx.arc(ox + cx, oy + cy, r, 0, Math.PI * 2);
    };
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, rotation = 0): PathFn {
    return (ox, oy) => {
      this.ctx.moveTo(ox + cx + rx * Math.cos(rotation), oy + cy + rx * Math.sin(rotation));
      this.ctx.ellipse(ox + cx, oy + cy, rx, ry, rotation, 0, Math.PI * 2);
    };
  }

  // A capsule down the bone: radius r1 at the joint, r2 at the far end.
  capsule(length: number, r1: number, r2: number): PathFn {
    return (ox, oy) => {
      this.ctx.moveTo(ox + r1, oy);
      this.ctx.arc(ox, oy, r1, 0, Math.PI, true);
      this.ctx.arc(ox, oy + length, r2, Math.PI, 0, true);
      this.ctx.closePath();
    };
  }

  // A capsule lying across: from x0 to x1 at height y.
  bar(x0: number, x1: number, y: number, r: number): PathFn {
    return (ox, oy) => {
      const { ctx } = this;

      ctx.moveTo(ox + x0, oy + y - r);
      ctx.lineTo(ox + x1, oy + y - r);
      ctx.arc(ox + x1, oy + y, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(ox + x0, oy + y + r);
      ctx.arc(ox + x0, oy + y, r, Math.PI / 2, Math.PI * 1.5);
      ctx.closePath();
    };
  }

  // A closed shape from a string of points, "x,y" for a corner and "cx,cy,x,y" for a curve,
  // in units of k.
  shape(points: string, k = 1): PathFn {
    const parsed = parse(points);

    return (ox, oy) => {
      const { ctx } = this;

      parsed.forEach((p, index) => {
        const [a = 0, b = 0, c = 0, d = 0] = p;

        if (index === 0) ctx.moveTo(ox + a * k, oy + b * k);
        else if (p.length === 4)
          ctx.quadraticCurveTo(ox + a * k, oy + b * k, ox + c * k, oy + d * k);
        else ctx.lineTo(ox + a * k, oy + b * k);
      });
      ctx.closePath();
    };
  }

  // A closed polygon through computed corners given as x, y, x, y and so on.
  polygon(...xy: number[]): PathFn {
    return (ox, oy) => {
      for (let i = 0; i + 1 < xy.length; i += 2) {
        const x = ox + (xy[i] ?? 0);
        const y = oy + (xy[i + 1] ?? 0);

        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
    };
  }

  // An outlined line through x, y, x, y and so on.
  polyline(width: number, color: string, ...xy: number[]): void {
    const { ctx } = this;

    ctx.beginPath();
    for (let i = 0; i + 1 < xy.length; i += 2) {
      if (i === 0) ctx.moveTo(xy[i] ?? 0, xy[i + 1] ?? 0);
      else ctx.lineTo(xy[i] ?? 0, xy[i + 1] ?? 0);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width + this.outline;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  segment(x1: number, y1: number, x2: number, y2: number, width: number, color: string): void {
    this.polyline(width, color, x1, y1, x2, y2);
  }

  // An outlined line through a constant string of points, in units of k.
  stroke(points: string, k: number, width: number, color: string): void {
    this.polyline(width, color, ...parse(points).flatMap(([x = 0, y = 0]) => [x * k, y * k]));
  }

  dot(x: number, y: number, r: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  glow(x: number, y: number, r: number, color: string, strength: number): void {
    const { ctx } = this;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(0.1, r));

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= strength;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // A limb from joint a to joint b, with an optional band across it, such as a cuff or a crack.
  bone(
    a: Point,
    b: Point,
    radii: readonly [number, number],
    shade: Shade,
    facing: number,
    band?: (length: number) => void,
  ): void {
    const length = this.frame(a, b, facing);

    this.cel(this.capsule(length, radii[0], radii[1]), shade, Math.max(radii[0], radii[1]));
    band?.(length);
    this.restore();
  }
}
