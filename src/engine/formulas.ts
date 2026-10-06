import { BALANCE } from './balance';
import type { HeroStats } from './types';

const grown = (base: number, rate: number, steps: number) => base * rate ** steps;

export const safeAmount = (value: number): number =>
  Number.isFinite(value)
    ? Math.min(Math.ceil(value), Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER;

export function foeHp(stage: number, scale: number, boss: boolean): number {
  const enemy = grown(BALANCE.enemyHpBase, BALANCE.hpGrowth, stage - 1) * scale;

  return safeAmount(boss ? enemy * BALANCE.bossHpMultiplier : enemy);
}

export function foeDamage(stage: number, scale: number, boss: boolean): number {
  const base = boss ? BALANCE.bossDamageBase : BALANCE.enemyDamageBase;

  return safeAmount(grown(base, BALANCE.damageGrowth, stage - 1) * scale);
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

export function heroHeal(hero: HeroStats, level: number): number {
  return safeAmount(heroDamage(hero, level) * BALANCE.healerShare);
}

export function heroHp(hero: HeroStats, level: number): number {
  return safeAmount(hero.baseHp * level * milestoneBonus(level));
}

export function levelCost(hero: HeroStats, level: number): number {
  return safeAmount(hero.levelCostBase * BALANCE.levelCostGrowth ** level);
}
