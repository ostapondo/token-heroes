import { CONTENT, elementById, toRoster } from '@content';
import { BALANCE, startStage, upcomingBoss, type PartyState } from '@engine';
import { describe, expect, it } from 'vitest';
import { Cast } from './cast';

const roster = toRoster(CONTENT);
const frame = { left: 0, zoom: 1, time: 0 };
const party = (level: number): PartyState => ({
  heroes: ['wanderer', 'cleric'].map((heroId) => ({ heroId, level })),
});
const elementOf = (stage: number) => elementById(CONTENT, upcomingBoss(roster, stage).element);

describe('the cast', () => {
  it('gives every foe of the stage a body, the boss a boss body', () => {
    const cast = new Cast(CONTENT);
    const stage = BALANCE.bossEvery;
    const battle = startStage(stage, party(1), roster, { seed: 1, ultimate: 0 });

    cast.syncFoes(battle, elementOf(stage), frame);

    expect(cast.foes).toHaveLength(battle.foes.length);
    expect(cast.foes.map((body) => body.boss)).toEqual(battle.foes.map((foe) => foe.boss));
  });

  it('brings a fresh pack when the rules restart the same stage', () => {
    const cast = new Cast(CONTENT);
    const battle = startStage(3, party(1), roster, { seed: 1, ultimate: 0 });
    const element = elementOf(3);

    cast.syncFoes(battle, element, frame);
    const first = cast.foes[0];

    expect(cast.syncFoes(battle, element, frame)).toBe(false);
    cast.renew();
    expect(cast.syncFoes(battle, element, frame)).toBe(true);
    expect(cast.foes[0]).not.toBe(first);
  });

  it('dresses a hero in a new piece of gear every 25 levels', () => {
    const cast = new Cast(CONTENT);
    const { palette } = elementOf(1);

    cast.syncHeroes(party(1), palette, frame);
    expect(cast.hero('wanderer')?.tier).toBe(0);
    cast.syncHeroes(party(75), palette, frame);
    expect(cast.hero('wanderer')?.tier).toBe(3);
    cast.syncHeroes(party(400), palette, frame);
    expect(cast.hero('wanderer')?.tier).toBe(4);
  });

  it('names the heroes who join after the first sync', () => {
    const cast = new Cast(CONTENT);
    const { palette } = elementOf(1);

    expect(cast.syncHeroes(party(1), palette, frame)).toEqual([]);
    const bigger = { heroes: [...party(1).heroes, { heroId: 'archer', level: 1 }] };

    expect(cast.syncHeroes(bigger, palette, frame)).toEqual(['archer']);
  });
});
