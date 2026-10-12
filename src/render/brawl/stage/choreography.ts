import { BattlePhase, heroById } from '@engine';
import type { Body } from './body';
import { foeGoals, heroGoals } from './formation';
import { Plans } from './plans';
import { steer } from './steering';
import { landsAt, swingOf } from './traits';
import type { World } from './world';

// A swing never outlasts this, nor most of the gap between two blows.
const SWING = { most: 0.8, heroShare: 0.92, foeShare: 0.9 } as const;
const LUNGE = 260;
// A corpse lies this long before it fades; with more than ten down the oldest go faster.
const CORPSE = { lies: 3.5, crowd: 10, hurry: 4 } as const;

function allow(body: Body, may: boolean): void {
  if (may && !body.mayRise) body.asleep = false;
  body.mayRise = may;
}

// Where every standing body walks, and when it winds up so its blow lands on the rules' beat.
export class Choreography {
  readonly #world: World;
  readonly #plans = new Plans();
  #since = 0;

  constructor(world: World) {
    this.#world = world;
  }

  // The rules' timers are as of the latest snapshot; between snapshots they run down here.
  shown(): void {
    this.#since = 0;
  }

  step(dt: number): void {
    const world = this.#world;

    this.#since += dt;
    world.freeze = Math.max(0, world.freeze - dt);
    this.#rise();
    this.#fade(dt);
    heroGoals(world, this.#plans);
    foeGoals(world, this.#plans);
    this.#swings();
    const all = world.cast.all;

    for (const body of all) {
      const held = body.hero && world.freeze > 0;

      if (body.state !== 'stand' || body.dead || body.alpha <= 0 || held) continue;
      const plan = this.#plans.of(body);

      steer(body, plan.goal, plan.faceX, all, dt, world.frame.left);
    }
  }

  // Only the rules put a fighter down or let it up: a hero rises while it has health, a foe once
  // its stun runs out.
  #rise(): void {
    const world = this.#world;

    for (const [id, body] of world.cast.heroes) allow(body, world.heroUp(id) && !world.wipe);
    world.cast.foes.forEach((body, index) => {
      const foe = world.ruleFoe(index);

      if (!body.dead) allow(body, (foe?.hp ?? 0) > 0 && (foe?.stunned ?? 0) <= 0);
    });
  }

  #fade(dt: number): void {
    const { cast } = this.#world;
    const dead = cast.all.filter((body) => body.dead && body.alpha > 0);
    const crowd = dead.length - CORPSE.crowd;

    dead.forEach((body, index) => {
      body.deadFor += dt * (index < crowd ? CORPSE.hurry : 1);
      if (body.deadFor > CORPSE.lies) body.alpha = Math.max(0, 1 - (body.deadFor - CORPSE.lies));
    });
    cast.corpses = cast.corpses.filter((body) => body.alpha > 0);
  }

  #swings(): void {
    const world = this.#world;
    const { battle, party } = world;
    const fighting = battle?.phase === BattlePhase.Fighting && world.frontIndex !== -1;

    if (!battle || !party || !fighting) return;
    for (const slot of party.heroes) {
      const body = world.cast.hero(slot.heroId);
      const held = world.freeze > 0 || !world.heroUp(slot.heroId);

      if (body?.state !== 'stand' || body.move || held) continue;
      const interval = heroById(world.roster, slot.heroId).attackInterval;
      const left = (battle.cooldowns[slot.heroId] ?? Infinity) - this.#since;

      this.#time(body, left, Math.min(SWING.most, interval * SWING.heroShare));
    }
    battle.foes.forEach((foe, index) => {
      const body = world.cast.foe(index);
      const able = foe.hp > 0 && (foe.stunned ?? 0) <= 0;

      if (!able || body?.state !== 'stand' || body.dead || body.move) return;
      const time = Math.min(SWING.most, foe.attackInterval * SWING.foeShare);
      const started = this.#time(body, foe.attackIn - this.#since, time);
      const { faceX, reach } = this.#plans.of(body);

      // Out of reach when the swing starts, a boss lunges the rest of the way.
      if (started && body.boss && faceX !== null && Math.abs(faceX - body.x) > reach + 16)
        body.kx += Math.sign(faceX - body.x) * LUNGE;
    });
  }

  #time(body: Body, left: number, time: number): boolean {
    const move = swingOf(body.look);
    const lead = landsAt(body.look, move) * time;

    if (left > lead) return false;
    body.swing(move, time, Math.max(0, (lead - left) / time));

    return true;
  }
}
