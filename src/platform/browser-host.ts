import { recordBurn, SAMPLE_AGENTS, sampleHistory } from './browser-menu';
import {
  SpendRefusal,
  type BurnHistory,
  type Host,
  type Settings,
  type Wallet,
  type WalletListener,
} from './host';
import { lastResort } from './last-resort';

const SAVE_KEY = 'token-heroes.save';
const BUG_REPORT_URL =
  'https://github.com/ostapondo/token-heroes/issues/new?template=bug_report.yml';
const FAKE_AGENT = { startBurned: 17_900_000, everyMs: 2_500, min: 2_000, max: 12_000 } as const;

function readStoredSave(): unknown {
  try {
    const text = localStorage.getItem(SAVE_KEY);

    return text === null ? null : (JSON.parse(text) as unknown);
  } catch (error) {
    lastResort('The browser save is unreadable; starting fresh', error);

    return null;
  }
}

export function browserHost(): Host {
  let wallet: Wallet = {
    burned: FAKE_AGENT.startBurned,
    spent: 0,
    balance: FAKE_AGENT.startBurned,
  };
  const listeners = new Set<WalletListener>();
  let history: BurnHistory = sampleHistory(Date.now());
  let settings: Settings = { showBalance: true, startAtLogin: true, closeOnBlur: true };

  setInterval(() => {
    const burnedNow = Math.round(
      FAKE_AGENT.min + Math.random() * (FAKE_AGENT.max - FAKE_AGENT.min),
    );

    wallet = { ...wallet, burned: wallet.burned + burnedNow, balance: wallet.balance + burnedNow };
    history = recordBurn(history, burnedNow, Date.now());
    for (const listener of listeners) listener(wallet, burnedNow);
  }, FAKE_AGENT.everyMs);

  return {
    wallet: () => Promise.resolve(wallet),

    onWallet(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },

    spend(amount) {
      if (amount > wallet.balance) {
        return Promise.resolve({ ok: false, reason: SpendRefusal.Insufficient });
      }
      wallet = { ...wallet, spent: wallet.spent + amount, balance: wallet.balance - amount };

      return Promise.resolve({ ok: true, wallet });
    },

    loadSave: () => Promise.resolve(readStoredSave()),

    writeSave(save) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));

        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }
    },

    log(level, message) {
      lastResort(`${level}: ${message}`);
    },

    checkForUpdate: () => Promise.resolve(null),

    installUpdate: () => Promise.resolve(false),

    reportBug() {
      window.open(BUG_REPORT_URL, '_blank', 'noopener');

      return Promise.resolve(true);
    },

    burnHistory: () => Promise.resolve(history),

    settings: () => Promise.resolve(settings),

    changeSetting(setting, on) {
      settings = { ...settings, [setting]: on };

      return Promise.resolve(settings);
    },

    watchedAgents: () => Promise.resolve(SAMPLE_AGENTS),

    version: () => Promise.resolve(null),
  };
}
