import { isTauri } from '@tauri-apps/api/core';
import { browserHost } from './browser-host';
import type { Host } from './host';
import { tauriHost } from './tauri-host';

export function connectHost(): Host {
  return isTauri() ? tauriHost() : browserHost();
}

export {
  Agent,
  LogLevel,
  Setting,
  SpendRefusal,
  type BurnHistory,
  type BurnTally,
  type Host,
  type Settings,
  type TokenKinds,
  type UpdateOffer,
  type Wallet,
  type WatchedAgent,
} from './host';
