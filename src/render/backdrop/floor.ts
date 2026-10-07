import type { Pixels } from './pixels';
import {
  BOTTOM,
  HORIZON,
  LIGHT,
  WIDTH,
  depthAt,
  perspectiveRows,
  recedingX,
  type Piece,
} from './plane';

const FAN = 8;

export function horizonLine(p: Pixels, piece: Piece<'horizon-line'>): void {
  p.span(0, WIDTH - 1, HORIZON, piece.color);
}

// Wind ripples or a wet sheen: broken dashes along receding rows, tighter far away.
export function furrows(p: Pixels, piece: Piece<'furrows'>): void {
  for (const y of perspectiveRows(piece.rows)) {
    const wave = piece.wave - depthAt(y) * piece.tighten;

    for (let x = 0; x < WIDTH; x += 1) {
      if (Math.sin(x * wave + y * 1.7) <= piece.threshold) continue;
      p.set(x, y, piece.color);
      if (piece.shade) p.set(x, y + 1, piece.shade);
    }
  }
}

// A tiled floor: rows bunching toward the horizon and seams running to its middle.
export function tiles(p: Pixels, piece: Piece<'tiles'>): void {
  for (const y of perspectiveRows(piece.rows)) {
    p.span(0, WIDTH - 1, y, piece.line);
    if (piece.shine) p.span(0, WIDTH - 1, y + 1, piece.shine);
  }
  for (let seam = -FAN; seam <= FAN; seam += 1) {
    for (let y = HORIZON + 3; y < BOTTOM; y += 1)
      p.set(recedingX(seam * piece.spacing, y), y, piece.line);
  }
}

// Flagstones: each row's seams are shifted half a stone from the row before.
export function flagstones(p: Pixels, piece: Piece<'flagstones'>): void {
  const rows = perspectiveRows(piece.rows);

  rows.forEach((top, index) => {
    p.span(0, WIDTH - 1, top, piece.joint);
    const next = rows[index + 1] ?? BOTTOM;
    const shift = index % 2 ? 0.5 : 0;

    for (let seam = -FAN + 1; seam < FAN; seam += 1) {
      for (let y = top + 1; y < next; y += 1) {
        p.set(recedingX((seam + shift) * piece.spacing, y), y, piece.joint);
      }
    }
  });
}

// The light's streak on a polished floor, fading toward the viewer.
export function reflection(p: Pixels, piece: Piece<'reflection'>): void {
  for (let y = HORIZON + 1; y < BOTTOM; y += 1) {
    const fade = 1 - depthAt(y);

    for (let x = LIGHT.x - 7; x <= LIGHT.x + 7; x += 1) {
      const core = 1 - Math.abs(x - LIGHT.x) / 8;

      p.stipple(x, y, piece.color, 0.5 * fade * core + 0.06);
    }
  }
}
