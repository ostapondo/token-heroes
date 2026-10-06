import { heroDamage, heroHp } from './formulas';
import { heroById } from './roster';
import type { HeroStats, PartyState, Roster } from './types';

export function partyMaxHp(party: PartyState, roster: Roster): number {
  return party.heroes.reduce(
    (sum, slot) => sum + heroHp(heroById(roster, slot.heroId), slot.level),
    0,
  );
}

export function partyPower(party: PartyState, roster: Roster): number {
  return party.heroes.reduce((sum, slot) => {
    const hero = heroById(roster, slot.heroId);
    return hero.role === 'healer' ? sum : sum + heroDamage(hero, slot.level);
  }, 0);
}

export function heroLevel(party: PartyState, heroId: string): number | undefined {
  return party.heroes.find((slot) => slot.heroId === heroId)?.level;
}

export function levelUp(party: PartyState, heroId: string): PartyState {
  return {
    heroes: party.heroes.map((slot) =>
      slot.heroId === heroId ? { heroId, level: slot.level + 1 } : slot,
    ),
  };
}

export function hire(party: PartyState, heroId: string): PartyState {
  if (heroLevel(party, heroId) !== undefined) return party;
  return { heroes: [...party.heroes, { heroId, level: 1 }] };
}

export function isUnlocked(hero: HeroStats, lifetimeTokens: number): boolean {
  return lifetimeTokens >= hero.unlockAtTokens;
}
