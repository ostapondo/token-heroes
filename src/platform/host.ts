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
}
