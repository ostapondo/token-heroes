import { BALANCE } from './balance';
import { attackShare, damageRankPower, healthRankPower, skillRank } from './skills/ranks';
import { HeroRole, type HeroStats } from './types';

const grown = (base: number, rate: number, steps: number) => base * rate ** steps;

export const safeAmount = (value: number): number =>
  Number.isFinite(value)
    ? Math.min(Math.ceil(value), Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER;

export function foeHp(stage: number, scale: number, boss: boolean): number {
  const enemy = grown(BALANCE.enemyHpBase, BALANCE.foeGrowth, stage - 1) * scale;

  return safeAmount(boss ? enemy * BALANCE.bossHpMultiplier : enemy);
}

export function foeDamage(stage: number, scale: number, boss: boolean): number {
  const base = boss ? BALANCE.bossDamageBase : BALANCE.enemyDamageBase;

  return safeAmount(grown(base, BALANCE.foeGrowth, stage - 1) * scale);
}

function milestoneBonus(level: number): number {
  return BALANCE.milestoneMultiplier ** Math.floor(level / BALANCE.milestoneEvery);
}

export function levelsToMilestone(level: number): number {
  return BALANCE.milestoneEvery - (level % BALANCE.milestoneEvery);
}

const baseOutput = (hero: HeroStats, level: number): number =>
  hero.baseDamage * level * milestoneBonus(level);

// Everything the hero deals per attack interval: its own attack and its skills together.
export function heroDamage(hero: HeroStats, level: number): number {
  return safeAmount(baseOutput(hero, level) * damageRankPower(hero, level));
}

// The hero's own hit, once its skills have taken their share.
export function heroAttack(hero: HeroStats, level: number): number {
  return safeAmount(baseOutput(hero, level) * attackShare(hero, level));
}

// A skill's damage per second for each unit of share it holds; see skillShare.
export const baseDamagePerSecond = (hero: HeroStats, level: number): number =>
  baseOutput(hero, level) / hero.attackInterval;

// A healer's own heal keeps the attack share of its healing; its skills carry the rest, so a
// rank adds no healing (healing that grew with rank made healers the one buy that wins).
export function healShare(hero: HeroStats, level: number): number {
  return hero.skills.length > 0 && skillRank(level) > 0 ? attackShare(hero, level) : 1;
}

export interface PartyVitals {
  readonly hp: number;
  readonly level: number;
  readonly mending: number;
}

// A healer's power counts in proportion to its level against the party's, up to the cap, so a
// neglected healer cannot keep healing for free.
export function healerWeight(hero: HeroStats, level: number, partyLevel: number): number {
  if (hero.role !== HeroRole.Healer) return 0;
  const { min, max } = BALANCE.healLevelFactor;

  return hero.power * Math.min(Math.max(level / Math.max(partyLevel, 1), min), max);
}

const mendDivisor = (party: PartyVitals) => 1 + BALANCE.mendShare * party.mending;

// The healers together undo mendShare·m / (1 + mendShare·m) of the foes' damage: always under
// all of it, so healing makes the party last longer but never makes it immortal.
export function partyMend(party: PartyVitals): number {
  return (BALANCE.mendShare * party.mending) / mendDivisor(party);
}

export function heroMend(hero: HeroStats, level: number, party: PartyVitals): number {
  return (BALANCE.mendShare * healerWeight(hero, level, party.level)) / mendDivisor(party);
}

export function heroHeal(
  hero: HeroStats,
  level: number,
  party: PartyVitals,
  foesDamagePerSecond: number,
): number {
  return safeAmount(heroMend(hero, level, party) * foesDamagePerSecond * hero.attackInterval);
}

export function heroHp(hero: HeroStats, level: number): number {
  return safeAmount(hero.baseHp * level * milestoneBonus(level) * healthRankPower(level));
}

export function levelCost(level: number): number {
  return safeAmount(BALANCE.levelCostBase * BALANCE.levelCostGrowth ** level);
}

export function costToLevel(level: number): number {
  const growth = BALANCE.levelCostGrowth;

  return level <= 1
    ? 0
    : safeAmount((BALANCE.levelCostBase * growth * (growth ** (level - 1) - 1)) / (growth - 1));
}
