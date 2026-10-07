import { BALANCE } from '../balance';
import { foeDamage, foeHp } from '../formulas';
import { bossAt, enemyAt, superBossAt } from '../roster';
import { SuperBossTier, type BossStats, type Foe, type Roster } from '../types';

const ENEMY_PICK_STRIDE = { perStage: 7, perSlot: 3 } as const;
const NO_LEAD = { hpLead: 0, damageLead: 0 } as const;

interface StageBoss {
  readonly stats: BossStats;
  readonly lead: { readonly hpLead: number; readonly damageLead: number };
}

export function isBossStage(stage: number): boolean {
  return stage % BALANCE.bossEvery === 0;
}

export function superBossTier(stage: number): SuperBossTier | null {
  const { medium, strong } = BALANCE.superBosses;

  if (stage % strong.every === 0) return SuperBossTier.Strong;
  if (stage % medium.every === 0) return SuperBossTier.Medium;

  return null;
}

// Each tier cycles through its own bosses, counting only the stages that tier stood on.
function superBossRound(tier: SuperBossTier, stage: number): number {
  const { medium, strong } = BALANCE.superBosses;
  const strongSoFar = Math.floor(stage / strong.every);

  return tier === SuperBossTier.Strong
    ? strongSoFar - 1
    : Math.floor(stage / medium.every) - strongSoFar - 1;
}

function bossOfStage(roster: Roster, bossStage: number): StageBoss {
  const tier = superBossTier(bossStage);

  if (!tier) return { stats: bossAt(roster, bossStage / BALANCE.bossEvery - 1), lead: NO_LEAD };

  return {
    stats: superBossAt(roster, tier, superBossRound(tier, bossStage)),
    lead: BALANCE.superBosses[tier],
  };
}

export function packSize(stage: number): number {
  const { first, max, growEvery } = BALANCE.packSize;

  return Math.min(max, first + Math.floor((stage - 1) / growEvery));
}

export function upcomingBoss(roster: Roster, stage: number): BossStats {
  return bossOfStage(roster, Math.ceil(stage / BALANCE.bossEvery) * BALANCE.bossEvery).stats;
}

export function foesForStage(roster: Roster, stage: number): Foe[] {
  if (isBossStage(stage)) {
    const { stats, lead } = bossOfStage(roster, stage);
    const hp = foeHp(stage + lead.hpLead, stats.hpScale, true);

    return [
      {
        id: stats.id,
        boss: true,
        hp,
        maxHp: hp,
        damage: foeDamage(stage + lead.damageLead, stats.damageScale, true),
        attackInterval: BALANCE.bossAttackInterval,
        attackIn: BALANCE.bossAttackInterval,
      },
    ];
  }

  return Array.from({ length: packSize(stage) }, (_, slot) => {
    const enemy = enemyAt(
      roster,
      stage * ENEMY_PICK_STRIDE.perStage + slot * ENEMY_PICK_STRIDE.perSlot,
    );
    const hp = foeHp(stage, enemy.hpScale, false);
    const interval = BALANCE.enemyAttackInterval * (1 + slot * BALANCE.packAttackStagger);

    return {
      id: enemy.id,
      boss: false,
      hp,
      maxHp: hp,
      damage: foeDamage(stage, enemy.damageScale, false),
      attackInterval: interval,
      attackIn: interval,
    };
  });
}
