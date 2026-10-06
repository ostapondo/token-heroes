import type { Roster } from '@engine';
import type { BossDef, CreatureDef, ElementDef, EnemyDef, HeroDef } from './model/definitions';
import type { Content } from './registry';

function findById<T extends { readonly id: string }>(
  items: readonly T[],
  id: string,
  kind: string,
): T {
  const item = items.find((candidate) => candidate.id === id);

  if (!item) throw new Error(`Unknown ${kind} ${id}`);

  return item;
}

export const elementById = (content: Content, id: string): ElementDef =>
  findById(content.elements, id, 'element');
export const creatureById = (content: Content, id: string): CreatureDef =>
  findById(content.creatures, id, 'creature');
export const bossById = (content: Content, id: string): BossDef =>
  findById(content.bosses, id, 'boss');
export const enemyById = (content: Content, id: string): EnemyDef =>
  findById(content.enemies, id, 'enemy');
export const heroDefById = (content: Content, id: string): HeroDef =>
  findById(content.heroes, id, 'hero');

export function starterHero(content: Content): HeroDef {
  const hero = content.heroes[0];

  if (!hero) throw new Error('The content has no heroes');

  return hero;
}

export function toRoster(content: Content): Roster {
  return {
    heroes: content.heroes.map((hero) => ({
      id: hero.id,
      role: hero.role,
      attack: hero.attack,
      baseDamage: hero.baseDamage,
      baseHp: hero.baseHp,
      attackInterval: hero.attackInterval,
      levelCostBase: hero.levelCostBase,
      hireCost: hero.hireCost,
      unlockAtTokens: hero.unlockAtTokens,
    })),
    bosses: content.bosses.map((boss) => {
      const creature = creatureById(content, boss.creature);

      return {
        id: boss.id,
        element: boss.element,
        hpScale: creature.hpScale,
        damageScale: creature.damageScale,
      };
    }),
    enemies: content.enemies.map((enemy) => ({
      id: enemy.id,
      hpScale: enemy.hpScale,
      damageScale: enemy.damageScale,
    })),
  };
}
