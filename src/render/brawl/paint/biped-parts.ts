import type { Palette } from '@content';
import type { Point } from '../../geometry';
import { J } from '../rig/skeleton';
import { darken, shadeOf, type Shade } from './colors';
import type { Kit } from './kit';
import type { Painter } from './painter';

export const pointAt = (points: readonly Point[], index: number): Point =>
  points[index] ?? { x: 0, y: 0 };

export function kitFor(p: Painter, palette: Palette, t: number): Kit {
  return {
    p,
    t,
    shade: (paint) => shadeOf(paint, palette),
    lit: (paint) => shadeOf(paint, palette)[0],
  };
}

// A robe hangs from the hips past the knees, between whichever knee is in front.
export function robe(kit: Kit, P: readonly Point[], shade: Shade, hips: number): void {
  const pelvis = pointAt(P, J.pelvis);
  const neck = pointAt(P, J.neck);
  const length = Math.hypot(pelvis.y - neck.y, pelvis.x - neck.x) || 1;
  const nx = -(pelvis.y - neck.y) / length;
  const ny = (pelvis.x - neck.x) / length;
  const hem = (knee: Point): Point => ({
    x: knee.x + (knee.x - pelvis.x) * 0.45,
    y: knee.y + (knee.y - pelvis.y) * 0.45,
  });
  const one = hem(pointAt(P, J.kneeF));
  const two = hem(pointAt(P, J.kneeB));
  const side = (point: Point) => (point.x - pelvis.x) * nx + (point.y - pelvis.y) * ny;
  const [a, b] = side(one) < side(two) ? [two, one] : [one, two];
  const { p } = kit;

  p.worldLight();
  p.cel(
    p.polygon(
      pelvis.x + nx * hips,
      pelvis.y + ny * hips,
      a.x + nx * 2,
      a.y + ny * 2,
      b.x - nx * 2,
      b.y - ny * 2,
      pelvis.x - nx * hips,
      pelvis.y - ny * hips,
    ),
    shade,
    hips,
  );
}

// Bands drawn along a limb in its frame: glowing cracks, a cuff at the wrist, a boot at the foot.
export function bands(kit: Kit, scale: number, hero: boolean) {
  const { p } = kit;

  return {
    crack: (color: string | undefined, r: number) =>
      color
        ? (length: number) => {
            p.ctx.save();
            p.ctx.globalCompositeOperation = 'lighter';
            p.ctx.globalAlpha *= 0.75 + 0.25 * Math.sin(kit.t * 6 + length);
            const zig = [r * 0.15, r * 0.2, -r * 0.3, length * 0.3, r * 0.25, length * 0.58];

            p.polyline(r * 0.18, color, ...zig, -r * 0.12, length * 0.85);
            p.ctx.restore();
          }
        : undefined,
    cuff: (shade: Shade, r: number) =>
      hero
        ? (length: number) => {
            p.ctx.fillStyle = darken(shade[1], 0.8);
            p.ctx.fillRect(-r, length * 0.8, r * 2, Math.max(1, r * 0.55));
          }
        : undefined,
    boot: (shade: Shade, radius: number) => (length: number) =>
      p.cel(
        p.bar(-radius * 0.5, 4.2 * scale, length + radius * 0.25, radius * 1.02),
        shade,
        radius,
      ),
  };
}

// Paints what a hand holds in the hand's frame: +y runs on along the forearm, +x across the fist.
export function inHand(p: Painter, elbow: Point, hand: Point, facing: number, paint: () => void) {
  p.frame(hand, { x: hand.x * 2 - elbow.x, y: hand.y * 2 - elbow.y }, facing);
  paint();
  p.restore();
}
