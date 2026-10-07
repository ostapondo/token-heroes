import { mergeHeights, mounds, peaks } from './heights';
import type { Pixels } from './pixels';
import { HORIZON, LIGHT, WIDTH, type Animation, type Piece } from './plane';

const H = HORIZON;

export function chapel(p: Pixels, piece: Piece<'chapel'>): void {
  const { x, color } = piece;

  p.rect(x, H - 16, 16, 16, color);
  p.skyline(
    peaks(WIDTH, [[x + 8, 22, 0.75]]).map((height) => (height > 16 ? height : 0)),
    H,
    color,
  );
  p.rect(x + 16, H - 28, 5, 28, color);
  p.column(x + 18, H - 34, H - 28, color);
  p.span(x + 16, x + 20, H - 32, color);
  p.column(x + 18, H - 24, H - 22, piece.window);
  p.column(x + 6, H - 9, H - 6, piece.door);
}

// Tombstones and crosses, each with a moonlit edge on the side facing the light.
export function graves(p: Pixels, piece: Piece<'graves'>): void {
  for (const [x, width, height] of piece.tombs) {
    p.rect(x, H - height + 1, width, height - 1, piece.color);
    p.span(x + 1, x + width - 2, H - height, piece.color);
    p.column(x + width - 1, H - height + 2, H - 1, piece.rim);
  }
  for (const [x, height] of piece.crosses) {
    p.rect(x, H - height, 2, height, piece.color);
    p.rect(x - 2, H - height + 3, 6, 2, piece.color);
    p.column(x + 1, H - height, H - height + 2, piece.rim);
  }
}

export function fence(p: Pixels, piece: Piece<'fence'>): void {
  for (let x = piece.from; x <= piece.to; x += piece.step) {
    p.column(x, H - piece.height, H, piece.color);
    if (piece.tip) p.set(x, H - piece.height - 1, piece.tip);
    if (piece.spear) {
      p.set(x - 1, H - piece.height + 1, piece.color);
      p.set(x + 1, H - piece.height + 1, piece.color);
    }
  }
  for (const rail of piece.rails) p.span(piece.from, piece.to, H - rail, piece.color);
}

const LANCETS = [-20, -19, -12, -11, 12, 13, 20, 21] as const;

export function cathedral(p: Pixels, piece: Piece<'cathedral'>): void {
  const { x } = piece;
  const nave = peaks(WIDTH, [[x, 30, 0.9]]).map((height, column) =>
    Math.abs(column - x) <= 26 ? Math.max(height, 18) : height,
  );
  const spires = peaks(WIDTH, [
    [x - 16, 42, 1.4],
    [x + 16, 36, 1.4],
  ]);

  p.skyline(mergeHeights(nave, spires), H, piece.color);
  for (const dx of LANCETS) p.column(x + dx, H - 12, H - 8, piece.glass);
  p.disc(x, H - 12, 3, piece.rose[0]);
  p.set(x, H - 12, piece.rose[1]);
}

export function ziggurat(p: Pixels, piece: Piece<'ziggurat'>): void {
  const { x } = piece;

  for (let tier = 0; tier < 6; tier += 1) {
    const left = x + tier * 6;
    const width = 72 - tier * 12;
    const top = H - (tier + 1) * 5;

    p.rect(left, top, width, 5, tier % 2 ? piece.shade : piece.color);
    p.span(left, left + width - 1, top, piece.edge);
  }
  p.rect(x + 30, H - 36, 12, 6, piece.color);
  p.rect(x + 34, H - 34, 4, 4, piece.door);
}

export function colonnade(p: Pixels, piece: Piece<'colonnade'>): void {
  p.rect(piece.x, H - 31, WIDTH - piece.x, 3, piece.cap);
  for (let x = piece.x + 4; x < WIDTH; x += 10) {
    p.rect(x, H - 28, 4, 28, piece.color);
    p.rect(x - 1, H - 28, 6, 2, piece.cap);
    p.column(x + 3, H - 26, H - 1, piece.edge);
  }
}

const GLINT = { share: 0.08, period: 2.4, lit: 0.5, stagger: 0.37, rate: 0.8 } as const;

// Heaps of coins whose top edges catch the light, a few of them flashing in turn.
export function hoard(p: Pixels, piece: Piece<'hoard'>, random: () => number): Animation {
  const heights = mounds(WIDTH, piece.mounds);

  p.skyline(heights, H, piece.color, piece.rim);
  const glints = heights.flatMap((height, x) =>
    height > 2 && random() < GLINT.share ? [{ x, y: H - height }] : [],
  );

  for (const glint of glints) p.set(glint.x, glint.y, piece.glint);

  return (context, time) => {
    glints.forEach((glint, index) => {
      if ((time * GLINT.rate + index * GLINT.stagger) % GLINT.period > GLINT.lit) return;
      context.fillStyle = piece.glint;
      context.fillRect(glint.x - 1, glint.y, 3, 1);
      context.fillRect(glint.x, glint.y - 1, 1, 3);
      context.fillStyle = piece.sparkle;
      context.fillRect(glint.x, glint.y, 1, 1);
    });
  };
}

export function monoliths(p: Pixels, piece: Piece<'monoliths'>): void {
  for (const [x, width, height] of piece.monoliths) {
    p.rect(x, H - height + 2, width, height - 2, piece.color);
    p.span(x + 1, x + width - 2, H - height + 1, piece.color);
    p.span(x + Math.floor(width / 2) - 1, x + Math.ceil(width / 2), H - height, piece.color);
    p.column(x + width - 1, H - height + 3, H - 1, x > LIGHT.x ? piece.rimFar : piece.rim);
  }
}

export function ruins(p: Pixels, piece: Piece<'ruins'>, random: () => number): void {
  for (const [x, width, height] of piece.ruins) {
    for (let dx = 0; dx < width; dx += 1) {
      const top = H - height + Math.floor(random() * 4);

      p.column(x + dx, top, H, piece.color);
      if (dx === width - 1) p.column(x + dx, top + 1, H - 1, piece.rim);
    }
  }
}
