import {
  BALANCE,
  foesForStage,
  heroById,
  heroDamage,
  heroHeal,
  heroHp,
  HeroRole,
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
  readonly heal: number;
  readonly interval: number;
  readonly damagePerSecond: number;
  readonly healPerSecond: number;
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
}

// A healer's heal depends on the party it heals; alone, it heals itself at its own level.
export function heroSheet(
  roster: Roster,
  heroId: string,
  level: number,
  party?: PartyVitals,
): HeroSheet {
  const hero = heroById(roster, heroId);
  const healer = hero.role === HeroRole.Healer;
  const hit = healer ? 0 : heroDamage(hero, level);
  const vitals = party ?? { hp: heroHp(hero, level), level };
  const heal = healer ? heroHeal(hero, level, vitals) : 0;

  return {
    heroId,
    role: hero.role,
    level,
    hit,
    heal,
    interval: hero.attackInterval,
    damagePerSecond: hit / hero.attackInterval,
    healPerSecond: heal / hero.attackInterval,
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

  return {
    stage,
    boss: isBossStage(stage),
    timeLimit: isBossStage(stage) ? BALANCE.bossTimeLimit : null,
    foes,
    totalHp: foes.reduce((sum, foe) => sum + foe.hp, 0),
    damagePerSecond: foes.reduce((sum, foe) => sum + foe.damagePerSecond, 0),
  };
}
