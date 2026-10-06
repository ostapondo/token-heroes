import type { Palette, SpriteDef } from '@content';
import { pixelColors, spriteSize, type PixelGrid } from './pixels';

export const SPRITE_OUTLINE = 1;

const OUTLINE_COLOR = '#000000';

export class SpriteCache {
  readonly #bitmaps = new Map<string, HTMLCanvasElement>();

  get(key: string, sprite: SpriteDef, palette?: Palette): HTMLCanvasElement {
    return this.#remember(key, () => paint(sprite, pixelColors(sprite, palette)));
  }

  silhouette(key: string, sprite: SpriteDef, color: string, palette?: Palette): HTMLCanvasElement {
    return this.#remember(`${key}#${color}`, () =>
      paint(
        sprite,
        pixelColors(sprite, palette).map((row) => row.map((pixel) => (pixel ? color : null))),
      ),
    );
  }

  #remember(key: string, create: () => HTMLCanvasElement): HTMLCanvasElement {
    const cached = this.#bitmaps.get(key);

    if (cached) return cached;
    const bitmap = create();

    this.#bitmaps.set(key, bitmap);

    return bitmap;
  }
}

function paint(sprite: SpriteDef, pixels: PixelGrid): HTMLCanvasElement {
  const { width, height } = spriteSize(sprite);
  const canvas = document.createElement('canvas');

  canvas.width = width + SPRITE_OUTLINE * 2;
  canvas.height = height + SPRITE_OUTLINE * 2;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas 2D is unavailable');

  const outlineSize = 1 + SPRITE_OUTLINE * 2;

  context.fillStyle = OUTLINE_COLOR;
  pixels.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) context.fillRect(x, y, outlineSize, outlineSize);
    });
  });
  pixels.forEach((row, y) => {
    row.forEach((color, x) => {
      if (!color) return;
      context.fillStyle = color;
      context.fillRect(x + SPRITE_OUTLINE, y + SPRITE_OUTLINE, 1, 1);
    });
  });

  return canvas;
}
