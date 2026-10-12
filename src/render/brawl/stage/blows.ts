import { FoeAttack } from '@engine';
import { compactNumber } from '../../format';
import type { Point } from '../../geometry';
import type { Body } from './body';
import { impact } from './bursts';
import { breath, erupt } from './debris';
import type { TextStyle } from './fx';
import { COLOR } from './styles';
import { chipOf, metalOf } from './traits';
import { hand, head, top, type World } from './world';

// Blows a body takes within this many seconds add up into one number.
const BATCH = 0.15;

interface Pending {
  value: number | string;
  readonly style: TextStyle;
  readonly t: number;
}

// Numbers over bodies: a quick run of hits on one body shows as their sum.
export class Numbers {
  readonly #pending = new Map<Body, Pending>();

  add(world: World, body: Body | undefined, value: number | string, style: TextStyle): void {
    if (!body) return;
    const pending = this.#pending.get(body);

    if (pending && world.now - pending.t < BATCH && pending.style === style) {
      pending.value =
        typeof pending.value === 'number' && typeof value === 'number'
          ? pending.value + value
          : value;

      return;
    }
    if (pending) this.#show(world, body, pending);
    this.#pending.set(body, { value, style, t: world.now });
  }

  flush(world: World): void {
    for (const [body, pending] of this.#pending) {
      if (world.now - pending.t < BATCH) continue;
      this.#show(world, body, pending);
      this.#pending.delete(body);
    }
  }

  #show(world: World, body: Body, pending: Pending): void {
    const at = head(body);
    const text = typeof pending.value === 'number' ? compactNumber(pending.value) : pending.value;

    world.fx.text(at.x + (Math.random() - 0.5) * 10, at.y - 14 * body.scale, text, pending.style);
  }
}

const middle = (body: Body): Point => {
  const a = top(body);
  const b = body.center;

  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
};

// Which way a blow from one body pushes another.
export const away = (from: Body | undefined, to: Body, fallback = 1): number =>
  from ? Math.sign(to.center.x - from.center.x) || fallback : fallback;

// A blow lands on a standing body: it flashes, flinches, slides back and sheds chips.
export function hitMark(world: World, body: Body, dir: number, crit: boolean, big: boolean): void {
  const mass = body.look.mass;
  const at = middle(body);

  // A boss under a whole party's blows would never stop flashing at full strength.
  body.flash = body.boss ? 0.35 : 1;
  body.lastHurt = world.now;
  body.flinch = Math.min(1.3, (crit ? 1.3 : 1) / Math.sqrt(mass));
  if (body.state === 'stand') {
    body.kx += (dir * (crit ? 140 : 70)) / mass;
    body.wobble.kick(dir, -0.25, (crit ? 95 : 55) / Math.sqrt(mass));
  }
  impact(world.fx, at.x - dir * 4, at.y, dir, chipOf(body), metalOf(body.look), crit || big);
  if (crit) {
    world.juice.hold(0.05);
    world.juice.kick(4);
  }
}

// Throws a body from a point under or behind it; what it held flies off.
export function throwBody(world: World, body: Body, from: Point, force: number, dir: number): void {
  body.launch(from.x, from.y, 90 * body.scale, force);
  world.props.drop(body, dir, force, world.frame.left);
}

// Every boss blow reaches its heroes and knocks them over for a moment; its creature decides how
// it travels.
export function bossBlow(
  world: World,
  boss: Body,
  hero: Body,
  attack: FoeAttack | undefined,
  dir: number,
): void {
  const from = head(boss);
  const to = hero.center;
  const { fx } = world;

  switch (attack) {
    case FoeAttack.Slam:
      fx.ring(to.x, hero.ground, 40, '255,200,120');
      for (let i = -1; i <= 1; i += 1) erupt(fx, to.x + i * 10, hero.ground, world.accent);
      break;
    case FoeAttack.Breath:
      breath(fx, from.x, from.y, to.x, to.y, world.accent);
      break;
    case FoeAttack.Scythe:
      fx.ring(to.x, to.y, 26, '220,230,255', 0.05);
      break;
    case FoeAttack.Spit:
      world.shots.fire('bolt', hand(boss), top(hero), COLOR.soul, () => undefined);
      break;
    case FoeAttack.Lunge:
    case undefined:
      break;
  }
  world.juice.kick(6);
  if (hero.state === 'stand')
    hero.launch(to.x - dir * 18, hero.ground + 8, 55, attack === FoeAttack.Lunge ? 900 : 760);
}
