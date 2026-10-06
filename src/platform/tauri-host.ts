import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { LogLevel, SpendRefusal, type Host, type SpendResult, type Wallet } from './host';
import { lastResort } from './last-resort';
import { walletChangeFromWire, walletFromWire } from './wire';

const HostCommand = {
  Wallet: 'wallet',
  Spend: 'spend',
  LoadSave: 'load_save',
  WriteSave: 'write_save',
  Log: 'log',
} as const;

const HostEvent = { WalletChanged: 'wallet-changed' } as const;

const INSUFFICIENT_COINS = 'insufficient-coins';

function report(message: string, error: unknown): void {
  invoke(HostCommand.Log, { level: LogLevel.Error, message: `${message}: ${String(error)}` }).catch(
    (logError: unknown) => lastResort(message, error, logError),
  );
}

export function tauriHost(): Host {
  return {
    async wallet(): Promise<Wallet> {
      const wallet = walletFromWire(await invoke(HostCommand.Wallet));

      if (!wallet) throw new Error('The host sent a malformed wallet');

      return wallet;
    },

    onWallet(listener) {
      const unlisten = listen(HostEvent.WalletChanged, (event) => {
        const change = walletChangeFromWire(event.payload);

        if (change) listener(change.wallet, change.burnedNow);
        else report('Dropped a malformed wallet event', event.payload);
      });

      return () => {
        unlisten
          .then((stop) => stop())
          .catch((error: unknown) => report('Could not stop wallet events', error));
      };
    },

    async spend(amount): Promise<SpendResult> {
      try {
        const wallet = walletFromWire(await invoke(HostCommand.Spend, { amount }));

        return wallet ? { ok: true, wallet } : { ok: false, reason: SpendRefusal.Unavailable };
      } catch (error) {
        if (error === INSUFFICIENT_COINS) return { ok: false, reason: SpendRefusal.Insufficient };
        report('Spending coins failed', error);

        return { ok: false, reason: SpendRefusal.Unavailable };
      }
    },

    async loadSave(): Promise<unknown> {
      const text = await invoke<string | null>(HostCommand.LoadSave);

      return text === null ? null : (JSON.parse(text) as unknown);
    },

    async writeSave(save): Promise<void> {
      await invoke(HostCommand.WriteSave, { save: JSON.stringify(save) });
    },

    log(level, message) {
      invoke(HostCommand.Log, { level, message }).catch((error: unknown) =>
        lastResort(message, error),
      );
    },
  };
}
