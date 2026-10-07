import { BALANCE } from '../balance';
import type { HeroStats } from '../types';
import type { SkillStats, Tiered } from './types';

const RULES = BALANCE.skills;
const FORM_RANKS = [5, 3] as const;

// Rank 0 below the unlock level; then one rank every rankEvery levels, counted lag levels late.
export function skillRank(level: number, lag = 0): number {
  if (level < RULES.unlockLevel) return 0;

  return Math.max(1, 1 + Math.floor((level - RULES.unlockLevel - lag) / RULES.rankEvery));
}

export function levelOfRank(rank: number, lag = 0): number {
  return rank <= 1 ? RULES.unlockLevel : RULES.unlockLevel + lag + (rank - 1) * RULES.rankEvery;
}

// A hero with several skills ranks them in turn, each one rankEvery / N levels behind the last.
export const skillLag = (slot: number, skills: number): number =>
  Math.floor(((slot - 1) * RULES.rankEvery) / Math.max(skills, 1));

// The skills a level-up opened or ranked up, with their new rank.
export function rankedSkills(
  hero: HeroStats,
  before: number,
  after: number,
): { readonly skill: SkillStats; readonly rank: number }[] {
  return hero.skills.flatMap((skill) => {
    const rank = skillRank(after, skill.lag);

    return rank === skillRank(before, skill.lag) ? [] : [{ skill, rank }];
  });
}

const lineRanks = (hero: HeroStats, level: number): number[] =>
  hero.skills.length > 0
    ? hero.skills.map((skill) => skillRank(level, skill.lag))
    : [skillRank(level)];

// The hero's damage grows by the mean of its skills' rank growth, so a hero whose second skill
// lags is never ahead of a hero with one skill.
export function damageRankPower(hero: HeroStats, level: number): number {
  const ranks = lineRanks(hero, level);

  return ranks.reduce((sum, rank) => sum + RULES.rankGrowth ** rank, 0) / ranks.length;
}

export const healthRankPower = (level: number): number => RULES.rankGrowth ** skillRank(level);

// The share of the hero's base output its own attack or heal keeps; the skills carry the rest.
export function attackShare(hero: HeroStats, level: number): number {
  const rank = skillRank(level);

  if (hero.skills.length === 0 || rank === 0) return damageRankPower(hero, level);
  const { first, step, floor } = RULES.attackShare;

  return Math.max(floor, first - step * (rank - 1));
}

// Of the hero's base output, the share that one skill delivers.
export function skillShare(hero: HeroStats, skill: SkillStats, level: number): number {
  const rank = skillRank(level, skill.lag);

  if (rank === 0) return 0;
  const lines = Math.max(hero.skills.length, 1);

  return (RULES.rankGrowth ** rank - attackShare(hero, level)) / lines;
}

export function formTier(rank: number): 0 | 1 | 2 {
  if (rank >= FORM_RANKS[0]) return 2;

  return rank >= FORM_RANKS[1] ? 1 : 0;
}

export function tiered(value: Tiered | undefined, rank: number, fallback = 0): number {
  if (value === undefined) return fallback;

  return typeof value === 'number' ? value : value[formTier(rank)];
}
