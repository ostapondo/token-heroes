import { describe, expect, it } from 'vitest';
import { partySlot } from './layout';

const hero = { width: 24, height: 30 };
const rightEdge = (box: { x: number; width: number }) => box.x + box.width;

describe('partySlot', () => {
  it.each([1, 3, 6, 8, 10])('keeps a party of %d inside the party area', (size) => {
    const boxes = Array.from({ length: size }, (_, index) => partySlot(index, size, hero));
    const keys = new Set(boxes.map((box) => `${box.x}:${box.y}`));

    expect(keys.size).toBe(size);
    expect(Math.max(...boxes.map(rightEdge))).toBeLessThanOrEqual(6 + 8 + 84);
  });
});
