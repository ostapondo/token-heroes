import { BALANCE } from './balance';
import { prdConstant } from './skills/procs';
import { skillLag } from './skills/ranks';
import type { SkillBlueprint, SkillStats } from './skills/types';
import type { AttackStyle, HeroRole, HeroStats } from './types';

export interface HeroBlueprint {
  readonly id: string;
  readonly order: number;
  readonly role: HeroRole;
  readonly attack: AttackStyle;
  readonly attackInterval: number;
  readonly focus?: number;
}

const SIGNIFICANT_DIGITS = 2;

function roundPrice(value: number): number {
  if (value <= 0) return 0;
  const unit = 10 ** (Math.floor(Math.log10(value)) - SIGNIFICANT_DIGITS + 1);

  return Math.round(value / unit) * unit;
}

const heroRank = (order: number): number => BALANCE.heroRankGrowth ** (order - 1);

const hireCostAt = (order: number): number =>
  order <= 1 ? 0 : roundPrice(BALANCE.hireCostFirst * BALANCE.hireCostGrowth ** (order - 2));

const unlockAt = (order: number): number =>
  order <= BALANCE.starterHeroes
    ? 0
    : BALANCE.unlockFirst * BALANCE.unlockGrowth ** (order - BALANCE.starterHeroes - 1);

function designSkills(skills: readonly SkillBlueprint[]): SkillStats[] {
  return skills
    .toSorted((left, right) => left.slot - right.slot)
    .map((skill) => ({
      ...skill,
      lag: skillLag(skill.slot, skills.length),
      prd: skill.chance ? prdConstant(skill.chance) : 0,
    }));
}

// Focus leans a hero towards offence (positive) or toughness (negative) within one budget. Its
// skills spend that budget too, so they shape the hero's output without adding to it.
export function designHero(
  blueprint: HeroBlueprint,
  skills: readonly SkillBlueprint[] = [],
): HeroStats {
  const role = BALANCE.roles[blueprint.role];
  const rank = heroRank(blueprint.order);
  const focus = blueprint.focus ?? 0;
  const power = rank * (1 + focus);

  return {
    id: blueprint.id,
    role: blueprint.role,
    attack: blueprint.attack,
    attackInterval: blueprint.attackInterval,
    power,
    baseDamage: role.damagePerSecond * power * blueprint.attackInterval,
    baseHp: role.hp * rank * (1 - focus),
    hireCost: hireCostAt(blueprint.order),
    unlockAtTokens: unlockAt(blueprint.order),
    skills: designSkills(skills),
  };
}
