import { heroDefById, type Content } from '@content';
import {
  BALANCE,
  heroById,
  isUnlocked,
  levelCost,
  levelsToMilestone,
  partyVitals,
  renownPower,
  type PartyState,
  type Roster,
} from '@engine';
import { RECRUITS_SHOWN } from '../constants';
import { roleAction } from './role-action';
import type { PartyRows } from '../types';

interface Wealth {
  readonly balance: number;
  readonly burned: number;
}

export function partyRows(
  party: PartyState,
  wealth: Wealth,
  roster: Roster,
  content: Content,
): PartyRows {
  const vitals = partyVitals(party, roster);
  const power = renownPower(party.renown ?? 0);
  const members = party.heroes.map((slot) => {
    const hero = heroById(roster, slot.heroId);
    const cost = levelCost(slot.level);
    const remaining = levelsToMilestone(slot.level);

    return {
      heroId: slot.heroId,
      name: heroDefById(content, slot.heroId).name,
      level: slot.level,
      cost,
      affordable: wealth.balance >= cost,
      levelsToMilestone: remaining,
      milestoneProgress: (BALANCE.milestoneEvery - remaining) / BALANCE.milestoneEvery,
      action: roleAction(hero, slot.level, vitals, power),
    };
  });
  const owned = new Set(party.heroes.map((slot) => slot.heroId));
  const recruits = content.heroes
    .filter((hero) => !owned.has(hero.id))
    .slice(0, RECRUITS_SHOWN)
    .map((hero) => {
      const stats = heroById(roster, hero.id);

      return {
        heroId: hero.id,
        name: hero.name,
        cost: stats.hireCost,
        unlockAtTokens: stats.unlockAtTokens,
        unlocked: isUnlocked(stats, wealth.burned),
        affordable: wealth.balance >= stats.hireCost,
        action: roleAction(stats, 1, vitals, power),
      };
    });

  return { members, recruits };
}
