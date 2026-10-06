import { CONTENT } from '@content';
import { AttackStyle } from '@engine';
import { describe, expect, it } from 'vitest';
import { floorTop, type Box } from './geometry';
import { partyFormation, type Recruit } from './formation';
import { packSlot } from './layout';

const HERO = { width: 24, height: 30 };
const everyHero: Recruit[] = CONTENT.heroes.map((hero) => ({ attack: hero.attack, size: HERO }));
const bottom = (box: Box) => box.y + box.height;

const HEAD_ROWS = 12;

function shareInView(boxes: readonly Box[]): { heads: number[]; bodies: number[] } {
  const owner = new Map<string, number>();
  const drawOrder = boxes
    .map((box, index) => ({ box, index }))
    .toSorted((left, right) => bottom(left.box) - bottom(right.box));

  for (const { box, index } of drawOrder) {
    for (let x = box.x; x < box.x + box.width; x += 1) {
      for (let y = box.y; y < box.y + box.height; y += 1) owner.set(`${x}:${y}`, index);
    }
  }
  const heads = boxes.map(() => 0);
  const bodies = boxes.map(() => 0);

  for (const [pixel, index] of owner) {
    const box = boxes[index];
    const y = Number(pixel.split(':')[1]);

    bodies[index] = (bodies[index] ?? 0) + 1;
    if (box && y < box.y + HEAD_ROWS) heads[index] = (heads[index] ?? 0) + 1;
  }

  return {
    heads: boxes.map((box, index) => (heads[index] ?? 0) / (box.width * HEAD_ROWS)),
    bodies: boxes.map((box, index) => (bodies[index] ?? 0) / (box.width * box.height)),
  };
}

describe('partyFormation', () => {
  it('keeps every face and a good part of every body in view in a full party', () => {
    const { heads, bodies } = shareInView(partyFormation(everyHero));

    expect(Math.min(...heads)).toBeGreaterThanOrEqual(0.7);
    expect(Math.min(...bodies)).toBeGreaterThanOrEqual(0.25);
  });

  it('stands every hero on the floor', () => {
    for (const box of partyFormation(everyHero)) {
      expect(bottom(box)).toBeGreaterThan(floorTop());
    }
  });

  it('puts healers behind the heroes who close in to strike', () => {
    const boxes = partyFormation(everyHero);
    const feetOf = (style: AttackStyle) =>
      everyHero.flatMap((hero, index) => {
        const box = boxes[index];

        return hero.attack === style && box ? [bottom(box)] : [];
      });

    expect(Math.max(...feetOf(AttackStyle.Heal))).toBeLessThan(
      Math.min(...feetOf(AttackStyle.Slash)),
    );
  });

  it('leaves the pack its ground', () => {
    const packLeft = packSlot(0, HERO).x;
    const rightmost = Math.max(...partyFormation(everyHero).map((box) => box.x + box.width));

    expect(rightmost).toBeLessThanOrEqual(packLeft + 2);
  });

  it.each([1, 3, 6, 10])('gives a party of %d a place each', (size) => {
    const boxes = partyFormation(everyHero.slice(0, size));

    expect(new Set(boxes.map((box) => `${box.x}:${box.y}`)).size).toBe(size);
  });
});
