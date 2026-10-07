import { designHero, SuperBossTier, type BossStats, type Roster } from '@engine';
import type {
  BossDef,
  CreatureDef,
  ElementDef,
  EnemyDef,
  HeroDef,
  SuperBossDef,
} from './model/definitions';
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
  findById([...content.elements, ...content.lairs], id, 'element');
export const creatureById = (content: Content, id: string): CreatureDef =>
  findById(content.creatures, id, 'creature');
export const bossById = (content: Content, id: string): BossDef =>
  findById(content.bosses, id, 'boss');
export const enemyById = (content: Content, id: string): EnemyDef =>
  findById(content.enemies, id, 'enemy');
export const heroDefById = (content: Content, id: string): HeroDef =>
  findById(content.heroes, id, 'hero');
export const findSuperBoss = (content: Content, id: string): SuperBossDef | undefined =>
  content.superBosses.find((boss) => boss.id === id);

export interface BossCard {
  readonly name: string;
  readonly element: ElementDef;
  readonly tier: SuperBossTier | null;
}

export function bossCard(content: Content, id: string): BossCard {
  const superBoss = findSuperBoss(content, id);

  if (superBoss) {
    return {
      name: superBoss.name,
      element: elementById(content, superBoss.lair),
      tier: superBoss.tier,
    };
  }
  const boss = bossById(content, id);

  return { name: boss.name, element: elementById(content, boss.element), tier: null };
}

export function starterHero(content: Content): HeroDef {
  const hero = content.heroes[0];

  if (!hero) throw new Error('The content has no heroes');

  return hero;
}

const superBossesOf = (content: Content, tier: SuperBossTier): BossStats[] =>
  content.superBosses
    .filter((boss) => boss.tier === tier)
    .map((boss) => ({
      id: boss.id,
      element: boss.lair,
      hpScale: boss.hpScale,
      damageScale: boss.damageScale,
    }));

export function toRoster(content: Content): Roster {
  return {
    heroes: content.heroes.map((hero) => designHero(hero)),
    bosses: content.bosses.map((boss) => {
      const creature = creatureById(content, boss.creature);

      return {
        id: boss.id,
        element: boss.element,
        hpScale: creature.hpScale,
        damageScale: creature.damageScale,
      };
    }),
    superBosses: {
      [SuperBossTier.Medium]: superBossesOf(content, SuperBossTier.Medium),
      [SuperBossTier.Strong]: superBossesOf(content, SuperBossTier.Strong),
    },
    enemies: content.enemies.map((enemy) => ({
      id: enemy.id,
      hpScale: enemy.hpScale,
      damageScale: enemy.damageScale,
    })),
  };
}
