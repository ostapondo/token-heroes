import { victims } from '@engine';
import type { Body } from './body';
import { FIELD } from './field';
import type { Plans } from './plans';
import { missileOf, reachOf } from './traits';
import type { World } from './world';

const ROWS = [0, -0.24, 0.24] as const;
const RING_GAP = 36;
// A healer keeps this close to the front foe; a shooter further, by its lane.
const BACK = { healer: 70, shooter: 105, lane: 55 } as const;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

// Melee heroes ring the front foe on two sides in three depth rows, a second ring behind the
// first; heroes who shoot or heal keep their distance on their side.
export function heroGoals(world: World, plans: Plans): void {
  const front = world.frontIndex;
  const target = world.cast.foe(front);
  const standing = (world.party?.heroes ?? []).flatMap((slot) => {
    const body = world.cast.hero(slot.heroId);

    return body?.state === 'stand' && world.heroUp(slot.heroId) ? [body] : [];
  });

  if (!target || target.dead) {
    const { left } = world.frame;

    standing.forEach((body, i) => {
      const plan = plans.of(body);

      plan.goal = {
        x: left + (FIELD.width - left) * (0.2 + 0.45 * ((i * 0.618) % 1)),
        z: plan.lane,
      };
      plan.faceX = null;
    });

    return;
  }
  const center = target.center;
  const sides: Record<-1 | 1, Body[]> = { [-1]: [], [1]: [] };

  for (const body of standing) {
    const plan = plans.of(body);

    plan.faceX = center.x;
    if (plan.ringOf !== front) {
      plan.ringOf = front;
      plan.side = body.x < center.x ? -1 : 1;
    }
    if (missileOf(body.look)) {
      const caster = body.look.rig === 'biped' && body.look.stance === 'caster';
      const away = caster ? BACK.healer : BACK.shooter + plan.lane * BACK.lane;

      plan.goal = {
        x: clamp(center.x + plan.side * away, world.frame.left + 16, FIELD.width - 16),
        z: plan.lane,
      };
    } else sides[plan.side < 0 ? -1 : 1].push(body);
  }
  ring(sides, target, plans);
}

function ring(sides: Record<-1 | 1, Body[]>, target: Body, plans: Plans): void {
  const { [-1]: left, [1]: right } = sides;

  while (Math.abs(left.length - right.length) > 1) {
    const [from, to, side] = left.length > right.length ? [left, right, 1] : [right, left, -1];
    const moved = from.pop();

    if (!moved) break;
    plans.of(moved).side = side;
    to.push(moved);
  }
  const center = target.center;
  const place = (side: number) => (body: Body, i: number) => {
    const row = Math.floor(i / 3);
    const reach = reachOf(body.look) * body.scale;
    const x = center.x + side * (reach * 0.62 + target.radius + row * RING_GAP + (i % 3) * 6);
    const z = clamp(target.z + (ROWS[i % 3] ?? 0) * (1 + row * 0.4), 0, 1);

    plans.of(body).goal = { x, z };
  };

  left.forEach(place(-1));
  right.forEach(place(1));
}

// A foe walks to the hero the rules have it hit and holds once that hero is in reach; a boss
// wades into the party at any depth.
export function foeGoals(world: World, plans: Plans): void {
  const { battle, party } = world;

  if (!battle || !party) return;
  battle.foes.forEach((foe, index) => {
    const body = world.cast.foe(index);

    if (!body || body.dead || foe.hp <= 0 || body.state !== 'stand') return;
    const plan = plans.of(body);
    const victim = world.cast.hero(victims(battle, party, index, foe)[0] ?? '');

    if (victim?.state !== 'stand') {
      plan.goal = null;

      return;
    }
    const at = victim.center;
    const dx = body.x - at.x;
    const melee = body.boss ? body.radius * 0.9 + victim.radius : body.radius + victim.radius + 10;
    const want = missileOf(body.look) ? 80 : melee;
    const near = Math.abs(dx) < want + 14 && Math.abs(body.z - victim.z) < (body.boss ? 0.3 : 0.2);

    plan.goal = near ? null : { x: at.x + (Math.sign(dx) || 1) * want, z: victim.z };
    plan.faceX = at.x;
    plan.reach = want;
  });
}
