import type { Offhand, Palette, Weapon } from '@content';
import type { Point } from '../../geometry';
import { kitFor } from '../paint/biped-parts';
import { paintOffhand, paintWeapon } from '../paint/gear';
import { Painter } from '../paint/painter';
import { J } from '../rig/skeleton';
import type { Body } from './body';
import { FIELD } from './field';

interface End {
  x: number;
  y: number;
  px: number;
  py: number;
}

interface Prop {
  readonly a: End;
  readonly b: End;
  readonly length: number;
  readonly floor: number;
  readonly scale: number;
  readonly palette: Palette;
  readonly gear: { readonly weapon: Weapon } | { readonly offhand: Offhand };
  life: number;
}

const MAX = 24;
const LIFE = 4;
const GRAVITY = 1300;
const STILL = { pull: 0, charge: 0 } as const;

const at = (points: readonly Point[], index: number): Point => points[index] ?? { x: 0, y: 0 };

// A point eighteen units past the fist along the forearm's normal: where the held thing ends.
function tipOf(elbow: Point, hand: Point, scale: number, facing: number): Point {
  const dx = hand.x - elbow.x;
  const dy = hand.y - elbow.y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    x: hand.x - (dy / length) * 18 * scale * facing,
    y: hand.y + (dx / length) * 18 * scale * facing,
  };
}

// What a falling body lets go of: the weapon spins off the way the blow came, the shield drops.
export class Props {
  #list: Prop[] = [];

  drop(body: Body, dir: number, force: number, left: number): void {
    const { look } = body;

    if (look.rig !== 'biped' || body.disarmed) return;
    const k = force / 700;
    const s = body.scale;
    const P = body.points;
    const throwFrom = (
      elbow: number,
      hand: number,
      vx: number,
      vy: number,
      spin: number,
      gear: Prop['gear'],
    ) => {
      const a = at(P, hand);
      const b = tipOf(at(P, elbow), a, s, body.facing);
      const end = (q: Point, side: number): End => ({
        x: Math.max(left, q.x),
        y: q.y,
        px: q.x - (vx + spin * side) * FIELD.step,
        py: q.y - (vy - spin * side * 0.5) * FIELD.step,
      });

      this.#list.push({
        a: end(a, -1),
        b: end(b, 1),
        length: Math.hypot(b.x - a.x, b.y - a.y),
        floor: body.ground,
        scale: s,
        palette: body.palette,
        gear,
        life: LIFE,
      });
    };

    if (look.weapon)
      throwFrom(
        J.elbowF,
        J.handF,
        dir * (120 + Math.random() * 120) * k,
        -(220 + Math.random() * 160) * k,
        (Math.random() < 0.5 ? -1 : 1) * 260 * k,
        { weapon: look.weapon },
      );
    if (look.offhand)
      throwFrom(J.elbowB, J.handB, dir * 80 * k, -150 * k, 140 * k, { offhand: look.offhand });
    if (this.#list.length > MAX) this.#list.splice(0, this.#list.length - MAX);
    body.disarmed = true;
  }

  // Verlet: called once per fixed step of the world.
  step(dt: number, left: number): void {
    const g = GRAVITY * dt * dt;

    for (const prop of this.#list) {
      prop.life -= dt;
      for (const q of [prop.a, prop.b]) {
        const vx = (q.x - q.px) * 0.995;
        const vy = (q.y - q.py) * 0.995;

        q.px = q.x;
        q.py = q.y;
        q.x += vx;
        q.y += vy + g;
      }
      for (let i = 0; i < 3; i += 1) settle(prop, left);
    }
    this.#list = this.#list.filter((prop) => prop.life > 0);
  }

  clear(): void {
    this.#list = [];
  }

  paint(ctx: CanvasRenderingContext2D, t: number): void {
    const painter = new Painter(ctx);

    for (const prop of this.#list) {
      const kit = kitFor(painter, prop.palette, t);

      ctx.save();
      ctx.globalAlpha = Math.min(1, prop.life);
      ctx.translate(prop.a.x, prop.a.y);
      ctx.rotate(Math.atan2(prop.b.y - prop.a.y, prop.b.x - prop.a.x));
      painter.worldLight();
      painter.outline = 2 + prop.scale * 0.7;
      if ('weapon' in prop.gear) paintWeapon(kit, prop.gear.weapon, prop.scale, STILL);
      else paintOffhand(kit, prop.gear.offhand, prop.scale);
      ctx.restore();
    }
  }
}

function settle(prop: Prop, left: number): void {
  const { a, b } = prop;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1e-3;
  const k = ((d - prop.length) / d) * 0.5;

  a.x += dx * k;
  a.y += dy * k;
  b.x -= dx * k;
  b.y -= dy * k;
  for (const q of [a, b]) {
    if (q.y > prop.floor - 1) {
      const vy = q.y - q.py;

      q.y = prop.floor - 1;
      q.py = q.y + vy * 0.35;
      q.px = q.x - (q.x - q.px) * 0.7;
    }
    q.x = Math.min(FIELD.width - 2, Math.max(left + 2, q.x));
  }
}
