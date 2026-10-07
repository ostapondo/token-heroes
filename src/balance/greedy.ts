import {
  BALANCE,
  heroById,
  heroDamage,
  costToLevel,
  levelCost,
  partyMend,
  partyVitals,
  type PartyState,
  type Roster,
} from '@engine';

// The player's own reckoning of how far a party gets, not a game rule: the stage where the boss
// outlasts the timer, or the stage where the boss outlasts the party, whichever comes first.
// Foes grow alike in health and damage, so both reduce to powers of the foe growth.
function reach(party: PartyState, roster: Roster): number {
  const vitals = partyVitals(party, roster);
  const damage = party.heroes.reduce((sum, slot) => {
    const hero = heroById(roster, slot.heroId);

    return sum + heroDamage(hero, slot.level) / hero.attackInterval;
  }, 0);
  const toughness = vitals.hp / (1 - partyMend(vitals));
  const bossHp = BALANCE.enemyHpBase * BALANCE.bossHpMultiplier;
  const bossDamage = BALANCE.bossDamageBase / BALANCE.bossAttackInterval;

  const growth = Math.log(BALANCE.foeGrowth);
  const beforeTimer = Math.log((damage * BALANCE.bossTimeLimit) / bossHp) / growth;
  const beforeDefeat = Math.log((damage * toughness) / (bossHp * bossDamage)) / (2 * growth);

  return Math.min(beforeTimer, beforeDefeat);
}

interface Purchase {
  readonly cost: number;
  readonly party: PartyState;
}

const median = (levels: readonly number[]): number =>
  levels.toSorted((left, right) => left - right)[Math.floor(levels.length / 2)] ?? 1;

const withLevel = (party: PartyState, heroId: string, level: number): PartyState => ({
  heroes: party.heroes.some((slot) => slot.heroId === heroId)
    ? party.heroes.map((slot) => (slot.heroId === heroId ? { heroId, level } : slot))
    : [...party.heroes, { heroId, level }],
});

// One more level of any hero, or a hero brought up to the party's median level in one go: a
// level-one recruit is worth little alone, so a player weighs the whole climb.
function purchases(party: PartyState, roster: Roster, burned: number): Purchase[] {
  const target = median(party.heroes.map((slot) => slot.level));
  const levels = party.heroes.flatMap((slot) => [
    { cost: levelCost(slot.level), party: withLevel(party, slot.heroId, slot.level + 1) },
    ...(slot.level < target
      ? [
          {
            cost: costToLevel(target) - costToLevel(slot.level),
            party: withLevel(party, slot.heroId, target),
          },
        ]
      : []),
  ]);
  const owned = new Set(party.heroes.map((slot) => slot.heroId));
  const hires = roster.heroes
    .filter((hero) => !owned.has(hero.id) && hero.unlockAtTokens <= burned)
    .flatMap((hero) => [
      { cost: hero.hireCost, party: withLevel(party, hero.id, 1) },
      {
        cost: hero.hireCost + costToLevel(target),
        party: withLevel(party, hero.id, target),
      },
    ]);

  return [...levels, ...hires];
}

// A player who always buys whatever moves the party furthest per coin: the next level of any
// hero, or any hero the burn has unlocked. If a lopsided party beats an even one, this finds it.
export function greedyPartyFor(roster: Roster, coins: number): PartyState {
  const [first] = roster.heroes;
  let party: PartyState = { heroes: first ? [{ heroId: first.id, level: 1 }] : [] };
  let left = coins - (first?.hireCost ?? 0);

  for (;;) {
    const now = reach(party, roster);
    const options = purchases(party, roster, coins).filter((option) => option.cost <= left);
    const best = options
      .map((option) => ({ option, gain: (reach(option.party, roster) - now) / option.cost }))
      .toSorted((a, b) => b.gain - a.gain)[0];

    if (!best) return party;
    party = best.option.party;
    left -= best.option.cost;
  }
}
