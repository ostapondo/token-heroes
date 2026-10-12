import type { Paint, Palette } from '@content';

export type Shade = readonly [lit: string, shade: string];

export function darken(hex: string, k: number): `#${string}` {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (value: number): string =>
    Math.round(Math.min(255, value * k))
      .toString(16)
      .padStart(2, '0');

  return `#${channel(n >> 16)}${channel((n >> 8) & 255)}${channel(n & 255)}`;
}

const DARKEST = '#16181d';

// A palette slot takes the element's colour and a shade from its neighbours: the body slot shades
// to its shade slot, light to body, eyes to light.
function slot(paint: string, palette: Palette): Shade {
  switch (paint) {
    case 'a':
      return [palette.a, palette.b];
    case 'b':
      return [palette.b, darken(palette.b, 0.55)];
    case 'c':
      return [palette.c, palette.a];
    case 'e':
      return [palette.e, palette.c];
    case 'h':
      return [palette.h, darken(palette.h, 0.62)];
    default:
      return [palette.x === '#000000' ? DARKEST : palette.x, darken(palette.b, 0.4)];
  }
}

export function shadeOf(paint: Paint, palette: Palette): Shade {
  if (typeof paint !== 'string') return paint;

  return paint.startsWith('#') ? [paint, darken(paint, 0.55)] : slot(paint, palette);
}

export const litOf = (paint: Paint, palette: Palette): string => shadeOf(paint, palette)[0];

export const farOf = (shade: Shade): Shade => [darken(shade[0], 0.72), darken(shade[1], 0.72)];
