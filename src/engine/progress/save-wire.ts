import {
  array,
  boolean,
  enum as enumOf,
  literal,
  number,
  object,
  record,
  string,
  union,
} from 'zod';
import { BattlePhase, type Roster } from '../types';
import { LEGACY_SAVE_VERSION, SAVE_VERSION, type StoredSave } from './save';

const foeWire = object({
  id: string(),
  boss: boolean(),
  hp: number().nonnegative(),
  maxHp: number().positive(),
  damage: number().nonnegative(),
  attackInterval: number().positive(),
  attackIn: number(),
});

const battleWire = object({
  stage: number().int().positive(),
  phase: enumOf(BattlePhase),
  phaseLeft: number(),
  foes: array(foeWire),
  partyHp: number(),
  cooldowns: record(string(), number()),
  strikeReadyIn: number().nonnegative(),
  ultimate: number().min(0).max(1),
  seed: number().int(),
});

const saveWire = object({
  version: union([literal(SAVE_VERSION), literal(LEGACY_SAVE_VERSION)]),
  battle: battleWire,
  party: object({
    heroes: array(object({ heroId: string(), level: number().int().positive() })).min(1),
    renown: number().int().nonnegative().optional(),
  }),
  bestStage: number().int().positive(),
  savedAt: number().nonnegative(),
});

export function saveFromWire(value: unknown, roster: Roster): StoredSave | null {
  const parsed = saveWire.safeParse(value);

  if (!parsed.success) return null;
  const known = new Set(roster.heroes.map((hero) => hero.id));

  return parsed.data.party.heroes.every((slot) => known.has(slot.heroId)) ? parsed.data : null;
}
