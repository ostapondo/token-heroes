// How a hero falls in an element and what is left of it until the party rises: fire leaves ash,
// ice a block, gold a statue, and a lair can take a hero its own way.
export const DeathKind = {
  Ash: 'ash',
  Ice: 'ice',
  Stone: 'stone',
  Shock: 'shock',
  Melt: 'melt',
  Bones: 'bones',
  Drain: 'drain',
  Gold: 'gold',
  Sink: 'sink',
  Context: 'context',
  Clip: 'clip',
} as const;
export type DeathKind = (typeof DeathKind)[keyof typeof DeathKind];
