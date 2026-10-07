import {
  BALANCE,
  foeDamage,
  foesForStage,
  healerWeight,
  heroAttack,
  heroById,
  heroDamage,
  heroHp,
  heroMend,
  type HeroRole,
  type HeroStats,
  isBossStage,
  levelCost,
  levelOfRank,
  type PartyVitals,
  type Roster,
  skillHitPerCast,
  skillRank,
  skillShare,
} from '@engine';

interface SkillSheet {
  readonly id: string;
  readonly rank: number;
  // Damage a cast lands on the front foe, null for a skill that deals none.
  readonly hit: number | null;
  // Of the hero's base output, the share this skill delivers.
  readonly share: number;
  readonly nextRankAt: number;
}

export interface HeroSheet {
  readonly heroId: string;
  readonly role: HeroRole;
  readonly level: number;
  readonly hit: number;
  readonly mend: number;
  readonly interval: number;
  readonly damagePerSecond: number;
  readonly hp: number;
  readonly nextLevelCost: number;
  readonly skills: readonly SkillSheet[];
}

interface FoeSheet {
  readonly id: string;
  readonly hp: number;
  readonly hit: number;
  readonly interval: number;
  readonly damagePerSecond: number;
}

export interface StageSheet {
  readonly stage: number;
  readonly boss: boolean;
  readonly foes: readonly FoeSheet[];
  readonly totalHp: number;
  readonly damagePerSecond: number;
  readonly harshestDamagePerSecond: number;
}

function skillSheets(hero: HeroStats, level: number): SkillSheet[] {
  return hero.skills.map((skill) => {
    const rank = skillRank(level, skill.lag);

    return {
      id: skill.id,
      rank,
      hit: skillHitPerCast(hero, skill, level),
      share: skillShare(hero, skill, level),
      nextRankAt: levelOfRank(rank + 1, skill.lag),
    };
  });
}

// A healer's share depends on the party it heals; alone, it heals itself at its own level.
export function heroSheet(
  roster: Roster,
  heroId: string,
  level: number,
  party?: PartyVitals,
): HeroSheet {
  const hero = heroById(roster, heroId);
  const vitals = party ?? {
    hp: heroHp(hero, level),
    level,
    mending: healerWeight(hero, level, level),
  };

  return {
    heroId,
    role: hero.role,
    level,
    hit: heroAttack(hero, level),
    mend: heroMend(hero, level, vitals),
    interval: hero.attackInterval,
    damagePerSecond: heroDamage(hero, level) / hero.attackInterval,
    hp: heroHp(hero, level),
    nextLevelCost: levelCost(level),
    skills: skillSheets(hero, level),
  };
}

export function stageSheet(roster: Roster, stage: number): StageSheet {
  const foes = foesForStage(roster, stage).map((foe) => ({
    id: foe.id,
    hp: foe.maxHp,
    hit: foe.damage,
    interval: foe.attackInterval,
    damagePerSecond: foe.damage / foe.attackInterval,
  }));

  const damagePerSecond = foes.reduce((sum, foe) => sum + foe.damagePerSecond, 0);
  const harshest = Math.max(...roster.bosses.map((boss) => boss.damageScale));

  return {
    stage,
    boss: isBossStage(stage),
    foes,
    totalHp: foes.reduce((sum, foe) => sum + foe.hp, 0),
    damagePerSecond,
    // The hardest-hitting boss kind at this stage, whichever boss happens to stand here; a super
    // boss always stands on its stage and leads it, so it can only hit harder.
    harshestDamagePerSecond: isBossStage(stage)
      ? Math.max(damagePerSecond, foeDamage(stage, harshest, true) / BALANCE.bossAttackInterval)
      : damagePerSecond,
  };
}
