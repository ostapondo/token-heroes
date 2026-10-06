import { costToLevel, heroById, type HeroStats, type PartyState, type Roster } from '@engine';
import { runParty } from './simulate';

export interface PacePoint {
  readonly coins: number;
  readonly party: PartyState;
  readonly stage: number;
}

export type Player = (roster: Roster, coins: number) => PartyState;

// Lifetime burns that stand for a first hour, day, week, month, season, year and beyond for a
// player whose agents burn about ten million tokens a day.
export const PACE_COINS = [1e6, 1e7, 7e7, 3e8, 1e9, 3.6e9, 3.6e10] as const;

const MAX_LEVEL = 5_000;
// A player hires the next hero once its price is a quarter of what they have burned.
const HIRE_SHARE = 0.25;

const costToReach = (hero: HeroStats, level: number): number => hero.hireCost + costToLevel(level);

// A player who hires the heroes their burn has unlocked, in roster order, and levels the
// whole party together. Not optimal, but a steady and honest stand-in for real play.
export function partyFor(roster: Roster, coins: number): PartyState {
  const owned: HeroStats[] = [];
  let hired = 0;

  for (const hero of roster.heroes) {
    if (hero.unlockAtTokens > coins || hero.hireCost > coins * HIRE_SHARE) break;
    owned.push(hero);
    hired += hero.hireCost;
  }
  let level = 1;

  while (level < MAX_LEVEL) {
    const next = owned.reduce((sum, hero) => sum + costToReach(hero, level + 1), 0);

    if (next > coins) break;
    level += 1;
  }

  return { heroes: owned.map((hero) => ({ heroId: hero.id, level })) };
}

export function stageReached(party: PartyState, roster: Roster): number {
  const run = runParty(party, roster);

  return run.frontier?.stage ?? run.fromStage + run.stagesCleared;
}

export function paceCurve(roster: Roster, player: Player = partyFor): PacePoint[] {
  return PACE_COINS.map((coins) => {
    const party = player(roster, coins);

    return { coins, party, stage: stageReached(party, roster) };
  });
}

export const outputPerCoin = (roster: Roster, heroId: string, coins: number) => {
  const hero = heroById(roster, heroId);
  let level = 1;

  while (level < MAX_LEVEL && costToReach(hero, level + 1) <= coins) level += 1;

  return { hero, level };
};
