import { Shockwave, Sparks } from '../bursts';
import { FX_COLOR } from '../colors';
import { LightPillar } from '../screen';
import { CrossSlash } from '../strikes';
import { MotionCue } from '../../scene/motion';
import { SpinSlash } from './auras';
import { Scorch } from './ground';
import { Burst, Debris, Rings, Smoke } from './impacts';
import { Later } from './later';
import { type LookPlan, type LookScene, feetOf, middleOf, plan } from './plan';
import { Ray } from './strokes';

const ARENA_EDGE = 190;

export function whirlwind(scene: LookScene): LookPlan {
  const [main] = scene.targets;

  if (!main) return plan({ effects: [] });
  scene.hero.motion.cue(MotionCue.Dash);
  const at = { x: middleOf(main).x - 6, y: middleOf(main).y + 4 };
  const spins = scene.tier + 1;

  return plan({
    effects: Array.from(
      { length: spins },
      (_, index) =>
        new Later(0.14 + index * 0.2, () => [
          new SpinSlash(at, 20 + index * 4, scene.tier === 2 ? '#9fd6ff' : scene.color),
        ]),
    ),
    lands: 0.14,
    shake: 2,
    flash: FX_COLOR.steel,
    hitstop: 0.04,
  });
}

export function leapSlam(scene: LookScene): LookPlan {
  const [main] = scene.targets;

  if (!main) return plan({ effects: [] });
  scene.hero.motion.cue(MotionCue.Lunge);
  const at = feetOf(main);

  return plan({
    effects: [
      new Later(0.24, () => [
        new Rings(at, '#e8c49a', 56),
        new Shockwave({ x: at.x, y: at.y - 6 }, FX_COLOR.stone),
        new Debris(
          { x: at.x, y: at.y - 2 },
          ['#5a4632', '#8a6a4a', '#3a2a1e', FX_COLOR.stone],
          26,
          at.y,
          80,
        ),
        ...(scene.tier === 2
          ? [new Ray(at.y - 1, 20, ARENA_EDGE, ['#5a4632', FX_COLOR.gold], 1)]
          : []),
      ]),
    ],
    ground: [new Later(0.24, () => [new Scorch(at, 40, ['#20160e', '#5a4632'], 3)])],
    lands: 0.24,
    shake: 6,
    flash: '#e8c49a',
    hitstop: 0.1,
  });
}

// A beam from the hero through every foe in the line: a holy lance or a crossbow bolt.
export function piercing(
  scene: LookScene,
  colors: readonly [string, string],
  thickness: number,
): LookPlan {
  const [main] = scene.targets;

  if (!main) return plan({ effects: [] });
  scene.hero.motion.cue(MotionCue.Dash);
  const y = Math.round(middleOf(main).y);

  return plan({
    effects: [
      new Later(0.12, () => [
        new Ray(y, middleOf(scene.hero).x, ARENA_EDGE, colors, thickness),
        ...scene.targets.flatMap((target) => [
          new Sparks(middleOf(target), [colors[1]], { count: 6, reach: 12 }),
          ...(scene.tier === 2 ? [new LightPillar(feetOf(target).x, feetOf(target).y)] : []),
        ]),
      ]),
    ],
    lands: 0.12,
    shake: 3,
    flash: FX_COLOR.holy,
    hitstop: 0.05,
  });
}

export function snipe(scene: LookScene): LookPlan {
  const [main] = scene.targets;

  if (!main) return plan({ effects: [] });
  const to = middleOf(main);
  const shots = scene.tier === 2 ? 2 : 1;

  return plan({
    effects: Array.from(
      { length: shots },
      (_, index) =>
        new Later(index * 0.3, () => [
          new Ray(
            Math.round(to.y),
            middleOf(scene.hero).x,
            scene.tier >= 1 ? ARENA_EDGE : to.x + 4,
            [scene.color, FX_COLOR.steel],
            2,
          ),
          new Burst(to, [FX_COLOR.steel, scene.color], 18, 0.35),
          new Debris(to, [FX_COLOR.steel, scene.color, '#c08a4a'], 12, feetOf(main).y, 60),
        ]),
    ),
    shake: 4,
    flash: FX_COLOR.steel,
    hitstop: 0.12,
  });
}

export function backstab(scene: LookScene): LookPlan {
  scene.hero.motion.cue(MotionCue.Dash);

  return plan({
    effects: [
      new Smoke(middleOf(scene.hero), '#3a2f4a'),
      ...scene.targets.map(
        (target, index) =>
          new Later(0.1 + index * 0.14, () => [
            new Smoke(
              { x: target.box.x + target.box.width + 2, y: middleOf(target).y },
              '#4a3a5e',
              6,
            ),
            new CrossSlash(middleOf(target), scene.color),
            new Sparks(middleOf(target), [scene.color, FX_COLOR.steel], { count: 10, reach: 18 }),
          ]),
      ),
    ],
    lands: 0.1,
    shake: 2,
    hitstop: 0.05,
  });
}

export function counter(scene: LookScene): LookPlan {
  const [main] = scene.targets;

  if (!main) return plan({ effects: [] });
  scene.hero.motion.cue(MotionCue.Dash);
  const to = middleOf(main);

  return plan({
    effects: [
      new Later(0.16, () => [
        new Burst(to, [scene.color, FX_COLOR.steel], 10, 0.3),
        new Shockwave(to, scene.color),
        ...(scene.tier === 2 ? [new Rings(feetOf(main), scene.color, 60)] : []),
      ]),
    ],
    lands: 0.16,
    shake: 2,
    hitstop: 0.05,
  });
}

// A dome or a raised skeleton holds the party's shield; the cast itself rings out from the hero.
export const warding = (scene: LookScene): LookPlan =>
  plan({ effects: [new Rings(feetOf(scene.hero), scene.color, 34)], shake: 1 });
