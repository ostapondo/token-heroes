// The party falls one hero at a time, front first, so a shared wipe reads as a moment; each
// death is short because a stuck party sees dozens of them an hour.
export const DEMISE = { strike: 0.1, stagger: 0.15, dying: 0.95 } as const;

export type DemiseMoment =
  | { readonly stage: 'standing' }
  | { readonly stage: 'dying'; readonly progress: number }
  | { readonly stage: 'down' };

export function demiseMoment(elapsed: number, rank: number): DemiseMoment {
  const struck = DEMISE.strike + rank * DEMISE.stagger;

  if (elapsed < struck) return { stage: 'standing' };
  if (elapsed < struck + DEMISE.dying) {
    return { stage: 'dying', progress: (elapsed - struck) / DEMISE.dying };
  }

  return { stage: 'down' };
}
