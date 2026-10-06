import type { ElementDef } from '@content';
import type { BattleEvent } from '@engine';
import type { Actor } from '../scene/cast';
import type { Effect } from './effect';

export interface Reaction {
  readonly effects: readonly Effect[];
  readonly shake: number;
}

export interface Stage {
  readonly heroes: readonly Actor[];
  readonly foes: readonly Actor[];
  readonly element: ElementDef;
}

export type EventOf<T extends BattleEvent['type']> = Extract<BattleEvent, { type: T }>;

export const NONE: Reaction = { effects: [], shake: 0 };
