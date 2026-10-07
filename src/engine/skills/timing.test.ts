import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { startStage } from '../battle/start';
import { stepBattle } from '../battle/step';
import { designHero } from '../design';
import { partyOf, testRoster } from '../testing';
import { AttackStyle, BattleEventType, HeroRole, type Roster } from '../types';
import { SkillEffectKind, SkillTrigger } from './types';

const sniper = designHero(
  { id: 'sniper', order: 2, role: HeroRole.Striker, attack: AttackStyle.Arrow, attackInterval: 1 },
  [
    {
      id: 'shot',
      hero: 'sniper',
      slot: 1,
      trigger: SkillTrigger.Cooldown,
      cooldown: 20,
      charge: 5,
      effects: [{ kind: SkillEffectKind.Hit, share: 1 }],
    },
  ],
);
const roster: Roster = { ...testRoster, heroes: [...testRoster.heroes, sniper] };

describe('skill timing', () => {
  it('never holds the attack of a hero whose skill has not opened', () => {
    const party = partyOf(['sniper', BALANCE.skills.unlockLevel - 1]);
    let battle = startStage(50, party, roster, { seed: 1, ultimate: 0 });
    let hits = 0;

    battle = { ...battle, skills: { shot: { readyIn: 1, pool: 0, misses: 0 } } };
    for (let tick = 0; tick < 50; tick += 1) {
      const step = stepBattle({ ...battle, partyHp: 1e12 }, 0.1, party, roster);

      battle = step.battle;
      hits += step.events.filter((event) => event.type === BattleEventType.Hit).length;
    }
    expect(hits).toBeGreaterThan(3);
  });

  it('opens a boss fight with every timed skill due within half its cooldown', () => {
    const party = partyOf(['sniper', 30]);
    const carried = { shot: { readyIn: 19, pool: 100, misses: 0 } };
    const boss = startStage(50, party, roster, { seed: 1, ultimate: 0, skills: carried });
    const pack = startStage(49, party, roster, { seed: 1, ultimate: 0, skills: carried });

    expect(boss.skills?.shot?.readyIn).toBeLessThanOrEqual(20 * BALANCE.skills.bossOpening);
    expect(boss.skills?.shot?.pool).toBe(100);
    expect(pack.skills?.shot?.readyIn).toBe(19);
  });
});
