import { LitterShape, PoolMotion } from '@content';
import type { Pixels } from './pixels';
import {
  BOTTOM,
  HORIZON,
  WIDTH,
  depthAt,
  groundPool,
  scatter,
  type Animation,
  type Piece,
  type Spot,
} from './plane';

const PULSE = { rate: 2.2, threshold: 0.25 } as const;
const BUBBLE = { every: 37, period: 1.6, rise: 0.6, stagger: 0.41 } as const;

// Glowing cracks wander across the crust, steeper the closer they run to the viewer.
export function cracks(p: Pixels, piece: Piece<'cracks'>, random: () => number): Animation {
  const path: { x: number; y: number }[] = [];

  for (let crack = 0; crack < piece.count; crack += 1) {
    let x = Math.floor(random() * WIDTH);
    let y = HORIZON + 4 + Math.floor(random() * (BOTTOM - HORIZON - 6));
    const length = Math.round(16 + depthAt(y) * 50);
    const direction = random() > 0.5 ? 1 : -1;

    for (let step = 0; step < length; step += 1) {
      x += direction;
      if (random() < 0.25 + depthAt(y) * 0.35) y += random() > 0.5 ? 1 : -1;
      y = Math.max(HORIZON + 3, Math.min(BOTTOM - 1, y));
      path.push({ x, y });
      p.set(x, y, piece.color);
      p.stipple(x, y - 1, piece.glow, 0.6);
      p.stipple(x, y + 1, piece.glow, 0.4);
    }
  }
  const vents = path.filter((_, index) => index % BUBBLE.every === 0);

  return (context, time) => {
    for (const { x, y } of path) {
      const hot = Math.sin(time * PULSE.rate + x * 0.12 + y * 0.4) > PULSE.threshold;

      context.fillStyle = hot ? piece.hot : piece.warm;
      context.fillRect(x, y, 1, 1);
    }
    context.fillStyle = piece.bubble;
    vents.forEach((vent, index) => {
      const phase = ((time + index * BUBBLE.stagger) % BUBBLE.period) / BUBBLE.period;

      if (phase > BUBBLE.rise) return;
      const size = Math.ceil(phase * 3);

      context.fillRect(vent.x, vent.y - size, size, size);
    });
  };
}

const RIPPLE = { period: 1.2, rate: 1.4, stagger: 0.29 } as const;
const POP = { period: 2, rise: 0.5, stagger: 0.37 } as const;

export function pools(p: Pixels, piece: Piece<'pools'>, random: () => number): Animation | null {
  const spots = scatter(random, piece.count, piece.minDepth);

  for (const spot of spots) groundPool(p, spot, piece.size, piece);
  const { motion } = piece;

  if (!motion) return null;

  return motion.kind === PoolMotion.Ripples
    ? (context, time) => ripples(context, time, spots, motion.color)
    : (context, time) => bubbles(context, time, spots, motion.color);
}

function ripples(context: CanvasRenderingContext2D, time: number, spots: Spot[], color: string) {
  context.fillStyle = color;
  spots.forEach((spot, index) => {
    const phase = ((time * RIPPLE.rate + index * RIPPLE.stagger) % RIPPLE.period) / RIPPLE.period;
    const reach = 1 + Math.round(phase * 3 * (0.6 + spot.depth));

    context.globalAlpha = 1 - phase;
    context.beginPath();
    context.rect(spot.x - reach, spot.y, 1, 1);
    context.rect(spot.x + reach, spot.y, 1, 1);
    context.rect(spot.x - reach + 1, spot.y - 1, reach * 2 - 1, 1);
    context.fill();
  });
  context.globalAlpha = 1;
}

function bubbles(context: CanvasRenderingContext2D, time: number, spots: Spot[], color: string) {
  context.fillStyle = color;
  context.beginPath();
  spots.forEach((spot, index) => {
    const phase = ((time + index * POP.stagger) % POP.period) / POP.period;

    if (phase > POP.rise) return;
    const size = Math.ceil(phase * 4);

    context.rect(spot.x, spot.y - size, size, size);
  });
  context.fill();
}

// Small things on the ground, larger toward the viewer.
export function litter(p: Pixels, piece: Piece<'litter'>, random: () => number): Animation | null {
  const spots = scatter(random, piece.count, piece.minDepth);
  const [main = '#000000', accent = main] = piece.colors;

  if (piece.shape === LitterShape.Sparkle) {
    return (context, time) => {
      context.fillStyle = main;
      spots.forEach((spot, index) => {
        if ((time * 1.3 + index * 0.53) % 2 < 0.35) context.fillRect(spot.x, spot.y, 1, 1);
      });
    };
  }
  for (const spot of spots) drawLitter(p, piece.shape, spot, main, accent, random);

  return null;
}

function drawLitter(
  p: Pixels,
  shape: LitterShape,
  { x, y, depth }: Spot,
  main: string,
  accent: string,
  random: () => number,
): void {
  const grown = (most: number) => Math.round(depth * most);

  switch (shape) {
    case LitterShape.Pebble:
      p.span(x, x + (depth > 0.5 ? 1 : 0), y, main);
      p.set(x, y - (depth > 0.5 ? 1 : 0), accent);
      break;
    case LitterShape.Crack: {
      const length = 2 + grown(6);
      const slope = random() > 0.5 ? 0 : random() > 0.5 ? 0.5 : -0.5;

      p.line(x, y, x + length, y + Math.round(length * slope * depth), main);
      break;
    }
    case LitterShape.Tuft:
      p.column(x, y - 1 - grown(2), y, main);
      p.set(x - 1, y - grown(2), accent);
      p.set(x + 1, y - grown(1), accent);
      break;
    case LitterShape.Reed:
      p.column(x, y - 2 - grown(6), y, main);
      p.column(x + 2, y - grown(6), y, main);
      p.rect(x, y - 3 - grown(6), 1, 2, accent);
      break;
    case LitterShape.Bone:
      p.span(x, x + 2 + grown(3), y, main);
      p.set(x, y - 1, accent);
      p.set(x + 2 + grown(3), y - 1, accent);
      break;
    case LitterShape.Skull:
      p.rect(x, y, 3, 3, main);
      p.set(x, y + 1, accent);
      p.set(x + 2, y + 1, accent);
      break;
    case LitterShape.Coin:
      p.span(x, x + (depth > 0.6 ? 1 : 0), y, main);
      p.set(x, y + 1, accent);
      break;
    case LitterShape.Sparkle:
      break;
    default:
      unknownShape(shape);
  }
}

function unknownShape(shape: never): never {
  throw new Error(`No litter draws ${JSON.stringify(shape)}`);
}
