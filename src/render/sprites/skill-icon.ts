import type { SpriteDef } from '@content';
import { pixelColors, spriteSize } from './pixels';

// The outline names the skill's form: black, then silver from rank three, violet once evolved.
const OUTLINE = ['#000000', '#c9ced6', '#c9a6ff'] as const;
const LOCKED = '#4a4238';
const BORDER = 1;

const icons = new Map<string, HTMLCanvasElement>();

function paint(sprite: SpriteDef, tier: 0 | 1 | 2, locked: boolean): HTMLCanvasElement {
  const { width, height } = spriteSize(sprite);
  const canvas = document.createElement('canvas');

  canvas.width = width + BORDER * 2;
  canvas.height = height + BORDER * 2;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas 2D is unavailable');
  const pixels = pixelColors(sprite);

  context.fillStyle = OUTLINE[tier];
  pixels.forEach((row, y) =>
    row.forEach((color, x) => {
      if (color) context.fillRect(x, y, 1 + BORDER * 2, 1 + BORDER * 2);
    }),
  );
  pixels.forEach((row, y) =>
    row.forEach((color, x) => {
      if (!color) return;
      context.fillStyle = locked ? LOCKED : color;
      context.fillRect(x + BORDER, y + BORDER, 1, 1);
    }),
  );

  return canvas;
}

// A skill's icon with its outline, painted once per form and kept.
export function skillIcon(
  id: string,
  sprite: SpriteDef,
  tier: 0 | 1 | 2,
  locked: boolean,
): HTMLCanvasElement {
  const key = `${id}:${locked ? 'locked' : tier}`;
  const cached = icons.get(key);

  if (cached) return cached;
  const icon = paint(sprite, locked ? 0 : tier, locked);

  icons.set(key, icon);

  return icon;
}
