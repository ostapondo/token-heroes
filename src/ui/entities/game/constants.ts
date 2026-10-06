export const GameStatus = { Loading: 'loading', Ready: 'ready', Failed: 'failed' } as const;
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export const SESSION_TIMING = { tickMs: 100, autosaveMs: 10_000 } as const;

export const SEED_RANGE = 2 ** 31;
