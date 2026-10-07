import { array, boolean, enum as enumOf, number, object, partialRecord, record, string } from 'zod';
import {
  Agent,
  type BurnHistory,
  type Settings,
  type UpdateOffer,
  type Wallet,
  type WatchedAgent,
} from './host';

const amount = number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

const walletWire = object({ burned: amount, spent: amount, balance: amount });

export function walletFromWire(value: unknown): Wallet | null {
  const parsed = walletWire.safeParse(value);

  return parsed.success ? parsed.data : null;
}

const walletChangeWire = object({ wallet: walletWire, burnedNow: amount });

export function walletChangeFromWire(value: unknown): { wallet: Wallet; burnedNow: number } | null {
  const parsed = walletChangeWire.safeParse(value);

  return parsed.success ? parsed.data : null;
}

const updateOfferWire = object({ version: string().min(1), notes: string().nullable() }).nullable();

export function updateOfferFromWire(value: unknown): UpdateOffer | null {
  const parsed = updateOfferWire.safeParse(value);

  return parsed.success ? parsed.data : null;
}

const kindsWire = object({
  input: amount,
  output: amount,
  cacheWrites: amount,
  cacheReads: amount,
});
const tallyWire = object({
  agents: partialRecord(enumOf(Agent), kindsWire),
  projects: record(string(), amount),
  models: record(string(), amount),
});
const historyWire = object({
  since: amount.nullable(),
  hours: record(string().regex(/^\d+$/), tallyWire),
  total: tallyWire,
});

export function burnHistoryFromWire(value: unknown): BurnHistory | null {
  const parsed = historyWire.safeParse(value);

  return parsed.success ? parsed.data : null;
}

const settingsWire = object({
  showBalance: boolean(),
  startAtLogin: boolean(),
  closeOnBlur: boolean(),
});

export function settingsFromWire(value: unknown): Settings | null {
  const parsed = settingsWire.safeParse(value);

  return parsed.success ? parsed.data : null;
}

const watchedWire = array(
  object({
    agent: enumOf(Agent),
    path: string(),
    found: boolean(),
    transcripts: number().int().nonnegative().nullable(),
  }),
);

export function watchedAgentsFromWire(value: unknown): readonly WatchedAgent[] {
  const parsed = watchedWire.safeParse(value);

  return parsed.success ? parsed.data : [];
}
