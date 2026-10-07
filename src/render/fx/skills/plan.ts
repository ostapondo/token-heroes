import type { ElementDef } from '@content';
import type { Actor } from '../../scene/cast';
import { center, type Point } from '../../scene/geometry';
import type { Effect } from '../effect';

// What a skill looks like when it lands: effects now, marks on the ground, and the moment the
// blow lands so its numbers show then. The arena's juice budget decides whether its flash and
// hit-stop reach the whole screen.
export interface LookPlan {
  readonly effects: readonly Effect[];
  readonly ground: readonly Effect[];
  readonly lands: number;
  readonly shake: number;
  readonly flash?: string;
  readonly hitstop?: number;
}

export interface LookScene {
  readonly hero: Actor;
  readonly heroes: readonly Actor[];
  // The foes the cast struck, the main target first.
  readonly targets: readonly Actor[];
  readonly color: string;
  readonly tier: 0 | 1 | 2;
  readonly element: ElementDef;
}

export const middleOf = (actor: Actor): Point => center(actor.box);
export const feetOf = (actor: Actor): Point => ({
  x: center(actor.box).x,
  y: actor.box.y + actor.box.height,
});
export const topOf = (actor: Actor): Point => ({ x: center(actor.box).x, y: actor.box.y });

export const plan = (overrides: Partial<LookPlan> & Pick<LookPlan, 'effects'>): LookPlan => ({
  ground: [],
  lands: 0,
  shake: 1,
  ...overrides,
});
