import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { startStage } from '../battle/start';
import { stepBattle } from '../battle/step';
import { designHero } from '../design';
import { heroDamage } from '../formulas';
import { partyOf, testRoster } from '../testing';
import {
  AttackStyle,
  type BattleEvent,
  BattleEventType,
  type BattleState,
  HeroRole,
  type PartyState,
  type Roster,
} from '../types';
import { type SkillEffect, SkillEffectKind, SkillTrigger, type SkillBlueprint } from './types';

const HUGE = 1e12;
const CRIT_FACTOR = 1 + BALANCE.critChance * (BALANCE.critMultiplier - 1);

const skill = (
  overrides: Partial<SkillBlueprint> & { effects: SkillEffect[] },
): SkillBlueprint => ({
  id: 'bolt',
  hero: 'mage',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 10,
  ...overrides,
});

function rosterWith(...skills: SkillBlueprint[]): Roster {
  const mage = designHero(
    { id: 'mage', order: 3, role: HeroRole.Striker, attack: AttackStyle.Spell, attackInterval: 1 },
    skills,
  );

  return { ...testRoster, heroes: [...testRoster.heroes, mage] };
}

const GUARD: SkillBlueprint = {
  id: 'palm',
  hero: 'mage',
  slot: 1,
  trigger: SkillTrigger.OnGuard,
  chance: 0.25,
  effects: [{ kind: SkillEffectKind.Deflect }, { kind: SkillEffectKind.Hit, share: 1 }],
};

const party: PartyState = partyOf(['mage', 30], ['guard', 30]);

function bossFight(roster: Roster): BattleState {
  const base = startStage(50, party, roster, { seed: 3, ultimate: 0 });
  const [boss] = base.foes;

  if (!boss) throw new Error('Stage 50 has no boss');

  return { ...base, foes: [{ ...boss, mechanic: undefined, hp: HUGE, maxHp: HUGE }] };
}

function run(battle: BattleState, roster: Roster, seconds: number, dt = 0.1) {
  let current = battle;
  const events: BattleEvent[] = [];

  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += dt) {
    const step = stepBattle({ ...current, partyHp: HUGE }, dt, party, roster);

    current = step.battle;
    events.push(...step.events);
  }

  return { battle: current, events };
}

const ofType = <T extends BattleEvent['type']>(events: readonly BattleEvent[], type: T) =>
  events.filter((event): event is Extract<BattleEvent, { type: T }> => event.type === type);

const blows = (roster: Roster) =>
  ofType(run(bossFight(roster), roster, 60).events, BattleEventType.PartyHit).length;

function mageDamage(events: readonly BattleEvent[]): number {
  const hits = ofType(events, BattleEventType.Hit).filter((hit) => hit.source === 'mage');
  const skills = ofType(events, BattleEventType.Skill).flatMap((cast) => cast.hits);

  return [...hits, ...skills].reduce((sum, hit) => sum + hit.amount, 0);
}

describe('a skill', () => {
  const roster = rosterWith(skill({ effects: [{ kind: SkillEffectKind.Hit, share: 1 }] }));
  const fight = run(bossFight(roster), roster, 200);

  it('casts on its timer', () => {
    expect(ofType(fight.events, BattleEventType.Skill)).toHaveLength(20);
  });

  it("reshapes its hero's damage without adding to it", () => {
    const mage = roster.heroes.find((hero) => hero.id === 'mage');
    const expected = mage ? heroDamage(mage, 30) * 200 * CRIT_FACTOR : 0;

    expect(mageDamage(fight.events) / expected).toBeCloseTo(1, 1);
  });

  it('plays out the same way from the same seed', () => {
    expect(run(bossFight(roster), roster, 30).events).toEqual(
      run(bossFight(roster), roster, 30).events,
    );
  });
});

describe('skill effects', () => {
  it('hold the foe back with a stun', () => {
    const stunned = rosterWith(
      skill({ cooldown: 4, effects: [{ kind: SkillEffectKind.Stun, share: 1 }] }),
    );
    const plain = rosterWith(
      skill({ cooldown: 4, effects: [{ kind: SkillEffectKind.Hit, share: 1 }] }),
    );

    expect(blows(stunned)).toBeLessThan(blows(plain));
  });

  it('take blows on a shield', () => {
    const roster = rosterWith(
      skill({ effects: [{ kind: SkillEffectKind.Shield, share: 1, seconds: 4 }] }),
    );
    const hits = ofType(run(bossFight(roster), roster, 40).events, BattleEventType.PartyHit);

    expect(hits.some((hit) => (hit.blocked ?? 0) > 0)).toBe(true);
  });

  it('burn a foe in ticks', () => {
    const roster = rosterWith(
      skill({ effects: [{ kind: SkillEffectKind.Burn, share: 1, seconds: 3 }] }),
    );

    expect(
      ofType(run(bossFight(roster), roster, 20).events, BattleEventType.SkillTick).length,
    ).toBeGreaterThan(5);
  });

  it('make a blow miss on a guard and answer it', () => {
    const roster = rosterWith(GUARD);
    const casts = ofType(run(bossFight(roster), roster, 120).events, BattleEventType.Skill);

    expect(casts.length).toBeGreaterThan(0);
    expect(casts.every((cast) => cast.deflected === 0 || (cast.parried ?? 0) > 0)).toBe(true);
  });

  it('miss a blow it can pay for in full and answer the foe with the rest', () => {
    const roster = rosterWith(GUARD);
    const weak = bossFight(roster);
    const softened = {
      ...weak,
      foes: weak.foes.map((foe) => ({ ...foe, damage: 1 })),
    };
    const { events } = run(softened, roster, 120);
    const misses = ofType(events, BattleEventType.Skill).filter((cast) => cast.deflected === 0);

    expect(misses.length).toBeGreaterThan(3);
    expect(misses.some((cast) => cast.hits.length > 0)).toBe(true);
  });

  it('hold the hero’s own attack while it charges', () => {
    const roster = rosterWith(
      skill({ cooldown: 6, charge: 2, effects: [{ kind: SkillEffectKind.Hit, share: 1 }] }),
    );
    const { events } = run(bossFight(roster), roster, 30);
    const hits = ofType(events, BattleEventType.Hit).filter((hit) => hit.source === 'mage');

    expect(hits.length).toBeLessThan(25);
    expect(mageDamage(events)).toBeGreaterThan(0);
  });
});
