import {
  CONTENT,
  TRANSPARENT_PIXEL,
  enemyById,
  toRoster,
  type ElementDef,
  type SpriteDef,
} from '@content';
import { BALANCE, foesForStage, upcomingBoss } from '@engine';
import { describe, expect, it } from 'vitest';
import { partyFormation } from '../scene/formation';
import type { Box } from '../scene/geometry';
import { bossSlot, packSlot } from '../scene/layout';
import { bossLook } from '../scene/looks';
import { spriteSize } from '../sprites/pixels';
import { SPRITE_OUTLINE } from '../sprites/sprite-cache';
import type { Pixels } from './pixels';
import { HORIZON, WIDTH } from './plane';
import { paintScenery } from './scenery';
import { contrast } from './tone';

// The black sprite outline is lost where the backdrop behind it is darker than this.
const LOST_OUTLINE = 1.25;
const MOST_LOST = 0.05;
const LEAST_HORIZON = 1.5;
// A party this small keeps the close camera, which draws a super boss tallest.
const SMALL_PARTY = 5;
const LAST_STAGE = 1000;
const roster = toRoster(CONTENT);

interface Figure {
  readonly sprite: SpriteDef;
  readonly box: Box;
  readonly scale: number;
}

const scaled = (sprite: SpriteDef, scale: number) => {
  const { width, height } = spriteSize(sprite);

  return { width: width * scale, height: height * scale };
};

function firstBossStage(element: ElementDef): number {
  for (let stage: number = BALANCE.bossEvery; stage <= LAST_STAGE; stage += BALANCE.bossEvery) {
    if (upcomingBoss(roster, stage).element === element.id) return stage;
  }
  throw new Error(`No boss fights in ${element.id} before stage ${LAST_STAGE}`);
}

function fight(element: ElementDef, partySize: number, boss: boolean): Figure[] {
  const heroes = CONTENT.heroes.slice(0, partySize);
  const { camera, boxes } = partyFormation(
    heroes.map((hero) => ({
      role: hero.role,
      attack: hero.attack,
      sprite: spriteSize(hero.sprite),
    })),
  );
  const stage = firstBossStage(element) - (boss ? 0 : 1);
  const foes = foesForStage(roster, stage).map((foe, index): Figure => {
    if (foe.boss) {
      const { sprite } = bossLook(CONTENT, foe.id, element);

      return { sprite, box: bossSlot(scaled(sprite, camera.scale.boss)), scale: camera.scale.boss };
    }
    const { sprite } = enemyById(CONTENT, foe.id);
    const box = packSlot(index, scaled(sprite, camera.scale.enemy), camera);

    return { sprite, box, scale: camera.scale.enemy };
  });

  return [
    ...heroes.map((hero, index) => ({
      sprite: hero.sprite,
      box: boxes[index] ?? { x: 0, y: 0, width: 0, height: 0 },
      scale: camera.scale.hero,
    })),
    ...foes,
  ];
}

// The cells just outside a sprite's outline, in arena pixels.
function outlineRing({ sprite, box, scale }: Figure): { x: number; y: number }[] {
  const solid = (x: number, y: number) => {
    const pixel = sprite.rows[y]?.[x];

    return pixel !== undefined && pixel !== TRANSPARENT_PIXEL;
  };
  const outlined = (x: number, y: number) =>
    [-1, 0, 1].some((dy) =>
      [-1, 0, 1].some((dx) => solid(x - SPRITE_OUTLINE + dx, y - SPRITE_OUTLINE + dy)),
    );
  const { width, height } = spriteSize(sprite);
  const ring: { x: number; y: number }[] = [];

  for (let y = -1; y <= height + SPRITE_OUTLINE * 2; y += 1) {
    for (let x = -1; x <= width + SPRITE_OUTLINE * 2; x += 1) {
      const touching =
        outlined(x - 1, y) || outlined(x + 1, y) || outlined(x, y - 1) || outlined(x, y + 1);

      if (outlined(x, y) || !touching) continue;
      ring.push({
        x: Math.floor(box.x + (x - SPRITE_OUTLINE + 0.5) * scale),
        y: Math.floor(box.y + (y - SPRITE_OUTLINE + 0.5) * scale),
      });
    }
  }

  return ring;
}

function lostOutline(pixels: Pixels, figures: readonly Figure[]): number {
  const ring = figures
    .flatMap(outlineRing)
    .filter(({ x, y }) => x >= 0 && y >= 0 && x < pixels.width && y < pixels.height);
  const lost = ring.filter(({ x, y }) => contrast(0, pixels.luminanceAt(x, y)) < LOST_OUTLINE);

  return lost.length / ring.length;
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

  it('keeps the outline of a small party and its pack readable', () => {
    expect(lostOutline(pixels, fight(element, 3, false))).toBeLessThanOrEqual(MOST_LOST);
  });

  it('keeps the outline of a full party and its boss readable', () => {
    expect(lostOutline(pixels, fight(element, CONTENT.heroes.length, true))).toBeLessThanOrEqual(
      MOST_LOST,
    );
  });
});

describe.each(CONTENT.lairs)('the $id lair', (lair) => {
  it('keeps the outline of a small party and its super boss readable', () => {
    const { pixels } = paintScenery(lair.backdrop);

    expect(lostOutline(pixels, fight(lair, SMALL_PARTY, true))).toBeLessThanOrEqual(MOST_LOST);
  });
});
