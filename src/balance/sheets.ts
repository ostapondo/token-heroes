import {
  BALANCE,
  foeDamage,
  foesForStage,
  healerWeight,
  heroById,
  heroDamage,
  heroHp,
  heroMend,
  type HeroRole,
  isBossStage,
  levelCost,
  type PartyVitals,
  type Roster,
} from '@engine';

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
  readonly timeLimit: number | null;
  readonly foes: readonly FoeSheet[];
  readonly totalHp: number;
  readonly damagePerSecond: number;
  readonly harshestDamagePerSecond: number;
}

// A healer's share depends on the party it heals; alone, it heals itself at its own level.
export function heroSheet(
  roster: Roster,
  heroId: string,
  level: number,
  party?: PartyVitals,
): HeroSheet {
  const hero = heroById(roster, heroId);
  const hit = heroDamage(hero, level);
  const vitals = party ?? {
    hp: heroHp(hero, level),
    level,
    mending: healerWeight(hero, level, level),
  };

  return {
    heroId,
    role: hero.role,
    level,
    hit,
    mend: heroMend(hero, level, vitals),
    interval: hero.attackInterval,
    damagePerSecond: hit / hero.attackInterval,
    hp: heroHp(hero, level),
    nextLevelCost: levelCost(level),
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
    timeLimit: isBossStage(stage) ? BALANCE.bossTimeLimit : null,
    foes,
    totalHp: foes.reduce((sum, foe) => sum + foe.hp, 0),
    damagePerSecond,
    // The hardest-hitting boss kind at this stage, whichever boss happens to stand here.
    harshestDamagePerSecond: isBossStage(stage)
      ? foeDamage(stage, harshest, true) / BALANCE.bossAttackInterval
      : damagePerSecond,
  };
}
