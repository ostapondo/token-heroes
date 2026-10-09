import type { Point } from '../../geometry';
import type { PathFn, Painter } from '../paint/painter';
import { pick } from './beast';

// Soft bodies have ten rim points from the top round, then the centre.
export const RIM = 10;

// The rim as one smooth closed curve through the midpoints of its points.
export function rimPath(p: Painter, P: readonly Point[]): PathFn {
  const mid = (i: number): Point => {
    const a = pick(P, i % RIM);
    const b = pick(P, (i + 1) % RIM);

    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  return (ox, oy) => {
    const start = mid(RIM - 1);

    p.ctx.moveTo(ox + start.x, oy + start.y);
    for (let i = 0; i < RIM; i += 1) {
      const corner = pick(P, i);
      const next = mid(i);

      p.ctx.quadraticCurveTo(ox + corner.x, oy + corner.y, ox + next.x, oy + next.y);
    }
    p.ctx.closePath();
  };
}

// The blob's width and height from its rim, and its centre.
export function extent(P: readonly Point[]): { cx: number; cy: number; w: number; h: number } {
  const rim = P.slice(0, RIM);
  const xs = rim.map((point) => point.x);
  const ys = rim.map((point) => point.y);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);

  return {
    cx: (x0 + Math.max(...xs)) / 2,
    cy: (y0 + Math.max(...ys)) / 2,
    w: Math.max(...xs) - x0,
    h: Math.max(...ys) - y0,
  };
}
