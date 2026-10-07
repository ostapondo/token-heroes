import { bossById, creatureById, findSuperBoss, type Content, type ElementDef } from '@content';
import type { Actor } from './cast';

type Look = Pick<Actor, 'attack' | 'glitches' | 'key' | 'sprite' | 'palette'>;

// A super boss wears its own colours; any other boss is its creature in the element's.
export function bossLook(content: Content, bossId: string, element: ElementDef): Look {
  const superBoss = findSuperBoss(content, bossId);

  if (superBoss) {
    const { attack, sprite, palette } = superBoss;

    return { attack, glitches: true, key: `super:${bossId}`, sprite, palette };
  }
  const boss = bossById(content, bossId);
  const { attack, sprite } = creatureById(content, boss.creature);

  return {
    attack,
    glitches: false,
    key: `boss:${boss.creature}:${element.id}`,
    sprite,
    palette: element.palette,
  };
}
