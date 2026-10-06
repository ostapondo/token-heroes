import { BALANCE } from './balance';
import type { HeroStats } from './types';

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

export function heroDamage(hero: HeroStats, level: number): number {
  return safeAmount(hero.baseDamage * level * milestoneBonus(level));
}

export interface PartyVitals {
  readonly hp: number;
  readonly level: number;
}

export function heroHeal(hero: HeroStats, level: number, party: PartyVitals): number {
  const { min, max } = BALANCE.healLevelFactor;
  const standing = Math.min(Math.max(level / Math.max(party.level, 1), min), max);

  return safeAmount(BALANCE.healShare * hero.power * party.hp * hero.attackInterval * standing);
}

export function heroHp(hero: HeroStats, level: number): number {
  return safeAmount(hero.baseHp * level * milestoneBonus(level));
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
