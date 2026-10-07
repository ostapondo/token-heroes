import { rgb } from '../../backdrop/tone';
import type { Body, Cell } from './body';

type Rgb = readonly [number, number, number];
type Tone = Rgb | string;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
export const ease = (t: number): number => t * t * (3 - 2 * t);
// A steady pseudo-random number per seed, so a pile or a crack falls the same way each frame.
export const noise = (seed: number): number => {
  const wave = Math.sin(seed * 9301 + 49_297) * 233_280;

  return wave - Math.floor(wave);
};

const toRgb = (tone: Tone): Rgb => (typeof tone === 'string' ? rgb(tone) : tone);

export function mix(from: Tone, to: Tone, share: number): Rgb {
  const [r1, g1, b1] = toRgb(from);
  const [r2, g2, b2] = toRgb(to);
  const t = clamp01(share);

  return [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t];
}

export const css = ([r, g, b]: Rgb): string =>
  `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

function lightness(color: string): number {
  const [r, g, b] = rgb(color);

  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// A colour along the stops, picked by how light the original colour was, so a statue keeps
// the sprite's shading.
export function ramp(stops: readonly string[], color: string): Rgb {
  const at = clamp01(lightness(color)) * 0.999 * (stops.length - 1);
  const low = Math.floor(at);

  return mix(stops[low] ?? '#000000', stops[low + 1] ?? stops[low] ?? '#000000', at - low);
}

export function square(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 1,
): void {
  context.globalAlpha = clamp01(alpha);
  context.fillStyle = color;
  context.fillRect(x, y, size, size);
  context.globalAlpha = 1;
}

// Cells drawn the way the sprite cache draws a sprite: a black outline, then the colours.
export function paintCells(
  context: CanvasRenderingContext2D,
  body: Body,
  cells: readonly Cell[],
  colorOf: (cell: Cell) => string,
  options: {
    dy?: number;
    alpha?: number;
    outline?: boolean;
    scale?: number;
    at?: { x: number; y: number };
  } = {},
): void {
  const scale = options.scale ?? body.scale;
  const left = options.at?.x ?? body.x;
  const top = (options.at?.y ?? body.y) + (options.dy ?? 0);

  context.globalAlpha = clamp01(options.alpha ?? 1);
  if (options.outline ?? true) {
    context.fillStyle = '#000000';
    for (const cell of cells) {
      context.fillRect(
        left + (cell.x - 1) * scale,
        top + (cell.y - 1) * scale,
        scale * 3,
        scale * 3,
      );
    }
  }
  for (const cell of cells) {
    context.fillStyle = colorOf(cell);
    context.fillRect(left + cell.x * scale, top + cell.y * scale, scale, scale);
  }
  context.globalAlpha = 1;
}

export function ellipse(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radii: { x: number; y: number },
  color: string,
): void {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, Math.max(radii.x, 0), Math.max(radii.y, 0), 0, 0, Math.PI * 2);
  context.fill();
}

// Turns the canvas around a point by a quarter turn times `share`, as a body tips over.
export function tipped(
  context: CanvasRenderingContext2D,
  pivot: { x: number; y: number },
  share: number,
  draw: () => void,
  squash = 1,
): void {
  context.save();
  context.translate(pivot.x, pivot.y);
  context.rotate((-Math.PI / 2) * share);
  context.scale(1, squash);
  context.translate(-pivot.x, -pivot.y);
  draw();
  context.restore();
}
