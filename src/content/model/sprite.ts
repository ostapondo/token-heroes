export const PALETTE_SLOTS = ['a', 'b', 'c', 'e', 'h', 'x'] as const;
type PaletteSlot = (typeof PALETTE_SLOTS)[number];
export type Palette = Readonly<Record<PaletteSlot, string>>;

export const TRANSPARENT_PIXEL = '.';

export interface SpriteDef {
  readonly rows: readonly string[];
  readonly fixed?: Readonly<Record<string, string>>;
}
