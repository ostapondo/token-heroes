import { describe, expect, it } from 'vitest';
import { compactNumber } from './format';

describe('compactNumber', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1_000, '1.0K'],
    [12_400, '12.4K'],
    [148_000, '148K'],
    [17_900_000, '17.9M'],
    [1_000_000_000, '1.0B'],
    [Number.MAX_SAFE_INTEGER, '9007T'],
  ])('writes %d as %s', (value, text) => {
    expect(compactNumber(value)).toBe(text);
  });
});
