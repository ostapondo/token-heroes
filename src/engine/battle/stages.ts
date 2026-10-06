import { BALANCE } from '../balance';
import { foeDamage, foeHp } from '../formulas';
import { bossAt, enemyAt } from '../roster';
import type { BossStats, Foe, Roster } from '../types';

const ENEMY_PICK_STRIDE = { perStage: 7, perSlot: 3 } as const;

export function isBossStage(stage: number): boolean {
  return stage % BALANCE.bossEvery === 0;
}

export function upcomingBoss(roster: Roster, stage: number): BossStats {
  return bossAt(roster, Math.ceil(stage / BALANCE.bossEvery) - 1);
}

export function foesForStage(roster: Roster, stage: number): Foe[] {
  if (isBossStage(stage)) {
    const boss = upcomingBoss(roster, stage);
    const hp = foeHp(stage, boss.hpScale, true);

    return [
      {
        id: boss.id,
        boss: true,
        hp,
        maxHp: hp,
        damage: foeDamage(stage, boss.damageScale, true),
        attackInterval: BALANCE.bossAttackInterval,
        attackIn: BALANCE.bossAttackInterval,
      },
    ];
  }

  return Array.from({ length: BALANCE.packSize }, (_, slot) => {
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
