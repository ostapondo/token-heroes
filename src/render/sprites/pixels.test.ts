import type { Palette } from '@content';
import { describe, expect, it } from 'vitest';
import { pixelColors, spriteSize } from './pixels';

const palette: Palette = {
  a: '#aa0000',
  b: '#bb0000',
  c: '#cc0000',
  e: '#ee0000',
  h: '#ff0000',
  x: '#000000',
};

describe('pixelColors', () => {
  it('fills palette slots, fixed letters and transparency', () => {
    const sprite = { rows: ['a.s', 'xe.'], fixed: { s: '#a9b3bf' } };

    expect(pixelColors(sprite, palette)).toEqual([
      ['#aa0000', null, '#a9b3bf'],
      ['#000000', '#ee0000', null],
    ]);
  });

  it('refuses a palette slot when the sprite is drawn without a palette', () => {
    expect(() => pixelColors({ rows: ['a'] })).toThrow('Pixel "a" has no colour');
  });

  it('measures the sprite from its rows', () => {
    expect(spriteSize({ rows: ['abc', 'abc'] })).toEqual({ width: 3, height: 2 });
  });
});
