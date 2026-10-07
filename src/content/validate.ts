import { BALANCE } from '@engine';
import {
  duplicated,
  elementProblems,
  idsOf,
  missingReference,
  ordersOf,
  sequenceProblems,
  spriteProblems,
} from './checks';
import type { BossDef, HeroDef } from './model/definitions';
import { CreatureId, ElementId } from './model/ids';
import type { Content } from './registry';
import { superBossProblems } from './validate-super-bosses';

const pairingsOf = (bosses: readonly BossDef[]) =>
  bosses.map((boss) => `${boss.creature} in ${boss.element}`);

function uniquenessProblems(content: Content): string[] {
  return [
    ...duplicated('element', idsOf(content.elements)),
    ...duplicated('creature', idsOf(content.creatures)),
    ...duplicated('boss', idsOf(content.bosses)),
    ...duplicated('boss order', ordersOf(content.bosses)),
    ...sequenceProblems('boss', ordersOf(content.bosses)),
    ...duplicated('boss pairing', pairingsOf(content.bosses)),
    ...duplicated('enemy', idsOf(content.enemies)),
    ...duplicated('hero', idsOf(content.heroes)),
    ...duplicated('hero order', ordersOf(content.heroes)),
    ...sequenceProblems('hero', ordersOf(content.heroes)),
  ];
}

function coverageProblems(content: Content): string[] {
  const defined = new Set<string>([...idsOf(content.elements), ...idsOf(content.creatures)]);

  return [...Object.values(ElementId), ...Object.values(CreatureId)]
    .filter((id) => !defined.has(id))
    .map((id) => `${id} has an id constant but no definition`);
}

function referenceProblems(content: Content): string[] {
  const elements = new Set(idsOf(content.elements));
  const creatures = new Set(idsOf(content.creatures));

  return content.bosses.flatMap((boss) => [
    ...missingReference(`boss ${boss.id}`, 'creature', boss.creature, creatures),
    ...missingReference(`boss ${boss.id}`, 'element', boss.element, elements),
  ]);
}

function artProblems(content: Content): string[] {
  return [
    ...content.elements.flatMap(elementProblems),
    ...content.creatures.flatMap((creature) =>
      spriteProblems(`creature ${creature.id}`, creature.sprite, true),
    ),
    ...content.enemies.flatMap((enemy) => spriteProblems(`enemy ${enemy.id}`, enemy.sprite, true)),
    ...content.heroes.flatMap((hero) => spriteProblems(`hero ${hero.id}`, hero.sprite, false)),
  ];
}

function designProblems(hero: HeroDef): string[] {
  const focus = hero.focus ?? 0;

  return [
    ...(hero.attackInterval > 0 ? [] : [`hero ${hero.id} must attack at a positive interval`]),
    ...(Math.abs(focus) <= BALANCE.heroFocusLimit
      ? []
      : [`hero ${hero.id} focus ${focus} leans past ±${BALANCE.heroFocusLimit}`]),
  ];
}

function rosterProblems(content: Content): string[] {
  return [
    ...(content.bosses.length === 0 ? ['there are no bosses'] : []),
    ...(content.enemies.length === 0 ? ['there are no enemies'] : []),
    ...(content.heroes.length === 0 ? ['there are no heroes'] : []),
    ...content.heroes.flatMap(designProblems),
  ];
}

export function validateContent(content: Content): string[] {
  return [
    ...uniquenessProblems(content),
    ...coverageProblems(content),
    ...referenceProblems(content),
    ...artProblems(content),
    ...rosterProblems(content),
    ...superBossProblems(content),
  ];
}
