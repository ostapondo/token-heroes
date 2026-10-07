import { BALANCE } from './balance';
import { healerWeight, heroDamage, heroHp, safeAmount, type PartyVitals } from './formulas';
import { heroById } from './roster';
import { HeroRole, type HeroStats, type PartyState, type Roster } from './types';

export function renownPower(renown: number): number {
  const { baseStage, exponent } = BALANCE.ascension;

  return renown >= baseStage ? (renown / baseStage) ** exponent : 1;
}

export function partyMaxHp(party: PartyState, roster: Roster): number {
  const total = party.heroes.reduce(
    (sum, slot) => sum + heroHp(heroById(roster, slot.heroId), slot.level),
    0,
  );

  return safeAmount(total * renownPower(party.renown ?? 0));
}

export function partyVitals(party: PartyState, roster: Roster): PartyVitals {
  const levels = party.heroes.reduce((sum, slot) => sum + slot.level, 0);
  const level = party.heroes.length > 0 ? levels / party.heroes.length : 1;
  const mending = party.heroes.reduce(
    (sum, slot) => sum + healerWeight(heroById(roster, slot.heroId), slot.level, level),
    0,
  );

  return { hp: partyMaxHp(party, roster), level, mending };
}

export function partyPower(party: PartyState, roster: Roster): number {
  const total = party.heroes.reduce((sum, slot) => {
    const hero = heroById(roster, slot.heroId);

    return hero.role === HeroRole.Healer ? sum : sum + heroDamage(hero, slot.level);
  }, 0);

  return safeAmount(total * renownPower(party.renown ?? 0));
}

export function strikeDamage(party: PartyState, roster: Roster): number {
  return safeAmount(partyPower(party, roster) * BALANCE.strikeShare);
}

export function ultimateDamage(party: PartyState, roster: Roster): number {
  return safeAmount(partyPower(party, roster) * BALANCE.ultimateMultiplier);
}

export function heroLevel(party: PartyState, heroId: string): number | undefined {
  return party.heroes.find((slot) => slot.heroId === heroId)?.level;
}

export function levelUp(party: PartyState, heroId: string): PartyState {
  return {
    ...party,
    heroes: party.heroes.map((slot) =>
      slot.heroId === heroId ? { heroId, level: slot.level + 1 } : slot,
    ),
  };
}

export function hire(party: PartyState, heroId: string): PartyState {
  if (heroLevel(party, heroId) !== undefined) return party;

  return { ...party, heroes: [...party.heroes, { heroId, level: 1 }] };
}

export function isUnlocked(hero: HeroStats, lifetimeTokens: number): boolean {
  return lifetimeTokens >= hero.unlockAtTokens;
}
