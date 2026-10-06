import { PALETTE_SLOTS, TRANSPARENT_PIXEL, type Palette, type SpriteDef } from '@content';

export type PixelGrid = readonly (readonly (string | null)[])[];

const isSlot = (pixel: string): pixel is keyof Palette =>
  (PALETTE_SLOTS as readonly string[]).includes(pixel);

export function pixelColors(sprite: SpriteDef, palette?: Palette): PixelGrid {
  return sprite.rows.map((row) =>
    row.split('').map((pixel) => {
      if (pixel === TRANSPARENT_PIXEL) return null;
      const fixed = sprite.fixed?.[pixel];
      if (fixed) return fixed;
      if (palette && isSlot(pixel)) return palette[pixel];
      throw new Error(`Pixel "${pixel}" has no colour`);
    }),
  );
}

export function spriteSize(sprite: SpriteDef): { width: number; height: number } {
  return { width: sprite.rows[0]?.length ?? 0, height: sprite.rows.length };
}
