import { BALANCE } from './balance';
import type { HeroStats } from './types';

const grown = (base: number, rate: number, steps: number) => base * rate ** steps;

export function foeHp(stage: number, scale: number, boss: boolean): number {
  const enemy = grown(BALANCE.enemyHpBase, BALANCE.hpGrowth, stage - 1) * scale;
  return Math.ceil(boss ? enemy * BALANCE.bossHpMultiplier : enemy);
}

export function foeDamage(stage: number, scale: number, boss: boolean): number {
  const base = boss ? BALANCE.bossDamageBase : BALANCE.enemyDamageBase;
  return Math.ceil(grown(base, BALANCE.damageGrowth, stage - 1) * scale);
}

export function milestoneBonus(level: number): number {
  return BALANCE.milestoneMultiplier ** Math.floor(level / BALANCE.milestoneEvery);
}

export function levelsToMilestone(level: number): number {
  return BALANCE.milestoneEvery - (level % BALANCE.milestoneEvery);
}

export function heroDamage(hero: HeroStats, level: number): number {
  return Math.ceil(hero.baseDamage * level * milestoneBonus(level));
}

export function heroHp(hero: HeroStats, level: number): number {
  return Math.ceil(hero.baseHp * level * milestoneBonus(level));
}

export function levelCost(hero: HeroStats, level: number): number {
  return Math.ceil(hero.levelCostBase * BALANCE.levelCostGrowth ** level);
}
