import { CONTENT } from '@content';
import { describe, expect, it } from 'vitest';
import { FIELD } from '../brawl/stage/field';
import type { Pixels } from './pixels';
import { HORIZON, WIDTH } from './plane';
import { paintScenery } from './scenery';
import { contrast } from './tone';

// A model's dark outline is lost where the backdrop behind it is darker than this.
const LOST_OUTLINE = 1.25;
const MOST_LOST = 0.05;
const LEAST_HORIZON = 1.5;
// Every model stands on the floor, from the horizon down to the near edge. Above the horizon only
// heads and a boss's shoulders show, and their cel-shaded fills carry them where an outline would
// sink into a dark skyline.
const BAND = { top: HORIZON, bottom: Math.floor(FIELD.ground * FIELD.pixel) } as const;

function lostOutline(pixels: Pixels): number {
  let lost = 0;
  let seen = 0;

  for (let y = BAND.top; y <= BAND.bottom; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      seen += 1;
      if (contrast(0, pixels.luminanceAt(x, y)) < LOST_OUTLINE) lost += 1;
    }
  }

  return lost / seen;
}

function horizonContrast(pixels: Pixels): number {
  const edges = Array.from({ length: WIDTH }, (_, x) =>
    contrast(pixels.luminanceAt(x, HORIZON - 2), pixels.luminanceAt(x, HORIZON + 2)),
  ).toSorted((left, right) => left - right);

  return edges[Math.floor(edges.length / 2)] ?? 1;
}

describe.each([...CONTENT.elements, ...CONTENT.lairs])('the $id backdrop', (element) => {
  const { pixels } = paintScenery(element.backdrop);

  it('shows where the ground meets the sky', () => {
    expect(horizonContrast(pixels)).toBeGreaterThanOrEqual(LEAST_HORIZON);
  });

  it('keeps an outline readable anywhere on the floor', () => {
    expect(lostOutline(pixels)).toBeLessThanOrEqual(MOST_LOST);
  });
});
