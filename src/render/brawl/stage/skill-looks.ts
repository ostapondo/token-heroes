import { SkillLook } from '@content';
import type { Point } from '../../geometry';
import { Move } from '../rig/poses';
import type { Body } from './body';
import { blast, mend, sparks } from './bursts';
import { dust, erupt } from './debris';
import { FIELD } from './field';
import { hand, top, type World } from './world';

interface LookScene {
  readonly world: World;
  readonly hero: Body;
  readonly targets: readonly Body[];
  readonly color: string;
  // 0 at rank I, 1 from rank III, 2 from rank V.
  readonly tier: number;
  readonly push: (x: number, y: number, radius: number, force: number) => void;
}

interface Plan {
  // Seconds from the cast until the blow lands, so a number shows when its effect arrives.
  readonly lands: number;
  readonly move: Move;
  readonly time?: number;
  // Where a killing blow throws a body from: lightning and spikes from below, a lance along it.
  readonly from?: (center: Point, dir: number, body: Body) => Point;
  readonly show: (scene: LookScene) => void;
}

const sky = (x: number): Point => ({ x: x + (Math.random() - 0.5) * 80, y: -30 });

function rain({ world, targets, tier }: LookScene): void {
  targets.forEach((body, i) => {
    for (let k = 0; k < 2 + tier; k += 1) {
      world.later.after(i * 0.04 + k * 0.06, () => {
        const to = top(body);

        world.shots.fire('arrow', sky(to.x), to, '#c08a4a', () => undefined, 0.45);
      });
    }
  });
}

function meteor({ world, targets, tier, color, push }: LookScene): void {
  targets.forEach((body, i) => {
    const to = top(body);
    const from = sky(to.x - 60);
    const radius = 7 + tier * 2;
    const land = () => {
      blast(world.fx, to.x, to.y, 50 + radius * 3, color, body.ground);
      world.fx.decals.push({ x: to.x, y: body.ground, radius: 30, life: 6 });
      world.juice.kick(6);
      push(to.x, body.ground + 4, 80, 950);
    };

    world.vfx.add(
      { kind: 'meteor', from, to, radius, land, at: from, landed: false },
      color,
      0.45,
      i * 0.08,
    );
  });
}

function backstab({ world, hero, targets }: LookScene): void {
  const first = targets[0];

  if (!first || hero.state !== 'stand') return;
  dust(world.fx, hero.x, hero.ground);
  hero.x = Math.min(
    FIELD.width - 14,
    Math.max(world.frame.left + 14, first.center.x - first.facing * 22),
  );
  hero.z = first.z;
  hero.facing = first.facing;
  dust(world.fx, hero.x, hero.ground);
}

function leap({ world, hero, tier, color, push }: LookScene): void {
  world.later.after(0.55, () => {
    world.fx.ring(hero.x, hero.ground, 70 + tier * 20, '255,200,120');
    for (let i = -3; i <= 3; i += 1) erupt(world.fx, hero.x + i * 16, hero.ground, color);
    world.juice.kick(7);
    push(hero.x, hero.ground + 10, 120, 1100);
  });
}

function spikes({ world, targets, tier, color, push }: LookScene): void {
  for (const body of targets) {
    world.later.after(0.12, () => {
      world.vfx.add(
        { kind: 'spike', x: body.center.x, y: body.ground, height: 30 + tier * 10 },
        color,
        0.9,
      );
      push(body.center.x, body.ground + 12, 35, 800);
    });
  }
}

function justice({ world, targets, tier, color, push }: LookScene): void {
  const first = targets[0];

  if (!first) return;
  world.later.after(0.2, () => {
    const x = first.center.x;

    world.vfx.add({ kind: 'beam', x, y: first.ground, width: 14 + tier * 4 }, color, 0.5);
    world.fx.ring(x, first.ground, 40, '255,224,138');
    push(x, first.ground, 60, 800);
  });
}

function lance({ world, hero, targets, color }: LookScene, lunge: number): void {
  const last = targets.at(-1);

  if (!last) return;
  world.vfx.add({ kind: 'lance', from: hand(hero), to: top(last) }, color, lunge ? 0.35 : 0.25);
  hero.kx += hero.facing * lunge;
}

function lightning({ world, targets, push }: LookScene): void {
  targets.forEach((body, i) => {
    world.later.after(i * 0.06, () => {
      const to = top(body);

      world.vfx.add(
        { kind: 'bolt', from: sky(to.x), to, seed: Math.random() * 99 },
        '#e8f0ff',
        0.25,
      );
      push(to.x, body.ground + 20, 45, 700);
    });
  });
}

function ward({ world, hero, color }: LookScene): void {
  const at = top(hero);

  world.fx.ring(at.x, at.y, 60, '150,210,255');
  mend(world.fx, at.x, at.y, color);
}

function sanctuary({ world, tier, color }: LookScene): void {
  for (const body of world.cast.heroes.values()) {
    if (body.state === 'stand')
      world.vfx.add(
        { kind: 'beam', x: body.center.x, y: body.ground, width: 8 + tier * 3 },
        color,
        0.6,
      );
  }
}

export const PLANS: Readonly<Record<SkillLook, Plan>> = {
  [SkillLook.Whirlwind]: {
    lands: 0.08,
    move: Move.Sword,
    show: ({ world, hero, tier, color }) =>
      world.vfx.add({ kind: 'arc', body: hero, rings: 2 + tier }, color, 0.45),
  },
  [SkillLook.ArrowRain]: { lands: 0.5, move: Move.Bow, time: 0.6, show: rain },
  [SkillLook.Snipe]: {
    lands: 0.08,
    move: Move.Bow,
    show: (scene) => lance(scene, 0),
  },
  [SkillLook.Bulwark]: { lands: 0, move: Move.Sword, show: ward },
  [SkillLook.RaiseDead]: { lands: 0, move: Move.Cast, show: ward },
  [SkillLook.Sanctuary]: { lands: 0, move: Move.Cast, show: sanctuary },
  [SkillLook.Meteor]: {
    lands: 0.45,
    move: Move.Cast,
    show: meteor,
    from: (c, dir, body) => ({ x: c.x - dir * 6, y: body.ground }),
  },
  [SkillLook.Backstab]: { lands: 0.14, move: Move.Stab, show: backstab },
  [SkillLook.LeapSlam]: {
    lands: 0.55,
    move: Move.Leap,
    time: 0.85,
    show: leap,
    from: (c, dir, body) => ({ x: c.x - dir * 10, y: body.ground + 18 }),
  },
  [SkillLook.GlacialSpike]: {
    lands: 0.22,
    move: Move.Cast,
    show: spikes,
    from: (c, dir, body) => ({ x: c.x - dir * 4, y: body.ground + 16 }),
  },
  [SkillLook.Justice]: {
    lands: 0.32,
    move: Move.Cast,
    show: justice,
    from: (c) => ({ x: c.x, y: c.y - 30 }),
  },
  [SkillLook.Counter]: {
    lands: 0,
    move: Move.Stab,
    show: ({ world, targets }) => {
      const at = targets[0] && top(targets[0]);

      if (!at) return;
      world.fx.ring(at.x, at.y, 20, '255,240,200', 0.08);
      sparks(world.fx, at.x, at.y, 8);
    },
  },
  [SkillLook.Crusade]: {
    lands: 0.18,
    move: Move.Sword,
    show: (scene) => lance(scene, 220),
    from: (c, dir) => ({ x: c.x - dir * 40, y: c.y + 4 }),
  },
  [SkillLook.PinningShot]: { lands: 0.1, move: Move.Bow, show: (scene) => lance(scene, 0) },
  [SkillLook.CallLightning]: {
    lands: 0.12,
    move: Move.Cast,
    show: lightning,
    from: (c, _dir, body) => ({ x: c.x, y: body.ground + 20 }),
  },
};
