export const ReleasePhase = { Idle: 'idle', Installing: 'installing', Failed: 'failed' } as const;
export type ReleasePhase = (typeof ReleasePhase)[keyof typeof ReleasePhase];

export const RELEASE_TIMING = { checkEveryMs: 6 * 60 * 60 * 1000 } as const;
