import { describe, expect, it } from 'vitest';
import { BALANCE } from '../balance';
import { heroMaxHp } from '../party';
import { saveFromWire } from '../progress/save-wire';
import { partyOf, runFor, testRoster } from '../testing';
import { BattleEventType, type BattleState, FoeAttack, type Foe } from '../types';
import { strike } from './actions';
import { draftOf } from './draft';
import { startStage } from './start';
import { stepBattle } from './step';
import { victims } from './vitals';

const fresh = { seed: 3, ultimate: 0 };
const party = partyOf(['knight', 5], ['cleric', 5], ['guard', 5]);
const boss = (attack: FoeAttack): Foe => ({
  id: 'dragon',
  boss: true,
  hp: 10,
  maxHp: 10,
  damage: 9,
  attackInterval: 1,
  attackIn: 0,
  attack,
});
const at = (stage: number): BattleState => startStage(stage, party, testRoster, fresh);
const downed = (battle: BattleState, ...ids: string[]): BattleState => ({
  ...battle,
  vitals: { ...battle.vitals, ...Object.fromEntries(ids.map((id) => [id, { hp: 0 }])) },
});

describe('hero vitals', () => {
  it('starts every hero at its own full health', () => {
    for (const { heroId } of party.heroes)
      expect(at(1).vitals[heroId]?.hp).toBe(heroMaxHp(party, testRoster, heroId));
  });

  it('sends each pack blow down the list of the healthiest heroes by slot', () => {
    const draft = draftOf(at(1));
    const [first] = draft.foes;

    if (!first) throw new Error('Stage 1 has no pack');
    expect(victims(draft, party, 0, first)).toEqual(['guard']);
    expect(victims(draft, party, 1, first)).toEqual(['knight']);
    expect(victims(draft, party, 2, first)).toEqual(['cleric']);
    const tankDown = draftOf(downed(at(1), 'guard'));

    expect(victims(tankDown, party, 0, first)).toEqual(['knight']);
  });

  it("reaches as many of the healthiest heroes as the boss's attack covers", () => {
    const draft = draftOf(at(5));

    expect(victims(draft, party, 0, boss(FoeAttack.Lunge))).toEqual(['guard']);
    expect(victims(draft, party, 0, boss(FoeAttack.Slam))).toEqual(['guard', 'knight', 'cleric']);
    expect(BALANCE.bossReach.breath).toBeGreaterThan(BALANCE.bossReach.lunge);
  });

  it('keeps a downed hero from striking until it stands again', () => {
    const battle = downed(at(1), 'knight');
    const { events } = runFor(battle, 3, party);

    expect(events.some((e) => e.type === BattleEventType.Hit && e.source === 'knight')).toBe(false);
  });

  it('stands every hero up at full health when the next stage starts', () => {
    const { battle } = runFor(downed(at(1), 'knight'), 12, party);

    expect(battle.stage).toBeGreaterThan(1);
    expect(battle.vitals.knight?.hp).toBe(heroMaxHp(party, testRoster, 'knight'));
  });

  it('wipes the party only when every hero is down', () => {
    const one = runFor(downed(at(1), 'knight', 'cleric'), 0.2, party);
    const all = stepBattle(downed(at(1), 'knight', 'cleric', 'guard'), 0.1, party, testRoster);

    expect(one.events.some((e) => e.type === BattleEventType.Wiped)).toBe(false);
    expect(all.events).toContainEqual({ type: BattleEventType.Wiped });
  });

  it('strikes the foe the player aimed at', () => {
    const { events } = strike(at(1), party, testRoster, 2);

    expect(events[0]).toMatchObject({ type: BattleEventType.Strike, foe: 2 });
  });

  it('starts the stage over for a save from before heroes had their own health', () => {
    const { vitals: _gone, ...battle } = at(7);
    const save = { version: 2, battle: { ...battle, partyHp: 5 }, party, bestStage: 7, savedAt: 0 };
    const loaded = saveFromWire(save, testRoster);

    expect(loaded?.battle.stage).toBe(7);
    expect(loaded?.battle.vitals.guard?.hp).toBe(heroMaxHp(party, testRoster, 'guard'));
  });
});
