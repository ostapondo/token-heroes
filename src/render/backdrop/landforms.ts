import {
  mesas as mesaHeights,
  mounds,
  peaks as peakHeights,
  ridge as ridgeHeights,
} from './heights';
import type { Pixels } from './pixels';
import { HORIZON, WIDTH, type Piece } from './plane';

export function ridge(p: Pixels, piece: Piece<'ridge'>, random: () => number): void {
  const heights = ridgeHeights(random, WIDTH, piece.base, piece.amplitude, piece.roughness);

  p.skyline(heights, HORIZON, piece.color, piece.rim);
  const { glow } = piece;

  if (!glow) return;
  heights.forEach((height, x) => {
    if (height <= 2) p.set(x, HORIZON - 1, glow);
  });
}

const SNOW_LINE = 16;

export function peaks(p: Pixels, piece: Piece<'peaks'>, random: () => number): void {
  const heights = peakHeights(WIDTH, piece.peaks, random);

  p.skyline(heights, HORIZON, piece.color, piece.rim);
  const { snow } = piece;

  if (!snow) return;
  heights.forEach((height, x) => {
    if (height < SNOW_LINE) return;
    const top = HORIZON - height;

    p.set(x, top, snow.line);
    p.column(x, top + 1, top + Math.round((height - SNOW_LINE + 2) * 0.3), snow.cap);
  });
}

const CRATER = { half: 5, depth: 5 } as const;

export function volcano(p: Pixels, piece: Piece<'volcano'>, random: () => number): void {
  const [cx, height] = piece.peak;
  const rim = height - CRATER.depth;
  const heights = peakHeights(WIDTH, [piece.peak], random).map((h, x) =>
    Math.abs(x - cx) <= CRATER.half ? Math.min(h, rim) : h,
  );

  p.halo(cx, HORIZON - height + 2, 0, 16, piece.glow, 0.8);
  p.skyline(heights, HORIZON, piece.color, piece.rim);
  p.span(cx - CRATER.half, cx + CRATER.half, HORIZON - rim, piece.crater[0]);
  p.span(cx - CRATER.half + 1, cx + CRATER.half - 1, HORIZON - rim + 1, piece.crater[1]);
  for (const [start, drift] of [
    [-3, -0.35],
    [2, 0.3],
    [0, 0.05],
  ] as const) {
    let x = cx + start;

    for (let y = HORIZON - rim + 2; y < HORIZON; y += 1) {
      x += drift + (random() - 0.5) * 0.8;
      p.set(x, y, y < HORIZON - rim * 0.7 ? piece.lava[0] : piece.lava[1]);
    }
  }
}

export function mesas(p: Pixels, piece: Piece<'mesas'>, random: () => number): void {
  const heights = mesaHeights(WIDTH, piece.mesas, random);

  p.skyline(heights, HORIZON, piece.color, piece.rim);
  heights.forEach((height, x) => {
    if (height > 8) p.set(x, HORIZON - Math.round(height * 0.55), piece.strata);
  });
}

// Ice spires: a lit face, a shaded face and a bright edge along the lit side.
export function shards(p: Pixels, piece: Piece<'shards'>): void {
  for (const [cx, height, half] of piece.shards) {
    for (let dx = -half; dx <= half; dx += 1) {
      const h = Math.round(height * (1 - Math.abs(dx) / (half + 1)));

      p.column(cx + dx, HORIZON - h, HORIZON, dx < 0 ? piece.lit : piece.shade);
      if (dx === -1) p.column(cx + dx, HORIZON - h + 2, HORIZON - 2, piece.edge);
    }
    p.set(cx, HORIZON - height, piece.tip);
  }
}

const CROWNS = 16;

export function canopy(p: Pixels, piece: Piece<'canopy'>): void {
  const crowns = Array.from({ length: CROWNS }, (_, i) => {
    const radius = 6 + ((i * 5) % 7);

    return [i * 13 + ((i * 7) % 5), radius, radius] as const;
  });
  const heights = mounds(WIDTH, crowns).map((height) => (height > 0 ? height + 6 : 0));

  p.skyline(heights, HORIZON, piece.color, piece.rim);
}

export function trees(p: Pixels, piece: Piece<'trees'>, random: () => number): void {
  for (const [x, height] of piece.trees) deadTree(p, random, x, height, piece);
}

function deadTree(
  p: Pixels,
  random: () => number,
  x: number,
  height: number,
  colors: { color: string; moss?: string },
): void {
  const lean = (random() - 0.5) * 0.25;

  for (let y = HORIZON; y >= HORIZON - height; y -= 1) {
    const trunk = x + Math.round((HORIZON - y) * lean);

    p.span(trunk, trunk + (y > HORIZON - height * 0.35 ? 1 : 0), y, colors.color);
  }
  const branches = 4 + Math.floor(random() * 3);

  for (let branch = 0; branch < branches; branch += 1) {
    const from = HORIZON - Math.round(height * (0.45 + random() * 0.5));
    const sx = x + Math.round((HORIZON - from) * lean);
    const side = branch % 2 === 0 ? 1 : -1;
    const length = 4 + Math.floor(random() * 8);
    const ex = sx + side * length;
    const ey = from - Math.round(length * (0.4 + random() * 0.6));

    p.line(sx, from, ex, ey, colors.color);
    p.line(ex, ey, ex + side * 2, ey - 2, colors.color);
    if (!colors.moss) continue;
    const hang = 2 + Math.floor(random() * 5);

    for (let k = 0; k < hang; k += 1) p.stipple(ex, ey + 1 + k, colors.moss, 1 - k / hang);
  }
}
