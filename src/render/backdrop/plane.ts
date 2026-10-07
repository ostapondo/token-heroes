import type { BackdropDef, SceneryDef, SceneryKind } from '@content';
import { ARENA, floorTop } from '../scene/geometry';
import type { Pixels } from './pixels';
import { rampAt } from './tone';

export const WIDTH = ARENA.width;
export const BOTTOM = ARENA.height;
export const HORIZON = floorTop();
// The light behind the foes: the celestial body hangs over the boss's head, clear of the HUD.
export const LIGHT = { x: 144, y: 70 } as const;
const GROUND = BOTTOM - HORIZON;

export type Piece<K extends SceneryKind> = Extract<SceneryDef, { readonly kind: K }>;
export type Animation = (context: CanvasRenderingContext2D, time: number) => void;

export interface Spot {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

const SKY_SEAM = 0.5;
const GROUND_SEAM = 0.55;
// Ground bands bunch toward the horizon like a plane seen at a low angle.
const RECEDE = 0.62;
const POOL = { x: 100, y: 150, rx: 110, ry: 30, lift: 0.3 } as const;

export const depthAt = (y: number): number => Math.max(0, (y - HORIZON) / (GROUND - 1));

// Sky bands from the top down, ground bands from the horizon down, lifted in a pool of light
// where the fight stands.
export function paintBands(p: Pixels, backdrop: BackdropDef): void {
  for (let y = 0; y < HORIZON; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      p.set(x, y, rampAt(backdrop.sky, y / (HORIZON - 1), x, y, SKY_SEAM));
    }
  }
  const lift = backdrop.pool ?? POOL.lift;

  for (let y = HORIZON; y < BOTTOM; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const distance = ((x - POOL.x) / POOL.rx) ** 2 + ((y - POOL.y) / POOL.ry) ** 2;
      const share = depthAt(y) ** RECEDE - Math.max(0, 1 - distance) * lift;

      p.set(x, y, rampAt(backdrop.ground, share, x, y, GROUND_SEAM));
    }
  }
}

// Rows a fixed step apart on the ground land closer together near the horizon.
export const perspectiveRows = (count: number): number[] =>
  Array.from(
    { length: count },
    (_, k) => HORIZON + Math.round(GROUND * ((k + 1) / (count + 0.6)) ** 2),
  );

export const recedingX = (offset: number, y: number): number =>
  WIDTH / 2 + (offset * (y - HORIZON)) / GROUND;

// Places things on the ground, more of them toward the viewer.
export function scatter(random: () => number, count: number, minDepth: number): Spot[] {
  return Array.from({ length: count }, () => {
    const depth = minDepth + (1 - minDepth) * Math.sqrt(random());

    return {
      x: Math.floor(random() * WIDTH),
      y: Math.round(HORIZON + 1 + depth * (GROUND - 2)),
      depth,
    };
  });
}

// A flat ellipse on the ground: wide and thin far away, rounder up close.
export function groundPool(
  p: Pixels,
  spot: Spot,
  size: number,
  colors: { fill: string; rim: string; shine: string },
): void {
  const rx = Math.round(size * (0.45 + spot.depth));
  const ry = Math.max(1, Math.round(rx * 0.22));

  for (let dy = -ry; dy <= ry; dy += 1) {
    const half = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.5)) ** 2));

    p.span(spot.x - half, spot.x + half, spot.y + dy, dy === -ry ? colors.rim : colors.fill);
  }
  p.span(
    spot.x - Math.round(rx * 0.4),
    spot.x - Math.round(rx * 0.1),
    spot.y - ry + 1,
    colors.shine,
  );
}
