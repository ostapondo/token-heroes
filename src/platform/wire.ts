import { number, object, string } from 'zod';
import type { UpdateOffer, Wallet } from './host';

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
