export interface Wallet {
  readonly burned: number;
  readonly spent: number;
  readonly balance: number;
}

export const SpendRefusal = { Insufficient: 'insufficient', Unavailable: 'unavailable' } as const;
export type SpendRefusal = (typeof SpendRefusal)[keyof typeof SpendRefusal];

export type SpendResult =
  | { readonly ok: true; readonly wallet: Wallet }
  | { readonly ok: false; readonly reason: SpendRefusal };

export const LogLevel = { Info: 'info', Warn: 'warn', Error: 'error' } as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface UpdateOffer {
  readonly version: string;
  readonly notes: string | null;
}

export type WalletListener = (wallet: Wallet, burnedNow: number) => void;

export const Agent = {
  ClaudeCode: 'claude-code',
  Codex: 'codex',
  GeminiCli: 'gemini-cli',
  QwenCode: 'qwen-code',
  OpenCode: 'open-code',
  KiloCode: 'kilo-code',
} as const;
export type Agent = (typeof Agent)[keyof typeof Agent];

export interface TokenKinds {
  readonly input: number;
  readonly output: number;
  readonly cacheWrites: number;
  readonly cacheReads: number;
}

export interface BurnTally {
  readonly agents: Readonly<Partial<Record<Agent, TokenKinds>>>;
  readonly projects: Readonly<Record<string, number>>;
  readonly models: Readonly<Record<string, number>>;
}

// What the host has counted by agent since it began to: each UTC hour of the last two weeks,
// keyed by unix seconds over 3600, and everything together.
export interface BurnHistory {
  readonly since: number | null;
  readonly hours: Readonly<Record<string, BurnTally>>;
  readonly total: BurnTally;
}

export const Setting = {
  ShowBalance: 'showBalance',
  StartAtLogin: 'startAtLogin',
  CloseOnBlur: 'closeOnBlur',
} as const;
export type Setting = (typeof Setting)[keyof typeof Setting];
export type Settings = Readonly<Record<Setting, boolean>>;

export interface WatchedAgent {
  readonly agent: Agent;
  readonly path: string;
  readonly found: boolean;
  readonly transcripts: number | null;
}

export interface Host {
  wallet(): Promise<Wallet>;
  onWallet(listener: WalletListener): () => void;
  spend(amount: number): Promise<SpendResult>;
  loadSave(): Promise<unknown>;
  writeSave(save: unknown): Promise<void>;
  log(level: LogLevel, message: string): void;
  checkForUpdate(): Promise<UpdateOffer | null>;
  installUpdate(): Promise<boolean>;
  reportBug(): Promise<boolean>;
  burnHistory(): Promise<BurnHistory | null>;
  settings(): Promise<Settings | null>;
  changeSetting(setting: Setting, on: boolean): Promise<Settings | null>;
  watchedAgents(): Promise<readonly WatchedAgent[]>;
  version(): Promise<string | null>;
}
