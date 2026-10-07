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
import { startStage } from '../battle/start';
import { BattlePhase, BossMechanic, type Roster } from '../types';
import { LEGACY_SAVE_VERSION, SAVE_VERSION, type StoredSave } from './save';

const foeWire = object({
  id: string(),
  boss: boolean(),
  hp: number().nonnegative(),
  maxHp: number().positive(),
  damage: number().nonnegative(),
  attackInterval: number().positive(),
  attackIn: number(),
  mechanic: enumOf(BossMechanic).optional(),
  clock: number().nonnegative().optional(),
  spent: boolean().optional(),
  stunned: number().nonnegative().optional(),
  burn: object({
    left: number().nonnegative(),
    perSecond: number().nonnegative(),
    tickIn: number(),
    source: string(),
    skill: string(),
  }).optional(),
  mark: object({ left: number().nonnegative(), bonus: number().nonnegative() }).optional(),
});

const skillWire = object({
  readyIn: number().nonnegative(),
  pool: number().nonnegative(),
  misses: number().int().nonnegative(),
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
  skills: record(string(), skillWire).optional(),
  shield: object({
    amount: number().nonnegative(),
    left: number().nonnegative(),
    skill: string(),
  }).optional(),
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

const foeIds = (roster: Roster): Set<string> =>
  new Set(
    [
      ...roster.enemies,
      ...roster.bosses,
      ...roster.superBosses.medium,
      ...roster.superBosses.strong,
    ].map((foe) => foe.id),
  );

export function saveFromWire(value: unknown, roster: Roster): StoredSave | null {
  const parsed = saveWire.safeParse(value);

  if (!parsed.success) return null;
  const save = parsed.data;
  const known = new Set(roster.heroes.map((hero) => hero.id));

  if (!save.party.heroes.every((slot) => known.has(slot.heroId))) return null;
  const foes = foeIds(roster);

  // A foe the content no longer has starts its stage over, so the save keeps its progress.
  return save.battle.foes.every((foe) => foes.has(foe.id))
    ? save
    : { ...save, battle: startStage(save.battle.stage, save.party, roster, save.battle) };
}
