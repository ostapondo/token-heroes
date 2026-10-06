import { number, object } from 'zod';
import type { Wallet } from './host';

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
