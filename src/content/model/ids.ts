export const ElementId = {
  Fire: 'fire',
  Ice: 'ice',
  Earth: 'earth',
  Storm: 'storm',
  Venom: 'venom',
  Bone: 'bone',
  Blood: 'blood',
  Gold: 'gold',
  Shadow: 'shadow',
} as const;
export type ElementId = (typeof ElementId)[keyof typeof ElementId];

// Each super boss fights in a lair of its own, painted like an element.
export const LairId = {
  Archive: 'archive',
  Mirage: 'mirage',
  Mire: 'mire',
  Court: 'court',
  Bastion: 'bastion',
  Recursion: 'recursion',
  Abyss: 'abyss',
  Foundry: 'foundry',
} as const;
export type LairId = (typeof LairId)[keyof typeof LairId];

export const CreatureId = {
  Dragon: 'dragon',
  Demon: 'demon',
  Golem: 'golem',
  Knight: 'knight',
  Zombie: 'zombie',
  Spider: 'spider',
  Wraith: 'wraith',
  Slime: 'slime',
} as const;
export type CreatureId = (typeof CreatureId)[keyof typeof CreatureId];
