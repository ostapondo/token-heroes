import { DeathKind } from '@content';
import { center } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { Sparks } from './bursts';
import type { Reaction, Stage } from './reaction';
import { LightPillar } from './screen';

// What a death leaves breaks off as the party rises: ice shatters, stone and gilt flake away.
const BREAKS: Partial<Record<DeathKind, readonly string[]>> = {
  [DeathKind.Ice]: ['#e8f7ff', '#9fd8ff'],
  [DeathKind.Stone]: ['#a8a294', '#6a655a'],
  [DeathKind.Gold]: ['#ffd36a', '#fff3c4'],
  [DeathKind.Ash]: ['#4a423a', '#ffb02e'],
  [DeathKind.Bones]: ['#e9e2cc'],
};

export function revival(stage: Stage): Reaction {
  const breaks = BREAKS[stage.element.death];
  const effects = stage.heroes.flatMap((hero) => {
    const floor = hero.box.y + hero.box.height;

    hero.motion.cue(MotionCue.Glow);

    return [
      new LightPillar(center(hero.box).x, floor),
      ...(breaks ? [new Sparks(center(hero.box), breaks, { count: 10, reach: 22 })] : []),
    ];
  });

  return { effects, shake: 0 };
}
