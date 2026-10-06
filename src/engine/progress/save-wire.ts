import { array, boolean, enum as enumOf, literal, number, object, record, string } from 'zod';
import { BattlePhase, type Roster } from '../types';
import { SAVE_VERSION, type GameSave } from './save';

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
  bossTimeLeft: number(),
  strikeReadyIn: number().nonnegative(),
  ultimate: number().min(0).max(1),
  seed: number().int(),
});

const saveWire = object({
  version: literal(SAVE_VERSION),
  battle: battleWire,
  party: object({
    heroes: array(object({ heroId: string(), level: number().int().positive() })).min(1),
  }),
  bestStage: number().int().positive(),
  savedAt: number().nonnegative(),
});

export function saveFromWire(value: unknown, roster: Roster): GameSave | null {
  const parsed = saveWire.safeParse(value);

  if (!parsed.success) return null;
  const known = new Set(roster.heroes.map((hero) => hero.id));

  return parsed.data.party.heroes.every((slot) => known.has(slot.heroId)) ? parsed.data : null;
}
