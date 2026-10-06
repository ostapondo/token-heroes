import { describe, expect, it } from 'vitest';
import { packSize } from './stages';

describe('packSize', () => {
  it('starts small and grows to the cap', () => {
    expect([1, 10, 11, 21, 31, 200].map(packSize)).toEqual([3, 3, 4, 5, 6, 6]);
  });
});
