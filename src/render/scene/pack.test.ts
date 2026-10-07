import { CONTENT, TRANSPARENT_PIXEL, enemyById, toRoster, type SpriteDef } from '@content';
import { foesForStage, isBossStage } from '@engine';
import { describe, expect, it } from 'vitest';
import { spriteSize } from '../sprites/pixels';
import { CAMERAS } from './camera';
import { ARENA, type Box } from './geometry';
import { packSlot } from './layout';

const roster = toRoster(CONTENT);
const STAGES = Array.from({ length: 200 }, (_, index) => index + 31);
const LEAST_IN_VIEW = 0.6;

// The arena cells a sprite covers; with its outline, the cells it hides from the foe behind.
function cells(sprite: SpriteDef, box: Box, scale: number, outline: boolean): Set<number> {
  const covered = new Set<number>();
  const reach = outline ? scale : 0;

  sprite.rows.forEach((row, y) => {
    row.split('').forEach((pixel, x) => {
      if (pixel === TRANSPARENT_PIXEL) return;
      for (let dy = -reach; dy < scale + reach; dy += 1) {
        for (let dx = -reach; dx < scale + reach; dx += 1) {
          covered.add((box.y + y * scale + dy) * ARENA.width + box.x + x * scale + dx);
        }
      }
    });
  });

  return covered;
}

describe.each(Object.values(CAMERAS))('a full pack on the $id camera', (camera) => {
  it('keeps most of every back-row foe in view above the front row', () => {
    const scale = camera.scale.enemy;
    const shares = STAGES.filter((stage) => !isBossStage(stage)).flatMap((stage) => {
      const sprites = foesForStage(roster, stage).map((foe) => enemyById(CONTENT, foe.id).sprite);
      const boxes = sprites.map((sprite, index) => {
        const { width, height } = spriteSize(sprite);

        return packSlot(index, { width: width * scale, height: height * scale }, camera);
      });
      const front = new Set(
        sprites.slice(0, 3).flatMap((sprite, index) => {
          const box = boxes[index];

          return box ? [...cells(sprite, box, scale, true)] : [];
        }),
      );

      return sprites.slice(3).map((sprite, index) => {
        const box = boxes[index + 3];
        const body = box ? [...cells(sprite, box, scale, false)] : [];

        return body.filter((cell) => !front.has(cell)).length / body.length;
      });
    });

    expect(shares.length).toBeGreaterThan(0);
    expect(Math.min(...shares)).toBeGreaterThanOrEqual(LEAST_IN_VIEW);
  });
});
