import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { LogLevel, SpendRefusal, type Host, type SpendResult, type Wallet } from './host';
import { lastResort } from './last-resort';
import {
  burnHistoryFromWire,
  settingsFromWire,
  updateOfferFromWire,
  walletChangeFromWire,
  walletFromWire,
  watchedAgentsFromWire,
} from './wire';

const HostCommand = {
  Wallet: 'wallet',
  Spend: 'spend',
  LoadSave: 'load_save',
  WriteSave: 'write_save',
  Log: 'log',
  CheckUpdate: 'check_update',
  InstallUpdate: 'install_update',
  ReportBug: 'report_bug',
  BurnHistory: 'burn_history',
  Settings: 'settings',
  ChangeSetting: 'change_setting',
  WatchedAgents: 'watched_agents',
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

    async checkForUpdate() {
      try {
        return updateOfferFromWire(await invoke(HostCommand.CheckUpdate));
      } catch {
        return null;
      }
    },

    async installUpdate() {
      try {
        await invoke(HostCommand.InstallUpdate);

        return true;
      } catch (error) {
        report('Installing the update failed', error);

        return false;
      }
    },

    async reportBug() {
      try {
        await invoke(HostCommand.ReportBug);

        return true;
      } catch {
        return false;
      }
    },

    async burnHistory() {
      return burnHistoryFromWire(await invoke(HostCommand.BurnHistory));
    },

    async settings() {
      return settingsFromWire(await invoke(HostCommand.Settings));
    },

    async changeSetting(setting, on) {
      return settingsFromWire(await invoke(HostCommand.ChangeSetting, { setting, on }));
    },

    async watchedAgents() {
      return watchedAgentsFromWire(await invoke(HostCommand.WatchedAgents));
    },

    async version() {
      try {
        return await getVersion();
      } catch {
        return null;
      }
    },
  };
}
