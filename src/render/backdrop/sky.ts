import type { Pixels } from './pixels';
import { HORIZON, LIGHT, WIDTH, type Animation, type Piece } from './plane';

const TWINKLE = { period: 2, lit: 0.3, stagger: 0.57 } as const;
const CORONA_GLINT = [-2.5, -0.55] as const;

const twinkling = (time: number, index: number): boolean =>
  (time + index * TWINKLE.stagger) % TWINKLE.period < TWINKLE.lit;

export function stars(p: Pixels, piece: Piece<'stars'>, random: () => number): Animation {
  const placed = Array.from({ length: piece.count }, () => {
    const star = { x: Math.floor(random() * WIDTH), y: Math.floor(random() * piece.below) };

    p.set(star.x, star.y, piece.colors[Math.floor(random() * piece.colors.length)] ?? piece.flash);

    return star;
  });
  const flickering = placed.slice(0, piece.twinkle);

  return (context, time) => {
    context.fillStyle = piece.flash;
    flickering.forEach((star, index) => {
      if (twinkling(time, index)) context.fillRect(star.x, star.y, 1, 1);
    });
  };
}

export function orb(p: Pixels, piece: Piece<'orb'>): void {
  const x = LIGHT.x;
  const y = LIGHT.y + (piece.lift ?? 0);

  for (const [inner, outer, color, strength] of piece.halos) {
    p.halo(x, y, inner, outer, color, strength);
  }
  const radius = piece.discs[0]?.[0] ?? 0;

  if (piece.corona) {
    p.ring(x, y, radius + 1, piece.corona.color);
    p.ring(x, y, radius + 1, piece.corona.glint, ...CORONA_GLINT);
  }
  for (const [size, color, dx, dy] of piece.discs) p.disc(x + dx, y + dy, size, color);
  for (const [dx, dy, size] of piece.spots?.at ?? []) {
    p.disc(x + dx, y + dy, size, piece.spots?.color ?? '#000000');
  }
}

// Curtains of light: thin columns every other pixel, swaying on two waves.
export function aurora(piece: Piece<'aurora'>): Animation {
  return (context, time) => {
    for (const [top, color, speed] of piece.ribbons) {
      context.fillStyle = color;
      for (let x = 0; x < WIDTH; x += 2) {
        const sway =
          Math.sin(x * 0.045 + time * speed) * 8 + Math.sin(x * 0.11 + time * speed * 2) * 3;
        const y = top + Math.round(sway);
        const strength = 0.5 + Math.sin(x * 0.07 - time * speed * 3) * 0.5;

        context.globalAlpha = 0.2 * strength;
        context.fillRect(x, y, 1, 6);
        context.globalAlpha = 0.09 * strength;
        context.fillRect(x, y + 6, 1, 10);
      }
    }
    context.globalAlpha = 1;
  };
}

export function clouds(p: Pixels, piece: Piece<'clouds'>, random: () => number): void {
  const phase = random() * 10;

  for (let x = 0; x < WIDTH; x += 1) {
    if (Math.sin(x * 0.041 + phase) > 0.55) continue;
    const upper =
      piece.top + Math.round(Math.sin(x * 0.09 + phase) * 2 + Math.sin(x * 0.23 + phase) * 1.5);
    const lower = piece.top + piece.thick + Math.round(Math.sin(x * 0.13 + phase * 2) * 2);

    p.column(x, upper, lower, piece.body);
    p.set(x, lower, piece.lit);
    p.stipple(x, lower - 1, piece.lit, 0.5);
  }
}

const RAIN_BANDS = [
  [14, 64],
  [112, 150],
] as const;

// A low ceiling of storm cloud, with grey curtains of rain falling from it.
export function overcast(p: Pixels, piece: Piece<'overcast'>): void {
  for (let x = 0; x < WIDTH; x += 1) {
    const edge =
      30 + Math.round(Math.sin(x * 0.07) * 6 + Math.sin(x * 0.19 + 1) * 4 + Math.sin(x * 0.37) * 2);

    p.column(x, 0, edge, piece.body);
    p.set(x, edge, piece.rim);
    p.stipple(x, edge - 1, piece.shade, 0.6);
    p.stipple(x, edge - 2, piece.shade, 0.3);
    const raining = RAIN_BANDS.some(([from, to]) => x > from && x < to);

    if (raining && x % 3 === 0) p.line(x, edge + 2, x - 12, HORIZON - 4, piece.curtain, 0.35);
  }
}

export function rays(p: Pixels, piece: Piece<'rays'>): void {
  const reach = HORIZON - 30;

  for (const [start, width] of piece.shafts) {
    for (let y = 0; y < reach; y += 1) {
      const left = start + y * 0.6;

      for (let x = left; x < left + width; x += 1)
        p.stipple(x, y, piece.color, 0.3 * (1 - y / reach));
    }
  }
}
