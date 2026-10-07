import { SuperBossTier } from '@engine';
import {
  colorProblems,
  duplicated,
  elementProblems,
  idsOf,
  missingReference,
  ordersOf,
  sequenceProblems,
  spriteProblems,
} from './checks';
import { LairId } from './model/ids';
import type { Content } from './registry';

function tierProblems(content: Content): string[] {
  return Object.values(SuperBossTier).flatMap((tier) => {
    const bosses = content.superBosses.filter((boss) => boss.tier === tier);

    return bosses.length === 0
      ? [`there are no ${tier} super bosses`]
      : sequenceProblems(`${tier} super boss`, ordersOf(bosses));
  });
}

// A foe is found by its id, so a super boss may not share one with any boss.
function idProblems(content: Content): string[] {
  const bossIds = new Set(idsOf(content.bosses));

  return [
    ...duplicated('super boss', idsOf(content.superBosses)),
    ...content.superBosses
      .filter((boss) => bossIds.has(boss.id))
      .map((boss) => `super boss ${boss.id} shares its id with a boss`),
  ];
}

function lairProblems(content: Content): string[] {
  const defined = new Set(idsOf(content.lairs));
  const used = new Set<string>(content.superBosses.map((boss) => boss.lair));

  return [
    ...duplicated('lair', idsOf(content.lairs)),
    ...duplicated(
      'lair of a super boss',
      content.superBosses.map((boss) => boss.lair),
    ),
    ...Object.values(LairId)
      .filter((id) => !defined.has(id))
      .map((id) => `${id} has an id constant but no definition`),
    ...content.lairs
      .filter((lair) => !used.has(lair.id))
      .map((lair) => `lair ${lair.id} has no super boss`),
    ...content.superBosses.flatMap((boss) =>
      missingReference(`super boss ${boss.id}`, 'lair', boss.lair, defined),
    ),
  ];
}

function artProblems(content: Content): string[] {
  return [
    ...content.lairs.flatMap(elementProblems),
    ...content.superBosses.flatMap((boss) => [
      ...colorProblems(`super boss ${boss.id} palette`, boss.palette),
      ...spriteProblems(`super boss ${boss.id}`, boss.sprite, true),
    ]),
  ];
}

export function superBossProblems(content: Content): string[] {
  return [
    ...tierProblems(content),
    ...idProblems(content),
    ...lairProblems(content),
    ...artProblems(content),
  ];
}
