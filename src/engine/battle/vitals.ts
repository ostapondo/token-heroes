import { BALANCE } from '../balance';
import { heroMaxHp } from '../party';
import {
  type BattleEvent,
  BattleEventType,
  type BattleState,
  type HeroVitals,
  type PartyState,
  type Roster,
} from '../types';
import type { BattleDraft, FoeDraft } from './draft';

export function freshVitals(party: PartyState, roster: Roster): Record<string, HeroVitals> {
  return Object.fromEntries(
    party.heroes.map((slot) => [slot.heroId, { hp: heroMaxHp(party, roster, slot.heroId) }]),
  );
}

export const isUp = (draft: Pick<BattleState, 'vitals'>, heroId: string): boolean =>
  (draft.vitals[heroId]?.hp ?? 0) > 0;

// A hero hired or levelled mid-fight joins the fight at full health.
export function joinVitals(draft: BattleDraft, party: PartyState, roster: Roster): void {
  for (const slot of party.heroes)
    draft.vitals[slot.heroId] ??= { hp: heroMaxHp(party, roster, slot.heroId) };
}

export const partyDown = (draft: BattleDraft, party: PartyState): boolean =>
  party.heroes.every((slot) => !isUp(draft, slot.heroId));

export const partyHealth = (battle: Pick<BattleState, 'vitals'>): number =>
  Object.values(battle.vitals).reduce((sum, vitals) => sum + vitals.hp, 0);

// Every blow goes to the hero with the most health left, so the tanks take the brunt and the
// damage evens out over the party; a pack spreads its blows down that list by slot, and a boss's
// blow reaches as many heroes from the top of it as its attack covers.
export function victims(
  draft: Pick<BattleState, 'vitals'>,
  party: PartyState,
  slot: number,
  foe: Pick<FoeDraft, 'boss' | 'attack'>,
): string[] {
  const standing = party.heroes
    .map((each) => ({ id: each.heroId, hp: draft.vitals[each.heroId]?.hp ?? 0 }))
    .filter((hero) => hero.hp > 0)
    .toSorted((left, right) => right.hp - left.hp);

  if (foe.boss)
    return standing.slice(0, foe.attack ? BALANCE.bossReach[foe.attack] : 1).map((hero) => hero.id);
  const victim = standing[slot % Math.max(1, standing.length)];

  return victim ? [victim.id] : [];
}

export function wound(
  draft: BattleDraft,
  heroId: string,
  amount: number,
  foe: number,
  events: BattleEvent[],
): void {
  const vitals = draft.vitals[heroId];

  if (!vitals || vitals.hp <= 0) return;
  const hp = vitals.hp - amount;

  if (hp > 0) {
    draft.vitals[heroId] = { hp };

    return;
  }
  draft.vitals[heroId] = { hp: 0 };
  events.push({ type: BattleEventType.HeroDown, hero: heroId, foe });
}

// Healing flows into lost health, weakest share first, and what one hero cannot take passes on
// to the next, so a heal is wasted only when the whole party is whole. Returns the first hero
// it reached.
function flow(
  draft: BattleDraft,
  party: PartyState,
  roster: Roster,
  amount: number,
): string | undefined {
  const wounded = party.heroes
    .map((slot) => ({ id: slot.heroId, hp: draft.vitals[slot.heroId]?.hp ?? 0 }))
    .filter((hero) => hero.hp > 0)
    .map((hero) => ({ ...hero, max: heroMaxHp(party, roster, hero.id) }))
    .filter((hero) => hero.hp < hero.max)
    .toSorted((left, right) => left.hp / left.max - right.hp / right.max);
  let left = amount;

  for (const hero of wounded) {
    if (left <= 0) break;
    const taken = Math.min(left, hero.max - hero.hp);

    draft.vitals[hero.id] = { hp: hero.hp + taken };
    left -= taken;
  }

  return wounded[0]?.id;
}

// A healer's own heal and a party heal both go where health is missing most.
export const mendWeakest = flow;
export const mendAll = (
  draft: BattleDraft,
  party: PartyState,
  roster: Roster,
  amount: number,
): void => {
  flow(draft, party, roster, amount);
};
