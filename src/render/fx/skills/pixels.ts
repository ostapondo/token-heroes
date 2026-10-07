import type { Point } from '../../scene/geometry';

export const dot = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width = 1,
  height = 1,
) => context.fillRect(Math.round(x), Math.round(y), width, height);

export const between = (low: number, high: number): number => low + Math.random() * (high - low);

// Opaque until `from`, then fading to nothing at the end of the effect.
export const fadeAfter = (progress: number, from: number): number =>
  progress < from ? 1 : 1 - (progress - from) / (1 - from);

export function line(context: CanvasRenderingContext2D, from: Point, to: Point, width: number) {
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y)));

  for (let step = 0; step <= steps; step += 1) {
    const x = from.x + ((to.x - from.x) * step) / steps;
    const y = from.y + ((to.y - from.y) * step) / steps;

    dot(context, x - width / 2, y - width / 2, width, width);
  }
}

export function polyline(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  width: number,
) {
  points.forEach((point, index) => {
    const previous = points[index - 1];

    if (previous) line(context, previous, point, width);
  });
}

// A crooked path from one point to another, bowed most in the middle.
export function jagged(from: Point, to: Point, steps: number, sway: number): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const middle = Array.from({ length: Math.max(steps - 1, 0) }, (_, index) => {
    const along = (index + 1) / steps;
    const offset = between(-sway, sway) * Math.sin(along * Math.PI);

    return {
      x: from.x + dx * along - (dy / length) * offset,
      y: from.y + dy * along + (dx / length) * offset,
    };
  });

  return [from, ...middle, to];
}
