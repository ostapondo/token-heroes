import type { Paint } from '@content';
import type { Shade } from './colors';
import type { Painter } from './painter';

// What a part painter needs: the painter, the clock, and colours resolved against the palette.
export interface Kit {
  readonly p: Painter;
  readonly t: number;
  readonly shade: (paint: Paint) => Shade;
  readonly lit: (paint: Paint) => string;
}
