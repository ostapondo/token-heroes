import { costToLevel } from '../formulas';
import { heroById } from '../roster';
import type { PartyState, Roster } from '../types';

const SEARCH_STEPS = 40;

// Levels bought under an older economy are re-bought with the coins the player spent. Every
// hero keeps the same share of its level, so the party keeps the shape the player chose.
export function rebalanceParty(party: PartyState, roster: Roster, spent: number): PartyState {
  const hires = party.heroes.reduce((sum, slot) => sum + heroById(roster, slot.heroId).hireCost, 0);
  const budget = spent - hires;
  const scaled = (share: number) =>
    party.heroes.map((slot) => ({ ...slot, level: Math.max(1, Math.floor(slot.level * share)) }));
  const cost = (share: number) =>
    scaled(share).reduce((sum, slot) => sum + costToLevel(slot.level), 0);

  if (cost(1) <= budget) return party;
  let low = 0;
  let high = 1;

  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const share = (low + high) / 2;

    if (cost(share) <= budget) low = share;
    else high = share;
  }

  return { heroes: scaled(low) };
}
