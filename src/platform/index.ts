import { isTauri } from '@tauri-apps/api/core';
import { browserHost } from './browser-host';
import type { Host } from './host';
import { tauriHost } from './tauri-host';

export function connectHost(): Host {
  return isTauri() ? tauriHost() : browserHost();
}

export { LogLevel, SpendRefusal, type Host, type Wallet } from './host';
