import type { ElementDef } from '@content';
import type { BattleEvent } from '@engine';
import type { Actor } from '../scene/cast';
import type { Effect } from './effect';

// A moment big enough to flash the screen and hold the action still; the arena lets one through
// at a time so a full party does not flash on every cast.
interface Beat {
  readonly flash: string;
  readonly hitstop: number;
}

export interface Reaction {
  readonly effects: readonly Effect[];
  readonly shake: number;
  // Marks drawn on the ground, beneath the fighters.
  readonly ground?: readonly Effect[];
  readonly beat?: Beat;
}

export interface Stage {
  readonly heroes: readonly Actor[];
  readonly foes: readonly Actor[];
  readonly element: ElementDef;
}

export type EventOf<T extends BattleEvent['type']> = Extract<BattleEvent, { type: T }>;

export const NONE: Reaction = { effects: [], shake: 0 };
