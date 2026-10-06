import { heroDamage, heroHp, safeAmount } from './formulas';
import { heroById } from './roster';
import { HeroRole, type HeroStats, type PartyState, type Roster } from './types';

export function partyMaxHp(party: PartyState, roster: Roster): number {
  const total = party.heroes.reduce(
    (sum, slot) => sum + heroHp(heroById(roster, slot.heroId), slot.level),
    0,
  );

  return safeAmount(total);
}

export function partyPower(party: PartyState, roster: Roster): number {
  const total = party.heroes.reduce((sum, slot) => {
    const hero = heroById(roster, slot.heroId);

    return hero.role === HeroRole.Healer ? sum : sum + heroDamage(hero, slot.level);
  }, 0);

  return safeAmount(total);
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
