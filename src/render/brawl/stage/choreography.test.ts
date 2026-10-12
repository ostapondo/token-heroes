import { CONTENT, elementById, toRoster } from '@content';
import { startStage, upcomingBoss, type BattleState, type PartyState } from '@engine';
import { describe, expect, it } from 'vitest';
import { landsAt } from './traits';
import { Choreography } from './choreography';
import { FIELD } from './field';
import { World } from './world';

const roster = toRoster(CONTENT);
const party: PartyState = {
  heroes: ['wanderer', 'archer', 'shieldbearer'].map((heroId) => ({ heroId, level: 20 })),
};

function stage(battle: BattleState = startStage(6, party, roster, { seed: 3, ultimate: 0 })) {
  const world = new World(CONTENT, roster);
  const element = elementById(CONTENT, upcomingBoss(roster, battle.stage).element);
  const choreography = new Choreography(world);

  world.battle = battle;
  world.party = party;
  world.element = element;
  world.cast.syncHeroes(party, element.palette, world.frame);
  world.cast.syncFoes(battle, element, world.frame);
  choreography.shown();
  const run = (seconds: number, each?: () => void) => {
    for (let t = 0; t < seconds; t += FIELD.step) {
      world.frame.time += FIELD.step;
      choreography.step(FIELD.step);
      for (const body of world.cast.all) body.step(FIELD.step, world.frame, null);
      each?.();
    }
  };

  return { world, choreography, run };
}

describe('the brawl choreography', () => {
  it('starts a swing so its blow lands when the rules strike', () => {
    const base = startStage(6, party, roster, { seed: 3, ultimate: 0 });
    const due = 0.6;
    const { world, run } = stage({ ...base, cooldowns: { ...base.cooldowns, wanderer: due } });
    const hero = world.cast.hero('wanderer');
    let elapsed = 0;
    let lands = -1;

    run(1, () => {
      elapsed += FIELD.step;
      if (lands >= 0 || !hero?.move) return;
      lands = elapsed + (landsAt(hero.look, hero.move) - hero.progress) * hero.duration;
    });

    expect(lands).toBeGreaterThan(0);
    expect(Math.abs(lands - due)).toBeLessThan(FIELD.step * 2);
  });

  it('walks every foe to the hero the rules have it hit', () => {
    const { world, run } = stage();

    run(4);
    world.cast.foes.forEach((foe) => {
      const nearest = Math.min(
        ...[...world.cast.heroes.values()].map((hero) => Math.abs(hero.center.x - foe.center.x)),
      );

      expect(nearest).toBeLessThan(140);
    });
  });

  it('keeps a hero down while it has no health and lets it up, weapon in hand, once it has', () => {
    const base = startStage(6, party, roster, { seed: 3, ultimate: 0 });
    const down = { ...base, vitals: { ...base.vitals, wanderer: { hp: 0 } } };
    const { world, run } = stage(down);
    const hero = world.cast.hero('wanderer');

    hero?.launch(hero.x - 10, hero.ground, 60, 600);
    if (hero) hero.disarmed = true;
    run(4);
    expect(hero?.state).toBe('rag');
    world.battle = base;
    run(4);
    expect(hero?.state).toBe('stand');
    expect(hero?.disarmed).toBe(false);
  });
});
