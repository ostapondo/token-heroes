import { AttackStyle } from '@engine';
import type { Actor } from '../scene/cast';
import { center } from '../scene/geometry';
import { MotionCue } from '../scene/motion';
import { Shockwave } from './bursts';
import { FX_COLOR } from './colors';
import type { Effect } from './effect';
import { Projectile, Slash } from './strikes';

function unknownStyle(style: never): never {
  throw new Error(`No effect draws the hero attack ${String(style)}`);
}

export function heroAttack(style: AttackStyle, hero: Actor, foe: Actor, accent: string): Effect[] {
  const from = center(hero.box);
  const to = center(foe.box);

  switch (style) {
    case AttackStyle.Slash:
      hero.motion.cue(MotionCue.Dash);

      return [new Slash(to, accent)];
    case AttackStyle.Arrow:
      return [new Projectile(from, to, [FX_COLOR.wood, FX_COLOR.heal], 1)];
    case AttackStyle.Bash:
      return [new Shockwave(to, FX_COLOR.stone)];
    case AttackStyle.Spell:
      return [new Projectile(from, to, [FX_COLOR.gold, FX_COLOR.ember], 3)];
    case AttackStyle.Heal:
      return [];
    default:
      return unknownStyle(style);
  }
}
