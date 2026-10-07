import { Sparks } from '../bursts';
import { FX_COLOR } from '../colors';
import type { Effect } from '../effect';
import { LightPillar } from '../screen';
import { FallingArrow, FallingHammer, Meteor } from './falls';
import { IceSpikes, Scorch, StuckArrow } from './ground';
import { Burst, Debris } from './impacts';
import { Later } from './later';
import { LightFall } from './auras';
import { type LookPlan, type LookScene, feetOf, middleOf, plan, topOf } from './plan';
import { Bolt } from './strokes';

const LIGHTNING = { glow: '#8fc7ff', storm: '#c9a6ff', core: FX_COLOR.steel } as const;
const METEOR_FALL = 0.45;
const ARROWS = [10, 16, 22] as const;
const HAMMER_FALL = 0.36;

// The bolt falls on the main target and leaps from foe to foe; the storm form brings three.
export function lightning(scene: LookScene): LookPlan {
  const glow = scene.tier === 2 ? LIGHTNING.storm : LIGHTNING.glow;
  const [main, ...chained] = scene.targets;

  if (!main) return plan({ effects: [] });
  const strikes = scene.tier === 2 ? [main, ...chained.slice(0, 2)] : [main];
  const sky: Effect[] = strikes.map((target, index) => {
    const to = middleOf(target);

    return new Later(index * 0.2, () => [
      new Bolt({ x: to.x - 12, y: -6 }, to, [glow, LIGHTNING.core], 2),
      new Burst(to, [glow, LIGHTNING.core], 12),
      new Sparks(to, [LIGHTNING.core, glow], { count: 10, reach: 22 }),
    ]);
  });
  const leaps = chained.map(
    (target, index) =>
      new Later(0.09 * (index + 1), () => [
        new Bolt(
          middleOf(scene.targets[index] ?? main),
          middleOf(target),
          [glow, LIGHTNING.core],
          1,
          0.28,
        ),
      ]),
  );

  return plan({ effects: [...sky, ...leaps], shake: 3, flash: FX_COLOR.steel, hitstop: 0.07 });
}

export function meteor(scene: LookScene): LookPlan {
  const effects = scene.targets.slice(0, scene.tier === 2 ? 3 : 1).map((target, index) => {
    const land = feetOf(target);
    const impact = { x: land.x, y: land.y - 6 };

    return new Later(index * 0.28, () => [
      new Meteor({ x: land.x - 80, y: -24 }, impact, METEOR_FALL, scene.tier === 2 ? 6 : 5),
      new Later(METEOR_FALL, () => [
        new Burst(impact, [FX_COLOR.ember, FX_COLOR.gold, FX_COLOR.holy], 22, 0.5),
        new Debris(impact, ['#3a2a1e', '#7a2f12', FX_COLOR.ember, FX_COLOR.gold], 22, land.y, 70),
      ]),
    ]);
  });
  const ground = scene.targets
    .slice(0, 1)
    .map(
      (target) =>
        new Later(METEOR_FALL, () => [
          new Scorch(feetOf(target), scene.tier >= 1 ? 44 : 30, ['#1a0d08', '#ff8a3a'], 3.5, true),
        ]),
    );

  return plan({
    effects,
    ground,
    lands: METEOR_FALL,
    shake: 5,
    flash: FX_COLOR.ember,
    hitstop: 0.09,
  });
}

export function arrowRain(scene: LookScene): LookPlan {
  const boxes = scene.targets.map((target) => target.box);
  const left = Math.min(...boxes.map((box) => box.x)) - 4;
  const right = Math.max(...boxes.map((box) => box.x + box.width)) + 4;
  const floor = Math.max(...boxes.map((box) => box.y + box.height));
  const count = ARROWS[scene.tier];
  const head = scene.tier === 2 ? FX_COLOR.gold : scene.color;
  const arrows = Array.from({ length: count }, (_, index) => {
    const x = left + ((index * 0.618_034) % 1) * (right - left);
    const delay = (index / count) * 0.7;

    return { x, y: floor - Math.random() * 14, delay };
  });

  return plan({
    effects: arrows.map((arrow) => new FallingArrow(arrow.x, arrow.y, arrow.delay, head)),
    ground: arrows.map((arrow) => new Later(arrow.delay + 0.22, () => [new StuckArrow(arrow)])),
    lands: 0.35,
    shake: 1.5,
  });
}

export function justice(scene: LookScene): LookPlan {
  const [main] = scene.targets;

  if (!main) return plan({ effects: [] });
  const top = topOf(main);
  const impact = { x: top.x, y: top.y + 6 };

  return plan({
    effects: [
      new FallingHammer({ x: top.x, y: top.y + 4 }, HAMMER_FALL),
      new Later(HAMMER_FALL, () => [
        new Burst(impact, [FX_COLOR.gold, FX_COLOR.holy], 16),
        new Sparks(impact, [FX_COLOR.gold, FX_COLOR.steel], { count: 12, reach: 24 }),
      ]),
    ],
    lands: HAMMER_FALL,
    shake: 4,
    flash: FX_COLOR.gold,
    hitstop: 0.08,
  });
}

// Light falls on the party and heals it at once.
export function sanctuary(scene: LookScene): LookPlan {
  const middles = scene.heroes.map(middleOf);
  const x = middles.reduce((sum, point) => sum + point.x, 0) / Math.max(middles.length, 1);
  const floor = Math.max(...scene.heroes.map((hero) => feetOf(hero).y));

  return plan({
    effects: [
      new LightFall(x, floor, scene.tier === 2 ? 14 : 9, [FX_COLOR.heal, FX_COLOR.holy]),
      new LightPillar(x, floor),
      new Sparks({ x, y: floor - 16 }, [FX_COLOR.heal, FX_COLOR.holy, '#b6f06a'], {
        count: 16,
        reach: 30,
      }),
    ],
    shake: 0,
  });
}

export const frostSpikes = (scene: LookScene): LookPlan =>
  plan({
    effects: scene.targets.map(
      (target, index) =>
        new Later(index * 0.07, () => [
          new IceSpikes(
            feetOf(target),
            target.box.width * 0.9,
            index === 0 ? 7 : 5,
            index === 0 ? 28 : 18,
          ),
          new Debris(
            { x: feetOf(target).x, y: feetOf(target).y - 10 },
            [FX_COLOR.steel, '#bfeaff', '#7fc8ef'],
            10,
            feetOf(target).y,
            50,
          ),
        ]),
    ),
    ground: scene.targets.map(
      (target) =>
        new Scorch(feetOf(target), target.box.width + 8, ['#bfeaff', FX_COLOR.steel], 3, true),
    ),
    shake: 3,
    flash: '#bfeaff',
    hitstop: 0.06,
  });
