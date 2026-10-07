import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { foeHp, safeAmount } from '../formulas';
import { partyOf, runFor, testRoster } from '../testing';
import { type BattleEvent, BattleEventType, BossMechanic, type Foe, type Roster } from '../types';
import { draftOf } from './draft';
import { damageFront } from './mechanics';
import { startStage } from './start';
import { foesForStage } from './stages';

const party = partyOf(['knight', 30], ['guard', 30]);
const HUGE = 1e12;

function fightWith(mechanic: BossMechanic, overrides: Partial<Foe> = {}) {
  const base = startStage(50, party, testRoster, { seed: 7, ultimate: 1 });
  const [boss] = base.foes;

  if (!boss) throw new Error('Stage 50 has no boss');

  return { ...base, foes: [{ ...boss, mechanic, hp: HUGE, maxHp: HUGE, damage: 1, ...overrides }] };
}

const ofType = <T extends BattleEvent['type']>(events: readonly BattleEvent[], type: T) =>
  events.filter((event): event is Extract<BattleEvent, { type: T }> => event.type === type);

function wound(mechanic: BossMechanic, hp: number, amount: number) {
  const draft = draftOf(fightWith(mechanic, { hp, maxHp: 100 }));
  const events: BattleEvent[] = [];

  damageFront(draft, amount, events, (foe, landed) => ({
    type: BattleEventType.Strike,
    foe,
    amount: landed,
  }));

  return { foe: draft.foes[0], events };
}

describe('super boss mechanics', () => {
  it('cost a boss health in the measure they make its fight harder', () => {
    const roster: Roster = {
      ...testRoster,
      superBosses: {
        ...testRoster.superBosses,
        medium: [
          { id: 'loop', element: 'vault', hpScale: 1, damageScale: 1, mechanic: BossMechanic.Loop },
        ],
      },
    };
    const { hpLead } = BALANCE.superBosses.medium;
    const { at, back } = BALANCE.mechanics.loop;

    expect(foesForStage(roster, 50)[0]?.maxHp).toBe(
      safeAmount(foeHp(50 + hpLead, 1, true) / (1 + back - at)),
    );
  });

  it('lose a share of the party hits to hallucinations that deal nothing', () => {
    const { battle, events } = runFor(fightWith(BossMechanic.Hallucinate), 30, party);
    const hits = ofType(events, BattleEventType.Hit);
    const phantoms = ofType(events, BattleEventType.Mechanic);
    const share = phantoms.length / (hits.length + phantoms.length);

    expect(share).toBeGreaterThan(0.15);
    expect(share).toBeLessThan(0.35);
    expect(HUGE - (battle.foes[0]?.hp ?? 0)).toBe(hits.reduce((sum, hit) => sum + hit.amount, 0));
  });

  it('turn an injected hit into healing for the boss', () => {
    const { battle, events } = runFor(fightWith(BossMechanic.Inject, { hp: HUGE / 2 }), 30, party);
    const dealt = ofType(events, BattleEventType.Hit).reduce((sum, hit) => sum + hit.amount, 0);
    const healed = ofType(events, BattleEventType.Mechanic).reduce(
      (sum, twist) => sum + twist.amount,
      0,
    );

    expect(healed).toBeGreaterThan(0);
    expect(battle.foes[0]?.hp).toBe(HUGE / 2 - dealt + healed);
  });

  it('flatter every crit into a plain hit', () => {
    const { events } = runFor(fightWith(BossMechanic.Flatter), 30, party);

    expect(ofType(events, BattleEventType.Hit).some((hit) => hit.crit)).toBe(false);
    expect(ofType(events, BattleEventType.Mechanic).length).toBeGreaterThan(0);
  });

  it('throttle the party, which then holds its attacks for the pause', () => {
    const { every, pause } = BALANCE.mechanics.throttle;
    const before = runFor(fightWith(BossMechanic.Throttle), every - pause + 0.05, party);
    const during = runFor(before.battle, pause - 0.2, party);

    expect(ofType(before.events, BattleEventType.Mechanic)).toHaveLength(1);
    expect(ofType(during.events, BattleEventType.Hit)).toHaveLength(0);
  });

  it('steal ultimate charge with every hit', () => {
    const { battle } = runFor(fightWith(BossMechanic.StealContext, { attackIn: 0.05 }), 0.1, party);

    expect(battle.ultimate).toBeCloseTo(1 - BALANCE.mechanics.stealContext.share);
  });

  it('loop back to more health once, the first time the boss falls low', () => {
    const first = wound(BossMechanic.Loop, 30, 10);

    expect(first.foe?.hp).toBe(50);
    expect(first.foe?.spent).toBe(true);
    expect(ofType(first.events, BattleEventType.Mechanic)).toEqual([
      { type: BattleEventType.Mechanic, mechanic: BossMechanic.Loop, foe: 0, amount: 30 },
    ]);
  });

  it('drop the mask at half health and hit harder from then on', () => {
    const { foe } = wound(BossMechanic.Unmask, 60, 20);

    expect(foe?.damage).toBe(safeAmount(BALANCE.mechanics.unmask.damage));
    expect(foe?.spent).toBe(true);
  });

  it('turn a share of every hit into paperclips', () => {
    const { foe, events } = wound(BossMechanic.Maximize, 100, 50);

    expect(foe?.hp).toBe(100 - 50 * BALANCE.mechanics.maximize.kept);
    expect(events[0]).toMatchObject({ amount: 50 * BALANCE.mechanics.maximize.kept });
  });
});
