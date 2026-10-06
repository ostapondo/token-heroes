import { describe, expect, it } from 'vitest';
import { ARENA } from '../scene/geometry';
import { NumberTrail } from './number-trail';

describe('NumberTrail', () => {
  it('places numbers that land together at different spots', () => {
    const trail = new NumberTrail();
    const at = { x: 100, y: 80 };
    const spots = Array.from({ length: 4 }, () => trail.place(at));

    expect(new Set(spots.map((spot) => `${spot.x}:${spot.y}`)).size).toBe(4);
    expect(spots.map((spot) => Math.sign(spot.x - at.x))).toEqual([-1, 1, -1, 1]);
  });

  it('keeps a number near the edge inside the arena', () => {
    const trail = new NumberTrail();

    trail.place({ x: 0, y: 80 });

    expect(trail.place({ x: ARENA.width, y: 80 }).x).toBeLessThan(ARENA.width);
  });
});
