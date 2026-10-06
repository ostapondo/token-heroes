import type { BossStats, FoeStats, HeroStats, Roster } from './types';

function cycled<T>(items: readonly T[], index: number, kind: string): T {
  const item = items[((index % items.length) + items.length) % items.length];
  if (item === undefined) throw new Error(`The roster has no ${kind}`);
  return item;
}

export function heroById(roster: Roster, id: string): HeroStats {
  const hero = roster.heroes.find((candidate) => candidate.id === id);
  if (!hero) throw new Error(`Unknown hero ${id}`);
  return hero;
}

export function bossAt(roster: Roster, round: number): BossStats {
  return cycled(roster.bosses, round, 'bosses');
}

export function enemyAt(roster: Roster, index: number): FoeStats {
  return cycled(roster.enemies, index, 'enemies');
}
