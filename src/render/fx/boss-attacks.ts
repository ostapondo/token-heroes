import { CreatureAttack } from '@content';
import type { Actor } from '../scene/cast';
import { center, type Point } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { Breath } from './breath';
import { Shockwave } from './bursts';
import { FX_COLOR } from './colors';
import type { Effect } from './effect';
import { Projectile, Slash } from './strikes';

export interface BossAttack {
  readonly effects: readonly Effect[];
  readonly shake: number;
}

const MOUTH = { x: 0.1, y: 0.4 } as const;
const SCYTHE_LENGTH = 28;

function unknownAttack(attack: never): never {
  throw new Error(`No effect draws the boss attack ${String(attack)}`);
}

function mouthOf(boss: Actor): Point {
  return { x: boss.box.x + boss.box.width * MOUTH.x, y: boss.box.y + boss.box.height * MOUTH.y };
}

function partyCenter(party: readonly Actor[]): Point {
  const points = party.map((hero) => center(hero.box));
  const count = Math.max(points.length, 1);

  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / count,
    y: points.reduce((sum, point) => sum + point.y, 0) / count,
  };
}

export function bossAttack(
  attack: CreatureAttack,
  boss: Actor,
  party: readonly Actor[],
  accent: string,
): BossAttack {
  const target = partyCenter(party);

  switch (attack) {
    case CreatureAttack.Breath:
      return {
        effects: [new Breath(mouthOf(boss), target, [accent, FX_COLOR.gold, FX_COLOR.holy])],
        shake: 2,
      };
    case CreatureAttack.Slam:
      boss.motion.cue(MotionCue.Hop);

      return {
        effects: [new Shockwave(target, accent), new Shockwave(target, FX_COLOR.stone)],
        shake: 4,
      };
    case CreatureAttack.Scythe:
      boss.motion.cue(MotionCue.Lunge);

      return { effects: [new Slash(target, accent, SCYTHE_LENGTH)], shake: 2 };
    case CreatureAttack.Spit:
      return {
        effects: [new Projectile(mouthOf(boss), target, [accent, FX_COLOR.shadow], 3)],
        shake: 1,
      };
    case CreatureAttack.Lunge:
      boss.motion.cue(MotionCue.Lunge);

      return { effects: [], shake: 2 };
    default:
      return unknownAttack(attack);
  }
}
